// Placeholder for routes owned by a parallel workstream. Replace the whole page file when you build it.
export function ComingSoon({ title, workstream, children }: { title: string; workstream: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{workstream}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="mt-4 space-y-2 text-sm text-slate-600">{children}</div>
    </div>
  );
}
