-- Create a basic test table for Supabase connection testing
CREATE TABLE IF NOT EXISTS public.test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert some sample data
INSERT INTO public.test (name, description) VALUES
  ('Test Item 1', 'This is a sample test item'),
  ('Test Item 2', 'Another test item for demonstration');

-- Set up Row Level Security (RLS)
ALTER TABLE public.test ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read the test table
CREATE POLICY "Allow authenticated users to read test data" ON public.test
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a policy that allows all authenticated users to insert into the test table
CREATE POLICY "Allow authenticated users to insert test data" ON public.test
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy that allows users to update their own records
CREATE POLICY "Allow authenticated users to update their own test data" ON public.test
  FOR UPDATE
  TO authenticated
  USING (true);
