-- N2 Architecture Database Schema
-- Focus: Multi-tenancy & Pay-As-You-Go

-- Create tables

-- Tenants (Corporations/Clients)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ton_wallet_address VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Tenant Employees)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents (Audits/Medical Records)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    status VARCHAR(50) DEFAULT 'UPLOADED', -- UPLOADED, PROCESSING, COMPLETED, FAILED
    document_hash VARCHAR(64), -- SHA-256 hash
    ton_tx_hash VARCHAR(255), -- On-chain registration Tx
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing/Credits (Pay-As-You-Go)
CREATE TABLE IF NOT EXISTS billing_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL, -- Positive values for recharge, negative for usage
    description TEXT,
    document_id UUID REFERENCES documents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
