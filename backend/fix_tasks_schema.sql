-- Fix tasks table schema to match SQLModel

-- Drop and recreate tasks table with correct schema
DROP TABLE IF EXISTS tasks CASCADE;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(5000),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(50),
    category VARCHAR(100),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Add check constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('pending', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check 
    CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high'));
