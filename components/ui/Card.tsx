'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export default function Card({ children, title, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 ${className}`}>
      {title && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {headerAction && headerAction}
        </div>
      )}
      {children}
    </div>
  );
}