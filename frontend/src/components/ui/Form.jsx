export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${className}`}
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
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1 text-xs",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`rounded-lg font-medium transition active:scale-[0.99] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({ className = "", children, ...props }) {
  return (
    <label className={`block text-sm font-medium text-zinc-900 ${className}`} {...props}>
      {children}
    </label>
  );
}

export function FormGroup({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
