# n8n - Middleware Orchestrator

n8n will be used as the visual orchestrator.
It will receive webhooks from Supabase and dispatch jobs to the Vault (Python Workers).

### Planned n8n Flow

1. **Webhook In**: Receives `POST /n8n-webhook` with the data of the file uploaded to Supabase.
2. **HTTP Request Node**: Makes a `POST http://worker:8000/api/v1/process` sending the file/metadata to the Worker.
3. **HTTP Request Node (TON)**: If the worker returns success (and generates the Hash), n8n invokes the mock service to register the memo on-chain on the TON network.
4. **Postgres Node (Supabase)**: Updates the database status to `COMPLETED` with the `tx_hash`.
