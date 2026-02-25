# Getting Started with Nonprofit Ideas Generator

Welcome! This guide will help you get the application up and running quickly.

## 🚀 Quick Start (Docker - Recommended)

The fastest way to get started is using Docker:

### 1. Install Docker

Download and install Docker Desktop:
- **Windows:** https://docs.docker.com/desktop/install/windows-install/
- **macOS:** https://docs.docker.com/desktop/install/mac-install/
- **Linux:** https://docs.docker.com/engine/install/

### 2. Configure Environment

```bash
# Navigate to project directory
cd nonprofit-ideas-generator

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
# Use any text editor like notepad, vim, or VS Code
notepad .env
```

**Minimum required configuration (no Manus account needed!):**
```env
DATABASE_URL=postgresql://nonprofit_user:nonprofit_password_change_me@postgres:5432/nonprofit_ideas
JWT_SECRET=change-me-to-a-random-secret-key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**OR use the minimal template:**
```bash
cp .env.minimal .env
# Then edit .env with your OpenAI API key
```

See [AI Providers Guide](./AI-PROVIDERS.md) for alternative AI providers (OpenRouter, local models, etc.)

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# Initialize database
docker-compose exec app pnpm run db:push

# View logs to ensure everything is running
docker-compose logs -f
```

### 4. Access the Application

Open your browser and navigate to: **http://localhost:3000**

That's it! 🎉

---

## 📋 Detailed Setup Options

### Option A: Docker (Production-Ready)

**Pros:**
- ✅ Includes PostgreSQL database
- ✅ Easy to deploy and manage
- ✅ Isolated environment
- ✅ One-command setup

**Steps:** See [Docker Guide](./DOCKER-GUIDE.md)

### Option B: Local Development

**Pros:**
- ✅ Faster development cycle
- ✅ Direct code access
- ✅ Easier debugging

**Requirements:**
- Node.js 18+
- PostgreSQL 14+
- pnpm

**Steps:**

1. **Install PostgreSQL:**
   - **Windows:** https://www.postgresql.org/download/windows/
   - **macOS:** `brew install postgresql@14`
   - **Linux:** `sudo apt install postgresql-14`

2. **Create Database:**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE nonprofit_ideas;
   CREATE USER nonprofit_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE nonprofit_ideas TO nonprofit_user;
   \q
   ```

3. **Install Dependencies:**
   ```bash
   # Install pnpm if not already installed
   npm install -g pnpm

   # Install project dependencies
   pnpm install
   ```

4. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection
   ```

5. **Run Migrations:**
   ```bash
   pnpm run db:push
   ```

6. **Start Development Server:**
   ```bash
   pnpm run dev
   ```

---

## 🔑 Getting Your Credentials

### Manus Platform Credentials

Since you downloaded this from Manus, you'll need these credentials:

1. **Log in to Manus Dashboard:**
   - Go to your Manus dashboard
   - Navigate to your project

2. **Get your credentials:**
   - `VITE_APP_ID`: Your application ID
   - `BUILT_IN_FORGE_API_KEY`: Your Forge API key
   - `OWNER_OPEN_ID`: Your owner OpenID

3. **Add to `.env` file:**
   ```env
   VITE_APP_ID=your-app-id-here
   BUILT_IN_FORGE_API_KEY=your-api-key-here
   OWNER_OPEN_ID=your-open-id-here
   ```

### JWT Secret

Generate a secure random string:

```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Add to `.env`:
```env
JWT_SECRET=your-generated-secret-here
```

---

## 🔄 Migrating from MySQL

If you have existing data in MySQL, follow the [Migration Guide](./MIGRATION.md).

Quick migration steps:

```bash
# 1. Set up both database URLs
export MYSQL_DATABASE_URL="mysql://user:pass@localhost:3306/nonprofit_ideas"
export DATABASE_URL="postgresql://user:pass@localhost:5432/nonprofit_ideas"

# 2. Create PostgreSQL schema
pnpm run db:push

# 3. Run migration
pnpm run migrate:mysql-to-postgres
```

---

## 🧪 Testing Your Setup

### 1. Check Services

```bash
# Using Docker
docker-compose ps

# Should show:
# - nonprofit-postgres (healthy)
# - nonprofit-app (healthy)
```

### 2. Test Database Connection

```bash
# Using Docker
docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas -c "SELECT 1;"

# Local
psql -U nonprofit_user -d nonprofit_ideas -c "SELECT 1;"
```

### 3. Access Application

Open browser: http://localhost:3000

You should see the application login page.

### 4. Check Logs

```bash
# Docker
docker-compose logs -f app

# Local
# Check terminal where you ran `pnpm run dev`
```

Look for:
- ✅ "Server running on port 3000"
- ✅ "Database connected"
- ❌ No error messages

---

## 🛠️ Common Commands

### Docker Commands

```bash
# Start services
pnpm run docker:up

# Stop services
pnpm run docker:down

# View logs
pnpm run docker:logs

# Restart application
pnpm run docker:restart

# Rebuild containers
pnpm run docker:build
```

### Development Commands

```bash
# Start dev server
pnpm run dev

# Run type checking
pnpm run check

# Run tests
pnpm run test

# Format code
pnpm run format

# Build for production
pnpm run build

# Run production build
pnpm run start
```

### Database Commands

```bash
# Apply migrations
pnpm run db:push

# Migrate from MySQL
pnpm run migrate:mysql-to-postgres
```

---

## ❓ Troubleshooting

### "Port 3000 already in use"

**Solution:** Stop other services or change the port in `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # Change to 8080
```

### "Database connection refused"

**Docker:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

**Local:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

### "Cannot find module 'postgres'"

**Solution:** Install dependencies:
```bash
pnpm install
```

### "Permission denied" (Linux)

**Solution:**
```bash
# Give Docker permission to current user
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

### Application shows error page

1. Check logs:
   ```bash
   docker-compose logs -f app
   ```

2. Verify environment variables:
   ```bash
   docker-compose exec app env | grep DATABASE_URL
   ```

3. Ensure database is initialized:
   ```bash
   docker-compose exec app pnpm run db:push
   ```

---

## 📚 Next Steps

1. **Read the Documentation:**
   - [Docker Guide](./DOCKER-GUIDE.md) - Detailed Docker setup and management
   - [Migration Guide](./MIGRATION.md) - Migrate from MySQL to PostgreSQL
   - [README](./README.md) - Full application documentation

2. **Configure Your Application:**
   - Set up user accounts
   - Configure organization settings
   - Customize colors and branding

3. **Learn the Features:**
   - Generate nonprofit program ideas
   - Export to PDF, Word, PowerPoint
   - Track project progress
   - Analyze sustainability

4. **Deploy to Production:**
   - Review [Docker Guide](./DOCKER-GUIDE.md) production section
   - Set up SSL/HTTPS
   - Configure backups
   - Set up monitoring

---

## 📞 Support

Need help?

1. Check troubleshooting section above
2. Review error logs
3. Check [GitHub Issues](https://github.com/your-repo/issues)
4. Contact your system administrator

---

## 🎯 Quick Reference

| What                  | Command                          | URL                    |
|-----------------------|----------------------------------|------------------------|
| Start application     | `docker-compose up -d`           | http://localhost:3000  |
| Stop application      | `docker-compose down`            | -                      |
| View logs             | `docker-compose logs -f app`     | -                      |
| Database shell        | `docker-compose exec postgres psql` | -                  |
| Application shell     | `docker-compose exec app sh`     | -                      |
| Run migrations        | `docker-compose exec app pnpm run db:push` | -          |

---

**Happy coding! 🚀**
