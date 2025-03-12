-- Create a simple function to test Supabase connection
CREATE OR REPLACE FUNCTION get_system_info()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'connected', true,
    'timestamp', NOW(),
    'version', current_setting('server_version')
  );
$$;
