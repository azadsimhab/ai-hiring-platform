-- Production Database Schema for AI Hiring Platform
-- Supports complete 9-agent agentic architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies and Organizations
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id to users table
ALTER TABLE users ADD COLUMN company_id UUID REFERENCES companies(id);

-- Hiring Requests (Agent 2)
CREATE TABLE hiring_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    manager VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    salary_range VARCHAR(100),
    benefits TEXT,
    location VARCHAR(255),
    urgency VARCHAR(20) DEFAULT 'medium',
    employment_type VARCHAR(50) DEFAULT 'permanent',
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Descriptions (Agent 3)
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiring_request_id UUID NOT NULL REFERENCES hiring_requests(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    requirements TEXT[],
    responsibilities TEXT[],
    ai_generated BOOLEAN DEFAULT false,
    template_used VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    version_number INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Posts (Social Media Integration)
CREATE TABLE job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jd_id UUID NOT NULL REFERENCES job_descriptions(id),
    platform VARCHAR(50) NOT NULL, -- linkedin, twitter, indeed, etc.
    post_content TEXT NOT NULL,
    graphics_url TEXT,
    post_url TEXT,
    performance_metrics JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidates (Agent 4)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    location VARCHAR(255),
    experience_years INTEGER,
    parsed_data JSONB DEFAULT '{}',
    skills TEXT[],
    education JSONB DEFAULT '{}',
    work_history JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resume Screenings (Agent 4)
CREATE TABLE resume_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    jd_id UUID NOT NULL REFERENCES job_descriptions(id),
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    summary TEXT,
    criteria_scores JSONB DEFAULT '{}',
    strengths TEXT[],
    concerns TEXT[],
    recommendations TEXT[],
    screening_method VARCHAR(50) DEFAULT 'document_ai',
    processed_by VARCHAR(255), -- AI model used
    screening_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interviews and Scheduling (Agent 5)
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    jd_id UUID NOT NULL REFERENCES job_descriptions(id),
    interviewer_id UUID REFERENCES users(id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    interview_type VARCHAR(50) DEFAULT 'video', -- phone, video, onsite
    meeting_link TEXT,
    meeting_room VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    timezone VARCHAR(50) DEFAULT 'UTC',
    calendar_event_id VARCHAR(255),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview Questions
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- technical, behavioral, problem-solving, culture-fit
    difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    expected_answer TEXT,
    scoring_criteria JSONB DEFAULT '{}',
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview Sessions (Agent 6)
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id),
    recording_url TEXT,
    transcript TEXT,
    ai_analysis JSONB DEFAULT '{}',
    scores JSONB DEFAULT '{}',
    feedback TEXT,
    duration_actual_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    ai_model_used VARCHAR(100),
    analysis_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview Question Responses
CREATE TABLE interview_question_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id),
    question_id UUID NOT NULL REFERENCES interview_questions(id),
    response_text TEXT,
    response_audio_url TEXT,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_feedback TEXT,
    response_time_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shortlists (Agent 7)
CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jd_id UUID NOT NULL REFERENCES job_descriptions(id),
    name VARCHAR(255) DEFAULT 'Final Shortlist',
    candidate_ids UUID[],
    selected_by UUID REFERENCES users(id),
    screening_results JSONB DEFAULT '{}',
    decision_criteria JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Final Selections and Offers
CREATE TABLE final_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jd_id UUID NOT NULL REFERENCES job_descriptions(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    decision VARCHAR(20) NOT NULL, -- hired, rejected, pending
    decision_reason TEXT,
    compensation JSONB DEFAULT '{}',
    start_date DATE,
    offer_letter_url TEXT,
    onboarding_plan TEXT[],
    decided_by UUID REFERENCES users(id),
    decision_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Activities and Logging (Agent 1 & 8)
CREATE TABLE agent_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50), -- candidate, job, interview, etc.
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    result VARCHAR(20) DEFAULT 'success', -- success, error, warning
    duration_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics (Agent 8)
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2) NOT NULL,
    metric_unit VARCHAR(20),
    date_recorded DATE NOT NULL,
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    category VARCHAR(50), -- hiring, performance, cost, time, quality
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- info, warning, error, critical
    message TEXT NOT NULL,
    component VARCHAR(100),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Settings and Preferences (Agent 9)
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, setting_key)
);

-- Integrations and API Keys
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    integration_type VARCHAR(50) NOT NULL, -- google, linkedin, slack, etc.
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_hiring_requests_company_id ON hiring_requests(company_id);
CREATE INDEX idx_hiring_requests_user_id ON hiring_requests(user_id);
CREATE INDEX idx_hiring_requests_status ON hiring_requests(status);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_resume_screenings_candidate_id ON resume_screenings(candidate_id);
CREATE INDEX idx_resume_screenings_jd_id ON resume_screenings(jd_id);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_scheduled_time ON interviews(scheduled_time);
CREATE INDEX idx_agent_activities_agent_name ON agent_activities(agent_name);
CREATE INDEX idx_agent_activities_user_id ON agent_activities(user_id);
CREATE INDEX idx_agent_activities_timestamp ON agent_activities(timestamp);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date_recorded);
CREATE INDEX idx_performance_metrics_company_id ON performance_metrics(company_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_level ON system_logs(level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hiring_requests_updated_at BEFORE UPDATE ON hiring_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shortlists_updated_at BEFORE UPDATE ON shortlists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO companies (name, industry, size, description) VALUES 
('TechCorp Inc', 'Technology', '100-500', 'Leading AI and software development company'),
('InnovateLabs', 'Software', '50-100', 'Innovative solutions for modern businesses');

-- Sample user (will be populated via OAuth)
-- Sample hiring request for testing
-- INSERT INTO hiring_requests (user_id, company_id, job_title, department, manager, level, salary_range, location) VALUES 
-- ('user_uuid', 'company_uuid', 'Senior Software Engineer', 'Engineering', 'John Smith', 'Senior', '$120,000 - $150,000', 'Remote');

-- Sample interview questions
INSERT INTO interview_questions (question_text, category, difficulty, tags) VALUES 
('Can you walk us through your experience with React and state management?', 'technical', 'medium', ARRAY['react', 'javascript', 'frontend']),
('Describe a challenging project you worked on and how you overcame obstacles.', 'behavioral', 'medium', ARRAY['problem-solving', 'teamwork']),
('How would you optimize a slow database query?', 'technical', 'hard', ARRAY['database', 'performance', 'sql']),
('What is your approach to code review and collaboration?', 'behavioral', 'easy', ARRAY['collaboration', 'code-quality']),
('Explain the difference between REST and GraphQL APIs.', 'technical', 'medium', ARRAY['api', 'rest', 'graphql']);

COMMENT ON TABLE users IS 'User accounts with Google OAuth integration';
COMMENT ON TABLE companies IS 'Company/organization information';
COMMENT ON TABLE hiring_requests IS 'Hiring requests created by Agent 2';
COMMENT ON TABLE job_descriptions IS 'AI-generated job descriptions from Agent 3';
COMMENT ON TABLE candidates IS 'Candidate information and profiles';
COMMENT ON TABLE resume_screenings IS 'Resume analysis results from Agent 4';
COMMENT ON TABLE interviews IS 'Interview scheduling from Agent 5';
COMMENT ON TABLE interview_sessions IS 'AI-powered interview sessions from Agent 6';
COMMENT ON TABLE shortlists IS 'Final candidate selections from Agent 7';
COMMENT ON TABLE agent_activities IS 'Activity logging for all agents';
COMMENT ON TABLE performance_metrics IS 'Analytics data for Agent 8';
COMMENT ON TABLE user_settings IS 'User preferences for Agent 9';