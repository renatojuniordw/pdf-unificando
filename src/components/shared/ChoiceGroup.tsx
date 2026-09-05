import { memo, useCallback } from "react";
import type { ReactNode } from "react";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface ChoiceGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly ChoiceOption[];
  hint?: string;
}

export function ChoiceGroup({
  label,
  value,
  onChange,
  options,
  hint,
}: ChoiceGroupProps) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xs font-black uppercase tracking-widest mb-3">
        {label}
      </legend>
      <div className="flex gap-3" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const selected = value === opt.value;

          return (
            <ChoiceOptionButton
              key={opt.value}
              option={opt}
              selected={selected}
              onChange={onChange}
            />
          );
        })}
      </div>
      {hint ? (
        <p className="text-xs font-mono text-slate-500 mt-3 uppercase tracking-widest">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

interface ChoiceOptionButtonProps {
  option: ChoiceOption;
  selected: boolean;
  onChange: (value: string) => void;
}

const ChoiceOptionButton = memo(function ChoiceOptionButton({
  option,
  selected,
  onChange,
}: ChoiceOptionButtonProps) {
  const handleClick = useCallback(() => onChange(option.value), [onChange, option.value]);

  return (
    <button
      type="button"
      data-testid={`choice-option-${option.value}`}
      role="radio"
      aria-checked={selected}
      onClick={handleClick}
      className={`flex-1 border-4 p-3 transition-all font-black uppercase text-xs tracking-widest ${
        selected
          ? "bg-slate-950 text-[#ccff00] border-slate-950 shadow-[4px_4px_0px_#ccff00]"
          : "bg-white text-slate-950 border-slate-950 shadow-[2px_2px_0px_#000] hover:bg-slate-100"
      }`}
    >
      {option.icon ? <span className="mb-1 flex justify-center">{option.icon}</span> : null}
      <span className="block text-sm">{option.label}</span>
      {option.description ? (
        <span className="block text-[9px] font-mono mt-1 opacity-70">
          {option.description}
        </span>
      ) : null}
    </button>
  );
});
