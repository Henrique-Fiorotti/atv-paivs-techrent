export function Card({ children, className = "", variant = "default" }) {
  const variants = {
    default: "bg-linear-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl",
    elevated: "bg-linear-to-br from-slate-800/80 to-slate-900/80 border-slate-600/50 backdrop-blur-xl shadow-2xl",
    subtle: "bg-slate-800/30 border-slate-700/30 backdrop-blur-md",
  };

  return (
    <div
      className={`rounded-2xl border ${variants[variant]} p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`mb-6 pb-4 border-b border-slate-700/30 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, className = "" }) {
  const trendIsPositive = trend === "up";

  return (
    <Card variant="elevated" className={`overflow-hidden group cursor-pointer hover:scale-105 transform ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-bold text-white">{value}</p>
          {trendLabel && (
            <div className={`mt-3 flex items-center gap-1 text-sm font-semibold ${trendIsPositive ? "text-emerald-400" : "text-red-400"}`}>
              <span>{trendIsPositive ? "↑" : "↓"}</span>
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
            <Icon className="h-8 w-8 text-blue-400 group-hover:text-purple-400 transition-colors" />
          </div>
        )}
      </div>
      <div className="mt-4 h-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </Card>
  );
}

export function PageHeader({ title, description, action, className = "" }) {
  return (
    <div className={`mb-8 flex flex-col md:flex-row items-start justify-between gap-4 animate-fadeIn ${className}`}>
      <div>
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && <p className="mt-2 text-base text-slate-400">{description}</p>}
      </div>
      {action && <div className="mt-2 md:mt-0">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full mb-4">
          <Icon className="h-12 w-12 text-blue-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

