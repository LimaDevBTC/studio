"use client";

import { Film } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Film className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">MQM CRYPTO</span>
    </div>
  );
}
