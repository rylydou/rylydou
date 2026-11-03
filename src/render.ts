// Draws each image on the profile. Every function returns an SVG string and
// does no I/O of its own, apart from reading screenshots (see dataUri).

import { join } from 'node:path';
import * as data from './data';
import type { Game, Project } from './data';
import type { Live } from './live';
import { ADV, C, Canvas, REDUCED_MOTION, SRC, SWATCHES, dataUri, len, num } from './svg';
import { ART, PAL, editor, phone, pixels, turtle } from './sprites';

const TIER = { gold: C.yellow, silver: C.fg, bronze: C.orange };
const DOTS = [C.red, C.yellow, C.leaf]; // window buttons

// ---------------------------------------------------------------------------
// the hero: `turtlefetch`, a neofetch-style screen with the turtle as the logo

export function hero(live: Live) {
	const W = 860, size = 15, adv = size * ADV, LH = 22;
	const BAR = 34;
	const win = { x: 10, y: 6, w: 840, h: 0 };
	const x0 = win.x + 26;
	const y0 = win.y + BAR + 32;
	const row = (r: number) => y0 + r * LH;
	const cell = (r: number) => row(r) - 16;

	const info = data.turtlefetch.map(([k, v]) => [k, typeof v === 'function' ? v(live) : v] as const);
	const rInfo = 4, rSwatch = rInfo + info.length + 1, rPrompt = rSwatch + 2, rCursor = rPrompt + 1;
	win.h = row(rCursor) + 18 - win.y;
	const H = win.y + win.h + 16;

	const p = data.prompt;
	const promptTime = live.time.replace(' ', ''); // the zsh theme writes 3:14PM
	const turtleIs = live.asleep ? 'a sleeping pixel turtle' : 'a pixel turtle';
	const cv = new Canvas(W, H, `A terminal running turtlefetch: ${turtleIs} next to ${info.map(([k, v]) => `${k}: ${v}`).join('; ')}`);

	// timeline (seconds)
	const cmd = 'turtlefetch';
	const T = { type: 0.5, perChar: 0.08 };
	const enter = T.type + len(cmd) * T.perChar + 0.25;
	const at = (i: number) => `${num(enter + 0.06 + i * 0.05)}s`;

	// prompt: green " user@host " pill (the zsh theme's SSH look), path, git branch, time
	const promptLine = (r: number, delay?: string) => {
		const y = row(r);
		const pill = ` ${p.user}@${p.host} `;
		let col = len(pill) + 1;
		let s = `<rect x="${x0}" y="${cell(r)}" width="${num(len(pill) * adv)}" height="${LH}" fill="${C.green}"/>`;
		s += cv.text(pill, x0, y, { size, font: 'b', fill: C.black });
		for (const [t, fill] of [[p.path, C.white], [' (', C.dim], [p.branch, C.cyan], [')', C.dim], [' ' + promptTime, C.dim]] as const) {
			s += cv.text(t, x0 + col * adv, y, { size, font: 'b', fill });
			col += len(t);
		}
		return delay ? `<g class="ln" style="animation-delay:${delay}">${s}</g>` : s;
	};

	let body = '';

	// window
	const defs = `<clipPath id="win"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="12"/></clipPath>` +
		`<filter id="shadow" x="-5%" y="-5%" width="110%" height="120%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".3"/></filter>`;
	// the shadow gets its own rect so the filter can't shift the window's colors
	body += `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="12" fill="${C.bg}" filter="url(#shadow)"/>`;
	body += `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="12" fill="${C.bg}"/>`;
	body += `<g clip-path="url(#win)">`;
	body += `<rect x="${win.x}" y="${win.y}" width="${win.w}" height="${BAR}" fill="${C.bar}"/>`;
	body += `<rect x="${win.x}" y="${win.y + BAR}" width="${win.w}" height="1" fill="${C.edge}"/>`;
	DOTS.forEach((fill, i) => {
		body += `<circle cx="${win.x + 22 + i * 20}" cy="${win.y + BAR / 2}" r="6" fill="${fill}"/>`;
	});
	const title = `${p.user}@${p.host}: ${p.path}`;
	body += cv.text(title, W / 2 - (len(title) * 13 * ADV) / 2, win.y + 22, { size: 13, font: 'b', fill: C.dim });
	body += `</g>`;
	body += `<rect x="${win.x + 0.5}" y="${win.y + 0.5}" width="${win.w - 1}" height="${win.h - 1}" rx="11.5" fill="none" stroke="${C.edge}"/>`;

	// the command, typed out
	body += promptLine(0);
	body += cv.text(cmd, x0, row(1), { size });
	const typed = num(len(cmd) * adv);
	body += `<rect class="type" x="${x0}" y="${cell(1)}" width="${num(typed + 1)}" height="${LH}" fill="${C.bg}"/>`;
	body += `<rect class="c1" x="${x0}" y="${cell(1)}" width="${num(adv)}" height="${LH}" fill="${C.fg}"/>`;

	// logo: hops in and blinks, or naps through the night
	const sprite = turtle({ blink: live.asleep });
	const S = 8;
	const blockTop = cell(2), blockBottom = cell(rInfo + info.length);
	const tx = x0 + 6, ty = Math.round((blockTop + blockBottom) / 2 - (sprite.length * S) / 2) - 4;
	body += `<g class="ln" style="animation-delay:${at(0)}">`;
	body += `<g class="${live.asleep ? '' : 'hop'}" style="animation-delay:${at(0)}" shape-rendering="crispEdges">`;
	body += pixels(sprite, { scale: S, x: tx, y: ty });
	if (!live.asleep) body += `<path class="lid" fill="${PAL.k}" d="M${tx + 26 * S} ${ty + 6 * S}h${2 * S}v${S}h${-2 * S}z"/>`;
	body += `</g>`;
	if (live.asleep) {
		;[[0, 14], [13, 17], [28, 20]].forEach(([dx, zs], i) => {
			const z = cv.text('z', tx + 30 * S + dx!, ty + 4 * S - i * 19, { size: zs, font: 'b', fill: C.cyan });
			body += `<g class="z" style="animation-delay:${num(enter + i * 1.1)}s">${z}</g>`;
		});
	}
	body += `</g>`;

	// info
	const ix = tx + sprite[0]!.length * S + 34;
	const keyW = Math.max(...info.map(([k]) => len(k))) + 2;
	body += `<g class="ln" style="animation-delay:${at(0)}">` +
		cv.text(p.user, ix, row(2), { size, font: 'b', fill: C.green }) +
		cv.text('@', ix + len(p.user) * adv, row(2), { size }) +
		cv.text(p.host, ix + (len(p.user) + 1) * adv, row(2), { size, font: 'b', fill: C.green }) + `</g>`;
	body += cv.text('-'.repeat(len(p.user) + 1 + len(p.host)), ix, row(3), { size, cls: 'ln', delay: at(1) });
	info.forEach(([k, v], i) => {
		const y = row(rInfo + i);
		const line = cv.text(`${k}:`, ix, y, { size, font: 'b', fill: C.green }) + cv.text(v, ix + keyW * adv, y, { size });
		body += `<g class="ln" style="animation-delay:${at(i + 2)}">${line}</g>`;
	});

	// color swatches
	SWATCHES.forEach((fill, i) => {
		body += `<rect class="ln" style="animation-delay:${at(info.length + 3 + i * 0.3)}" x="${num(ix + i * 2 * adv)}" y="${cell(rSwatch) + 2}" width="${num(2 * adv)}" height="${LH - 4}" fill="${fill}"/>`;
	});

	// back to the prompt
	const done = at(info.length + 9);
	body += promptLine(rPrompt, done);
	body += `<rect class="c2" style="animation-delay:${done}, ${done}" x="${x0}" y="${cell(rCursor)}" width="${num(adv)}" height="${LH}" fill="${C.fg}"/>`;

	const css = `
		.type { transform: translateX(${typed}px); animation: type ${num(len(cmd) * T.perChar)}s steps(${len(cmd)}, end) ${T.type}s both }
		.c1 { opacity: 0; transform: translateX(${typed}px); animation: type ${num(len(cmd) * T.perChar)}s steps(${len(cmd)}, end) ${T.type}s both, hold ${num(enter)}s }
		@keyframes type { from { transform: translateX(0) } }
		@keyframes hold { from, to { opacity: 1 } }
		.ln { animation: show .01s step-end both }
		@keyframes show { from { opacity: 0 } }
		.hop { animation: hop .4s cubic-bezier(.3, 1.6, .5, 1) both }
		@keyframes hop { from { transform: translateY(14px) } }
		.lid { opacity: 0; animation: lid 4.5s steps(1, end) 3s infinite }
		@keyframes lid { 0% { opacity: 1 } 4% { opacity: 0 } }
		.z { animation: z 3.3s ease-in-out infinite both }
		@keyframes z { 0% { opacity: 0; transform: translate(-5px, 7px) } 25%, 65% { opacity: 1 } 100% { opacity: 0; transform: translate(5px, -7px) } }
		.c2 { animation: show .01s step-end both, blink 1.1s steps(1, end) infinite }
		@keyframes blink { 50% { opacity: 0 } }
		${REDUCED_MOTION}`;
	return cv.svg(body, { defs, css });
}

// ---------------------------------------------------------------------------
// section headers: a one-line prompt

type Header = { cmd: string; args?: string; comment?: string; };

export const sections = {
	games: { cmd: 'ls', args: '~/games', comment: `${data.itchGames} shipped, mostly at game jams` },
	projects: { cmd: 'ls', args: '~/projects', comment: "tools that didn't exist yet" },
	links: { cmd: 'exit', comment: 'come say hi' },
} satisfies Record<string, Header>;

export function header(h: Header) {
	const W = 860, H = 56, size = 17, adv = size * ADV;
	const parts: [string, ('r' | 'b' | 'i')?, string?][] = [['$', 'b', C.green], [' '], [h.cmd, 'b', C.white]];
	if (h.args) parts.push([' '], [h.args, 'r', C.cyan]);
	if (h.comment) parts.push(['  '], [`# ${h.comment}`, 'i', C.dim]);
	const cv = new Canvas(W, H, `$ ${h.cmd}${h.args ? ' ' + h.args : ''}${h.comment ? '  # ' + h.comment : ''}`);
	let body = `<rect x="10" y="6" width="840" height="42" rx="10" fill="${C.bg}"/>`;
	body += `<rect x="10.5" y="6.5" width="839" height="41" rx="9.5" fill="none" stroke="${C.edge}"/>`;
	let col = 0;
	for (const [t, font = 'r', fill = C.fg] of parts) {
		body += cv.text(t, 30 + col * adv, 33, { size, font, fill });
		col += len(t);
	}
	return cv.svg(body);
}

// ---------------------------------------------------------------------------
// game cards: cover art + where it was made + how it placed

export async function gameCard(g: Game) {
	const W = 420, CH = 333, BAR = 58, H = CH + BAR;
	const cv = new Canvas(W, H, `${g.name}: ${g.event}${g.place ? `, ${g.place}` : ''}`);
	const img = await dataUri(join(SRC, 'images/games', `${g.id}.webp`), 630, 500);
	let body = `<g clip-path="url(#card)">`;
	body += `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
	body += `<image href="${img}" width="${W}" height="${CH}" preserveAspectRatio="xMidYMid slice"/>`;
	body += cv.text(g.event, 18, CH + 37, { size: 21, font: 'b', fill: C.fg });
	if (g.place && g.tier) {
		const cs = 19, cw = len(g.place) * cs * ADV + 22, cx = W - 14 - cw;
		body += `<rect x="${num(cx)}" y="${CH + 13}" width="${num(cw)}" height="32" rx="7" fill="${TIER[g.tier]}"/>`;
		body += cv.text(g.place, cx + 11, CH + 35, { size: cs, font: 'b', fill: C.black });
	}
	body += `</g>`;
	body += `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="none" stroke="${C.edge}"/>`;
	return cv.svg(body, { defs: `<clipPath id="card"><rect width="${W}" height="${H}" rx="12"/></clipPath>` });
}

// ---------------------------------------------------------------------------
// project cards: a little app window with a screenshot (or pixel art)

const chipOf = (p: Project, live: Live): [string, string] => {
	if (!('stars' in p.chip)) return [p.chip[0], C[p.chip[1]]];
	const n = live.stars[p.chip.stars]!;
	return [`${n} star${n === 1 ? '' : 's'}`, C.yellow];
};

export async function projectCard(p: Project, live: Live) {
	const W = 800, BAR = 60, IH = 450, CAP = 60, H = BAR + IH + CAP;
	const name = p.name ?? p.id;
	const [chip, chipFill] = chipOf(p, live);
	const cv = new Canvas(W, H, `${name}: ${p.blurb} (${chip})`);
	let defs = `<clipPath id="card"><rect width="${W}" height="${H}" rx="14"/></clipPath>`;
	let body = `<g clip-path="url(#card)">`;
	body += `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
	body += `<rect width="${W}" height="${BAR}" fill="${C.bar}"/>`;
	DOTS.forEach((fill, i) => {
		body += `<circle cx="${30 + i * 26}" cy="${BAR / 2}" r="8" fill="${fill}"/>`;
	});
	body += cv.text(name, 112, 39, { size: 25, font: 'b', fill: C.white });
	const cs = 21, cw = len(chip) * cs * ADV + 26, cx = W - 18 - cw;
	body += `<rect x="${num(cx)}" y="13" width="${num(cw)}" height="34" rx="8" fill="${chipFill}"/>`;
	body += cv.text(chip, cx + 13, 37, { size: cs, font: 'b', fill: C.black });
	if (p.art) {
		const sprite = { phone, editor }[p.art]();
		const S = 9, sw = sprite[0]!.length * S, sh = sprite.length * S;
		defs += `<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="9" y="9" width="2" height="2" fill="${C.edge}"/></pattern>`;
		body += `<rect y="${BAR}" width="${W}" height="${IH}" fill="url(#dots)"/>`;
		body += `<g shape-rendering="crispEdges">${pixels(sprite, { scale: S, x: Math.round((W - sw) / 2), y: BAR + Math.round((IH - sh) / 2), pal: ART })}</g>`;
	} else {
		const img = await dataUri(join(SRC, 'images/projects', `${p.id}.webp`), 960, 540, { fit: p.fit, crop: p.crop });
		body += `<image href="${img}" y="${BAR}" width="${W}" height="${IH}" preserveAspectRatio="xMidYMid slice"/>`;
	}
	body += cv.text('>', 26, BAR + IH + 39, { size: 24, font: 'b', fill: C.green });
	body += cv.text(p.blurb, 26 + 2 * 24 * ADV, BAR + IH + 39, { size: 24, fill: C.fg });
	body += `</g>`;
	body += `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="13.5" fill="none" stroke="${C.edge}"/>`;
	return cv.svg(body, { defs });
}

// ---------------------------------------------------------------------------
// link buttons, all as wide as the longest label

export function button(label: string) {
	const size = 17, adv = size * ADV, H = 48;
	const width = Math.round((Math.max(...data.links.map(len)) + 2) * adv + 56);
	const cv = new Canvas(width, H, label);
	let body = `<rect x="3" y="3" width="${width - 6}" height="${H - 6}" rx="10" fill="${C.bg}"/>`;
	body += `<rect x="3.5" y="3.5" width="${width - 7}" height="${H - 7}" rx="9.5" fill="none" stroke="${C.edge}"/>`;
	const x = width / 2 - ((len(label) + 2) * adv) / 2;
	body += cv.text('>', x, 30, { size, font: 'b', fill: C.green });
	body += cv.text(label, x + 2 * adv, 30, { size, font: 'b', fill: C.white });
	return cv.svg(body);
}

// ---------------------------------------------------------------------------
// footer: the turtle wandering past

export function walker() {
	const W = 860, H = 64, S = 3;
	const cv = new Canvas(W, H, 'A pixel turtle wandering by');
	const ground = 58;
	const ty = ground - 16 * S;
	let body = `<rect x="0" y="${ground}" width="${W}" height="2" fill="${C.dim}" opacity=".35"/>`;
	body += `<g class="walk" shape-rendering="crispEdges">`;
	body += `<g class="fa">${pixels(turtle({ pose: 'a' }), { scale: S, y: ty })}</g>`;
	body += `<g class="fb">${pixels(turtle({ pose: 'b' }), { scale: S, y: ty })}</g>`;
	body += `</g>`;
	const css = `
		.walk { transform: translateX(${W / 2 - 48}px); animation: stroll 30s linear infinite }
		@keyframes stroll { from { transform: translateX(-110px) } to { transform: translateX(${W + 10}px) } }
		.fa { animation: fa .5s steps(1, end) infinite }
		.fb { opacity: 0; animation: fb .5s steps(1, end) infinite }
		@keyframes fa { 50% { opacity: 0 } }
		@keyframes fb { 50% { opacity: 1 } }
		${REDUCED_MOTION}`;
	return cv.svg(body, { css });
}
