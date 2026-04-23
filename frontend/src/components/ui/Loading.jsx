"use client";

import { Loader } from "lucide-react";

export function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
      <p className="text-slate-400 font-medium mt-4">{message}</p>
    </div>
  );
}

export function SkeletonLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-800/50 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}
