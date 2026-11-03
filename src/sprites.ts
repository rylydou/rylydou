// Pixel art for the profile, drawn in code so it stays easy to tweak.
// Shapes get painted into a grid of palette keys, then an outline is
// traced around everything that was filled.

export type Sprite = string[];
type Grid = string[][];
type Palette = Record<string, string>;

// Zughy 32 colors (same palette as Turtle Theme), plus a near-black outline.
export const PAL: Palette = {
	o: '#141013', // outline
	h: '#b6d53c', // shell highlight
	g: '#71aa34', // shell
	d: '#397b44', // shell seams
	y: '#f4b41b', // rim
	Y: '#f47e1b', // rim shade
	k: '#eea160', // skin
	K: '#bf7958', // skin shade
	w: '#ffffff', // eye shine
	p: '#141013', // pupil
	c: '#cd6093', // blush
};

// Colors for the project illustrations.
export const ART: Palette = {
	o: '#141013', // outline
	b: '#564064', // phone body
	B: '#8e478c', // phone body highlight
	s: '#242022', // screen / code background
	f: '#3d3739', // window frame
	t: '#7d7071', // gray (title bar, text lines)
	l: '#cfc6b8', // light (d-pad, page)
	L: '#a0938e', // light shade
	a: '#b6d53c', // green
	r: '#e6482e', // red
	x: '#28ccdf', // cyan
	y: '#f4b41b', // yellow
	p: '#cd6093', // pink
	v: '#3978a8', // sky
	g: '#71aa34', // grass
};

const makeGrid = (w: number, h: number): Grid => Array.from({ length: h }, () => Array<string>(w).fill('.'));

function rect(grid: Grid, x0: number, y0: number, x1: number, y1: number, key: string) {
	for (let y = y0; y <= y1; y++)
		for (let x = x0; x <= x1; x++)
			if (grid[y] && x >= 0 && x < grid[y].length) grid[y][x] = key;
}

function set(grid: Grid, points: [number, number][], key: string) {
	for (const [x, y] of points) if (grid[y] && x >= 0 && x < grid[y].length) grid[y][x] = key;
}

/** Every empty cell touching a filled one (up/down/left/right) becomes outline. */
function outline(grid: Grid): Grid {
	const out = grid.map(row => row.slice());
	grid.forEach((row, y) => row.forEach((v, x) => {
		if (v !== '.') return;
		const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
			const n = grid[y + dy!]?.[x + dx!];
			return n && n !== '.';
		});
		if (touches) out[y]![x] = 'o';
	}));
	return out;
}

const toSprite = (grid: Grid): Sprite => grid.map(r => r.join(''));

/**
 * The turtle, facing right. 32x18 cells.
 * pose: 'a' | 'b' (walk frames), blink: eyes closed.
 */
export function turtle({ pose = 'a', blink = false }: { pose?: 'a' | 'b'; blink?: boolean; } = {}) {
	const W = 32, H = 18;
	const gr = makeGrid(W, H);

	// tail
	set(gr, [[2, 11], [3, 11], [3, 10], [1, 12], [2, 12]], 'k');

	// legs (drawn first so the rim overlaps them)
	const back = pose === 'a' ? 5 : 6;
	const front = pose === 'a' ? 18 : 17;
	for (const lx of [back, front]) {
		rect(gr, lx, 12, lx + 3, 13, 'k');
		rect(gr, lx, 14, lx + 3, 14, 'K');
	}

	// neck + head
	rect(gr, 22, 8, 25, 11, 'k');
	rect(gr, 24, 5, 29, 10, 'k');
	set(gr, [[24, 5], [29, 5], [29, 10]], '.'); // round the corners
	rect(gr, 24, 10, 28, 10, 'K'); // chin shade
	rect(gr, 22, 11, 23, 11, 'K');

	// shell dome: top half of an ellipse
	const cx = 13.5, cy = 11.5, rx = 11, ry = 10;
	for (let y = 2; y <= 10; y++)
		for (let x = 0; x < W; x++) {
			const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
			if (dx * dx + dy * dy <= 1) gr[y]![x] = 'g';
		}

	// seams: top (vertebral) scutes, then side (costal) scutes
	set(gr, [
		[5, 6], [6, 6], [7, 5], [8, 5], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4],
		[14, 4], [15, 4], [16, 4], [17, 4], [18, 4], [19, 5], [20, 5], [21, 6], [22, 6],
		[13, 2], [13, 3], // between the top scutes
		[9, 5], [9, 6], [9, 7], [9, 8], [9, 9], // side scute seams
		[18, 5], [18, 6], [18, 7], [18, 8], [18, 9],
	], 'd');

	// highlights on the top-left of each scute
	set(gr, [
		[9, 2], [10, 2], [11, 2], [8, 3], [9, 3], [10, 3],
		[14, 2], [15, 2], [14, 3],
		[6, 5], [5, 7], [4, 8],
		[10, 5], [11, 5], [10, 6],
		[19, 6], [20, 6], [19, 7],
	], 'h');

	// rim, with little notches between the marginal scutes
	rect(gr, 2, 10, 25, 10, 'y');
	rect(gr, 3, 11, 24, 11, 'Y');
	set(gr, [[6, 10], [10, 10], [14, 10], [18, 10], [22, 10]], 'Y');

	// face
	if (blink) {
		set(gr, [[26, 7], [27, 7]], 'p');
	} else {
		set(gr, [[26, 6], [27, 6], [26, 7], [27, 7]], 'p');
		set(gr, [[26, 6]], 'w');
	}
	set(gr, [[28, 8]], 'c');

	return toSprite(outline(gr));
}

/** A phone running a gamepad, with a signal icon (for Godot Remote). 44x30 cells. */
export function phone() {
	const W = 44, H = 30;
	const gr = makeGrid(W, H);

	// body, screen, camera
	rect(gr, 3, 10, 40, 27, 'b');
	rect(gr, 4, 10, 39, 10, 'B');
	set(gr, [[3, 10], [40, 10], [3, 27], [40, 27]], '.');
	rect(gr, 6, 11, 37, 26, 's');
	rect(gr, 4, 18, 4, 19, 's');

	// d-pad
	rect(gr, 11, 15, 12, 22, 'l');
	rect(gr, 8, 18, 15, 19, 'l');

	// face buttons
	rect(gr, 31, 15, 32, 16, 'y');
	rect(gr, 31, 21, 32, 22, 'a');
	rect(gr, 28, 18, 29, 19, 'x');
	rect(gr, 34, 18, 35, 19, 'r');

	// start / select
	rect(gr, 19, 22, 20, 22, 't');
	rect(gr, 23, 22, 24, 22, 't');

	// signal: a dot and two arcs, painted after the outline so they stay thin
	const out = outline(gr);
	rect(out, 21, 6, 22, 7, 'x');
	for (let y = 0; y < 6; y++)
		for (let x = 0; x < W; x++) {
			const dx = x + 0.5 - 22, dy = 8 - (y + 0.5);
			const d = Math.hypot(dx, dy), angle = (Math.atan2(dy, dx) * 180) / Math.PI;
			if (angle > 35 && angle < 145 && [3.6, 6.4].some(r => Math.abs(d - r) < 0.6)) out[y]![x] = 'x';
		}
	return toSprite(out);
}

/** A code editor with a live preview and two people's cursors (for the IDE). 52x30 cells. */
export function editor() {
	const W = 52, H = 30;
	const gr = makeGrid(W, H);

	// window: title bar, code pane, preview pane
	rect(gr, 0, 0, 51, 29, 'f');
	rect(gr, 0, 0, 51, 2, 't');
	set(gr, [[2, 1]], 'r');
	set(gr, [[4, 1]], 'y');
	set(gr, [[6, 1]], 'a');
	rect(gr, 1, 3, 25, 28, 's');
	rect(gr, 27, 3, 50, 28, 'l');

	// code, one line per row: [indent, [length, color] for each token]
	const code: [number, [number, string][]][] = [
		[0, [[4, 'p'], [6, 'l'], [5, 'p']]],
		[0, [[4, 'p'], [4, 'x'], [7, 'y'], [1, 'p']]],
		[0, [[3, 'p']]],
		[2, [[10, 'l']]],
		[2, [[7, 'l'], [2, 'p'], [4, 'l']]],
		[0, [[4, 'p']]],
		[0, []],
		[0, [[6, 'x'], [2, 'l']]],
		[2, [[6, 'x'], [5, 'y']]],
		[2, [[4, 'x'], [8, 'y']]],
		[0, [[1, 'l']]],
	];
	code.forEach(([indent, segs], i) => {
		let x = 3 + indent;
		for (const [n, color] of segs) {
			rect(gr, x, 5 + i * 2, x + n - 1, 5 + i * 2, color);
			x += n + 1;
		}
	});

	// two people editing at once: a cursor and a little name flag each
	rect(gr, 15, 10, 15, 12, 'x');
	rect(gr, 15, 8, 18, 9, 'x');
	rect(gr, 17, 20, 17, 22, 'p');
	rect(gr, 17, 18, 20, 19, 'p');

	// preview: a heading, some text, a picture
	rect(gr, 29, 5, 42, 6, 's');
	rect(gr, 29, 9, 47, 9, 'L');
	rect(gr, 29, 11, 45, 11, 'L');
	rect(gr, 29, 13, 40, 13, 'L');
	rect(gr, 29, 16, 48, 26, 'v');
	rect(gr, 44, 18, 45, 19, 'y');
	for (let x = 29; x <= 48; x++) {
		const top = Math.round(23 - 2.5 * Math.sin((x - 27) / 4));
		rect(gr, x, top, x, 26, 'g');
	}

	return toSprite(outline(gr));
}

/**
 * Renders a sprite as SVG paths, one per color. Horizontal runs of the same
 * color are merged so the output stays small.
 */
export function pixels(rows: Sprite, { scale = 1, x = 0, y = 0, pal = PAL }: { scale?: number; x?: number; y?: number; pal?: Palette; } = {}) {
	const byColor = new Map<string, string[]>();
	rows.forEach((row, ry) => {
		let start = 0;
		for (let rx = 1; rx <= row.length; rx++) {
			if (rx < row.length && row[rx] === row[start]) continue;
			const key = row[start]!;
			if (key !== '.') {
				const fill = pal[key];
				if (!fill) throw new Error(`no color for "${key}"`);
				if (!byColor.has(fill)) byColor.set(fill, []);
				byColor.get(fill)!.push(`M${x + start * scale} ${y + ry * scale}h${(rx - start) * scale}v${scale}h${-(rx - start) * scale}z`);
			}
			start = rx;
		}
	});
	return [...byColor].map(([fill, d]) => `<path fill="${fill}" d="${d.join('')}"/>`).join('');
}
