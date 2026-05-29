-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text,
  google_id text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ==================== CONVERSATIONS ====================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_feature ON conversations(feature);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- ==================== MESSAGES ====================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ==================== GENERATIONS ====================
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  title text NOT NULL DEFAULT 'Generation',
  input jsonb,
  content text NOT NULL,
  model text,
  rag_used boolean DEFAULT false,
  fallback_used boolean DEFAULT false,
  stream_used boolean DEFAULT false,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_feature ON generations(feature);
CREATE INDEX idx_generations_conversation_id ON generations(conversation_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

-- ==================== EVALUATIONS ====================
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_id uuid UNIQUE NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
  overall_score integer CHECK (overall_score >= 1 AND overall_score <= 5),
  relevance_score integer CHECK (relevance_score >= 1 AND relevance_score <= 5),
  clarity_score integer CHECK (clarity_score >= 1 AND clarity_score <= 5),
  accuracy_score integer CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  feedback text,
  created_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_evaluations_generation_id ON evaluations(generation_id);
CREATE INDEX idx_evaluations_overall_score ON evaluations(overall_score);

-- ==================== RESET TOKENS ====================
CREATE TABLE IF NOT EXISTS reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT current_timestamp
);

CREATE INDEX idx_reset_tokens_token ON reset_tokens(token);
CREATE INDEX idx_reset_tokens_expires_at ON reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;