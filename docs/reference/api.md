# Internal API Reference (n8n & Worker)

This reference outlines the internal data contracts between the N8N Orchestrator and the Python Worker (Mock TEE Vault). Since the worker runs in an isolated environment, communication is strictly limited to these specific HTTP requests.

## Python Worker API (FastAPI)

The Worker acts as a "Cryptographic Vault." It accepts encrypted documents, processes them using AI/OCR entirely in memory, and returns the result and a cryptographic hash.

### `POST /v1/audit`

Initiates the document analysis process.

**Endpoint:** `http://worker-service:8000/v1/audit`
**Content-Type:** `application/json` (or `multipart/form-data` if passing raw buffers)

#### Request Body (JSON Example)

```json
{
  "job_id": "uuid-1234-5678",
  "document_url": "http://supabase-storage/bucket/path/to/encrypted/blob",
  "decryption_key": "optional-key-if-passed-by-n8n",
  "audit_type": "legal_contract_review"
}
```

_Note: In production, `decryption_key` securely flows from the user to the TEE enclave, bypassing the n8n orchestrator entirely. For MVP, we pass it via secure internal channels._

#### Response (Success - 200 OK)

Returns the generated audit report and the SHA-256 hash that will be anchored on the TON Blockchain.

```json
{
  "job_id": "uuid-1234-5678",
  "status": "COMPLETED",
  "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "report": {
    "summary": "The M&A contract contains a high-risk liability clause in section 4.2...",
    "flagged_issues": 2,
    "confidence_score": 0.94
  }
}
```

#### Response (Error - 4xx/5xx)

```json
{
  "job_id": "uuid-1234-5678",
  "status": "FAILED",
  "error": "Failed to decrypt document stream or unsupported format."
}
```

---

## Supabase Webhook Events

n8n is triggered by Supabase Postgres triggers when new data is inserted.

### Event: `document.inserted`

Triggered when a user uploads a file and inserts a row into the `documents` table.

#### Payload

```json
{
  "type": "INSERT",
  "table": "documents",
  "record": {
    "id": "uuid",
    "user_id": "wallet_address_or_uuid",
    "status": "UPLOADED",
    "storage_path": "/secure-vault/doc.pdf",
    "created_at": "2023-10-27T10:00:00Z"
  }
}
```

n8n catches this payload, changes the status to `PROCESSING` in the DB, and fires the `POST /v1/audit` endpoint on the worker.
