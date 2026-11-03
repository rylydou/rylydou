// Serves every image on the profile README, drawn fresh on each request.
// `bun run dev` runs it at http://localhost:3000 and reloads on save.

import * as data from './data';
import { getLive } from './live';
import { button, gameCard, header, hero, projectCard, sections, walker } from './render';
import { slug } from './svg';

/**
 * Sends an SVG. GitHub shows README images through its own caching proxy;
 * `no-cache` makes it check back on every view, and the ETag lets it skip
 * the download when the image hasn't changed.
 */
function send(req: Request, svg: string) {
	const etag = `"${Bun.hash(svg).toString(36)}"`;
	const headers = { 'content-type': 'image/svg+xml', 'cache-control': 'no-cache', etag, vary: 'accept-encoding' };
	if (req.headers.get('if-none-match')?.includes(etag)) return new Response(null, { status: 304, headers });
	if (!req.headers.get('accept-encoding')?.includes('gzip')) return new Response(svg, { headers });
	return new Response(Bun.gzipSync(svg), { headers: { ...headers, 'content-encoding': 'gzip' } });
}

const notFound = () => new Response('Not found', { status: 404 });

/** The item named by a route's "<name>.svg" param. */
const pick = <T>(items: T[], name: (item: T) => string, file: string) => items.find(it => `${name(it)}.svg` === file);

const server = Bun.serve({
	port: Number(Bun.env.PORT ?? 3000),
	routes: {
		'/': Response.redirect(`https://github.com/${data.user}`),

		// add ?now=2026-01-01T02:00-06:00 to see it at another time
		'/turtlefetch.svg': async req => {
			const now = new URL(req.url).searchParams.get('now');
			return send(req, hero(await getLive(now ? new Date(now) : undefined)));
		},

		'/sections/:file': req => {
			const section = pick(Object.entries(sections), ([name]) => name, req.params.file);
			return section ? send(req, header(section[1])) : notFound();
		},

		'/games/:file': async req => {
			const game = pick(data.games, g => g.id, req.params.file);
			return game ? send(req, await gameCard(game)) : notFound();
		},

		'/projects/:file': async req => {
			const project = pick(data.projects, p => p.id, req.params.file);
			return project ? send(req, await projectCard(project, await getLive())) : notFound();
		},

		'/links/:file': req => {
			const label = pick(data.links, slug, req.params.file);
			return label ? send(req, button(label)) : notFound();
		},

		'/turtle-walk.svg': req => send(req, walker()),
	},
	fetch: notFound,
	error(err) {
		console.error(err);
		return new Response('Server error', { status: 500 });
	},
});

console.log(`Serving the profile images at ${server.url}`);
