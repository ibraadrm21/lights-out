-- LIGHTS OUT - Production PostgreSQL Schema & Constraints

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    bio TEXT,
    country VARCHAR(100) DEFAULT 'España',
    avatar_url VARCHAR(500),
    active_badge VARCHAR(50) DEFAULT '🚦',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_scores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    coins INT DEFAULT 500,
    rank_name VARCHAR(100) DEFAULT 'Rookie F3',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_hash VARCHAR(64) NOT NULL,
    was_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_user_hash ON quiz_history(user_id, question_hash);

CREATE TABLE IF NOT EXISTS cosmetics (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) DEFAULT 'rare'
);

CREATE TABLE IF NOT EXISTS inventory (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cosmetic_id VARCHAR(100) REFERENCES cosmetics(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, cosmetic_id)
);

CREATE TABLE IF NOT EXISTS driverle_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_driver VARCHAR(100) NOT NULL,
    attempts_count INT NOT NULL,
    solved BOOLEAN NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geoguessr_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    circuit_id VARCHAR(100) NOT NULL,
    points_earned INT NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
