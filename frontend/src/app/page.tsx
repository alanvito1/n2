"use client";

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('IDLE');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('UPLOADING');

    // Simulate upload and processing time
    setTimeout(() => {
        setStatus('PROCESSING');

        // Simulate completion after processing
        setTimeout(() => {
            setStatus('COMPLETED');
            setResultHash("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
            setTxHash("c9b2d8f7e6a543b1290c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a");
        }, 3000);
    }, 1500);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <header className="mb-10 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">N2 Auditoria Segura</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition">
                TON Connect
            </button>
        </header>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Upload de Documento Confidencial</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o arquivo para o Cofre</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || status !== 'IDLE'}
            className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'IDLE' ? 'Iniciar Auditoria' : 'Processando...'}
          </button>

          {/* Status Panel */}
          {status !== 'IDLE' && (
             <div className="mt-8 p-6 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status da Operação</h3>

                <div className="space-y-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${status === 'UPLOADING' || status === 'PROCESSING' || status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">1. Upload para Enclave Seguro</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${status === 'PROCESSING' || status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">2. Extração via IA & OCR (TEE)</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">3. Atestação On-Chain (TON)</span>
                    </div>
                </div>
             </div>
          )}

          {/* Results Panel */}
          {status === 'COMPLETED' && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-md">
                 <h3 className="text-lg font-medium text-green-800 mb-2">Auditoria Concluída com Sucesso</h3>
                 <div className="text-sm text-green-700 space-y-2 break-all">
                     <p><strong>Hash do Laudo:</strong> {resultHash}</p>
                     <p><strong>Tx Blockchain:</strong> {txHash}</p>
                 </div>
                 <div className="mt-4 flex gap-4">
                     <button className="text-blue-600 text-sm font-medium hover:underline">
                         Ver Laudo Completo
                     </button>
                     <button className="text-blue-600 text-sm font-medium hover:underline">
                         Validar na TON Explorer
                     </button>
                 </div>
              </div>
          )}
        </div>
      </div>
    </main>
  );
}
