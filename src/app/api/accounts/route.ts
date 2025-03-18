import { query, queryOne, transaction } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '@/lib/api-utils';
import { NextRequest } from 'next/server';

export interface Account {
  id: string;
  name: string;
  description: string | null;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountWithMembers extends Account {
  members: {
    user_id: string;
    email: string;
    name: string;
    role: string;
  }[];
}

// GET /api/accounts - Get all accounts (optionally for a specific user)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    let accounts: AccountWithMembers[];
    
    if (userId) {
      // Get accounts for a specific user with member details
      accounts = await query<AccountWithMembers>(
        `SELECT 
           a.*, 
           json_agg(
             json_build_object(
               'user_id', u.id,
               'email', u.email,
               'name', u.name,
               'role', am.role
             )
           ) as members
         FROM accounts a
         JOIN account_members am ON a.id = am.account_id
         JOIN users u ON am.user_id = u.id
         WHERE a.id IN (
           SELECT account_id FROM account_members WHERE user_id = $1
         )
         GROUP BY a.id
         ORDER BY a.created_at DESC`,
        [userId]
      );
    } else {
      // Get all accounts with member details
      accounts = await query<AccountWithMembers>(
        `SELECT 
           a.*, 
           json_agg(
             json_build_object(
               'user_id', u.id,
               'email', u.email,
               'name', u.name,
               'role', am.role
             )
           ) as members
         FROM accounts a
         JOIN account_members am ON a.id = am.account_id
         JOIN users u ON am.user_id = u.id
         GROUP BY a.id
         ORDER BY a.created_at DESC`
      );
    }
    
    return successResponse(accounts);
  } catch (error: any) {
    return errorResponse(`Error fetching accounts: ${error.message}`);
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isPersonal, userId } = body;
    
    if (!name) {
      return errorResponse('Account name is required');
    }
    
    if (!userId) {
      return errorResponse('User ID is required');
    }
    
    // Use transaction to create account and add user as member
    const result = await transaction(async (client) => {
      // Create account
      const accountResult = await client.query(
        'INSERT INTO accounts (name, description, is_personal) VALUES ($1, $2, $3) RETURNING *',
        [name, description, isPersonal || false]
      );
      
      const account = accountResult.rows[0];
      
      // Add creator as admin
      await client.query(
        'INSERT INTO account_members (account_id, user_id, role) VALUES ($1, $2, $3)',
        [account.id, userId, 'admin']
      );
      
      // Get user details for response
      const userResult = await client.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [userId]
      );
      
      return {
        ...account,
        members: [{
          user_id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          name: userResult.rows[0].name,
          role: 'admin'
        }]
      };
    });
    
    return createdResponse(result);
  } catch (error: any) {
    return errorResponse(`Error creating account: ${error.message}`);
  }
}
