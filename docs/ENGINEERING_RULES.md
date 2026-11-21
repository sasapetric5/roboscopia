# Engineering Rules

## Mandatory six-stage process

Every substantial integration or functional component must follow all six stages:

1. **Discover** — identify at least 10 relevant existing projects or candidate components where the scope warrants it.
2. **Evaluate** — inspect actual code and verify functionality, maintenance activity, license, dependencies, security and compatibility.
3. **Reuse** — prefer suitable, verified existing components over unnecessary development from scratch.
4. **Adapt** — integrate and adapt selected components to ROBOSCOPIA's architecture and requirements.
5. **Verify** — test the integrated result, including relevant failure and security cases.
6. **Deliver** — document and complete one functional unit before moving to the next.

A README description alone is not sufficient evidence that a project is suitable. No component is accepted until its code, license and practical behavior have been reviewed.

## Engineering and operating rules

- Use **one primary branch: `main`**. Do not create additional development branches unless explicitly approved.
- Keep ROBOSCOPIA operationally independent from CEOAI during the initial development and validation period.
- Any future CEOAI integration must use a deliberately designed and secured API boundary.
- Prefer free and open-source infrastructure where it meets the requirements.
- Do not activate paid services, paid APIs, subscriptions or billable infrastructure without explicit approval.
- Do not deploy to production, change DNS or alter domain configuration without explicit approval.
- Reliability, security and data integrity take priority over speed and feature count.
- Review third-party licenses and dependency risks before reuse.
- Never commit API keys, passwords, tokens, private credentials or other secrets.
- Do not publish copyrighted photographs, videos, manuals or documents without an appropriate license or permission.
- Keep commercial relationships transparent. Affiliate or sponsored relationships must not influence technical facts or objective comparison results.
