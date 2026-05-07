# Architecture In-Depth

This document details the architectural decisions and flow of the N2 Project, moving from the high-level system context down to the specific interactions between containers and external dependencies.

## C4 Container Diagram (Level 2)

This diagram breaks down the N2 Platform into its deployable containers and showcases how data flows between the Web App, the Orchestrator, and the TEE Mock Vault.

```mermaid
C4Container
    title N2 Project - Container Diagram

    Person(client, "Enterprise Client", "Browser-based B2B User")

    System_Boundary(n2_platform, "N2 SaaS Platform") {
        Container(webapp, "Next.js Application", "React/Node.js", "Handles UI, TON Wallet connection, and file encryption.")
        ContainerDb(supabase, "Supabase Database", "PostgreSQL", "Stores user metadata, file states, and billing balances. Acts as the Auth provider.")
        ContainerDb(storage, "Supabase Storage", "S3 Compatible", "Private bucket for encrypted document storage.")

        Container(n8n, "n8n Orchestrator", "Node.js", "Listens for DB Webhooks, manages workflow logic, and interfaces with the Vault.")

        Boundary(vault_boundary, "Cryptographic Vault (TEE Mock)") {
            Container(python_api, "Python Worker API", "FastAPI", "Receives tasks and decrypts streams in isolated memory.")
            Container(ai_ocr, "AI & OCR Engine", "PyTorch/LangChain", "Extracts data and generates audit reports. Destroys data post-processing.")
        }
    }

    System_Ext(ton_network, "TON Blockchain", "The Open Network")
    System_Ext(stripe, "Stripe", "Payment Gateway (Pay-As-You-Go)")

    Rel(client, webapp, "Uploads Docs & Views Reports", "HTTPS")
    Rel(webapp, supabase, "Authenticates via TON Connect & Updates state", "REST/Realtime")
    Rel(webapp, storage, "Uploads Encrypted BLOBs", "HTTPS")

    Rel(supabase, n8n, "Triggers Webhook on Insert (UPLOADED)", "HTTPS")
    Rel(n8n, stripe, "Checks Balance/Subscription", "REST")
    Rel(n8n, storage, "Fetches Encrypted BLOB", "HTTPS")
    Rel(n8n, python_api, "Sends BLOB & Job ID", "REST (Internal)")

    Rel(python_api, ai_ocr, "Passes Document for Processing", "Internal Call")
    Rel(ai_ocr, python_api, "Returns Audit Result & Hash", "Internal Call")

    Rel(python_api, n8n, "Returns Extracted Data & SHA-256", "REST (Internal)")
    Rel(n8n, ton_network, "Broadcasts Tx with Hash in Memo", "RPC")
    Rel(n8n, supabase, "Updates State to COMPLETED", "REST")
```

## Business Logic Flow: Document Upload to On-Chain Recording

The following sequence diagram outlines the chronological steps taken by the system when a user submits a highly sensitive document. Note the emphasis on the "Clean Room" lifecycle within the Python Worker.

```mermaid
sequenceDiagram
    autonumber
    actor User as Enterprise Client
    participant Frontend as Next.js Web App
    participant DB as Supabase (DB & Storage)
    participant n8n as n8n Workflow Engine
    participant Vault as Python Worker (TEE)
    participant TON as TON Blockchain

    User->>Frontend: Connect TON Wallet
    User->>Frontend: Upload Sensitive Document
    Frontend->>Frontend: Encrypt Document (Client-Side)
    Frontend->>DB: Upload Encrypted Blob to Storage
    Frontend->>DB: Insert Record (status: UPLOADED)

    DB-->>n8n: Trigger Webhook (New Document)
    n8n->>n8n: Validate User Credits/Tier
    n8n->>DB: Update Record (status: PROCESSING)
    Frontend-->>User: UI updates to "Processing" (via Realtime)

    n8n->>Vault: POST /v1/audit (Encrypted Blob)

    rect rgb(200, 220, 240)
        Note over Vault: TEE "Clean Room" Execution
        Vault->>Vault: Decrypt Blob in Isolated Memory
        Vault->>Vault: Execute OCR / AI Analysis
        Vault->>Vault: Generate Audit Report
        Vault->>Vault: Calculate SHA-256(Report)
        Vault->>Vault: Destroy Document from Memory
    end

    Vault-->>n8n: Return { report, document_hash }

    n8n->>TON: Submit Tx with document_hash in Memo
    TON-->>n8n: Tx Confirmation (tx_hash)

    n8n->>DB: Update Record (status: COMPLETED, tx_hash, document_hash)
    DB-->>Frontend: Realtime event (Job Done)
    Frontend-->>User: Display Audit Report & Blockchain Verification Link
```
