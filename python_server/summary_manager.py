from typing import List, Any
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from langchain.prompts import PromptTemplate
from document_manager import DocumentManager
from database import ChromaDB

class SummaryManager:
    @staticmethod
    async def submit_summary(
        files: List[UploadFile],
        inputtext: str,
        file_type: str,
        llm: Any,
        SUMMARY_PROMPT: str,
        collections: List[str] = None,
        metadata_filters: dict = None,
        use_precise_pdf: bool = False
    ) -> JSONResponse:
        """
        Generate a summary with metadata filtering support.
        
        Args:
            metadata_filters: Dict of metadata filters, e.g.,
                {
                    "course_code": ["CS101", "CS102"],
                    "topic": ["Introduction", "Arrays"],
                    "filename": ["lecture1.pdf"]
                }
            use_precise_pdf: Whether to use precise mode for PDFs
        """
        try:
            # Process all input content
            content_parts = []
            if inputtext:
                content_parts.append(inputtext)
            
            if files:
                processed_files = await DocumentManager.process_files(files, use_precise_pdf)
                content_parts.extend(processed_files)

            # Combine all content with separators
            full_context = "\n\n---\n\n".join(content_parts)
            
            # Direct LLM approach if no collections specified
            if not collections:
                return await SummaryManager._generate_direct_summary(
                    full_context, llm, SUMMARY_PROMPT
                )
            
            # Include vector DB results if collections specified
            return await SummaryManager._generate_collection_summary(
                full_context, 
                collections, 
                inputtext, 
                llm, 
                SUMMARY_PROMPT,
                metadata_filters
            )
            
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": f"Error generating summary: {str(e)}"}
            )

    @staticmethod
    async def _generate_direct_summary(
        context: str,
        llm: Any,
        prompt_template: str
    ) -> JSONResponse:
        """Generate summary using direct LLM approach."""
        try:
            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            chain_input = {
                "context": context,
                "question": "Please summarize the above content."
            }
            
            response = llm.invoke(prompt.format(**chain_input))
            summary_content = response.content if hasattr(response, 'content') else str(response)
            
            return JSONResponse({
                "content": summary_content,
                "sources": []
            })
        except Exception as e:
            raise

    @staticmethod
    async def _generate_collection_summary(
        context: str,
        collections: List[str],
        query: str,
        llm: Any,
        prompt_template: str,
        metadata_filters: dict = None
    ) -> JSONResponse:
        """Generate summary using collections and vector DB with metadata filtering."""
        try:
            all_documents = []
            
            # Search across all specified collections with metadata filters
            for collection_name in collections:
                try:
                    db_instance = ChromaDB.get_collection(collection_name)
                    docs = db_instance.similarity_search(
                        query or context, 
                        k=4,
                        metadata_filters=metadata_filters
                    )
                    all_documents.extend(docs)
                finally:
                    ChromaDB.close_collection(collection_name)
            
            # Combine vector DB results with input content
            db_content = "\n\n".join(doc.page_content for doc in all_documents)
            complete_context = f"{context}\n\n---\n\nRelevant Reference Materials:\n\n{db_content}"
            
            # Generate summary
            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            chain_input = {
                "context": complete_context,
                "question": query if query else "Please summarize the above content."
            }
            
            # Get the response and extract the content
            response = llm.invoke(prompt.format(**chain_input))
            summary_content = response.content if hasattr(response, 'content') else str(response)
            
            # Format sources
            sources = SummaryManager._format_sources(all_documents)
            
            return JSONResponse({
                "content": summary_content,  # Now using the extracted content
                "sources": sources
            })
        except Exception as e:
            raise

    @staticmethod
    def _format_sources(documents: List[Any]) -> List[dict]:
        """Format and deduplicate source information."""
        unique_sources = {}
        for doc in documents:
            key = (doc.metadata.get("filename", "Unknown"), 
                  doc.metadata.get("course_code", "Unknown"))
            if key not in unique_sources:
                unique_sources[key] = {
                    "filename": key[0],
                    "course_code": key[1],
                    "type": doc.metadata.get("type", "Unknown"),
                    "topic": doc.metadata.get("topic", "Unknown"),
                    "collection": doc.metadata.get("collection", "Unknown")
                }
        return list(unique_sources.values()) 