// ステータスバッジコンポーネント

import React from "react";
import type { Status } from "@/lib/logic/computeStatus";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.chip}`}
    >
      {status.label}
    </span>
  );
}

