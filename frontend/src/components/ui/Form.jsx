export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none backdrop-blur transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:bg-slate-800/80 placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none backdrop-blur resize-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:bg-slate-800/80 placeholder:text-slate-500 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none backdrop-blur transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:bg-slate-800/80 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) {
  const variants = {
    default: "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20",
    secondary: "bg-slate-700 text-white hover:bg-slate-600",
    destructive: "bg-linear-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20",
    outline: "border border-slate-600 text-slate-200 hover:bg-slate-800/50 hover:border-slate-500",
    ghost: "text-slate-200 hover:bg-slate-800/50",
  };

  const sizes = {
    default: "px-4 py-2.5 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`rounded-lg font-semibold transition-all active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({ className = "", children, ...props }) {
  return (
    <label className={`block text-sm font-semibold text-slate-200 ${className}`} {...props}>
      {children}
    </label>
  );
}

export function FormGroup({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}
