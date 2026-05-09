<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Room Remix Agent Runtime

The agent implementation uses LangGraph StateGraph orchestration in `src/lib/agent/room-remix-graph.ts` and minimal LangChain Core tools in `src/lib/agent/langchain-tools.ts`.

Keep model/provider-specific code behind `src/lib/ai/provider.ts`. LangGraph should coordinate the workflow, LangChain Core should wrap deterministic tools, and `room-remix-orchestrator.ts` should own Prisma persistence.

Do not replace the mock provider. Mock mode is the default fallback for demos and tests.
