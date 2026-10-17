import Image from 'next/image';
import type { Metadata } from 'next';
import { ALL_PHOTOS } from '@/lib/ship-photos';
import { PageHeader, Panel } from '@/components/ui';

export const metadata: Metadata = { title: 'Photo credits · SHIPVANA' };

export default function CreditsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Credits"
        title="Photo credits"
        description="All ship photos come from Wikimedia Commons under open licences. They are resized; nothing else is changed."
      />
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_PHOTOS.map((p) => (
          <Panel key={p.key} as="article" className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-navy">
              <Image src={p.file} alt={p.title} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
            </div>
            <div className="space-y-1 p-4 text-sm">
              <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-harbor hover:underline">
                {p.title}
              </a>
              <p className="text-muted">
                By {p.author} ·{' '}
                <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  {p.license}
                </a>
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
