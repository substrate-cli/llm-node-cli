# llm-node
llm-node for substrate-cli. microservice responsible for cluster generation. does not have any endpoints, only communicates via rabbitmq channel. Only responds to consumer-service.

# environment variables

```bash
PORT=3000
ANTHROPIC_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
DEFAULT_LLM="anthropic"
MODE="cli"
SUPPORTED_LLMS="anthropic,openai,gemini"
SAFE_ORIGINS="http://localhost:8090, http://localhost:8080, http://localhost:3000"
ANTHROPIC_MAX_TOKENS=32000
ENVIRONMENT="local"
API_SERVER_URL="http://localhost:8080"
AMQP_URL="amqp://guest:guest@localhost:5672/"
```

# run llm-node

```bash
npm i
npm run dev
```

this is an entry point to substrate-cli, for more informations, follow instructions on https://trysubstrate.com/notes.         
api-server - https://github.com/substrate-cli/api-server.        
llm-node - https://github.com/substrate-cli/consumer-service-cli.         
