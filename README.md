# A simple UI setup for local LLM

Repo for an example to build very simple chatbot UI using LangChain.

## Chatbot Server

Install Ollama and install `llama3`.

## LangChain Server

### Requirements
- Runtime: Python 3.10+

### Execution
1. Create virtual environment.
```sh
python3 -m venv .env
```

2. Enter the LangChain project.
```sh
cd langchain
pip install -r requirements.txt
```

3. Run the LangChain server (`http://localhost:8000`).
```sh
python main.py
```

## UI

### Requirements
- Web-Server: node 16+
- Web-Browser: latest version of Edge / Chrome / Firefox

### Execution
1. Start web server
```sh
cd ui
node server.js
```

2. Visit `http://localhost:8001`.