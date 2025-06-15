import os
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI
from langchain_chroma import Chroma
from langchain_openai import AzureOpenAIEmbeddings
import quiz_with_scheme
from openai import AzureOpenAI

load_dotenv()

#MODEL = "gpt-35-turbo"
MODEL = "gpt-4o-mini"

load_dotenv()
api_key = os.getenv("AZURE_OPENAI_API_KEY")
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://hkust.azure-api.net"
os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4o-mini"
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")

client = AzureOpenAI(api_key=api_key,
                     api_version=api_version,
                     azure_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"])
llm = AzureChatOpenAI(
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    azure_deployment=os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"],
    api_version=api_version,
)

async def gen_quiz(
    file, 
    file_type, 
    inputtext, 
    difficulty, 
    noQuestion, 
    prompt,
    language="English",
    collections=None,
    metadata_filters=None,
    use_precise_pdf=False
):
    """
    Generate quiz using DocumentManager for file processing.
    
    Args:
        file: List of uploaded files
        file_type: Type of input files
        inputtext: User input text
        difficulty: Difficulty level
        noQuestion: Number of questions
        prompt: User prompt
        language: Target language for quiz generation (default: English)
        collections: List of collection names to search in
        metadata_filters: Dict of metadata filters for search
        use_precise_pdf: Whether to use precise mode for PDFs
    """
    quiz_json = await quiz_with_scheme.gen_quiz(
        file=file,
        inputtext=inputtext,
        difficulty=difficulty,
        noQuestion=noQuestion,
        prompt=prompt,
        file_type=file_type,
        language=language,
        collections=collections,
        metadata_filters=metadata_filters,
        use_precise_pdf=use_precise_pdf
    )
    
    print("")
    print(quiz_json)
    print("")
    return quiz_json