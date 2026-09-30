import type { Dict } from '../i18n';
import type { SessionRecord } from '../store';

export function startOfWeek(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - dow);
  return x;
}

export function weekLabel(start: Date, t: Dict) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const M = t.dates.monthsShort;
  const a = t.dates.dayMonth(start.getDate(), M[start.getMonth()]);
  const b = start.getMonth() === end.getMonth() ? `${end.getDate()}` : t.dates.dayMonth(end.getDate(), M[end.getMonth()]);
  return `${a} – ${b}`;
}

function timeBucket(h: number, t: Dict) {
  const key = h >= 5 && h < 12 ? 'Morning' : h >= 12 && h < 17 ? 'Afternoon' : h >= 17 && h < 22 ? 'Evening' : 'Night';
  const end = (h + 2) % 24;
  return { name: t.insights.times[key], range: t.dates.range(h, end) };
}

export function weeklyInsights(history: SessionRecord[], t: Dict, now = new Date()) {
  const start = startOfWeek(now);
  const startMs = start.getTime();
  const endMs = startMs + 7 * 86400000;
  const week = history.filter((r) => r.startedAt >= startMs && r.startedAt < endMs);

  const perDay = Array.from({ length: 7 }, () => 0);
  week.forEach((r) => {
    const i = Math.floor((r.startedAt - startMs) / 86400000);
    if (i >= 0 && i < 7) perDay[i] += r.seconds;
  });
  const minutes = perDay.map((s) => Math.round(s / 60));
  const todayIdx = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - startMs) / 86400000);

  const totalMin = Math.round(week.reduce((a, r) => a + r.seconds, 0) / 60);
  const avgInt = week.length ? week.reduce((a, r) => a + r.intensity, 0) / week.length : 0;

  const hours = new Map<number, number>();
  week.forEach((r) => {
    const h = new Date(r.startedAt).getHours();
    hours.set(h, (hours.get(h) ?? 0) + 1);
  });
  let bestHour = -1;
  let bestCount = 0;
  hours.forEach((c, h) => { if (c > bestCount) { bestCount = c; bestHour = h; } });

  const counts = new Map<string, number>();
  week.forEach((r) => {
    const label = t.patterns[r.pid]?.name ?? r.name;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  const favs = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    label: weekLabel(start, t),
    sessions: week.length,
    activeDays: perDay.filter((s) => s > 0).length,
    perDay,
    minutes,
    todayIdx,
    totalMin,
    avgInt,
    time: bestHour >= 0 ? timeBucket(bestHour, t) : null,
    favs,
  };
}
