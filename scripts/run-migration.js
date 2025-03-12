// Run migration script for Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250312_create_system_functions.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL directly
    const { data, error } = await supabase.from('_migrations').insert({
      name: '20250312_create_system_functions',
      sql: migrationSql,
      executed_at: new Date().toISOString()
    });
    
    if (error) {
      if (error.code === '42P01') { // relation does not exist
        console.log('Creating migrations table...');
        
        // Create migrations table if it doesn't exist
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS _migrations (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              sql TEXT NOT NULL,
              executed_at TIMESTAMPTZ NOT NULL
            );
          `
        });
        
        if (createError) {
          console.log('Could not create migrations table, trying direct function creation...');
          
          // Try to create the function directly
          const { error: directError } = await supabase.rpc('exec_sql', {
            sql: migrationSql
          });
          
          if (directError) {
            // Last resort: Try to connect to the database directly
            console.log('Attempting to create function directly...');
            
            // Test the connection
            const { data: testData, error: testError } = await supabase
              .from('_schema')
              .select('version')
              .limit(1);
              
            if (testError) {
              console.log('Could not access schema information. Using REST API to create function...');
              
              // Use the REST API to create the function
              const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_system_info`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`
                }
              });
              
              if (!response.ok) {
                // Function doesn't exist, create it
                console.log('Function does not exist, creating it...');
                
                // Create the function using raw SQL via REST
                // This is a simplified approach - in a real scenario, you would use the Supabase CLI
                console.log('Please run the migration manually using the Supabase dashboard.');
                console.log('Copy the SQL from: supabase/migrations/20250312_create_system_functions.sql');
                console.log('And execute it in the SQL editor in your Supabase dashboard.');
                
                process.exit(1);
              } else {
                console.log('Function already exists!');
              }
            } else {
              console.log('Connected to database but could not create function.');
              console.log('Please run the migration manually using the Supabase dashboard.');
            }
          } else {
            console.log('Function created successfully!');
          }
        } else {
          console.log('Migrations table created, retrying migration...');
          return runMigration();
        }
      } else {
        console.error('Error inserting migration record:', error.message);
      }
    } else {
      console.log('Migration record inserted successfully!');
    }
    
    // Test the function
    const { data: testData, error: testError } = await supabase.rpc('get_system_info');
    
    if (testError) {
      console.warn(`Warning: Function may not be created or accessible: ${testError.message}`);
      console.log('Please check your Supabase dashboard to verify the function was created.');
    } else {
      console.log('Function test successful:', testData);
      console.log('Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('Error running migration:', error.message);
    console.log('Please run the migration manually using the Supabase dashboard.');
    console.log('Copy the SQL from: supabase/migrations/20250312_create_system_functions.sql');
    console.log('And execute it in the SQL editor in your Supabase dashboard.');
    process.exit(1);
  }
}

runMigration();
