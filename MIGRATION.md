# Migration Guide: MySQL to PostgreSQL

This guide will help you migrate your data from the old MySQL database to the new PostgreSQL database.

## Prerequisites

Before starting the migration:

1. ✅ Make sure you have a **backup** of your MySQL database
2. ✅ PostgreSQL should be installed and running (or use Docker)
3. ✅ The new PostgreSQL database schema should be created

## Step 1: Set Up PostgreSQL

### Using Docker (Recommended)

```bash
# Start only PostgreSQL container
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
docker-compose logs postgres
```

### Using Local PostgreSQL

```bash
# Create database
createdb -U postgres nonprofit_ideas

# Or using psql
psql -U postgres -c "CREATE DATABASE nonprofit_ideas;"
```

## Step 2: Create PostgreSQL Schema

```bash
# Update DATABASE_URL in .env to point to PostgreSQL
DATABASE_URL=postgresql://nonprofit_user:nonprofit_password@localhost:5432/nonprofit_ideas

# Run migrations
pnpm run db:push
```

## Step 3: Migrate Data

### Prepare Environment Variables

Create a temporary file with both database URLs:

```bash
# Your old MySQL connection
export MYSQL_DATABASE_URL="mysql://user:password@localhost:3306/nonprofit_ideas"

# Your new PostgreSQL connection (should match DATABASE_URL in .env)
export DATABASE_URL="postgresql://nonprofit_user:nonprofit_password@localhost:5432/nonprofit_ideas"
```

### Run Migration Script

```bash
# Install dependencies if not already installed
pnpm install

# Run the migration
tsx scripts/migrate-mysql-to-postgres.ts
```

The script will:
- ✅ Connect to both databases
- ✅ Copy all data from MySQL to PostgreSQL
- ✅ Handle ID regeneration for auto-increment fields
- ✅ Show progress for each table
- ✅ Report any errors

## Step 4: Verify Migration

### Check Record Counts

```bash
# PostgreSQL
docker-compose exec postgres psql -U nonprofit_user -d nonprofit_ideas -c "
  SELECT 'users' as table_name, COUNT(*) FROM users
  UNION ALL SELECT 'ideas', COUNT(*) FROM ideas
  UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
  UNION ALL SELECT 'messages', COUNT(*) FROM messages;"
```

### Compare with MySQL

```bash
# MySQL
mysql -u root -p nonprofit_ideas -e "
  SELECT 'users' as table_name, COUNT(*) FROM users
  UNION ALL SELECT 'ideas', COUNT(*) FROM ideas
  UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
  UNION ALL SELECT 'messages', COUNT(*) FROM messages;"
```

## Step 5: Update Application Configuration

1. Update `.env` file:
   ```bash
   # Change from MySQL
   # DATABASE_URL=mysql://...
   
   # To PostgreSQL
   DATABASE_URL=postgresql://nonprofit_user:nonprofit_password@localhost:5432/nonprofit_ideas
   ```

2. Restart the application:
   ```bash
   # Using Docker
   docker-compose restart app
   
   # Or local development
   pnpm run dev
   ```

## Step 6: Test the Application

1. Login to your application
2. Verify that your data is accessible:
   - Check user accounts
   - View existing ideas
   - Test conversation history
   - Verify permissions and settings

## Troubleshooting

### Issue: Connection refused to MySQL

**Solution:** Make sure your MySQL server is running and the connection URL is correct.

```bash
# Test MySQL connection
mysql -u user -p -h localhost -P 3306 nonprofit_ideas
```

### Issue: Permission denied on PostgreSQL

**Solution:** Grant proper permissions to the database user.

```sql
GRANT ALL PRIVILEGES ON DATABASE nonprofit_ideas TO nonprofit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nonprofit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nonprofit_user;
```

### Issue: Migration script fails midway

**Solution:** The script is designed to be run multiple times. Fix the error and run again. Duplicate entries will be skipped where unique constraints exist.

### Issue: Different data between MySQL and PostgreSQL

**Solution:** This could be due to:
1. Active writes during migration - put application in maintenance mode
2. Failed migration - check the error logs
3. Character encoding issues - verify UTF-8 encoding on both databases

## Rollback Plan

If you need to rollback:

1. Stop the application
2. Drop the PostgreSQL database
3. Update `.env` to point back to MySQL
4. Restart the application

```bash
# Stop app
docker-compose down

# Drop PostgreSQL database
docker-compose exec postgres psql -U nonprofit_user -c "DROP DATABASE nonprofit_ideas;"

# Update .env back to MySQL
DATABASE_URL=mysql://...

# Restart with MySQL
docker-compose up -d
```

## Post-Migration Cleanup

⚠️ **Only after confirming everything works correctly:**

1. Keep MySQL database backup for at least 30 days
2. Consider archiving the MySQL database
3. Update any external services pointing to the old database
4. Update documentation and environment configs
5. Monitor application logs for any database-related errors

## Need Help?

If you encounter issues during migration:

1. Check the migration script output for specific error messages
2. Verify database credentials and connectivity
3. Ensure both databases are accessible from your machine
4. Review PostgreSQL and MySQL logs
5. Make sure you have enough disk space for the new database

## Data Mapping Notes

### Type Conversions

The migration automatically handles:

- `INT` → `INTEGER`
- `TINYINT(1)` → `BOOLEAN` (for boolean fields)
- `VARCHAR` → `VARCHAR` (same)
- `TEXT` → `TEXT` (same)
- `TIMESTAMP` → `TIMESTAMP` (same)

### Auto-increment vs Serial

- MySQL `AUTO_INCREMENT` fields become PostgreSQL `SERIAL` fields
- New IDs will be generated during migration
- Foreign key relationships are preserved by the order of migration

### JSON Fields

JSON text fields (like `proposedNames`, `kpis`, etc.) are migrated as-is. PostgreSQL can use native JSON types, but for compatibility, we keep them as `TEXT` fields.
