-- Migration: Add indexes for better performance and scalability
-- This migration adds indexes to improve query performance for large datasets

-- =====================================================
-- Users table indexes
-- =====================================================
-- Index for user status queries (admin panel filtering)
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Composite index for status + role queries
CREATE INDEX IF NOT EXISTS idx_users_status_role ON users(status, role);

-- Index for login method filtering
CREATE INDEX IF NOT EXISTS idx_users_login_method ON users(loginMethod);

-- Index for last signed in (sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_users_last_signed_in ON users(lastSignedIn);

-- =====================================================
-- Ideas table indexes (most critical for scalability)
-- =====================================================
-- Index for user's ideas (most common query)
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(userId);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(createdAt);

-- Composite index for user's ideas sorted by date (pagination)
CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON ideas(userId, createdAt DESC);

-- Fulltext index for search functionality
CREATE FULLTEXT INDEX IF NOT EXISTS idx_ideas_search ON ideas(idea, programDescription, selectedName);

-- =====================================================
-- Conversations table indexes
-- =====================================================
-- Index for user's conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(userId);

-- Index for idea's conversations
CREATE INDEX IF NOT EXISTS idx_conversations_idea_id ON conversations(ideaId);

-- Composite index for user's conversations by idea
CREATE INDEX IF NOT EXISTS idx_conversations_user_idea ON conversations(userId, ideaId);

-- Index for conversation status
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- =====================================================
-- Messages table indexes
-- =====================================================
-- Index for conversation messages (most common query)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversationId);

-- Composite index for conversation messages sorted by date
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversationId, createdAt);

-- =====================================================
-- Permissions table indexes
-- =====================================================
-- Index for user permissions (unique constraint already exists on userId)
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON permissions(userId);

-- =====================================================
-- System Features table indexes
-- =====================================================
-- Index for feature category filtering
CREATE INDEX IF NOT EXISTS idx_system_features_category ON system_features(category);

-- Index for enabled features
CREATE INDEX IF NOT EXISTS idx_system_features_enabled ON system_features(isEnabled);

-- =====================================================
-- Project Tracking table indexes
-- =====================================================
-- Index for idea's tracking
CREATE INDEX IF NOT EXISTS idx_project_tracking_idea_id ON project_tracking(ideaId);

-- Index for user's projects
CREATE INDEX IF NOT EXISTS idx_project_tracking_user_id ON project_tracking(userId);

-- Index for project status
CREATE INDEX IF NOT EXISTS idx_project_tracking_status ON project_tracking(status);

-- Composite index for user's projects by status
CREATE INDEX IF NOT EXISTS idx_project_tracking_user_status ON project_tracking(userId, status);

-- =====================================================
-- Project Tasks table indexes
-- =====================================================
-- Index for project's tasks
CREATE INDEX IF NOT EXISTS idx_project_tasks_tracking_id ON project_tasks(projectTrackingId);

-- Index for task status
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- Index for task priority
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);

-- Composite index for project tasks sorted by order
CREATE INDEX IF NOT EXISTS idx_project_tasks_tracking_order ON project_tasks(projectTrackingId, sortOrder);

-- Index for due date (for deadline queries)
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(dueDate);

-- =====================================================
-- Budget Tracking table indexes
-- =====================================================
-- Index for project's budget items
CREATE INDEX IF NOT EXISTS idx_budget_tracking_tracking_id ON budget_tracking(projectTrackingId);

-- Index for budget category
CREATE INDEX IF NOT EXISTS idx_budget_tracking_category ON budget_tracking(category);

-- =====================================================
-- KPI Tracking table indexes
-- =====================================================
-- Index for project's KPIs
CREATE INDEX IF NOT EXISTS idx_kpi_tracking_tracking_id ON kpi_tracking(projectTrackingId);

-- =====================================================
-- Risk Tracking table indexes
-- =====================================================
-- Index for project's risks
CREATE INDEX IF NOT EXISTS idx_risk_tracking_tracking_id ON risk_tracking(projectTrackingId);

-- Index for risk severity
CREATE INDEX IF NOT EXISTS idx_risk_tracking_severity ON risk_tracking(severity);

-- Index for risk status
CREATE INDEX IF NOT EXISTS idx_risk_tracking_status ON risk_tracking(status);

-- Composite index for active high-severity risks
CREATE INDEX IF NOT EXISTS idx_risk_tracking_severity_status ON risk_tracking(severity, status);
