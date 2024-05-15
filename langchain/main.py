"""LangServe server for connecting frontend API with LLM models.
Adapted code from LangServe Docs: https://python.langchain.com/v0.1/docs/langserve/
"""
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chat_models.ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langserve import add_routes


# Create Fast API server.
app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

# Allow CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create chat chain with history.
model = ChatOllama(
    model="llama3"
)
prompt = ChatPromptTemplate.from_messages([
    ("system", "You're an helpful assistant. Continue the chat with human."),
    MessagesPlaceholder("history"),
    ("human", "{input}")
])
chat_chain = prompt | model | StrOutputParser()

# Add chain as a server route.
add_routes(app, chat_chain, path="/chat")



if __name__ == "__main__":
    # Start the server.
    uvicorn.run(app, host="localhost", port=8000)
