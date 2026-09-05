import { useCallback, useId } from "react"
import type { ChangeEvent } from "react"
import { BrutalistCard } from "@/components/layout/BrutalistCard"

interface PageRangeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint: string;
  error?: string | null;
}

export function PageRangeField({
  label,
  value,
  onChange,
  placeholder = "Ex: 1-3, 5, 7-9",
  hint,
  error,
}: PageRangeFieldProps) {
  const hintId = useId();
  const errorId = useId();
  const inputId = useId();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange]);

  return (
    <BrutalistCard className="p-6">
      <label htmlFor={inputId} className="text-xs font-black uppercase tracking-widest block mb-3">
        {label}
      </label>
      <input
        id={inputId}
        data-testid="page-range-input"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
        className="w-full border-4 border-slate-950 bg-white p-3 font-mono text-sm uppercase font-bold outline-none focus:border-[#ccff00] focus:shadow-[4px_4px_0px_#ccff00] transition-all"
      />
      <p id={hintId} className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mt-2">
        {hint}
      </p>
      {error ? (
        <p id={errorId} data-testid="page-range-error" role="alert" aria-live="assertive" className="mt-2 text-xs font-black uppercase tracking-widest text-[#ff4d4d]">
          {error}
        </p>
      ) : null}
    </BrutalistCard>
  );
}
