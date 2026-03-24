'use client';

import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode; asChild?: boolean }> = ({ children, asChild }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode; side?: string; className?: string }> = ({ 
  children, 
  side = 'top',
  className = ''
}) => {
  return (
    <div className={`
      invisible group-hover:visible opacity-0 group-hover:opacity-100
      absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm
      transition-opacity duration-300
      ${side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
