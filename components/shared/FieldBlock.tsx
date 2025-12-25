// フィールドブロックコンポーネント

import React from "react";
import { BRAND } from "@/lib/constants/theme";

interface FieldBlockProps {
  title: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FieldBlock({
  title,
  required = false,
  hint,
  children,
}: FieldBlockProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {title}{" "}
          {required ? (
            <span className="text-xs" style={{ color: BRAND.ORANGE }}>
              必須
            </span>
          ) : null}
        </div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

