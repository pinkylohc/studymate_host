# main.py
# app the api call are set in this file
# feel free the use other .py function to store non-api call function

# 1. testing
# 2. summary generator
# 3. quiz generator
# 4. follow-up chatbot

import os
import random
import fitz
from typing import List, Dict, Any
from datetime import datetime

from fastapi import FastAPI, File, Form, UploadFile, Body, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_openai import AzureChatOpenAI, ChatOpenAI
from openai import AzureOpenAI
from langchain import PromptTemplate
from dotenv import load_dotenv

from document_manager import DocumentManager
from prompts import SUMMARY_PROMPT
from summary_manager import SummaryManager
from database import ChromaDB
from quiz_generation import gen_quiz
from quiz_grader import grader
from chatbot_utils import start_followup_chatbot, start_career_advisor, get_history_by_user_id, get_session_ids, get_history_by_session_id, new_guidance

# Load environment variables
load_dotenv()

# set up the fastapi environment
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM
load_dotenv()
api_key = os.getenv("AZURE_OPENAI_API_KEY")
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://hkust.azure-api.net"
os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4o-mini"
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-01-preview")

client = AzureOpenAI(api_key=api_key,
                     api_version=api_version,
                     azure_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"])

llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    api_version=api_version,
)

# 1. testing request
# Starting API as a sample
@app.get("/")
def root():
    return {"message": "Hello World!!"}


#######################################################
# 2. summary generator
# This API use for upload the files/text entry for summary generator 
# this API is call in next_app/components/generator/summary_genrator_form.tsx (u can also add more input parameter in this file)

# @param files :content of the upload file
# @param inputtext: content of the user input text
# @param type : type of file/text ['Text', 'PDF/Word', 'Image', 'Audio', 'Video'] from next_app/lib/generator_const.ts

# return - JSON array of summary, u can refer to sample_summary.py for more detail

# if type == 'Text', use @param inputtext as source
# if type != 'Text', use @param files and handle it accordingly
 
# currently, assume the mix of diff file type (like pdf+png) is not allowed, if you want to allow this set up
# please change the code in next_app/components/generator/summary_genrator_form.tsx && file_loader.tsx
# file next_app/lib/generator_const.ts set the accepted file type for each @param type, modify it if needed
# ** the above two file loader setup is used for all generator

@app.post("/summary/submit")
async def submit_summary(
    files: List[UploadFile] = File([]),
    inputtext: str = Form(""),
    file_type: str = Form(...),
    collections: List[str] = Form(None),
    course_codes: List[str] = Form(None),
    topics: List[str] = Form(None),
    filenames: List[str] = Form(None),
    precise_pdf: str = Form("false")
):
    try:
        # Parse collections if provided
        collection_list = (
            collections[0].split(',') if collections 
            and isinstance(collections[0], str) 
            and ',' in collections[0]
            else collections
        )
        
        # Build metadata filters
        metadata_filters = {}
        if course_codes:
            metadata_filters["course_code"] = course_codes[0].split(',') if ',' in course_codes[0] else course_codes
        if topics:
            metadata_filters["topic"] = topics[0].split(',') if ',' in topics[0] else topics
        if filenames:
            metadata_filters["filename"] = filenames[0].split(',') if ',' in filenames[0] else filenames
        
        # Convert precise_pdf string to boolean
        use_precise_pdf = precise_pdf.lower() == "true"
        
        return await SummaryManager.submit_summary(
            files=files,
            inputtext=inputtext,
            file_type=file_type,
            llm=llm,
            SUMMARY_PROMPT=SUMMARY_PROMPT,
            collections=collection_list,
            metadata_filters=metadata_filters if metadata_filters else None,
            use_precise_pdf=use_precise_pdf
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error processing request: {str(e)}"}
        )
######## 2. end summary generator ###########






#######################################################
# 3. quiz generator

# 3.1 submit quiz generator request ##########################
# This API use for upload the files/text entry && paramter for quiz generator 
# this API is call in next_app/components/generator/quiz_genrator_form.tsx (u can also add more input parameter in this file)

# @param files :content of the upload file
# @param inputtext: content of the user input text
# @param language: language of quiz - [English, Chinese]
# @param difficulty: diffculty level - ['Easy', 'Medium', 'Hard']
# @param noQuestion: number of question (int)
# @param prompt: prompt (area to focus)
# @param type : type of file/text ['Text', 'PDF/Word', 'Image', 'Audio', 'Video'] from next_app/lib/generator_const.ts

# return - JSON array (refer to sample_quiz.py for more detail)

# if type == 'Text' then use @param inputtext as source
# if type != 'Text', use @param files and handle it accordingly
 
# currently, assume the mix of diff file type (like pdf+png) is not allowed, if you want to allow this set up
# please change the code in next_app/components/generator/quiz_genrator_form.tsx && file_loader.tsx
# file next_app/lib/generator_const.ts set the accepted file type for each @param type, modify it if needed
# ** the above two file loader setup is used for all generator

@app.post("/quiz/submit")
async def submit_quiz(
    files: List[UploadFile] = File(default=[]),
    inputtext: str = Form(default=""),
    language: str = Form(...),
    difficulty: str = Form(...),
    noQuestion: str = Form(...),
    prompt: str = Form(default=""),
    file_type: str = Form(default="Auto"),
    collections: List[str] = Form(default=None),
    course_codes: List[str] = Form(default=None),
    topics: List[str] = Form(default=None),
    filenames: List[str] = Form(default=None),
    precise_pdf: str = Form(default="false")
):
    try:
        # Validate input
        if not files and not inputtext.strip():
            raise HTTPException(
                status_code=400,
                detail="Either files or input text must be provided"
            )

        # Validate language
        if language not in ["English", "Chinese"]:
            raise HTTPException(
                status_code=422,
                detail="Language must be either 'English' or 'Chinese'"
            )

        # Parse collections if provided
        collection_list = None
        if collections:
            collection_list = (
                collections[0].split(',') if isinstance(collections[0], str) and ',' in collections[0]
                else collections
            )
        
        # Build metadata filters
        metadata_filters = {}
        if course_codes:
            metadata_filters["course_code"] = course_codes[0].split(',') if ',' in course_codes[0] else course_codes
        if topics:
            metadata_filters["topic"] = topics[0].split(',') if ',' in topics[0] else topics
        if filenames:
            metadata_filters["filename"] = filenames[0].split(',') if ',' in filenames[0] else filenames

        # Convert precise_pdf string to boolean
        use_precise_pdf = precise_pdf.lower() == "true"

        # Call gen_quiz with proper parameters
        result = await gen_quiz(
            file=files,
            file_type=file_type,
            inputtext=inputtext,
            difficulty=difficulty,
            noQuestion=int(noQuestion),
            prompt=prompt or "",
            language=language,
            collections=collection_list,
            metadata_filters=metadata_filters if metadata_filters else None,
            use_precise_pdf=use_precise_pdf
        )
        
        return JSONResponse(content=result)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating quiz: {str(e)}"
        )



# 3.2 submit quiz result and answer ##########################
# This API use for grading the user answer 
# this API is call in next_app/components/generator/quiz_card.tsx 

# @param quiz : json with quiz content and user answer (same format as sample_quiz.py but for each element in quiz a additional field - user_answer)
# (refer to sample_quiz_user_input.py as example)

# return - JSON array (refer to quiz_result_return.py for more detail)
@app.post("/quiz/grade")
async def grade_quiz(userquiz: Dict[str, Any] = Body(...)):
    print(userquiz) # print the quiz
    result = grader(userquiz)
    #sample_result = quiz_return_result
    print(result)
    return JSONResponse(content=result)
######## 3. end quiz generator ###########


#######################################################
# 4. follow-up chatbot
# This API is used for a chatbot after the user finish the quiz
# this is used in next_app/components/chatbot/followup_chatbot.tsx
# @param chathistory: the chat history of the current chat
# @param message: the message from the user
# @param quiz: the database rows for quiz
# @param result: the database rows for current quiz result

@app.post("/followup-chatbot")
async def followup_chatbot(request: Request):
    """
    Answer questions based on the quiz and the user's results.

    return:
    AI response message
    """
    data = await request.json()
    
    quiz = data.get("quiz")
    result = data.get("result")
    message = data.get("message")
    chatHistory = data.get("chatHistory")

    # Log the incoming data
    print(f"Chat history: {chatHistory}")
    print(f"Quiz: {quiz}")
    print(f"Result: {result}")
    print(f"Message: {message}")

    # AI response
    response_message = start_followup_chatbot(data)

    # Return the response
    return JSONResponse(content=response_message)


@app.post("/careeradvising-chatbot")
async def career_advising_chatbot(request: Request):
    """
    ReAct agent that can use a web search tool and respond with sources.

    return:
    AI response message
    """
    data = await request.json()
    response_message = start_career_advisor(data)
    return JSONResponse(content=response_message)

@app.get("/careeradvising-chatbot/guidance")
async def guidance():
    '''
    generate guidance for new chat.
    '''
    guidance_list = new_guidance()
    return JSONResponse(content=guidance_list)

@app.get("/careeradvising-chatbot/history/{userId}")
async def history(userId: str):
    '''
    retrieve the most recent history.
    '''
    history = get_history_by_user_id(userId)
    return JSONResponse(content=history)

@app.get("/careeradvising-chatbot/sessions/{userId}")
async def get_session(userId: str):
    '''
    get recent session ids.
    '''
    session_id_list = get_session_ids(userId)
    return JSONResponse(content=session_id_list)

@app.get("/careeradvising-chatbot/{sessionId}")
async def history_by_session_id(sessionId: str):
    '''
    retrieve the chat history by session id.
    '''
    history = get_history_by_session_id(sessionId)
    return JSONResponse(content=history)

#######################################################
# 5. Document Management APIs
# This section contains endpoints for managing documents:
# - Upload documents (from files or paths)
# - List documents
# - Delete documents
# - Get collection metadata
#######################################################

@app.post("/documents/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    document_type: str = Form(...),
    course_code: str = Form(...),
    topic: str = Form(...),
    user_email: str = Form(None),
    collection_name: str = Form(None),
    precise_pdf: str = Form("false")
):
    """Handle multiple uploads at once."""
    # Determine collection name based on inputs
    if collection_name:
        # Developer upload to specified collection
        target_collection = collection_name
    elif user_email:
        # User upload to their personal collection
        target_collection = DocumentManager.get_collection_name(user_email)
    else:
        raise HTTPException(status_code=400, detail="Either collection_name or user_email must be provided")

    # Convert precise_pdf string to boolean
    use_precise_pdf = precise_pdf.lower() == "true"

    results = []
    for file in files:
        single_result = await DocumentManager.upload_document(
            file=file,
            document_type=document_type,
            course_code=course_code,
            topic=topic,
            user_email=user_email,
            collection_name=target_collection,
            use_precise_pdf=use_precise_pdf
        )
        results.append(single_result)

    return JSONResponse(
        content={"message": "Batch upload complete", "details": results}
    )

@app.get("/documents/{collection_name}")
async def list_documents(collection_name: str = "default"):
    """List all documents in the specified collection."""
    try:
        result = await DocumentManager.list_documents(collection_name)
        return result
    finally:
        ChromaDB.close_collection(collection_name)

@app.delete("/documents/{collection_name}/{document_id}")
async def delete_document(collection_name: str, document_id: str):
    """Delete a document from the specified collection."""
    return await DocumentManager.delete_document(document_id, collection_name)

@app.post("/documents/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    document_type: str = Form(...),
    course_code: str = Form(...),
    topic: str = Form(...),
    user_email: str = Form(...)
):
    """Handle multiple uploads at once."""
    results = []
    for file in files:
        # DocumentManager.upload_document now returns a dict
        single_result = await DocumentManager.upload_document(
            file=file,
            document_type=document_type,
            course_code=course_code,
            topic=topic,
            user_email=user_email
        )
        results.append(single_result)

    return JSONResponse(
        content={"message": "Batch upload complete", "details": results}
    )

@app.get("/documents/{collection_name}/metadata")
async def get_collection_metadata(collection_name: str):
    """Get metadata information for a collection."""
    try:
        db_instance = ChromaDB.get_collection(collection_name)
        collection_data = db_instance.vector_store._collection.get()
        
        # Extract unique metadata values
        metadata = {
            "course_codes": set(),
            "topics": set(),
            "filenames": set()
        }
        
        for doc_metadata in collection_data["metadatas"]:
            if doc_metadata:
                if "course_code" in doc_metadata:
                    metadata["course_codes"].add(doc_metadata["course_code"])
                if "topic" in doc_metadata:
                    metadata["topics"].add(doc_metadata["topic"])
                if "filename" in doc_metadata:
                    metadata["filenames"].add(doc_metadata["filename"])
        
        # Convert sets to sorted lists for JSON serialization
        return JSONResponse({
            "course_codes": sorted(list(metadata["course_codes"])),
            "topics": sorted(list(metadata["topics"])),
            "filenames": sorted(list(metadata["filenames"]))
        })
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error fetching metadata: {str(e)}"}
        )
    finally:
        ChromaDB.close_collection(collection_name)

@app.post("/documents/upload-from-paths")
async def upload_from_paths(
    paths: List[str] = Body(...),
    document_type: str = Body(...),
    course_code: str = Body(...),
    topic: str = Body(...),
    collection_name: str = Body("default"),
    recursive: bool = Body(True)
):
    """
    Upload documents from file paths and/or directories.
    
    Example request body:
    {
        "paths": [
            "/path/to/single/file.pdf",
            "/path/to/directory",
            "/path/to/another/file.docx"
        ],
        "document_type": "Auto",
        "course_code": "CS101",
        "topic": "Introduction to Programming",
        "collection_name": "my_collection",
        "recursive": true
    }
    """
    try:
        result = await DocumentManager.upload_from_paths(
            paths=paths,
            document_type=document_type,
            course_code=course_code,
            topic=topic,
            collection_name=collection_name,
            recursive=recursive
        )
        
        return JSONResponse(content=result)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error processing uploads: {str(e)}"}
        )


######## 5. End Document Management APIs ###########
    
#######################################################
# 6. test
#######################################################

@app.post("/test/metadata-search")
async def test_metadata_search(
    query: str = Form(...),
    collections: List[str] = Form(None),
    course_codes: List[str] = Form(None),
    topics: List[str] = Form(None),
    filenames: List[str] = Form(None)
):
    """Test endpoint to verify metadata filtering."""
    try:
        # Parse collections
        collection_list = (
            collections[0].split(',') if collections 
            and isinstance(collections[0], str) 
            and ',' in collections[0]
            else collections
        )
        
        # Build metadata filters
        metadata_filters = {}
        if course_codes:
            metadata_filters["course_code"] = course_codes[0].split(',') if ',' in course_codes[0] else course_codes
        if topics:
            metadata_filters["topic"] = topics[0].split(',') if ',' in topics[0] else topics
        if filenames:
            metadata_filters["filename"] = filenames[0].split(',') if ',' in filenames[0] else filenames

        all_results = []
        # Search across specified collections
        for collection_name in collection_list:
            try:
                db_instance = ChromaDB.get_collection(collection_name)
                docs = db_instance.similarity_search(
                    query=query,
                    k=4,
                    metadata_filters=metadata_filters
                )
                
                # Format results for this collection
                collection_results = [{
                    "content": doc.page_content[:200] + "...",  # First 200 chars for preview
                    "metadata": doc.metadata,
                    "collection": collection_name
                } for doc in docs]
                
                all_results.extend(collection_results)
            finally:
                ChromaDB.close_collection(collection_name)

        return JSONResponse({
            "query": query,
            "filters_applied": metadata_filters,
            "collections_searched": collection_list,
            "results": all_results,
            "total_results": len(all_results)
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error in metadata search: {str(e)}"}
        )
