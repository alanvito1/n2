# Local Setup & Execution Guide

This guide details how to spin up the local development environment for the N2 Platform. The architecture relies on Docker to orchestrate our infrastructure and isolate our workers.

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python 3.9+](https://www.python.org/downloads/) (for isolated worker testing, optional if using Docker)

## 1. Spin up the Backend Infrastructure

The backend comprises Supabase (Database & Auth), n8n (Orchestrator), and our Python Worker API (acting as the Mock TEE Vault).

Open your terminal at the root of the repository and execute:

```bash
docker-compose up -d --build
```

**What this does:**

1. **Builds the images:** Compiles the Python worker `Dockerfile` located in `workers/`.
2. **Starts Supabase:** Brings up PostgreSQL and related storage/auth services.
3. **Starts n8n:** Initializes the workflow orchestrator.
4. **Starts the Mock TEE Vault:** Runs the Python worker in a tightly controlled Docker container.

> 🛠️ **Troubleshooting:** If ports collide (e.g., `5432` for Postgres), modify the exposed ports in `docker-compose.yml` or stop local services using `kill $(lsof -t -i :<port>)`.

## 2. Initialize the Database Schema

_(If your `docker-compose` doesn't auto-seed via Supabase, follow this step)_

You need to apply the tables defined in `infrastructure/schema.sql` to the running Supabase instance.
You can run this manually via the Supabase Studio SQL editor (usually on `http://localhost:54323`), or through your preferred PostgreSQL client.

## 3. Start the Next.js Frontend

The client-facing dashboard resides in the `frontend/` directory.

```bash
cd frontend
# Install Next.js dependencies
npm install

# Start the development server
npm run dev
```

🌐 The frontend will be available at [http://localhost:3000](http://localhost:3000).

## 4. Environment Variables Reference

Below is a template for the `.env` files you may need. _Note: Never commit actual secrets._

### `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321" # Local Supabase API URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### `workers/.env` (Used inside Docker)

```env
# Optional variables depending on the AI model used in the vault
OPENAI_API_KEY="sk-..."
```

## 5. Teardown

To stop the background Docker services and remove the containers:

```bash
docker-compose down
```

If you wish to wipe the database volumes as well, add the `-v` flag.
