# N2 Project: Document Audit Vault and Clean Room

This repository contains the MVP for N2, an ultra-secure B2B SaaS using TEE concepts (mocked in Docker for the MVP phase) for Confidential Computing focused on MRR.

## Components

*   **`frontend/`**: Next.js + TailwindCSS + TON Connect application for clients (Desktop focus).
*   **`workers/`**: Python (FastAPI) services running inside strictly isolated containers, acting as the "Cryptographic Vault" for auditing (AI/OCR).
*   **`infrastructure/`**: Database definitions (local Supabase) and `schema.sql` oriented towards Multi-tenancy and Pay-As-You-Go.
*   **`docker-compose.yml`**: Local orchestrator for the workers and mock dependencies.

## Running Locally

1. Spin up the base infrastructure:
   `docker-compose up -d --build`

2. Run the Frontend:
   `cd frontend && npm install && npm run dev &`
