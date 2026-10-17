import 'server-only';
import { connection } from 'next/server';
import { imoIsValid } from '@/lib/core/valuation';
import type { EventState, VesselEvent } from '@/lib/core/types';
import { newId, persist, runAlertMatching, store, vesselForEvent } from './store';

// Read helpers. Each awaits connection() so data is read per request, never baked into the prerender.

export async function getVessels() {
  await connection();
  return store().vessels;
}

export async function getVessel(imo: string) {
  await connection();
  return store().vessels.find((v) => v.imo === imo) ?? null;
}

export async function getEvents() {
  await connection();
  return [...store().events].sort((a, b) => (b.event_date ?? '').localeCompare(a.event_date ?? ''));
}

export async function getEventsForVessel(imo: string) {
  await connection();
  return store().events.filter((e) => e.imo === imo);
}

export async function getScrapPrices() {
  await connection();
  return store().scrapPrices;
}

export async function getPolicies() {
  await connection();
  return store().policies;
}

export async function getScenarios() {
  await connection();
  return store().scenarios;
}

export async function getAlertsFor(userId: string) {
  await connection();
  return store().alerts.filter((a) => a.owner === userId);
}

export async function getNotificationsFor(userId: string) {
  await connection();
  return store()
    .notifications.filter((n) => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getScenarioRunsFor(userId: string) {
  await connection();
  return store()
    .scenarioRuns.filter((r) => r.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Events are "Needs IMO" when they have no IMO or the IMO matches no tracked vessel.
export const needsImo = (e: VesselEvent) => !e.imo || !store().vessels.some((v) => v.imo === e.imo);

// Mutations ----------------------------------------------------------------

export type NewEventInput = Omit<VesselEvent, 'id' | 'status' | 'created_at' | 'created_by'> & {
  status?: EventState;
};

/** Save a reviewed event. Never invents an IMO: an IMO that fails the check digit is dropped. Triggers alert matching. */
export function saveEvent(input: NewEventInput, userId: string) {
  const s = store();
  const imo = input.imo && imoIsValid(input.imo) ? input.imo : null;
  const event: VesselEvent = {
    ...input,
    imo,
    imo_status: imo
      ? s.vessels.some((v) => v.imo === imo)
        ? 'MATCHED to Vessel table'
        : 'Valid IMO, not tracked'
      : (input.imo_status ?? 'NO IMO IN SOURCE - do not guess'),
    id: newId('evt'),
    status: input.status ?? 'Reported',
    created_by: userId,
    created_at: new Date().toISOString(),
  };
  s.events.push(event);
  persist();
  const notifications = runAlertMatching(event);
  return { event, notifications, vessel: vesselForEvent(s.vessels, event) };
}

/** Attach an IMO to a "Needs IMO" event later (validated), then re-run alert matching. */
export function setEventImo(eventId: string, imo: string) {
  if (!imoIsValid(imo)) throw new Error('IMO fails the check digit');
  const s = store();
  const event = s.events.find((e) => e.id === eventId);
  if (!event) throw new Error('Event not found');
  event.imo = imo;
  event.imo_status = s.vessels.some((v) => v.imo === imo) ? 'MATCHED to Vessel table' : 'Valid IMO, not tracked';
  persist();
  return runAlertMatching(event);
}
