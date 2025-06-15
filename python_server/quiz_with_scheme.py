import json
import os
import re
import tempfile
from textwrap import dedent
from langchain_community.document_loaders import PyPDFLoader
import random
from langchain.chains import RetrievalQA
from database import ChromaDB
from openai import AzureOpenAI
from langchain_openai import AzureChatOpenAI
from document_manager import DocumentManager

async def process_files_content(files, file_type, use_precise_pdf=False):
    """
    Process multiple files and combine their content.
    
    Args:
        files: List of uploaded files
        file_type: Type of files
        use_precise_pdf: Whether to use precise mode for PDFs
    """
    all_content = []
    
    for file in files:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename.lower()) as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file.flush()
                
                # Process the content using DocumentManager
                file_content = await DocumentManager.process_content(
                    temp_file.name,
                    os.path.splitext(file.filename.lower())[1],
                    use_precise_pdf
                )
                all_content.append(file_content)
                
                os.unlink(temp_file.name)
        except Exception as e:
            print(f"Error processing file {file.filename}: {str(e)}")
            continue
    
    return "\n\n".join(all_content)

def get_system_prompt(user_content, difficulty, llm, prompt, language="English", collections=None, metadata_filters=None):
    """
    Get system prompt with context from collections.
    
    Args:
        user_content: The user's input content
        difficulty: Difficulty level for questions
        llm: Language model instance
        prompt: User's specific prompt
        language: Target language for quiz generation (default: English)
        collections: List of collection names to search in
        metadata_filters: Dict of metadata filters for search
    """
    all_documents = []
    context = ""
    
    # If collections specified, get context from vector DB
    if collections:
        for collection_name in collections:
            try:
                db_instance = ChromaDB.get_collection(collection_name)
                docs = db_instance.similarity_search(
                    user_content,
                    k=4,
                    metadata_filters=metadata_filters
                )
                all_documents.extend(docs)
            finally:
                ChromaDB.close_collection(collection_name)
        
        # Combine vector DB results
        context = "\n\n".join(doc.page_content for doc in all_documents)

    # Create the system prompt with the retrieved context and language instruction
    system_prompt = (
        f"You are a professor tasked with creating questions in {language} based on user-uploaded content and retrieved context.\n"
        f"Please generate all questions, answers, and explanations in {language}.\n"
        f"Assign points to each question based on its difficulty equal to {difficulty}.\n"
        "Provide answers for each question but do not include the contextual responses.\n"
        "\n"
        "Here is the user-uploaded content:\n"
        f"{user_content}\n"
    )

    # Add context if available
    if context:
        system_prompt += (
            "\nHere is the retrieved context from reference materials:\n"
            f"{context}\n"
        )

    # Add user prompt
    system_prompt += (
        "\nHere is the user prompt:\n"
        f"{prompt}"
    )
    print(system_prompt)

    return system_prompt





#Question scheme generation
def get_mc_question(propmt, gpt_model, api_client):
    question = (
        "Please generate a multiple-choice question and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'MC' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide, and please only reference the format of the sample question, "
        '{"type": "MC", "question": "Which of the following is not a principle of OOP?", '
        '"point": 1, "choices": ["Encapsulation", "Polymorphism", "Abstraction", "Compilation"], '
        '"answer": "Compilation"}'
        '"explanation": "OOP is centered around four main principles: Encapsulation, Polymorphism, and Abstraction."'
    )
    response = api_client.chat.completions.create(
    model=gpt_model,
    messages=[
        {
            "role": "system", 
            "content": dedent(propmt) + "\nIMPORTANT: Make sure to set the type field exactly as 'MC'."
        },
        {
            "role": "user", 
            "content": question
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
                "name": "mc_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["MC"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "choices": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "choices", "answer","explanation"],
                    "additionalProperties": False
                },
            "strict": True
        }
    }
    )
    return response.choices[0].message.content

def get_tf_with_Coding_question(propmt, gpt_model, api_client):
    question = (
        "Please generate a true/false choice question with code and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'T/F' (not 'object' or anything else). "
        "Provide a code snippet to support the question and ensure the code is correct and relevant to the question. "
        '{"type": "T/F", "question": "Is inheritance a feature of OOP?", '
        '"point": 1, "choices": ["True", "False"], '
        '"code": """\n'
        'class Animal:\n'
        '    def __init__(self, name):\n'
        '        self.name = name\n'
        '\n'
        'class Dog(Animal):\n'
        '    def bark(self):\n'
        '        return f"{self.name} says woof!"\n'
        '\n'
        'dog = Dog("Buddy")\n'
        'print(dog.bark())  # Buddy says woof!\n'
        '""", '
        '"answer": "True"}'
        '"explanation": "Inheritance is a feature of OOP that allows a new class to inherit properties and methods from an existing class, promoting code reuse."'
    )
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(propmt) + "\nIMPORTANT: Make sure to set the type field exactly as 'T/F'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "tf_question_with_coding",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["T/F"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "choices": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "code": {"type": "string"},
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "choices", "code", "answer", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def get_tf_question(propmt, gpt_model, api_client):
    question = (
        "Please generate a true/false choice question and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'T/F' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide, and please only reference the format of the sample question, "
        '{"type": "T/F", "question": "Is inheritance a feature of OOP?", '
        '"point": 1, "choices": ["True", "False"], '
        '"answer": "True"}'
        '"explanation" : "inheritance is a fundamental feature of Object-Oriented Programming (OOP), allowing classes to inherit properties and methods from other classes."'
    )
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(propmt) + "\nIMPORTANT: Make sure to set the type field exactly as 'T/F'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "tf_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["T/F"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "choices": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "answer", "choices", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def get_ordering_question(prompt, gpt_model, api_client):
    question = (
        "Please generate an ordering question and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'Ordering' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide, and please only reference the format of the sample question, "
        '{"type": "Ordering", "question": "Order the following steps in the process of creating an object in OOP.(Drag and drop from top to bottm)", '
        '"point": 4, "choices": ["Define a class", "Use an object", "Define methods", "Create the object"], '
        '"answer": ["Define a class", "Define methods", "Create an object", "Use the object"]}'
        '"explanation": "The correct order of steps in creating an object in OOP is to first define a class, then define methods, create the object, and finally use the object."'
    )
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(prompt) + "\nIMPORTANT: Make sure to set the type field exactly as 'Ordering'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "ordering_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["Ordering"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "choices": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "answer": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "choices", "answer", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def get_fill_blank_question(prompt, gpt_model, api_client):
    question = (
        "Please generate a fill-in-the-blank question and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'Fill_blank' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide, and please only reference the format of the sample question, "
        '{"type": "Fill_blank", "question": "The process of hiding the internal details of an object is called ___.", '
        '"point": 2, '
        '"answer": "Encapsulation"}'
        '"explanation": "Encapsulation is the process of hiding the internal details of an object, allowing access to the object through an interface."'
    )
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(prompt) + "\nIMPORTANT: Make sure to set the type field exactly as 'Fill_blank'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "fill_blank_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["Fill_blank"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "answer", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def get_short_question(prompt, gpt_model, api_client):
    question = (
        "Please generate a short answer question and corresponding answer based on the content of the system prompt. "
        "IMPORTANT: The type field MUST be exactly 'Short_qs' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide, and please only reference the format of the sample question, "
        '{"type": "Short_qs", "question": "What is a constructor in a class?", '
        '"point": 3, '
        '"code": """\n'
        'class Person:\n'
        '    def __init__(self, name, age):\n'
        '        self.name = name\n'
        '        self.age = age\n'
        '\n'
        'person = Person("Alice", 30)\n'
        'print(person.name)  # Alice\n'
        'print(person.age)   # 30\n'
        '""", '
        '"answer": "A constructor is a special method that is automatically called when an object of a class is created."'
        '}'
        '"explanation": "A constructor in a class is a special method that is automatically called when an object of the class is created. It is used to initialize the object\'s attributes."'
    )
    
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(prompt) + "\nIMPORTANT: Make sure to set the type field exactly as 'Short_qs'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "short_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["Short_qs"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "code": {"type": "string"},
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "answer", "code", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def get_long_question(prompt, gpt_model, api_client):
    question = (
        "Please generate a long answer question and corresponding answer based on the content of the prompt. "
        "IMPORTANT: The type field MUST be exactly 'Long_qs' (not 'object' or anything else). "
        "Use the following JSON format of a sample question as a guide. "
        "It is optional to provide a code snippet to support the question but please ensure that the provided code is correct and relevant to the question. "
        '{"type": "Long_qs", "question": "Explain the concept of polymorphism in OOP with an example.", '
        '"point": 6, '
        '"code": """\n'
        'class Shape:\n'
        '    def draw(self):\n'
        '        raise NotImplementedError("Subclasses should implement this method")\n'
        '\n'
        'class Circle(Shape):\n'
        '    def draw(self):\n'
        '        return "Drawing a circle"\n'
        '\n'
        'class Square(Shape):\n'
        '    def draw(self):\n'
        '        return "Drawing a square"\n'
        '\n'
        'shapes = [Circle(), Square()]\n'
        'for shape in shapes:\n'
        '    print(shape.draw())\n'
        '""", '
        '"answer": "Polymorphism in OOP is the ability of different objects to respond to the same function call in different ways."'
        '}'
        '"explanation": "Polymorphism in OOP is the ability of different objects to respond to the same function call in different ways. For example, a base class \'Shape\' might have a method \'draw\'. Subclasses like \'Circle\' and \'Square\' can override the \'draw\' method to provide their specific implementations. When you call \'draw\' on a \'Shape\' object, the correct method for the actual object type (Circle or Square) is called."'
    )
    
    response = api_client.chat.completions.create(
        model=gpt_model,
        messages=[
            {
                "role": "system",
                "content": dedent(prompt) + "\nIMPORTANT: Make sure to set the type field exactly as 'Long_qs'."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "long_question",
                "schema": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["Long_qs"]
                        },
                        "question": {"type": "string"},
                        "point": {"type": "integer"},
                        "code": {"type": "string"},
                        "answer": {"type": "string"},
                        "explanation": {"type": "string"}
                    },
                    "required": ["type", "question", "point", "answer", "code", "explanation"],
                    "additionalProperties": False
                },
                "strict": True
            }
        }
    )
    return response.choices[0].message.content

def quiz_generation_call(system_prompt, number_of_question, gpt_model, api_client):
    quizjson = {
        "quiz": []
    }

    question_types = [
        get_mc_question,
        get_tf_with_Coding_question,
        get_tf_question,
        get_ordering_question,
        get_fill_blank_question,
        get_short_question,
        get_long_question
    ]

    modifiers = [
        "Focus on practical applications of the content.",
        "Emphasize theoretical concepts.",
        "Highlight key definitions and terminology.",
        "Concentrate on examples and illustrations.",
        "Explore real-world scenarios related to the content.",
        "Identify and explain common misconceptions.",
        "Examine case studies related to the subject matter.",
        "Compare and contrast different viewpoints or theories.",
        "Discuss potential future developments in the field.",
        "Request definitions and explanations of key terms.",
        "Ask for the significance of the content in practical settings.",
        "Generate questions that require complex calculation.",
        "Debug and fix errors in the provided code.",
        "Calculate the result of a given mathematical expression.",
        "Solve the given mathematical equation.",
        "Calculate the impact of changing variables in a formula.",
    ]

    for _ in range(number_of_question):
        # Randomly select a question type generating function
        question_function = random.choice(question_types)
        
        # Add variability to the system prompt
        selected_modifier = random.choice(modifiers)
        modified_prompt = f"{system_prompt}\n{selected_modifier}"

        # Generate the question
        question = question_function(modified_prompt, gpt_model, api_client)
        
        # Parse the generated question string into a JSON object
        question_json = json.loads(question)
        # Append the generated question to the quiz
        quizjson["quiz"].append(question_json)

    return quizjson

async def gen_quiz(
    file, 
    inputtext, 
    difficulty, 
    noQuestion, 
    prompt, 
    file_type,
    language="English",
    collections=None,
    metadata_filters=None,
    use_precise_pdf=False
):
    """
    Generate quiz with support for collections and metadata filters.
    
    Args:
        file: List of uploaded files
        inputtext: User input text
        difficulty: Difficulty level
        noQuestion: Number of questions
        prompt: User prompt
        file_type: Type of input files
        language: Target language for quiz generation (default: English)
        collections: List of collection names to search in
        metadata_filters: Dict of metadata filters for search
        use_precise_pdf: Whether to use precise mode for PDFs
    """
    # Initialize OpenAI client
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-01-preview")
    client = AzureOpenAI(
        api_key=api_key,
        api_version=api_version,
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"]
    )

    # Convert content to text
    llm = AzureChatOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
        api_version=api_version,
    )
    
    # Process input content
    content_parts = []
    if inputtext:
        content_parts.append(inputtext)
    
    if file:
        processed_content = await process_files_content(file, file_type, use_precise_pdf)
        if processed_content:
            content_parts.append(processed_content)
    
    # Combine all content
    user_content = "\n\n".join(content_parts)
    
    # Get system prompt with collection context and language
    system_prompt = get_system_prompt(
        user_content=user_content,
        difficulty=difficulty,
        llm=llm,
        prompt=prompt,
        language=language,
        collections=collections,
        metadata_filters=metadata_filters
    )
    
    # Generate quiz
    return quiz_generation_call(
        system_prompt=system_prompt,
        number_of_question=noQuestion,
        gpt_model="gpt-4o-mini",
        api_client=client
    )