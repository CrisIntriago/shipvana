// Part D alert matching. A missed alert is better than a false one.
// event: row from vessel_events_cruise.csv (price_musd may be blank). vessel: matched Vessel row or null.
// alert: { brand, parent_company, public_status, event_type, imo, min_gross_tonnage, max_gross_tonnage,
//          max_age, min_price_musd, max_price_musd, include_undisclosed_price }

const filled = (v) => v !== undefined && v !== null && v !== '';

export function alertMatches(alert, event, vessel = null) {
  if (event.status === 'Withdrawn' || event.evidence_status === 'Withdrawn') return false;

  if (filled(alert.event_type) && alert.event_type !== event.event_type) return false;
  if (filled(alert.brand) && alert.brand !== event.brand) return false;

  if (filled(alert.parent_company)) {
    const parent = vessel ? vessel.parent_company : event.seller_or_operator;
    if (alert.parent_company !== parent) return false;
  }

  if (filled(alert.imo)) {
    const imo = event.imo || vessel?.imo;
    if (!imo || String(imo) !== String(alert.imo)) return false;
  }

  // Criteria that need the ship's data are tested only with a matched vessel; missing data means no match.
  if (filled(alert.public_status)) {
    if (!vessel || vessel.public_status !== alert.public_status) return false;
  }
  if (filled(alert.min_gross_tonnage)) {
    if (!vessel || !(Number(vessel.gross_tonnage) >= Number(alert.min_gross_tonnage))) return false;
  }
  if (filled(alert.max_gross_tonnage)) {
    if (!vessel || !(Number(vessel.gross_tonnage) <= Number(alert.max_gross_tonnage))) return false;
  }
  if (filled(alert.max_age)) {
    if (!vessel || !(Number(vessel.age_2026) <= Number(alert.max_age))) return false;
  }

  // Price criteria apply only when a price exists. Blank price matches only if include_undisclosed_price.
  const hasPrice = filled(event.price_musd);
  if (!hasPrice) {
    return alert.include_undisclosed_price !== false;
  }
  const price = Number(event.price_musd);
  if (filled(alert.min_price_musd) && price < Number(alert.min_price_musd)) return false;
  if (filled(alert.max_price_musd) && price > Number(alert.max_price_musd)) return false;
  return true;
}

export function notificationFor(alert, event, vessel = null) {
  return {
    title: `Alert matched: ${event.ship_name}`,
    body: `${event.event_type}, counterparty ${event.counterparty || 'undisclosed'}, price ${
      filled(event.price_musd) ? event.price_musd : 'UNDISCLOSED'
    }. Source: ${event.source}`,
    link: vessel ? `/vessel/${vessel.imo}` : `/events/${encodeURIComponent(event.ship_name)}`,
  };
}
