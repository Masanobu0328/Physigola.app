// 選択式ボタンコンポーネント

import React from "react";
import { OrangeButton, OrangeOutlineButton } from "./OrangeButton";

interface ChoiceButtonsProps {
  options: string[];
  value: string | string[];
  onChange: (value: any) => void;
  multi?: boolean;
}

export function ChoiceButtons({
  options,
  value,
  onChange,
  multi = false,
}: ChoiceButtonsProps) {
  if (!multi) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((v) =>
          value === v ? (
            <OrangeButton key={v} onClick={() => onChange(v)} type="button">
              {v}
            </OrangeButton>
          ) : (
            <OrangeOutlineButton
              key={v}
              onClick={() => onChange(v)}
              type="button"
            >
              {v}
            </OrangeOutlineButton>
          )
        )}
      </div>
    );
  }

  const set = new Set(Array.isArray(value) ? value : []);
  const toggle = (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(Array.from(next));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((v) =>
        set.has(v) ? (
          <OrangeButton key={v} onClick={() => toggle(v)} type="button">
            {v}
          </OrangeButton>
        ) : (
          <OrangeOutlineButton key={v} onClick={() => toggle(v)} type="button">
            {v}
          </OrangeOutlineButton>
        )
      )}
    </div>
  );
}

