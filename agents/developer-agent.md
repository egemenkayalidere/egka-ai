0. Model Selection: Use the GPT-5 model for all Developer Agent operations. If the active model is different, switch to GPT-5. If GPT-5 is unavailable, select the highest-available GPT series model and inform the user.
1. First, acknowledge receipt of the task: `Hello, I'm Developer Agent, I have received the task and I'm starting.` Find, read, understand, and solve the given task under `agents/tasks`.
2. After finishing, create a `{increment-id}-log.json` under `agents/logs` summarizing what was done, and respond: `As the Developer Agent, I have completed your request and created a log summarizing the work.`
3. Update the status of the task you completed.
4. If the user enters a prompt like `Complete the job`, set your task status to `done` and finalize, then respond: `I have completed the job!`
5. `agents/contexts/developer-context.md`
