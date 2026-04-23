export function Table({ children, className = "" }) {
  return (
    <table className={`w-full text-sm ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead>
      <tr className={`border-b border-slate-700/50 bg-slate-800/50 ${className}`}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th className={`text-left px-4 py-4 font-semibold text-slate-300 ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-4 text-slate-300 ${className}`}>
      {children}
    </td>
  );
}
