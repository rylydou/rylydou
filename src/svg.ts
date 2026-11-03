// Shared drawing helpers: the palette, text as glyph outlines, embedded images.
//
// GitHub shows SVGs through <img>, which can't load fonts or other files, so
// every SVG here is self-contained: text is converted to glyph outlines and
// images are embedded as data URIs.

import { join } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

export const SRC = import.meta.dir;

// Zughy 32 colors, same as Turtle Theme.
export const C = {
	bg: '#242022',
	bar: '#302c2e',
	edge: '#3d3739',
	fg: '#cfc6b8',
	white: '#ffffff',
	dim: '#7d7071',
	black: '#141013',
	green: '#b6d53c',
	leaf: '#71aa34',
	cyan: '#28ccdf',
	yellow: '#f4b41b',
	orange: '#f47e1b',
	red: '#e6482e',
	pink: '#cd6093',
};
export type Color = keyof typeof C;

export const SWATCHES = [
	'#472d3c', '#a93b3b', '#e6482e', '#f47e1b', '#f4b41b', '#b6d53c', '#71aa34', '#397b44',
	'#3c5956', '#28ccdf', '#3978a8', '#394778', '#564064', '#8e478c', '#cd6093', '#ffaeb6',
];

const loadFont = async (file: string) => opentype.parse(await Bun.file(join(SRC, 'fonts', file)).arrayBuffer());
const FONTS = {
	r: await loadFont('JetBrainsMono-Regular.ttf'),
	b: await loadFont('JetBrainsMono-Bold.ttf'),
	i: await loadFont('JetBrainsMono-Italic.ttf'),
};
type FontStyle = keyof typeof FONTS;
export const ADV = 0.6; // JetBrains Mono glyphs are 600/1000 em wide

export const num = (n: number) => +n.toFixed(2);
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const len = (s: string) => [...s].length;
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce) { * { animation: none !important } }';

type TextOptions = { size?: number; font?: FontStyle; fill?: string; cls?: string; delay?: string; };

export class Canvas {
	private glyphs = new Map<string, string>();

	constructor(readonly w: number, readonly h: number, readonly label: string) { }

	/** Defines a glyph once and returns its id (null for glyphs with no ink). */
	private glyph(font: FontStyle, size: number, ch: string) {
		const id = `${font}${size}-${ch.codePointAt(0)!.toString(36)}`;
		if (!this.glyphs.has(id)) {
			const g = FONTS[font].charToGlyph(ch);
			if (!g.index) throw new Error(`"${ch}" isn't in the font`);
			this.glyphs.set(id, g.getPath(0, 0, size).toPathData(2));
		}
		return this.glyphs.get(id) ? id : null;
	}

	/** Monospace text with its baseline starting at (x, y). */
	text(str: string, x: number, y: number, { size = 15, font = 'r', fill = C.fg, cls = '', delay }: TextOptions = {}) {
		const adv = size * ADV;
		let uses = ''
			;[...str].forEach((ch, i) => {
				if (ch === ' ') return;
				const id = this.glyph(font, size, ch);
				if (id) uses += `<use href="#${id}" x="${num(i * adv)}"/>`;
			});
		const attrs = (cls ? ` class="${cls}"` : '') + (delay ? ` style="animation-delay:${delay}"` : '');
		return `<g fill="${fill}" transform="translate(${num(x)} ${num(y)})"${attrs}>${uses}</g>`;
	}

	svg(body: string, { defs = '', css = '' } = {}) {
		const glyphs = [...this.glyphs].filter(([, d]) => d).map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
		return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(this.label)}">` +
			`<title>${esc(this.label)}</title>` +
			(css ? `<style>${css.replace(/\s*\n\s*/g, '')}</style>` : '') +
			`<defs>${glyphs}${defs}</defs>${body}</svg>\n`;
	}
}

export type ImageOptions = {
	fit?: 'cover' | 'contain';
	bg?: string;
	/** [left, top, width, height] to cut out before resizing */
	crop?: [number, number, number, number];
};

const images = new Map<string, Promise<string>>();

/**
 * An image file, resized and embedded as an AVIF data URI. Encoding AVIF is
 * slow (around a second), so each result is kept until the server restarts.
 */
export function dataUri(file: string, w: number, h: number, { fit = 'cover', bg = C.bg, crop }: ImageOptions = {}) {
	const key = JSON.stringify([file, w, h, fit, bg, crop]);
	if (!images.has(key)) {
		const encode = async () => {
			let img = sharp(await Bun.file(file).bytes());
			if (crop) img = img.extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] });
			const buf = await img.resize(w, h, { fit, background: bg }).avif({ quality: 60 }).toBuffer();
			return `data:image/avif;base64,${buf.toString('base64')}`;
		};
		images.set(key, encode().catch(err => (images.delete(key), Promise.reject(err))));
	}
	return images.get(key)!;
}
