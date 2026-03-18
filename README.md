# LLM Task Tracker

This project is a small full-stack task tracker where the main interface is a chat screen. Instead of filling out forms to create or update work items, the user talks to the system in natural language and the backend turns that message into a structured task operation.

At a high level, the app is trying to do one thing well: treat the LLM as an interpreter for task intent, while keeping the actual task mutations in regular application code.

## Working Demo APP

Visit Demo App on:

https://llm-task-tracker.joelbaluma.com/

## Running The App

This repo has two separate apps:

- `backend/` for the API, Prisma access, and LLM integration
- `frontend/` for the React UI

Use a modern Node version for both. In practice, Node `20+` is the safest choice here. The frontend uses Vite 8, and the backend LLM client expects a runtime with global `fetch`, so older Node versions can fail in confusing ways.

### Backend Instructions

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create or update `backend/.env` with the values the API expects:

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini
PORT=4000
```

Notes:

- `DATABASE_URL` is required because Prisma is configured for PostgreSQL
- `OPENAI_API_KEY` is required for chat interpretation
- `OPENAI_BASE_URL` can stay pointed at the standard OpenAI API unless you intentionally use a different compatible endpoint
- `MODEL_NAME` defaults to `gpt-4o-mini` in code, but keeping it explicit in `.env` makes local behavior easier to reason about

3. Run your database migrations if needed:

```bash
npm run prisma:migrate
```

4. Start the backend in development mode:

```bash
npm run dev
```

By default the API runs on:

```text
http://localhost:4000
```

Important detail: the frontend currently expects the backend at `http://localhost:4000/api`, so if you change the backend port you should update the frontend API base URL too.

### Frontend Instructions

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the React app:

```bash
npm run dev
```

3. Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The frontend talks directly to the backend API at:

```text
http://localhost:4000/api
```

That base URL is currently hardcoded in `frontend/src/lib/api.ts`, so if you move the backend to another host or port, update that file or introduce an environment-based API URL.

## Architecture Overview

The codebase is split into two very clear halves:

- `frontend/`: a React app used for the chat experience and the task board UI
- `backend/`: an Express API that owns chat processing, task persistence, and the LLM integration

### Frontend

The frontend has two main pages:

- `frontend/src/pages/ChatPage.tsx`
  This is the primary interface. The user sends free-form text, the UI posts it to `POST /api/chat`, and the assistant response is rendered back into the conversation.
- `frontend/src/pages/TasksPage.tsx`
  This is the read-side view of the system. It shows the tasks and their attached details so the user can see the state the chat has produced.

The frontend is intentionally thin. It does not try to interpret the user's intent itself. Its job is mostly:

- collect user input
- send requests to the backend
- render task state and assistant responses
- surface backend error messages clearly

That boundary matters because it keeps the UI simple and avoids duplicating business logic in the browser.

### Backend

The backend is where the interesting work happens. The main flow is:

1. `backend/src/routes/chat.ts` receives a chat message with a client-generated `messageId`
2. it checks whether that exact message was already processed
3. it stores the raw user message in `ChatMessage`
4. it loads the current tasks and a small slice of recent chat history
5. it asks the LLM to convert the user's text into a constrained JSON action
6. `backend/src/services/taskExecutor.ts` applies that action to the database
7. it stores the assistant summary and the processed-message record
8. it returns a short reply to the frontend

The other backend routes are much simpler:

- `backend/src/routes/tasks.ts`: read-only task APIs for the board/details view
- `backend/src/routes/admin.ts`: a reset endpoint for clearing local state during development

### Persistence Boundary

Prisma is the persistence layer, and the schema reflects the app's mental model pretty directly:

- `Task`: the main work item
- `TaskDetail`: notes or appended details for a task
- `ChatMessage`: raw conversation history
- `ProcessedMessage`: the record used for idempotency and replay protection

That separation is useful because chat history and task state are related, but they are not the same thing. A message can exist without creating a task, and a processed task operation should still be traceable back to the message that caused it.

## How The LLM Is Used

The LLM is not used as a general-purpose agent that is allowed to make arbitrary decisions or call database code directly. It is used in a narrower and safer role: **intent interpretation**.

### Prompting Approach

The prompt is built in `backend/src/services/promptBuilder.ts`. It includes:

- the current list of tasks, with IDs, titles, and statuses
- the recent chat messages
- the latest user message
- explicit instructions about the allowed intents and output shape

The prompt tells the model that it can only do a small set of things:

- create one or more tasks
- mark tasks as completed
- attach a detail to a task
- ask for clarification
- do nothing

This is a practical pattern for apps like this. The model is good at understanding messy human language, but it is not trusted to directly perform side effects. Instead, it returns a structured plan, and the application code executes that plan deterministically.

### Structured Output Contract

The backend calls the OpenAI chat completions API in `backend/src/services/llm.ts` with `response_format: { type: "json_object" }`.

The expected JSON shape is then validated with Zod in `backend/src/types/llmAction.ts`.

The contract looks like this in spirit:

- `intent`
- `tasksToCreate`
- `tasksToComplete`
- `detailsToAttach`
- `clarificationQuestion`

This is not "tool calling" in the strict API sense. There are no registered function calls being sent to the model. Instead, the app uses a **schema-first JSON contract**:

- the model proposes a structured action
- Zod validates it
- the backend applies it

I like this approach for a small app because it is easy to debug, easy to log, and easy to reason about. If the model returns invalid or unexpected data, the backend fails fast before touching the database.

### Why This Works Well Here

This design keeps the LLM's responsibility narrow:

- understand language
- map it to one of a few supported intents
- choose task IDs from the provided context

Everything stateful happens outside the model:

- duplicate prevention
- database updates
- status changes
- detail creation
- response persistence

That boundary is one of the most important architectural decisions in the project.

## Idempotency Approach

The app uses **message-level idempotency**.

Each frontend chat submission generates a `messageId` with `crypto.randomUUID()` in `frontend/src/lib/api.ts`. That `messageId` is sent with the chat request and treated as the identity of the operation.

On the backend:

- `backend/src/routes/chat.ts` checks `ProcessedMessage` first using `findProcessedMessage(messageId)`
- if a record already exists, the route immediately returns the previous summary instead of re-running the LLM or re-applying task mutations
- if not, it processes the message and stores the final result in `ProcessedMessage`

### Why It Works

It works because the app treats "process this user message" as the idempotent unit, not "run this exact SQL" or "perform this exact LLM call."

That means if the frontend:

- retries because of a flaky network
- double-submits
- gets a late response and retries manually

the backend can safely say, "I've already handled message `X`; here is the same answer again."

This is especially important in LLM-backed systems because the expensive and risky part is not just the API call. It is the side effect that happens after interpretation. Without an idempotency key, the same natural-language message could easily create duplicate tasks or duplicate attached details.

### Additional Duplicate Guards

There are also two smaller, more local protections:

- task creation normalizes titles with `normalizeText()` and avoids creating a second task with the same normalized title
- detail creation checks for an existing detail with the same `taskId`, trimmed content, and `sourceMessageId`

Those checks are not the primary idempotency mechanism, but they do help reduce accidental duplication during normal usage.

### Limits Of The Current Approach

The current design assumes the frontend keeps and resends the same `messageId` if a request is retried. If the user sends the same sentence twice as two different messages, the system treats that as two distinct operations, which is usually the right behavior.

One subtle limitation is that the chat route writes the user `ChatMessage` before the LLM call and before the `ProcessedMessage` record is created. If the request crashes in the middle, the raw chat message may exist without a corresponding processed record. In practice that is survivable, but it means the system is not fully transactional yet.

## Key Tradeoffs

This project makes a few tradeoffs that are reasonable for a compact prototype, but worth calling out explicitly.

### 1. Simple JSON schema over full tool calling

The current implementation is lightweight and easy to inspect. That is a real benefit.

The tradeoff is that the model is still generating JSON manually rather than invoking first-class typed tools. For a small set of operations, that is totally fine. For a larger system with more actions and more branching behavior, I would likely move to a more formal tool-calling flow.

### 2. Prompt includes full task context

Right now the model gets the current task list and recent messages inline in the prompt. That is straightforward and keeps the implementation simple.

The tradeoff is scale. As the number of tasks grows, prompt size and ambiguity both increase. At some point I would want retrieval or a filtering step so the model sees only the most relevant tasks.

### 3. Fast development over strict transactional guarantees

The chat route is easy to follow and easy to extend, but it is not wrapped in a database transaction around the full "interpret + execute + persist result" flow.

That keeps the code simpler, but it leaves a few edge cases where partially-completed work could exist if something fails midway through processing.

### 4. Thin frontend, smart backend

I think this is the right tradeoff here. The frontend stays mostly presentational, and the backend owns the domain logic.

The downside is that the chat endpoint becomes the center of gravity for the whole product. As more features are added, that route and its supporting services will need stronger separation and test coverage.

## What I Would Improve Next

If I were continuing this project, these would be my next upgrades:

### 1. Add transactional processing around chat execution

I would make the write path more atomic so that:

- the processed-message record
- the assistant reply
- the task mutations

are committed together, or not at all. That would tighten the reliability story quite a bit.

### 2. Upgrade the LLM integration to true tool calls or a Responses-style action contract

The current JSON contract is solid, but formal tool calls would give better structure, clearer observability, and less prompt fragility as the action surface grows.

### 3. Add backend tests around intent execution and idempotency

The highest-value tests here are not UI tests. They are backend tests that verify:

- duplicate `messageId` does not duplicate side effects
- normalized titles prevent duplicate tasks
- invalid model output is rejected cleanly
- completion and detail attachment behave correctly

### 4. Improve task reference resolution

Right now the model is asked to choose from the provided tasks, which is workable but a little brittle when task names are similar. I would add a proper task-resolution layer so the model can say something like "complete the dashboard task" and the backend can deterministically resolve the best match or ask a clarification question.

### 5. Make the conversation history smarter

The app currently sends a small recent window of chat messages. That is a nice starting point, but eventually I would separate:

- short-term conversational context
- durable task state
- user intent memory

That would help the assistant stay accurate without overloading the prompt.

## Final Take

The strongest part of this codebase is the boundary it draws around the LLM. The model is used where it adds the most value, which is interpreting natural language, but the application still owns validation, mutation, and persistence.

That is a healthy pattern for building LLM features into normal product software. It keeps the "AI" part useful without letting it take over the parts that should remain deterministic.
