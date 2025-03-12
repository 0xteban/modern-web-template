'use client';

import { useState } from 'react';
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '@/lib/hooks/use-supabase';
import { TestRecord, CreateTestRecord } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TestDataPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTestRecord>({
    name: '',
    description: '',
    is_active: true,
  });

  // Fetch test data
  const { 
    data: testData, 
    loading: isLoading, 
    error, 
    refetch 
  } = useSupabaseQuery<TestRecord>(
    'test',
    (query) => query.select('*').order('created_at', { ascending: false }),
    []
  );

  // Insert hook
  const { 
    insert, 
    loading: isInserting 
  } = useSupabaseInsert<CreateTestRecord>('test');

  // Update hook
  const { 
    update, 
    loading: isUpdating 
  } = useSupabaseUpdate<CreateTestRecord>('test');

  // Delete hook
  const { 
    remove, 
    loading: isDeleting 
  } = useSupabaseDelete('test');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing record
        const result = await update(editingId, formData);
        if (result) {
          toast({
            title: "Record updated",
            description: `Successfully updated "${formData.name}"`,
          });
          setEditingId(null);
        }
      } else {
        // Create new record
        const result = await insert(formData);
        if (result) {
          toast({
            title: "Record created",
            description: `Successfully created "${formData.name}"`,
          });
        }
      }
      
      // Reset form and refetch data
      setFormData({ name: '', description: '', is_active: true });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: TestRecord) => {
    setEditingId(record.id);
    setFormData({
      name: record.name,
      description: record.description || '',
      is_active: record.is_active,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await remove(id);
      if (success) {
        toast({
          title: "Record deleted",
          description: `Successfully deleted "${name}"`,
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete record",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', is_active: true });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Data Management</h1>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Test Records</CardTitle>
              <CardDescription>
                View, edit and delete test records from your Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                  <p className="font-medium">Error loading data:</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              ) : testData && testData.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {testData.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          {item.name}
                          {!item.is_active && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(item)}
                          disabled={isUpdating || isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No test records found</p>
                  <p className="text-sm mt-1">Create a new record to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Record' : 'Add New Record'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update an existing record' : 'Create a new test record'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description (optional)"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {editingId ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isInserting}
                  >
                    {isInserting ? 'Creating...' : 'Create Record'}
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
