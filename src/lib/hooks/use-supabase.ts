'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * A custom hook for fetching data from Supabase with loading and error states
 * @param tableName The name of the table to query
 * @param query A function that takes a Supabase query builder and returns a modified query
 * @param dependencies Dependencies array to control when the query should re-run
 * @returns An object containing the data, loading state, error, and a refetch function
 */
export function useSupabaseQuery<T>(
  tableName: string,
  query: (queryBuilder: any) => any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryBuilder = supabase.from(tableName);
      const { data: result, error: queryError } = await query(queryBuilder);
      
      if (queryError) {
        setError(queryError);
        return;
      }
      
      setData(result);
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * A custom hook for inserting data into Supabase
 * @param tableName The name of the table to insert into
 * @returns An object containing the insert function, loading state, and error
 */
export function useSupabaseInsert<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const insert = async (data: Partial<T> | Partial<T>[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: insertError } = await supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (insertError) {
        setError(insertError);
        return null;
      }
      
      return result;
    } catch (err) {
      console.error(`Error inserting data into ${tableName}:`, err);
      setError(err as PostgrestError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
}

/**
 * A custom hook for updating data in Supabase
 * @param tableName The name of the table to update
 * @returns An object containing the update function, loading state, and error
 */
export function useSupabaseUpdate<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select();
      
      if (updateError) {
        setError(updateError);
        return null;
      }
      
      return result;
    } catch (err) {
      console.error(`Error updating data in ${tableName}:`, err);
      setError(err as PostgrestError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

/**
 * A custom hook for deleting data from Supabase
 * @param tableName The name of the table to delete from
 * @returns An object containing the delete function, loading state, and error
 */
export function useSupabaseDelete(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        setError(deleteError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting data from ${tableName}:`, err);
      setError(err as PostgrestError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}
