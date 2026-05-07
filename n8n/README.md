# n8n - Middleware Orchestrator

O n8n será usado como orquestrador visual.
Ele receberá webhooks do Supabase e despachará jobs para o Cofre (Python Workers).

### Fluxo n8n planejado
1. **Webhook In**: Recebe `POST /n8n-webhook` com os dados do arquivo enviado para o Supabase.
2. **HTTP Request Node**: Faz `POST http://worker:8000/api/v1/process` enviando o arquivo/metadados para o Worker.
3. **HTTP Request Node (TON)**: Se o worker retornar sucesso (e gerar o Hash), o n8n invoca o serviço mock para registrar o memo on-chain na rede TON.
4. **Postgres Node (Supabase)**: Atualiza o status do banco para `COMPLETED` com o `tx_hash`.
