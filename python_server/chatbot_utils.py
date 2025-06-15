"""
core functionality for chatbot
"""

from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_openai import AzureChatOpenAI
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings
from prompts import followup_chat_prompt, contextualize_q_prompt, advising_prompt

# db
from langchain_postgres import PostgresChatMessageHistory
import os
import psycopg
import uuid
import json
import psycopg2

# search engine
from tavily import UsageLimitExceededError
from tavily import TavilyClient

# agent
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.prebuilt import create_react_agent

# replace
os.environ["AZURE_OPENAI_API_KEY"] = ""
os.environ["AZURE_OPENAI_ENDPOINT"] = ""
os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = ""
os.environ["AZURE_OPENAI_API_VERSION"] = ""
# replace
os.environ["DATABASE_URL"] = ""

# search engine
os.environ["TAVILY_API_KEY"] = "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"

llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    api_version=os.environ["AZURE_OPENAI_API_VERSION"]
)


def new_session_id():
    """
    return a new session id
    """
    session_id = str(uuid.uuid4())
    return session_id

def get_session_id(user_id=None) -> str:
    '''
    get the last session id from database, or create a new one if it doesn't exist (e.g. new user)

    return: a string of session id
    '''
    session_id = ''
    if user_id:
        result = query_one(f"SELECT sessionId FROM chatHistory WHERE userId='{user_id}' ORDER BY chatTime DESC LIMIT 1;")
        if result:
            # convert to string
            session_id = result[0]
        else:
            session_id = new_session_id()
    else:
        session_id = new_session_id()
    return session_id

def create_table():
    '''
    Create the table schema (only needs to be done once)
    '''
    conn = os.environ.get("DATABASE_URL")

    sync_connection = psycopg.connect(conn)
    table_name = "history"
    PostgresChatMessageHistory.create_tables(sync_connection, table_name)

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """
    connect with database. Get chat history from the history table or store chat history in the history table.
    """
    conn = os.environ.get("DATABASE_URL")

    return PostgresChatMessageHistory(
        'history',
        session_id,
        sync_connection=psycopg.connect(conn)
    ) 


def query_one(sql, vars=None):
    conn = os.environ.get("DATABASE_URL")

    result = None
    try:
        with psycopg2.connect(conn) as conn:
            with  conn.cursor() as cur:
                # query 
                if vars:
                    cur.execute(sql, vars)
                else:
                    cur.execute(sql)
                result = cur.fetchone()
                # print(f"query: {result}")
    except (psycopg2.DatabaseError, Exception) as error:
        print(f"query: {error}")
    finally:
        return result


def insert_chathistory(user_id, session_id, user_message, ai_message, chatbot):
    sql = """
    INSERT INTO chatHistory (userId, sessionId, history, chatTime)
    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
    RETURNING id;
    """
    chatHistoryId = None 
    conn = os.environ.get("DATABASE_URL")

    # store json to chatHistory table
    timestamp = query_one("SELECT CURRENT_TIMESTAMP;")
    if timestamp:
        timestamp = timestamp[0]
        timestamp = timestamp.strftime("%Y-%m-%d, %H:%M:%S.%f")

    history = {
        session_id: [
            {
                "type": "human",
                "content": user_message,
                "created_at": timestamp,
            },
            {
                "type": "ai",
                "content": ai_message,
            }
        ],
        "chatbot": chatbot,
        "status": None,
    }
    history_json = json.dumps(history)

    try:
        with psycopg2.connect(conn) as conn:
            with  conn.cursor() as cur:
                # execute the INSERT statement
                cur.execute(sql, (user_id, session_id, history_json))
                # get the generated id back
                rows = cur.fetchone()
                if rows:
                    chatHistoryId = rows[0]
                # commit the changes to the database
                conn.commit()
    except (psycopg2.DatabaseError, Exception) as error:
        print(f"insert: {error}")
    finally:
        return chatHistoryId

def start_followup_chatbot(data):
    """
    Start a follow-up conversation in the chat.

    table:
    chathistory -> id, userId, history, chatTime
    history -> id, session_id, message, created_at (langchain has fixed the schema for PostgresChatMessageHistory)
    """

    # user_id = data.get('userId')
    session_id = get_session_id()
    history = get_session_history(session_id)
    create_table()

    quiz = data.get("quiz")
    result = data.get("result")
    message = data.get("message")

    # set up chain
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=10)
    docs = text_splitter.create_documents([quiz, result])
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=AzureOpenAIEmbeddings(azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"])
    )
    retriever = vectorstore.as_retriever()

    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    # question_answer_chain provides external data
    question_answer_chain = create_stuff_documents_chain(llm, followup_chat_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

    with_message_history = RunnableWithMessageHistory(
        # runnable, the chain
        rag_chain,
        # takes in a session id then returns a BaseChatMessageHistory object (Store chat history)
        get_session_history=get_session_history,
        # a prompt (dictionary) can have multiple keys, but we only want to save ONE as input
        input_messages_key="input",
        # history_messages_key is the key to save the loaded messages in the dictionary
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

    if message:
        response = with_message_history.invoke(
            {
                "input": message,
                "chat_history": history.messages,
            },
            config={"configurable": {"session_id": session_id}},
        )
        answer = response["answer"]

        # row = insert_chathistory(user_id, session_id, message, answer, "followup")
        # print(f"chathistory inserted at {row}")
    return answer

########################################### career advisor ###########################################

def new_guidance():
    """
    this function generates a new guidance for the users who starting a new session.

    params:
    gen_num: the number of guidance to generate

    returns:
    guidance list
    """

    guidance_list = []
    messages = [
        SystemMessage(
            content=
            """
            You are a computer science university student. 
            Your task is to generate exactly 3 unique questions about achieving career goals, each in one sentence.
            Generate only questions that do not repeat and have a similarity score of less than 0.2.
            Exclude the numerical prefix.
            """
            ),
        HumanMessage(content="")
    ]
    response = llm.invoke(messages)
    for i in response.content.split('\n'):
        guidance_list.append(i)
    return guidance_list


def web_search(query):
        """
        Search for data and prioritize using 'include_domains'

        return:
        json 
        """
        tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

        try:
            response = tavily_client.search(
                query=query, 
                search_depth="advanced",
                max_results=5,
                include_domains=[
                    "hkust.edu.hk",
                    "glassdoor.com",
                    "indeed.com",
                    "linkedin.com",
                    ],
                )["results"]
        except UsageLimitExceededError:
            print("Usage limit exceeded. Please check your plan's usage limits or consider upgrading.")
        return response

def start_career_advisor(data):
    """
    Start a conversation with the career advisor agent.

    table:
    chathistory -> id, userId, sessionId, history, chatTime
    history -> id, session_id, message, created_at (langchain has fixed the schema for PostgresChatMessageHistory)
    checkpoints (for agent) -> thread_id (sesionId), ...
    """

    user_id = data.get('userId')
    is_new_session = data.get('isNewSession')
    prev_session = data.get('sessionId')

    if is_new_session:
        session_id = new_session_id()
    elif prev_session:
        session_id = prev_session
    else:
        session_id = get_session_id(user_id)

    message = data.get("message")

    with PostgresSaver.from_conn_string(os.environ.get("DATABASE_URL")) as checkpointer:
        # NOTE: you need to call .setup() the first time you're using your checkpointer
        checkpointer.setup()

        ai_message = ''

        # put all the tools here
        tools = [web_search]

        agent = create_react_agent(
            model=llm, 
            tools=tools, 
            checkpointer=checkpointer,
            state_modifier=advising_prompt
        )

        response = agent.invoke(
            {"messages": [("human", message)]},
            config={"configurable": {"thread_id": session_id}}
        )['messages'][-1]

        if isinstance(response, AIMessage) and response.content:
            ai_message = response.content

        row = insert_chathistory(user_id, session_id, message, ai_message, "careerAdvisor")
        # print(f"chathistory inserted at {row}")
    return ai_message

def get_session_ids(user_id):
    '''
    get at most 5 chats.

    return: a list of session id
    '''
    session_id_list = []
    size = 5
    conn = os.environ.get("DATABASE_URL")

    sql = f"SELECT sessionId FROM chatHistory WHERE userId='{user_id}' ORDER BY chatTime DESC;"
    
    try:
        with psycopg2.connect(conn) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                rows = cur.fetchall()
                for row in rows:
                    if len(session_id_list) >= size:
                        break
                    # print(row[0])
                    if row[0] not in session_id_list:
                        session_id_list.append(row[0])
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    return session_id_list


def get_history_by_session_id(session_id):
    '''
    return: a list of history
    '''
    history = []
    conn = os.environ.get("DATABASE_URL")

    sql = f"SELECT history FROM chatHistory WHERE sessionId='{session_id}' ORDER BY chatTime ASC;"
    
    try:
        with psycopg2.connect(conn) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                rows = cur.fetchall()
                for row in rows:
                    # print(row[0])
                    history.append(row[0])
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    return history

def get_history_by_user_id(user_id):
    '''
    get the latest chat history by user id.

    return: a list of history
    '''
    session_id = get_session_id(user_id)
    history = get_history_by_session_id(session_id)
    print(history)
    return history