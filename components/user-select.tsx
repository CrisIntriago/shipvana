'use client';

// Demo sign-in: pick a role. Submits the parent form on change.
export function UserSelect({ users, current }: { users: { id: string; name: string }[]; current: string }) {
  return (
    <select
      name="userId"
      defaultValue={current}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
      aria-label="Signed-in demo user"
    >
      <option value="">Signed out (public)</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}
