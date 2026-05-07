# ARCHITECTURE BLUEPRINT - Projeto N2 (Cofre e Clean Room de Auditoria Documental)

## Visão Geral

Este documento descreve a arquitetura do MVP do **Projeto N2**, um SaaS B2B focado em auditoria e varredura documental massiva (sectores Farmacêutico e Jurídico) em ambientes ultrasseguros.

Focamos na entrega de valor rápida, segurança by-design, e rastreabilidade on-chain, usando componentes off-the-shelf sempre que possível.

## Stack Tecnológico

1. **Frontend (Dashboard & Cliente):**
   - **Framework:** Next.js (TypeScript)
   - **Autenticação:** TON Connect (Carteiras TON) + Supabase Auth.
   - **Papel:** Painel administrativo focado em Desktop para B2B. Exibe upload de arquivos, status em tempo real do processamento, e listagem de laudos.

2. **Backend / Database:**
   - **DB / Auth / Storage:** Supabase (PostgreSQL).
   - **Orquestração / Middleware:** n8n. Responsável por receber webhooks do front-end/Supabase e orquestrar a lógica de negócio, chamando os workers em Python e atualizando o DB.

3. **Workers de Processamento (O "Cofre"):**
   - **Linguagem / Ecossistema:** Python (LangChain, PyTorch, OCR).
   - **Ambiente de Execução (TEE Mock):** Containers Docker locais, estritamente isolados, simulando os Enclaves (Confidential Computing) e sem acesso irrestrito à internet, exceto portas de API específicas controladas.

4. **Rastreabilidade / Blockchain:**
   - **Rede:** The Open Network (TON).
   - **Estratégia:** Gravação do Hash SHA-256 do laudo gerado no Memo/Payload de uma transação simples (carteira-para-carteira). Proof of Existence imutável, rápida e de baixo custo.

## Arquitetura de Dados e Fluxo do Processo

O fluxo a seguir mapeia desde o upload do arquivo até a gravação on-chain:

1. **Autenticação e Upload (Next.js + Supabase):**
   - Cliente acessa o app web e se autentica usando TON Connect.
   - O cliente realiza o upload de um documento confidencial (ex: Prontuário Médico, Contrato de M&A).
   - O documento é criptografado pelo frontend e enviado para um Bucket Privado no Supabase Storage.
   - Um registro é criado no banco de dados (Supabase) na tabela `documents` com status `UPLOADED`.

2. **Orquestração (n8n):**
   - Um evento de inserção (Database Webhook no Supabase) notifica o **n8n**.
   - O n8n intercepta a chamada, valida os créditos/assinatura do cliente (Lógica de Pay-As-You-Go).
   - O n8n atualiza o status do documento para `PROCESSING` e despacha o job para o **Python Worker API**.

3. **Processamento em "Cofre" (Python Worker em Docker Isolado):**
   - O Worker recebe o job, baixa o documento (ou o n8n passa o buffer criptografado para o worker que tem a chave).
   - A extração de dados e auditoria (OCR, IA) ocorrem dentro do Docker (Mock de TEE).
   - Um laudo (`report`) de auditoria é gerado e resumido em um Hash SHA-256.
   - O Worker destrói os dados confidenciais da memória após a extração e devolve o Hash e os resultados anonimizados ao n8n.

4. **Gravação On-Chain e Finalização:**
   - O n8n recebe o Hash do laudo.
   - O n8n faz a requisição para a API (ou um serviço isolado) que executa a transação na rede **TON**. O Hash do documento é anexado ao *Memo* da transação.
   - Assim que a transação for confirmada, o n8n atualiza o Supabase: `status = COMPLETED`, inserindo o `tx_hash` e o `document_hash`.
   - O Frontend (Next.js), ouvindo em tempo real via Supabase Realtime, atualiza a UI do cliente para "Concluído", disponibilizando os dados e o link de validação On-Chain.

## Monetização: Pay-As-You-Go

- O modelo MRR + Pay-As-You-Go será implementado com Stripe. O modelo de dados contabilizará as auditorias (ex: "X documentos auditados").
- O n8n poderá bater em um endpoint do Stripe ou consultar um saldo no banco de dados (Supabase) antes de acionar os Workers (Step 2).

## Escalonamento Futuro

- **TEE (Trusted Execution Environments):** Quando a tração justificar os custos, migraremos os containers Docker para AWS Nitro Enclaves, Intel TDX ou GCP Confidential Space, garantindo que mesmo os administradores da infraestrutura não tenham acesso à RAM dos workers.
- **Smart Contracts:** Dependendo da necessidade de lógicas mais avançadas e compliance de auditores, evoluiremos de "Hash in Memo" para contratos em FunC/Tact na TON.
