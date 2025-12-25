// オレンジボタンコンポーネント（視認性保証）

import React from "react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/theme";

export const OrangeButton: React.FC<
  React.ComponentProps<typeof Button> & { style?: React.CSSProperties }
> = ({ className = "", style = {}, ...props }) => (
  <Button
    {...props}
    className={`rounded-2xl hover:opacity-95 ${className}`}
    style={{ backgroundColor: BRAND.ORANGE, color: "#ffffff", ...style }}
  />
);

export const OrangeOutlineButton: React.FC<
  React.ComponentProps<typeof Button> & { style?: React.CSSProperties }
> = ({ className = "", style = {}, ...props }) => (
  <Button
    {...props}
    variant="outline"
    className={`rounded-2xl border hover:bg-orange-50 ${className}`}
    style={{ borderColor: BRAND.ORANGE, color: BRAND.ORANGE, ...style }}
  />
);

