-- ============================
-- Row Level Security Policies
-- ============================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_documents ENABLE ROW LEVEL SECURITY;

-- ============================
-- user_profiles policies
-- ============================
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================
-- career_profiles policies
-- ============================
CREATE POLICY "Users can read own profiles"
ON career_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profiles"
ON career_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
ON career_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
ON career_profiles FOR DELETE
USING (auth.uid() = user_id);

-- ============================
-- career_documents policies
-- ============================
CREATE POLICY "Users can read own documents"
ON career_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
ON career_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
ON career_documents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON career_documents FOR DELETE
USING (auth.uid() = user_id);