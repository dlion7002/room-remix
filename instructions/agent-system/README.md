# Agent System Instructions

This folder is the learning path for the actual agent architecture: structured state, provider boundaries, orchestration, pipelines, and fidelity loops.

The implemented app lives in:

```text
room-remix/
```

## Recommended Learning Order

1. [03-domain-types.md](03-domain-types.md)

   Learn the canonical Room State, design patches, preferences, preview result, and fidelity report types.

2. [04-mock-data-and-catalog.md](04-mock-data-and-catalog.md)

   Treat mock data as the contract real AI providers must eventually satisfy.

3. [05-provider-adapters-and-orchestrator.md](05-provider-adapters-and-orchestrator.md)

   Study the provider boundary and the orchestration pipeline: analyze, build state, patch state, generate plan, generate preview, validate fidelity, and record feedback.

4. [10-event-upgrade-path.md](10-event-upgrade-path.md)

   Learn where real providers, prompts, AG-UI/A2UI/CopilotKit-style component protocols, and event-day integrations plug in.

## Agent Pipeline

```text
Source photo
-> vision/provider analysis
-> canonical Room State
-> user confirmation
-> state patch/version
-> design plan
-> atomic design patches
-> preview prompt
-> preview generation
-> fidelity validation
-> user fidelity feedback
```

## Implemented Code To Compare

After reading these docs, compare them with the actual app files:

```text
room-remix/src/lib/types/room-remix.ts
room-remix/src/lib/ai/provider.ts
room-remix/src/lib/ai/mock-provider.ts
room-remix/src/lib/ai/prompts.ts
room-remix/src/lib/orchestrator/tools.ts
room-remix/src/lib/orchestrator/room-remix-orchestrator.ts
room-remix/src/lib/generative-ui/component-registry.ts
```

The key idea: the UI is not the agent. The agent is the state model, provider contract, and orchestration pipeline that drive the UI.

