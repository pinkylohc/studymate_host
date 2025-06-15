import json
import os
from langchain_openai import AzureChatOpenAI
from dotenv import load_dotenv
from openai import AzureOpenAI

# for user content summary and vectordatabase generation
load_dotenv()
api_key = os.getenv("AZURE_OPENAI_API_KEY")
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://hkust.azure-api.net"
os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4o-mini"
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")

llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    api_version=api_version,
)


def grader(quiz):
    
    user_point = 0
    total_point = 0

    results = []
    current_question_point = 0
    current_question_user_point = 0
    current_question_explanation = ''

    questions = quiz_praser(quiz)
    flag = True
    #print(len(questions))
    for question in questions:
        match question['type']:
            case 'T/F':
                flag = True
                current_question_user_point, current_question_point, current_question_explanation = grade_absolute(question)
            case 'MC':
                flag = True
                current_question_user_point, current_question_point, current_question_explanation = grade_absolute(question)
            #case 'Fill_blank':
            #    current_question_point, current_question_user_point, current_question_explanation = grade_fill_blank(question)
            case "Ordering":
                flag = True
                current_question_user_point, current_question_point, current_question_explanation = grade_ordering(question)
            case 'Fill_blank' | 'Short_qs' | 'Long_qs':
                flag = True
                current_question_user_point, current_question_point, current_question_explanation = llm_grading(question)
            case _:
                flag = False
                continue
        if(flag == True):
        #current_question_user_point, current_question_point, current_question_explanation
            results.append(result_maker(current_question_user_point, current_question_point, current_question_explanation))
            user_point += current_question_user_point
            total_point += current_question_point
    
    score = f"{user_point}/{total_point}"
    quiz_result ={
        "total_score" : score,
        "result" : results
    }

    # Analyze performance using LLM
    performance_analysis = analyze_performance(quiz)
    quiz_result["performance_comment"] = performance_analysis
    print("Grading results")

    return quiz_result

def quiz_praser(quiz):

    if isinstance(quiz, str):
        quiz_data = json.loads(quiz)
    elif isinstance(quiz, dict):
        quiz_data = quiz
    # Extract questions into a list
    questions_list = []
    for item in quiz_data['quiz']:
        questions_list.append(item)
    return questions_list

def result_maker(current_question_user_point, current_question_point, current_question_explanation):
    score = f"{current_question_user_point}/{current_question_point}"
    # Return a dictionary directly instead of JSON string
    return {
        "correct": score,
        "explanation": current_question_explanation
    }

def grade_absolute(question):
    user_point = 0
    question_point = question['point']
    if(question['answer'] == question['user_answer'][0]):
        user_point = question_point
    return user_point , question_point , question['explanation']

def grade_ordering(question):
    user_point = 0
    question_point = question['point']
    num_of_match = 0
    num_of_option = len(question['answer'])
    for i in range(num_of_option):
        if(question['answer'][i] == question['user_answer'][i]):
            print (question['answer'][i])
            print (question['user_answer'][i])
            num_of_match+=1
    user_point = question_point*(num_of_match/num_of_option)
    if user_point == 1.0:
        user_point = 1
    return user_point , question_point , question['explanation']

def llm_grading(question):
    user_point = 0
    question_point = question['point']
    question_content = question['question']
    question_answer = question['answer']
    user_answer = question['user_answer']
    
    # Create the prompt for the LLM
    prompt = (
        f"Question: {question_content}\n"
        f"Correct Answer: {question_answer}\n"
        f"User Answer: {' '.join(user_answer)}\n"
        f"Grade the user answer on a scale from 0 to {question_point} based on its correctness.\n"
        f"Provide feedback on the answer.\n"
        f"Ensure that you provide the score first and then give the evaluation."
    )

    messages = [
        (
            "system",
            "You are an AI grading assistant. Your task is to evaluate student responses to quiz questions based on the provided correct answers. You should assess the accuracy of the answers, provide a score that reflects the correctness (from 0 to the total possible points for the question), and offer constructive feedback. Make sure to be fair, objective, and clear in your evaluations. Consider the following when grading: completeness, relevance, and correctness of the answer."
        ),
        ("human", prompt),
    ]
    
    # Invoke the LLM and get the response
    llm_response = llm.invoke(messages).content

    # Initialize score and feedback
    score = 0
    feedback = ""

    # Print the LLM response for debugging
    # print(llm_response)
    
    # Parse the LLM response with exception handling
    try:
        if "Score:" in llm_response:
            # Extract the score part
            score_part = llm_response.split("Score:")[1].split("\n")[0].strip()  # Get the score line
            score = int(score_part.split('/')[0])  # Extract the numerator from the score

            # Extract the evaluation part
            if "Evaluation:" in llm_response:
                feedback_part = llm_response.split("Evaluation:")[1].strip()  # Get the evaluation part
            else:
                feedback_part = "No evaluation provided."
        else:
            feedback_part = "No score provided."
    except (IndexError, ValueError) as e:
        feedback_part = f"Error parsing response: {str(e)}"

    # Ensure the score does not exceed the question points
    user_point = min(score, question_point)

    # Combine question answer and feedback into a single string
    combined_answer_feedback = f"Correct Answer: {question_answer}; Feedback: {feedback_part}"

    return user_point, question_point, combined_answer_feedback

def analyze_performance(quiz):
    # Convert the quiz JSON into a string
    quiz_json_str = json.dumps(quiz, indent=2)

    prompt = (
        f"You are a professor with expertise in the subject matter. Analyze the following quiz results and provide concise insights on the user's performance. "
        f"Identify specific topics or areas where the user needs improvement and suggest study materials or resources to help them improve. "
        f"Additionally, provide motivational comments to encourage the user. "
        f"Remember to address the user directly using 'you' in your sentences.\n\n"
        f"Quiz JSON:\n{quiz_json_str}\n\n"
        "Based on the above results, please provide the following in 6 sentences:\n"
        "1. Concise insights on the user's performance.\n"
        "2. Specific topics or areas where the user needs improvement.\n"
        "3. Motivational comments to encourage the user.\n"
    )

    messages = [
        {
            "role": "system",
            "content": "You are an AI assistant that provides insights and suggestions for improvement based on quiz results."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    # Invoke the LLM and get the response
    llm_response = llm.invoke(messages).content

    return llm_response