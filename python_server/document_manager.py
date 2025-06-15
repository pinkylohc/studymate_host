import os
import tempfile
from datetime import datetime
from typing import Dict, Any, List, Tuple
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse
from database import ChromaDB
from markitdown import MarkItDown
from openai import AzureOpenAI, OpenAI
from langchain.schema import Document
from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered
from langchain.prompts import PromptTemplate

SUPPORTED_FILE_TYPES = {
    'pdf': '.pdf',
    'docx': '.docx',
    'pptx': '.pptx',
    'xlsx': '.xlsx',
    'jpg': '.jpg',
    'jpeg': '.jpeg',
    'png': '.png',
    'mp3': '.mp3',
    'wav': '.wav',
    'html': '.html',
    'txt': '.txt',
    'md': '.md'
}

class DocumentManager:
    _md = None
    _pdf_converter = PdfConverter(
        artifact_dict=create_model_dict(),
    )

    @classmethod
    def get_markitdown(cls):
        if cls._md is None:
            
            #change it to your API key
            load_dotenv()
            api_key = os.getenv("AZURE_OPENAI_API_KEY")
            os.environ["AZURE_OPENAI_ENDPOINT"] = "https://hkust.azure-api.net"
            os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = "gpt-4o-mini"
            api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")

            client = AzureOpenAI(api_key=api_key,
                                api_version=api_version,
                                azure_endpoint = os.environ["AZURE_OPENAI_ENDPOINT"])
            
            cls._md = MarkItDown(llm_client=client, llm_model="gpt-4o")
        return cls._md

    @staticmethod
    def pdf_to_markdown_precise(file_path: str) -> Tuple[str, List]:
        """
        Convert PDF to markdown and extract images.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Tuple containing:
                - markdown text
                - list of extracted images
        """
        try:
            rendered = DocumentManager._pdf_converter(file_path)
            text, _, images = text_from_rendered(rendered)
            return text, images
        except Exception as e:
            print(f"Error converting PDF to markdown: {str(e)}")
            raise

    @staticmethod
    async def process_content(file_path: str, file_extension: str, use_precise_pdf: bool = False) -> str:
        """
        Extract content from file based on type
        
        Args:
            file_path: Path to the file
            file_extension: File extension
            use_precise_pdf: Whether to use precise mode for PDFs
        """
        md = DocumentManager.get_markitdown()
        
        if file_extension == '.pdf' and use_precise_pdf:
            text, _ = DocumentManager.pdf_to_markdown_precise(file_path)
            return text
        elif file_extension == '.md':
            with open(file_path, 'r') as f:
                return f.read()
            
        try:
            result = md.convert(file_path)
            return result.text_content
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing file: {str(e)}"
            )

    @staticmethod
    def get_collection_name(user_email: str) -> str:
        """Generate collection name based on user email"""
        # Create a valid collection name from email
        return f"user_{user_email.replace('@', '_').replace('.', '_')}"

    @staticmethod
    async def upload_document(
        file: UploadFile,
        document_type: str,
        course_code: str,
        topic: str,
        user_email: str,
        collection_name: str = "default",
        use_precise_pdf: bool = False
    ) -> dict:
        """Process one file upload and return a dictionary with the result."""
        db_instance = None
        try:
            # Get the specified collection
            db_instance = ChromaDB.get_collection(collection_name)
            
            file_extension = os.path.splitext(file.filename.lower())[1]
            
            if file_extension not in SUPPORTED_FILE_TYPES.values():
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported format. Supported: {', '.join(SUPPORTED_FILE_TYPES.values())}"
                )

            content = await file.read()
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                # Write content to temp file
                temp_file.write(content)
                temp_file.flush()
                
                try:
                    metadata = {
                        "filename": file.filename,
                        "course_code": course_code,
                        "type": file_extension, 
                        "topic": topic,
                        "user_email": user_email,
                        "date_added": datetime.now().isoformat()
                    }
                    
                    # debug file type
                    print(f"File type: {file_extension}")

                    markdown_content = await DocumentManager.process_content(
                        temp_file.name,
                        file_extension,
                        use_precise_pdf
                    )
                    
                    print("sussessfully converted to markdown")
                    # Add to vector store as Document
                    db_instance.add_documents([
                        Document(
                            page_content=markdown_content,
                            metadata=metadata
                        )
                    ])

                    print("sussessfully added to db")
                finally:
                    # Clean up: remove temp file
                    os.unlink(temp_file.name)

            return {
                "message": "Document uploaded successfully",
                "filename": file.filename,
                "metadata": metadata,
                "collection": collection_name
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading document: {str(e)}"
            )
        finally:
            if db_instance:
                ChromaDB.close_collection(collection_name)

    @staticmethod
    async def list_documents(collection_name: str = "default") -> JSONResponse:
        """List all documents in the specified collection."""
        db_instance = None
        try:
            db_instance = ChromaDB.get_collection(collection_name)
            collection_info = db_instance.get_collection_info()
            return JSONResponse(content=collection_info)
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": f"An error occurred: {str(e)}"}
            )
        finally:
            if db_instance:
                ChromaDB.close_collection(collection_name)

    @staticmethod
    async def delete_document(document_id: str, collection_name: str = "default") -> JSONResponse:
        """Delete a document from the specified collection."""
        db_instance = None
        try:
            db_instance = ChromaDB.get_collection(collection_name)
            success = db_instance.delete_document(document_id)
            if success:
                return JSONResponse(content={"message": f"Document {document_id} deleted successfully"})
            else:
                return JSONResponse(
                    status_code=404,
                    content={"error": f"Document {document_id} not found or could not be deleted"}
                )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": f"An error occurred: {str(e)}"}
            )
        finally:
            if db_instance:
                ChromaDB.close_collection(collection_name)

    @staticmethod
    async def process_files(files: List[UploadFile], use_precise_pdf: bool = False) -> List[str]:
        """
        Process uploaded files and convert to markdown content.
        
        Args:
            files: List of uploaded files to process
            use_precise_pdf: Whether to use precise mode for PDFs
        """
        processed_content = []
        for file in files:
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename.lower()) as temp_file:
                    content = await file.read()
                    temp_file.write(content)
                    temp_file.flush()
                    
                    markdown_content = await DocumentManager.process_content(
                        temp_file.name,
                        os.path.splitext(file.filename.lower())[1],
                        use_precise_pdf
                    )
                    processed_content.append(markdown_content)
                    
                    os.unlink(temp_file.name)
            except Exception as e:
                print(f"Error processing file {file.filename}: {str(e)}")
                continue
        return processed_content

    @staticmethod
    async def upload_document_from_path(
        file_path: str,
        document_type: str,
        course_code: str,
        topic: str,
        collection_name: str = "default"
    ) -> dict:
        """
        Upload a document from a file path (for developer use).
        
        Args:
            file_path: Path to the file on the server
            document_type: Type of document
            course_code: Course code for the document
            topic: Topic of the document
            collection_name: Name of the collection to store in
            
        Returns:
            Dictionary containing upload result details
        """
        db_instance = None
        try:
            # Get the specified collection
            db_instance = ChromaDB.get_collection(collection_name)
            
            file_extension = os.path.splitext(file_path.lower())[1]
            
            if file_extension not in SUPPORTED_FILE_TYPES.values():
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported format. Supported: {', '.join(SUPPORTED_FILE_TYPES.values())}"
                )
                
            try:
                metadata = {
                    "filename": os.path.basename(file_path),
                    "course_code": course_code,
                    "type": file_extension,
                    "topic": topic,
                    "date_added": datetime.now().isoformat()
                }
                
                # Convert content to markdown
                markdown_content = await DocumentManager.process_content(
                    file_path,
                    file_extension
                )
                
                # Add to vector store
                db_instance.add_documents([
                    Document(
                        page_content=markdown_content,
                        metadata=metadata
                    )
                ])

                return {
                    "message": "Document uploaded successfully",
                    "filename": os.path.basename(file_path),
                    "metadata": metadata,
                    "collection": collection_name
                }

            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing file: {str(e)}"
                )

        except Exception as e:
            if db_instance:
                ChromaDB.close_collection(collection_name)
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading document: {str(e)}"
            )

    @staticmethod
    async def upload_from_paths(
        paths: List[str],
        document_type: str,
        course_code: str,
        topic: str,
        collection_name: str = "default",
        recursive: bool = True
    ) -> dict:
        """
        Unified upload function that handles both file paths and directories.
        
        Args:
            paths: List of file or directory paths
            document_type: Type of documents
            course_code: Course code for the documents
            topic: Topic of the documents
            collection_name: Name of the collection to store in
            recursive: Whether to search subdirectories recursively
            
        Returns:
            Dictionary containing upload results
        """
        results = []
        errors = []
        
        async def process_directory(dir_path: str):
            """Helper function to process a directory"""
            for entry in os.scandir(dir_path):
                if entry.is_file():
                    # Check if file extension is supported
                    file_extension = os.path.splitext(entry.name.lower())[1]
                    if file_extension in SUPPORTED_FILE_TYPES.values():
                        await process_file(entry.path)
                elif entry.is_dir() and recursive:
                    # Recursively process subdirectories if recursive is True
                    await process_directory(entry.path)
        
        async def process_file(file_path: str):
            """Helper function to process a single file"""
            try:
                if not os.path.exists(file_path):
                    raise FileNotFoundError(f"File not found: {file_path}")
                    
                file_extension = os.path.splitext(file_path.lower())[1]
                if file_extension not in SUPPORTED_FILE_TYPES.values():
                    raise ValueError(f"Unsupported file type: {file_extension}")
                    
                result = await DocumentManager.upload_document_from_path(
                    file_path=file_path,
                    document_type=document_type,
                    course_code=course_code,
                    topic=topic,
                    collection_name=collection_name
                )
                results.append(result)
            except Exception as e:
                errors.append({
                    "file": file_path,
                    "error": str(e)
                })
        
        # Process each path
        for path in paths:
            if os.path.isdir(path):
                await process_directory(path)
            else:
                await process_file(path)
        
        return {
            "message": f"Upload complete. Processed {len(results)} files successfully, {len(errors)} failures",
            "successful_uploads": results,
            "errors": errors,
            "collection": collection_name
        }
