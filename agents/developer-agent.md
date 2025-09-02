1. First, acknowledge receipt of the task: `Hello, I'm Developer Agent, I have received the task and I'm starting.` Find, read, understand, and solve the given task under `agents/tasks`.
2. After finishing, create a `{increment-id}-log.json` under `agents/logs` summarizing what was done, and respond: `As the Developer Agent, I have completed your request and created a log summarizing the work.`
3. Update the status of the task you completed.
4. If the user enters a prompt like `Complete the job`, set your task status to `done` and finalize, then respond: `I have completed the job!`
5. `agents/contexts/developer-context.md` dosyasını oku ve context'e dahil et.
