// Scaffold for routes owned by a parallel workstream (see docs/PLANNING.md).
// Keep the PageHeader when you build the page; replace the Panel below with the real content.
import { CircleDashed, FileCode2, ListChecks } from 'lucide-react';
import { PageHeader, Panel, SectionLabel } from '@/components/ui';

export function ComingSoon({
  title,
  eyebrow,
  description,
  workstream,
  checklist,
  files,
}: {
  title: string;
  eyebrow: string;
  description: string;
  workstream: string;
  checklist: string[];
  files: string[];
}) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-5 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CircleDashed className="h-4 w-4 text-brass" aria-hidden />
              In progress · {workstream}
            </p>
            <a href="https://github.com/CrisIntriago/shipvana/blob/main/docs/PLANNING.md" className="text-xs font-medium text-harbor hover:underline">
              docs/PLANNING.md
            </a>
          </div>
          <div className="grid gap-8 p-5 md:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionLabel icon={<ListChecks className="h-3.5 w-3.5" aria-hidden />}>Done when</SectionLabel>
              <ul className="mt-3 space-y-2">
                {checklist.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm text-ink/80">
                    <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded border border-line bg-paper" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel icon={<FileCode2 className="h-3.5 w-3.5" aria-hidden />}>Files</SectionLabel>
              <ul className="mt-3 space-y-1.5">
                {files.map((f) => (
                  <li key={f} className="rounded-md bg-paper px-2.5 py-1.5 font-mono text-xs text-ink/80">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
