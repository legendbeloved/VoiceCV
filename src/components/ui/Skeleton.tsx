import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer relative overflow-hidden bg-white/5",
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-12 w-full max-w-[1280px] mx-auto animate-pulse">
      <div className="flex justify-between items-end gap-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="w-64 h-12" />
            <Skeleton className="w-48 h-6" />
          </div>
        </div>
        <Skeleton className="w-32 h-16 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-3">
          <Skeleton className="h-20 rounded-[2rem]" />
          <Skeleton className="h-20 rounded-[2rem]" />
          <Skeleton className="h-20 rounded-[2rem]" />
        </div>
        <div className="lg:col-span-9">
          <Skeleton className="h-[750px] rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}

export function RecordSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full pt-12 space-y-12 animate-pulse">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      <Skeleton className="h-20 rounded-3xl" />
      <Skeleton className="h-60 rounded-3xl" />
      <div className="flex flex-col items-center gap-8">
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
    </div>
  );
}
