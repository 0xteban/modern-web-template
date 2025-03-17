import { redirect } from 'next/navigation';
import { stackServerApp } from '@/stack';

export default async function DashboardPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user.displayName || user.primaryEmail}</h2>
        <p className="text-gray-600 mb-4">You are logged in with: {user.primaryEmail}</p>
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Your Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-md">
              <h4 className="font-medium">Email</h4>
              <p>{user.primaryEmail}</p>
            </div>
            <div className="border p-4 rounded-md">
              <h4 className="font-medium">Account Settings</h4>
              <p>
                <a href="/handler/account" className="text-blue-600 hover:underline">
                  Manage your account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
