# Scribe's Journal - Knowledge Gaps

_Date: Today_

As Scribe, I have mapped the N2 project architecture and generated the initial documentation base. However, during my scan of the `ARCHITECTURE_BLUEPRINT.md` against the assumed physical codebase state (and requirements), I have identified several critical ambiguities and "missing pieces" that prevent complete documentation.

These gaps must be resolved by the engineering team before the platform can be considered production-ready.

## ⚠️ Ambiguities & Codebase Discrepancies

### 1. Stripe / Billing Implementation

- **The Gap:** The `ARCHITECTURE_BLUEPRINT.md` mentions a "Pay-As-You-Go model will be implemented with Stripe" and suggests n8n will hit a Stripe endpoint.
- **Impact on Docs:** I cannot document the exact billing flow or webhook signatures for Stripe because the logic (code) does not currently exist in the repository structure. The Database Schema reference assumes a `credits_balance`, but the mechanism to refill this via Stripe is pure speculation at this point.

### 2. TEE Mock vs. Real Enclaves

- **The Gap:** The project relies heavily on the concept of "Confidential Computing" and "Trusted Execution Environments" (TEEs), as outlined in the Cocoon research. Currently, the `workers` are just running in standard local Docker containers (TEE Mock).
- **Impact on Docs:** The "Clean Room" guarantee is only theoretical. We lack the actual Intel TDX / AWS Nitro Enclave implementation code. I cannot document the hardware attestation flow (RA-TLS, image verification hashes) because the local mock does not enforce or generate real cryptographic proofs of isolation.

### 3. Key Management for Decryption

- **The Gap:** The architecture states: "The document is encrypted by the frontend... n8n passes the encrypted buffer to the worker holding the key".
- **Impact on Docs:** The exact key exchange mechanism is undefined. How does the frontend safely transmit the decryption key to the TEE Worker without n8n intercepting it? Without code defining this (e.g., Diffie-Hellman key exchange directly to the enclave), the security model is flawed, and I cannot document a truthful "Zero Trust" sequence diagram beyond an abstraction.

### 4. N8n Workflow Definitions

- **The Gap:** The `n8n/` folder exists, but the exact JSON workflow files (nodes, edges, credentials) are not fully detailed in the codebase.
- **Impact on Docs:** I had to infer the internal API contract (`POST /v1/audit`) based on standard architectural practices. The exact n8n webhook listener configuration is missing, preventing a complete step-by-step tutorial on "How to deploy the n8n logic".

### 5. Error Handling in the Vault

- **The Gap:** There is no defined protocol for what happens when the Python Worker crashes halfway through processing a massive PDF, or if the OCR engine fails to read a corrupted file.
- **Impact on Docs:** Creating a comprehensive "Troubleshooting" section is impossible until the `Worker -> n8n -> Database` error reporting lifecycle is explicitly coded.

---

_End of Entry. Awaiting engineering refactors to update the Knowledge Base._
