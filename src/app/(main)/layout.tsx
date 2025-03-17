'use client';

import { UserButton } from '@/components/auth/user-button';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">OpenAI Chat</h1>
          <UserButton />
        </div>
      </header>
      <div className="flex-1">
        {children}
      </div>
    </main>
  );
}
