"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A container component for page content with consistent padding and max width
 */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${className}`}>
      {children}
    </div>
  );
}
