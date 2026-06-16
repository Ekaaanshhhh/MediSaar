from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from loguru import logger


class TextChunker:

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 100
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                ", ",
                " "
            ]
        )

        logger.info(
            f"TextChunker initialized | "
            f"chunk_size={chunk_size}, overlap={chunk_overlap}"
        )

    def split_text(self, text: str) -> List[str]:

        if not text.strip():
            return []

        chunks = self.text_splitter.split_text(text)

        logger.info(f"Created {len(chunks)} chunks")

        return chunks