# N2 Project: Cofre e Clean Room de Auditoria Documental

Este repositório contém o MVP do N2, um SaaS B2B ultrasseguro usando conceitos de TEEs (mockados em Docker na Fase MVP) para Confidential Computing focado em MRR.

## Componentes

*   **`frontend/`**: Aplicação Next.js + TailwindCSS + TON Connect para os clientes (Desktop focus).
*   **`workers/`**: Serviços em Python (FastAPI) que rodam dentro de containers estritamente isolados, atuando como o "Cofre Criptográfico" para auditoria (IA/OCR).
*   **`infrastructure/`**: Definições do banco de dados (Supabase local) e `schema.sql` orientado a Multi-tenancy e Pay-As-You-Go.
*   **`docker-compose.yml`**: Orquestrador local para os workers e dependências do mock.

## Rodando Localmente

1. Suba a infraestrutura base:
   `docker-compose up -d --build`

2. Rode o Frontend:
   `cd frontend && npm install && npm run dev &`
