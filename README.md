# Nonprofit Ideas Generator

A web application for generating and managing nonprofit program and initiative ideas using AI.

## 🚀 Quick Start

**New to this project?** Check out the [Getting Started Guide](./GETTING-STARTED.md) for step-by-step instructions.

```bash
# Quick setup with Docker
docker-compose up -d
docker-compose exec app pnpm run db:push
# Visit http://localhost:3000
```

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database (v14 or higher)
- Docker and Docker Compose (optional, for containerized deployment)

## Environment Setup

This project requires several environment variables to function properly. Follow these steps:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure the following required variables in `.env`:**

   ### Required Configuration

   #### Database (Docker handles this automatically)
   - `DATABASE_URL`: PostgreSQL connection string
   - Default for Docker: `postgresql://nonprofit_user:nonprofit_password_change_me@postgres:5432/nonprofit_ideas`

   #### Authentication
   - `JWT_SECRET`: Strong random string for session security
   - Generate using: `openssl rand -base64 32` or any password generator

   #### AI Provider (Choose ONE - see [AI Providers Guide](./AI-PROVIDERS.md))
   - **Option 1:** `OPENAI_API_KEY` - OpenAI API (recommended)
   - **Option 2:** `OPENROUTER_API_KEY` - OpenRouter (multiple models)
   - **Option 3:** `CUSTOM_LLM_URL` + `OPENAI_API_KEY` - Local models (Ollama/LM Studio)
   - **Option 4:** Manus Forge API (if you have credentials from Manus)

   ### Optional Configuration
   - `OWNER_OPEN_ID`: Admin user ID (optional for single-user setups)
   - `PORT`: Server port (defaults to 3000)
   - `NODE_ENV`: Environment (development/production)

## Installation

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker Compose:

1. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your credentials
   - The default PostgreSQL credentials in `docker-compose.yml` can be used for development

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec app pnpm run db:push
   ```

4. **Access the application:**
   - Application: http://localhost:3000
   - PostgreSQL: localhost:5432

5. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up PostgreSQL database:**
   - Install PostgreSQL 14+ locally
   - Create a database named `nonprofit_ideas`
   - Update `DATABASE_URL` in `.env`

3. **Run database migrations:**
   ```bash
   pnpm run db:push
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run check` - Type check
- `pnpm run format` - Format code with Prettier
- `pnpm run test` - Run tests
- `pnpm run db:push` - Update database schema

## Docker Commands

- `docker-compose up -d` - Start all services in background
- `docker-compose down` - Stop all services
- `docker-compose logs -f app` - View application logs
- `docker-compose exec app sh` - Access application container shell
- `docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas` - Access PostgreSQL
- `docker-compose restart app` - Restart application container
- `docker-compose build --no-cache` - Rebuild containers from scratch

## Features

- AI-powered nonprofit program and initiative idea generation
- Arabic language support (RTL)
- Export to PDF, Word, and PowerPoint
- Idea management and history
- Search and filtering capabilities
- Professional templates for donor marketing
- Analytics and reporting

## Getting Manus Credentials

If you downloaded this project from Manus and need your API credentials:

1. Log in to your Manus dashboard
2. Navigate to your project settings
3. Find the API credentials section
4. Copy your:
   - `BUILT_IN_FORGE_API_KEY`
   - `OWNER_OPEN_ID`
   - `VITE_APP_ID`

## License

MIT
