// Shared UI primitives. Build every page from these so spacing, type and colour stay consistent.
import Image from 'next/image';
import Link from 'next/link';
import { Ship } from 'lucide-react';
import { PORT_PHOTO, type ShipPhoto } from '@/lib/ship-photos';

/** Dark navy band at the top of each page. Uses the PortMiami panorama faintly unless a photo is given. */
export function PageHeader({
  eyebrow,
  title,
  description,
  photo = PORT_PHOTO,
  back,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  photo?: ShipPhoto | null;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-abyss text-white">
      {photo && (
        <Image src={photo.file} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-30" />
      )}
      {/* Black scrim keeps text readable over any photo. */}
      {photo && <div className="absolute inset-0 -z-10 bg-black/35" />}
      <div className="chart-grid absolute inset-0 -z-10 bg-gradient-to-r from-abyss via-abyss/85 to-abyss/30" />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:pb-12">
        {back && (
          <Link href={back.href} className="text-sm text-white/60 transition hover:text-white">
            ← {back.label}
          </Link>
        )}
        {eyebrow && <Eyebrow className="mt-4">{eyebrow}</Eyebrow>}
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight sm:text-5xl">{title}</h1>
        {description && <div className="mt-3 max-w-2xl text-base text-white/70">{description}</div>}
        {children && <div className="mt-6">{children}</div>}
      </div>
      {photo && photo !== PORT_PHOTO && <PhotoCredit photo={photo} className="absolute bottom-2 right-3" />}
    </section>
  );
}

export function Eyebrow({ children, className = '', tone = 'brass' }: { children: React.ReactNode; className?: string; tone?: 'brass' | 'harbor' }) {
  return (
    <p
      className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${tone === 'brass' ? 'text-brass' : 'text-harbor'} ${className}`}
    >
      <span className={`h-px w-6 ${tone === 'brass' ? 'bg-brass' : 'bg-harbor'}`} aria-hidden />
      {children}
    </p>
  );
}

/** White card on the paper background. */
export function Panel({ children, className = '', as: As = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'article' | 'aside' }) {
  return <As className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,27,40,0.04)] ${className}`}>{children}</As>;
}

/** Small uppercase heading inside a panel or above a group. */
export function SectionLabel({ children, icon, className = '' }: { children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <h2 className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted ${className}`}>
      {icon}
      {children}
    </h2>
  );
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div>
      {eyebrow && <Eyebrow tone="harbor">{eyebrow}</Eyebrow>}
      <h2 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
    </div>
  );
}

const buttonStyles = {
  primary: 'bg-harbor text-white hover:bg-harbor-dark',
  brass: 'bg-brass text-abyss hover:bg-brass-light',
  secondary: 'border border-line bg-white text-ink hover:border-harbor/40 hover:bg-harbor-tint',
  ghost: 'text-muted hover:bg-harbor-tint hover:text-ink',
};
export const buttonClass = (variant: keyof typeof buttonStyles = 'primary', extra = '') =>
  `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${buttonStyles[variant]} ${extra}`;

export const inputClass =
  'rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-harbor focus:outline-none focus:ring-2 focus:ring-harbor/15';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
      {label}
      {children}
    </label>
  );
}

/** Ship photo with its credit, or a neutral placeholder. Never shows another ship's photo. */
export function ShipImage({
  photo,
  alt,
  sizes,
  className = '',
  preload,
  showCredit = true,
}: {
  photo: ShipPhoto | null;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  showCredit?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-navy ${className}`}>
      {photo ? (
        <>
          <Image src={photo.file} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
          {showCredit && <PhotoCredit photo={photo} className="absolute bottom-1.5 right-2" />}
        </>
      ) : (
        <div className="chart-grid flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-navy to-harbor-dark text-white/40">
          <Ship className="h-8 w-8" strokeWidth={1.25} aria-hidden />
          <span className="text-[11px]">No open-licence photo yet</span>
        </div>
      )}
    </div>
  );
}

export function PhotoCredit({ photo, className = '' }: { photo: ShipPhoto; className?: string }) {
  return (
    <a
      href={photo.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={`rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white/85 backdrop-blur-sm transition hover:bg-black/70 ${className}`}
    >
      Photo: {photo.author} · {photo.license}
    </a>
  );
}
