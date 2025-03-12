"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Application header component with navigation links
 */
export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Modern Web Template
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <Link href="/image-generator" className="text-sm font-medium hover:underline">
              Image Generator
            </Link>
            <Link href="/test-data" className="text-sm font-medium hover:underline">
              Test Data
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
