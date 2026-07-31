const Input = ({ error, id, label, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label ? (
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
    ) : null}
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`focus-ring min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 ${error ? "border-red-500" : ""} ${className}`}
      {...props}
    />
    {error ? (
      <p id={`${id}-error`} className="text-sm text-red-600">
        {error}
      </p>
    ) : null}
  </div>
);

export default Input;
