// SHIPVANA logo: a cruise ship against a setting sun over waves, plus the "ShipVana" wordmark.
// Matches the pitch deck. `tone="dark"` is for dark backgrounds (navy parts turn white).

type Tone = 'light' | 'dark';

export function LogoMark({ tone = 'light', className = 'h-8 w-auto' }: { tone?: Tone; className?: string }) {
  const hull = tone === 'dark' ? '#ffffff' : 'var(--color-navy)';
  const cut = tone === 'dark' ? 'var(--color-abyss)' : '#ffffff';
  return (
    <svg viewBox="0 0 72 46" className={className} aria-hidden>
      <defs>
        <clipPath id="sv-sun-clip">
          <rect x="0" y="0" width="72" height="27" />
        </clipPath>
      </defs>
      <circle cx="40" cy="22" r="15" fill="var(--color-brass)" clipPath="url(#sv-sun-clip)" />
      {/* Superstructure tiers */}
      <rect x="31" y="6" width="7" height="4" rx="1" fill={hull} />
      <path d="M22 11h23l3 5H22z" fill={hull} />
      <path d="M16 16.5h33l3.5 4.5H16z" fill={hull} />
      <path d="M11 21.5h43l4 5.5H11z" fill={hull} />
      {/* Hull with raised bow */}
      <path d="M5 27.5h56l10-9-5 17H10z" fill={hull} />
      {/* Window rows */}
      <g stroke={cut} strokeWidth="1.1" strokeDasharray="2 1.4">
        <path d="M25 13.6h18" />
        <path d="M19 18.8h28" />
        <path d="M14 24.2h37" />
        <path d="M13 31.5h46" />
      </g>
      {/* Waves */}
      <path
        d="M4 41c3-2.4 6-2.4 9 0s6 2.4 9 0 6-2.4 9 0 6 2.4 9 0 6-2.4 9 0 6 2.4 9 0 6-2.4 9 0"
        fill="none"
        stroke="var(--color-brass)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ tone = 'light', size = 'md' }: { tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const mark = { sm: 'h-6 w-auto', md: 'h-8 w-auto', lg: 'h-12 w-auto' }[size];
  const text = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }[size];
  return (
    <span className="inline-flex items-center gap-2" aria-label="SHIPVANA">
      <LogoMark tone={tone} className={mark} />
      <span className={`font-logo font-extrabold italic leading-none tracking-tight ${text}`} aria-hidden>
        <span className={tone === 'dark' ? 'text-white' : 'text-navy'}>Ship</span>
        <span className="text-brass">Vana</span>
      </span>
    </span>
  );
}
