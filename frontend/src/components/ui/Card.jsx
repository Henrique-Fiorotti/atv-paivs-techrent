export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`mb-4 pb-4 border-b border-zinc-200 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-semibold text-zinc-900 ${className}`}>{children}</h2>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, className = "" }) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
          {trendLabel && (
            <p className={`mt-2 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trendLabel}
            </p>
          )}
        </div>
        {Icon && <Icon className="h-8 w-8 text-zinc-400" />}
      </div>
    </Card>
  );
}

export function PageHeader({ title, description, action, className = "" }) {
  return (
    <div className={`mb-8 flex items-start justify-between ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
        {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12 px-4 ${className}`}
    >
      {Icon && <Icon className="h-12 w-12 text-zinc-400 mb-4" />}
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-zinc-600 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
