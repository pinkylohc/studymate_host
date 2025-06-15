import os
from typing import List, Dict, Any, Optional
from langchain_chroma import Chroma
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings, OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain.schema import Document
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables / Change to your API key
load_dotenv()
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://hkust.azure-api.net"
os.environ["AZURE_OPENAI_API_KEY"] = os.getenv("AZURE_OPENAI_API_KEY")
os.environ["AZURE_OPENAI_API_VERSION"] = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-01-preview")

embed_model = AzureOpenAIEmbeddings()

class ChromaDB:
    _instances: Dict[str, 'ChromaDB'] = {}  # Collection name -> Instance mapping
    
    def __init__(self, collection_name: str = "default", persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.vector_store = self._initialize_vector_store()

    def _initialize_vector_store(self) -> Chroma:
        """Initialize or load the Chroma vector store with specific collection."""
        return Chroma(
            collection_name=self.collection_name,
            persist_directory=self.persist_directory,
            embedding_function=embed_model
        )

    def add_documents(self, documents: List[Document]) -> None:
        """Add documents to the vector store."""
        print(f"Adding {len(documents)} documents to the vector store")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=200,
            separators=[
                "\n\n",
                "\n",
                " ",
                ".",
                ",",
                "\u200b",  # Zero-width space
                "\uff0c",  # Fullwidth comma
                "\u3001",  # Ideographic comma
                "\uff0e",  # Fullwidth full stop
                "\u3002",  # Ideographic full stop
                "",
            ],
        )
        split_docs = text_splitter.split_documents(documents)
        self.vector_store.add_documents(split_docs)

    def similarity_search(
        self, 
        query: str, 
        k: int = 4,
        metadata_filters: dict = None
    ) -> List[Document]:
        """
        Perform similarity search with optional metadata filters.
        
        Args:
            query: Search query
            k: Number of results to return
            metadata_filters: Dict of metadata filters, e.g.,
                {
                    "course_code": ["CS101", "CS102"],
                    "topic": ["Introduction", "Arrays"],
                    "filename": ["lecture1.pdf"]
                }
        """
        where_clause = {}
        
        if metadata_filters:
            conditions = []
            
            # Handle course code filter
            if "course_code" in metadata_filters and metadata_filters["course_code"]:
                if len(metadata_filters["course_code"]) == 1:
                    conditions.append({"course_code": metadata_filters["course_code"][0]})
                else:
                    conditions.append({
                        "$or": [{"course_code": code} for code in metadata_filters["course_code"]]
                    })
            
            # Handle topic filter
            if "topic" in metadata_filters and metadata_filters["topic"]:
                if len(metadata_filters["topic"]) == 1:
                    conditions.append({"topic": metadata_filters["topic"][0]})
                else:
                    conditions.append({
                        "$or": [{"topic": topic} for topic in metadata_filters["topic"]]
                    })
            
            # Handle filename filter
            if "filename" in metadata_filters and metadata_filters["filename"]:
                if len(metadata_filters["filename"]) == 1:
                    conditions.append({"filename": metadata_filters["filename"][0]})
                else:
                    conditions.append({
                        "$or": [{"filename": fname} for fname in metadata_filters["filename"]]
                    })
            
            # Combine all conditions with $and
            if conditions:
                if len(conditions) == 1:
                    where_clause = conditions[0]
                else:
                    where_clause = {"$and": conditions}
        
        # Get embeddings for the query
        query_embedding = embed_model.embed_query(query)
        
        # Perform the search with filters
        results = self.vector_store._collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where_clause if where_clause else None
        )
        
        # Convert results to Documents
        documents = []
        if results['ids'] and len(results['ids']) > 0:  # Check if we have results
            for i in range(len(results['ids'][0])):
                doc = Document(
                    page_content=results['documents'][0][i],
                    metadata=results['metadatas'][0][i]
                )
                documents.append(doc)
        
        return documents

    def as_retriever(self):
        """Get the vector store as a retriever."""
        return self.vector_store.as_retriever()
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about all documents in the collection."""
        return {
            "count": self.vector_store._collection.count(),
            "documents": [
                {
                    "id": metadata.get("filename", "Unknown"),
                    "type": metadata.get("type", "Unknown"),
                    "date_added": metadata.get("date_added", "Unknown")
                }
                for metadata in self.vector_store._collection.get()["metadatas"]
            ]
        }
    
    def delete_document(self, document_id: str) -> bool:
        """Delete a document from the vector store by its ID."""
        try:
            self.vector_store._collection.delete(
                where={"filename": document_id}
            )
            self.vector_store.persist()
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False

    @classmethod
    def get_collection(cls, collection_name: str) -> 'ChromaDB':
        """Get or create a collection instance."""
        if collection_name not in cls._instances:
            cls._instances[collection_name] = ChromaDB(collection_name=collection_name)
        return cls._instances[collection_name]
    
    @classmethod
    def close_collection(cls, collection_name: str) -> None:
        """Close and cleanup a specific collection."""
        if collection_name in cls._instances:
            instance = cls._instances[collection_name]
            del cls._instances[collection_name]
    
    @classmethod
    def close_all_collections(cls) -> None:
        """Close all open collections."""
        for collection_name in list(cls._instances.keys()):
            cls.close_collection(collection_name)

# Instantiate the database
# db = ChromaDB()  # Remove global instance to prevent memory leaks

def cleanup():
    """Call this when shutting down the application to clean up resources"""
    ChromaDB.close_all_collections()
