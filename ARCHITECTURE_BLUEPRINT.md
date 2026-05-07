# ARCHITECTURE BLUEPRINT - Project N2 (Document Audit Vault and Clean Room)

## Overview

This document describes the MVP architecture of **Project N2**, a B2B SaaS focused on massive document auditing and scanning (Pharmaceutical and Legal sectors) in ultra-secure environments.

We focus on fast value delivery, security by design, and on-chain traceability, using off-the-shelf components whenever possible.

## Technology Stack

1. **Frontend (Dashboard & Client):**
   - **Framework:** Next.js (TypeScript)
   - **Authentication:** TON Connect (TON Wallets) + Supabase Auth.
   - **Role:** Administrative panel focused on Desktop for B2B. Displays file upload, real-time processing status, and report listings.

2. **Backend / Database:**
   - **DB / Auth / Storage:** Supabase (PostgreSQL).
   - **Orchestration / Middleware:** n8n. Responsible for receiving webhooks from the frontend/Supabase and orchestrating business logic, calling Python workers and updating the DB.

3. **Processing Workers (The "Vault"):**
   - **Language / Ecosystem:** Python (LangChain, PyTorch, OCR).
   - **Execution Environment (TEE Mock):** Strictly isolated local Docker containers, simulating Enclaves (Confidential Computing) with no unrestricted internet access, except for controlled specific API ports.

4. **Traceability / Blockchain:**
   - **Network:** The Open Network (TON).
   - **Strategy:** Recording the SHA-256 Hash of the generated report in the Memo/Payload of a simple transaction (wallet-to-wallet). Immutable, fast, and low-cost Proof of Existence.

## Data Architecture and Process Flow

The following flow maps from file upload to on-chain recording:

1. **Authentication and Upload (Next.js + Supabase):**
   - Client accesses the web app and authenticates using TON Connect.
   - The client uploads a confidential document (e.g., Medical Record, M&A Contract).
   - The document is encrypted by the frontend and sent to a Private Bucket in Supabase Storage.
   - A record is created in the database (Supabase) in the `documents` table with status `UPLOADED`.

2. **Orchestration (n8n):**
   - An insert event (Database Webhook in Supabase) notifies **n8n**.
   - n8n intercepts the call, validates client credits/subscription (Pay-As-You-Go logic).
   - n8n updates the document status to `PROCESSING` and dispatches the job to the **Python Worker API**.

3. **"Vault" Processing (Python Worker in Isolated Docker):**
   - The Worker receives the job, downloads the document (or n8n passes the encrypted buffer to the worker holding the key).
   - Data extraction and auditing (OCR, AI) occur inside Docker (TEE Mock).
   - An audit `report` is generated and summarized into a SHA-256 Hash.
   - The Worker destroys the confidential data from memory after extraction and returns the Hash and anonymized results to n8n.

4. **On-Chain Recording and Finalization:**
   - n8n receives the report Hash.
   - n8n makes a request to the API (or an isolated service) that executes the transaction on the **TON** network. The document Hash is attached to the transaction _Memo_.
   - Once the transaction is confirmed, n8n updates Supabase: `status = COMPLETED`, inserting the `tx_hash` and the `document_hash`.
   - The Frontend (Next.js), listening in real-time via Supabase Realtime, updates the client UI to "Completed", making the data and On-Chain validation link available.

## Monetization: Pay-As-You-Go

- The MRR + Pay-As-You-Go model will be implemented with Stripe. The data model will account for audits (e.g., "X documents audited").
- n8n can hit a Stripe endpoint or check a balance in the database (Supabase) before triggering the Workers (Step 2).

## Future Scaling

- **TEE (Trusted Execution Environments):** When traction justifies the costs, we will migrate Docker containers to AWS Nitro Enclaves, Intel TDX, or GCP Confidential Space, ensuring that even infrastructure administrators do not have access to the workers' RAM.
- **Smart Contracts:** Depending on the need for more advanced logic and auditor compliance, we will evolve from "Hash in Memo" to FunC/Tact contracts on TON.
