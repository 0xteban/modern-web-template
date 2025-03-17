'use client';

import { useState } from 'react';
import { useUser, UserButton as StackUserButton } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function UserButton() {
  const user = useUser({ or: 'return-null' });
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
        </Link>
        <StackUserButton />
      </div>
    </div>
  );
}
