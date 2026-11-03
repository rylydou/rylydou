// Things that change over time. The clock is read on every request; GitHub
// numbers are cached for an hour, so a profile view doesn't cost API calls.
//
// GITHUB_TOKEN is optional. Without it GitHub allows 60 requests an hour,
// and the cache only needs a couple.

import * as data from './data';

export type Live = {
	repos: number; // public repos on GitHub
	uptime: string; // how long the GitHub account has existed, e.g. "6 years, 10 months"
	stars: Record<string, number>; // by "owner/repo"
	time: string; // local time, e.g. "3:14 PM"
	asleep: boolean;
};

type Stats = { repos: number; created: Date; stars: Record<string, number>; };

const TTL = 60 * 60 * 1000;

async function github<T>(path: string): Promise<T> {
	const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': data.user };
	if (Bun.env.GITHUB_TOKEN) headers.authorization = `Bearer ${Bun.env.GITHUB_TOKEN}`;
	const res = await fetch(`https://api.github.com/${path}`, { headers });
	if (!res.ok) throw new Error(`GitHub API /${path}: ${res.status} ${res.statusText}`);
	return (await res.json()) as T;
}

async function fetchStats(): Promise<Stats> {
	const starRepos = data.projects.flatMap(p => ('stars' in p.chip ? [p.chip.stars] : []));
	const [profile, ...repos] = await Promise.all([
		github<{ public_repos: number; created_at: string; }>(`users/${data.user}`),
		...starRepos.map(r => github<{ stargazers_count: number; }>(`repos/${r}`)),
	]);
	return {
		repos: profile.public_repos,
		created: new Date(profile.created_at),
		stars: Object.fromEntries(starRepos.map((r, i) => [r, repos[i]!.stargazers_count])),
	};
}

// One fetch at a time (a profile view asks for several images at once), and
// if GitHub is down, keep showing the last numbers we got.
let cache: { at: number; stats: Stats; } | undefined;
let pending: Promise<Stats> | undefined;

async function getStats() {
	if (cache && Date.now() - cache.at < TTL) return cache.stats;
	pending ??= fetchStats()
		.then(stats => (cache = { at: Date.now(), stats }).stats)
		.finally(() => (pending = undefined));
	try {
		return await pending;
	} catch (err) {
		if (!cache) throw err;
		console.error(err);
		return cache.stats;
	}
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function since(start: Date, now: Date) {
	let months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
	if (now.getUTCDate() < start.getUTCDate()) months--;
	const years = Math.floor(months / 12);
	months %= 12;
	return [years && plural(years, 'year'), months && plural(months, 'month')].filter(Boolean).join(', ') || 'brand new';
}

export async function getLive(now = new Date()): Promise<Live> {
	const stats = await getStats();
	const clock = (opts: Intl.DateTimeFormatOptions) =>
		new Intl.DateTimeFormat('en-US', { timeZone: data.timeZone, ...opts }).format(now);
	// newer ICU puts a narrow no-break space before AM/PM; the font only needs a plain one
	const time = clock({ hour: 'numeric', minute: '2-digit' }).replace(/\s/g, ' ');
	const hour = Number(clock({ hour: 'numeric', hourCycle: 'h23' }));
	const [from, to] = data.sleepHours;
	const asleep = from > to ? hour >= from || hour < to : hour >= from && hour < to;

	return { repos: stats.repos, uptime: since(stats.created, now), stars: stats.stars, time, asleep };
}
