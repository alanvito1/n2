from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import hashlib
import json
from datetime import datetime

app = FastAPI(title="N2 Worker Mock", description="Mock do Cofre de Auditoria TEE")

def mock_process_document(content: bytes) -> dict:
    """
    Simula o processamento complexo de IA e OCR dentro do enclave.
    Neste mock, apenas extraímos metadados e simulamos confidencialidade.
    """
    # ... mock OCR and processing ...
    mock_result = {
        "status": "success",
        "findings": [
            {"type": "ConfidentialData", "confidence": 0.99},
            {"type": "Signature", "verified": True}
        ],
        "processed_at": datetime.utcnow().isoformat(),
        "bytes_read": len(content)
    }
    return mock_result

@app.post("/api/v1/process")
async def process_document(
    file: UploadFile = File(...),
    tenant_id: str = Form(...)
):
    try:
        content = await file.read()

        # 1. Simula processamento dentro do Enclave (Isolado e Confidencial)
        result = mock_process_document(content)

        # 2. Gera o Hash SHA-256 do laudo para registro On-Chain
        report_str = json.dumps(result, sort_keys=True)
        report_hash = hashlib.sha256(report_str.encode('utf-8')).hexdigest()

        # 3. Retorna os resultados e a prova
        return {
            "tenant_id": tenant_id,
            "filename": file.filename,
            "document_hash": report_hash,
            "results": result,
            "message": "Processed securely. Mock TEE Enclave clear."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "enclave": "mock"}
