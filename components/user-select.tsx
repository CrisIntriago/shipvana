'use client';
import { UserRound } from 'lucide-react';

// Demo sign-in: pick a role. Submits the parent form on change.
export function UserSelect({ users, current }: { users: { id: string; name: string }[]; current: string }) {
  return (
    <div className="relative">
      <UserRound className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/50" aria-hidden />
      <select
        name="userId"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="appearance-none rounded-md border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-sm text-white focus:border-brass/60 focus:outline-none [&>option]:text-ink"
        aria-label="Signed-in demo user"
      >
        <option value="">Signed out (public)</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
