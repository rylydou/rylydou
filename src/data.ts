// What the profile's images say. The server reads this when it starts, so
// redeploy after editing. Links, alt text, and the text-only lists live in
// README.md, next to the images they go with.

import type { Color } from './svg';
import type { Live } from './live';

export const user = 'rylydou';

export const timeZone = 'America/Chicago';
/** Between these hours (local time) the turtle in turtlefetch is asleep. */
export const sleepHours: [from: number, to: number] = [23, 7];

export const prompt = { user: 'ryly', host: 'github', path: '~/profile', branch: 'main' };

/** The `turtlefetch` output, as [key, value] lines. A value can be worked out from live stats. */
export const turtlefetch: [string, string | ((live: Live) => string)][] = [
	['Name', 'Ryly Dou, aka CiberTurtle'],
	['School', "CS @ Mizzou, class of '29"],
	['Work', 'VR + biofeedback @ Healium'],
	['Stack', 'TypeScript, SvelteKit, Godot, XR, C#'],
	['Hobbies', 'game dev, homelab, 3D printing'],
	['Plays', 'Factorio, Zelda, Spelunkey'],
	['Packages', live => `${live.repos} (github), ${games.length} (itch)`],
	['Uptime', live => `${live.uptime} on GitHub`],
	['Shell', 'zsh on Fedora'],
	['Time', live => `${live.time}, Chicago time`],
];

export type Game = {
	id: string; // itch.io slug. /games/<id>.svg, drawn from src/images/games/<id>.avif
	name: string;
	event: string; // the jam it was made for, or what kind of game it is
	place?: string;
	tier?: 'gold' | 'silver' | 'bronze'; // colors the placement chip (gray without one)
};

/**
 * Every game on itch.io, in the same order as the itch page. Any of them can
 * go in the README; the "Packages" line counts them, so add new ones here.
 */
export const games: Game[] = [
	{ id: 'tidal-towns', name: 'Tidal Towns', event: 'Ludum Dare 54', place: '#11 of ~3k', tier: 'bronze' },
	{ id: 'trix', name: 'Trix', event: "20 Second Jam '23" },
	{ id: 'threes-a-crime', name: "Three's a Crime", event: "GMTK Jam '25" },
	{ id: 'nanobots', name: 'Nanobots', event: 'Roguelike shooter' },
	{ id: 'quantum-bugs', name: 'Quantum Bugs', event: "Adroit Jam '26" },
	{ id: 'crater-goods', name: 'Crater Goods', event: "Tiger Hacks '25", place: '1st place', tier: 'gold' },
	{ id: 'process', name: 'Process', event: "Adroit Jam '25", place: '2nd place', tier: 'silver' },
	{ id: 'infinitape', name: 'Infinitape', event: 'Co-op roguelike' },
	{ id: 'ball-entanglement', name: 'Ball Entanglement', event: 'Foddian SpeedJam #2' },
	{ id: 'utterly-from-outer-space', name: 'Utterly from Outer Space', event: "GMTK Jam '23" },
	{ id: 'vines', name: 'Vines', event: 'Puzzle Jam III' },
	{ id: 'poultry-pounders', name: 'Poultry Pounders', event: 'Made in 1 week' },
	{ id: 'telecade', name: 'Telecade', event: 'Arcade prototype' },
	{ id: 'undying-torch', name: 'Undying Torch', event: 'Platformer' },
	{ id: 'the-oblets', name: 'The Oblets', event: 'MashUp Jam 2' },
	{ id: 'welcome-to-tiny-town-small-world', name: 'Welcome to Tiny Town, Small World', event: 'Blackthornprod #3', place: '#78 of ~1k' },
	{ id: 'relive', name: 'Re:Live', event: 'Puzzle platformer' },
	{ id: 'snowling', name: 'Snowling', event: 'MashUp Jam' },
	{ id: 'carry-the-fire', name: 'Carry the Fire', event: 'Platformer' },
];

export type Project = {
	id: string; // /projects/<id>.svg, drawn from src/images/projects/<id>.avif unless it has art
	name?: string; // defaults to the id
	blurb: string;
	chip: [string, Color] | { stars: string; }; // { stars: 'owner/repo' } shows its live star count
	art?: 'phone' | 'editor'; // pixel art instead of a screenshot
	fit?: 'cover' | 'contain';
	crop?: [number, number, number, number];
};

export const projects: Project[] = [
	{
		id: 'ide',
		blurb: 'The live-coding IDE I taught web dev with',
		chip: ['40+ students', 'green'],
		art: 'editor',
	},
	{
		id: 'democade',
		blurb: 'A game launcher for in-person demo events',
		chip: ['Godot', 'cyan'],
	},
	{
		id: 'sharp-icons',
		blurb: 'Crisp 16px file icons for VS Code',
		chip: ['14k+ installs', 'green'],
		fit: 'contain',
	},
	{
		id: 'turtle-theme',
		blurb: 'VS Code themes by a turtle, for turtles',
		chip: ['7k+ installs', 'green'],
	},
	{
		id: 'godot-cheatsheet',
		blurb: 'A drop-in debug console for Godot',
		chip: { stars: 'rylydou/godot-cheatsheet' },
		crop: [0, 0, 700, 394], // just the console, so the text is readable
	},
	{
		id: 'mge',
		name: 'mangrove-engine',
		blurb: 'My own 2D game engine + editor',
		chip: ['C# + OpenGL', 'cyan'],
	},
	{
		id: 'godot-remote',
		blurb: 'Use your phone as a gamepad in Godot',
		chip: ['Godot + TS', 'cyan'],
		art: 'phone',
	},
];

export type Mention = {
	name: string; // /mentions/<slug of name>.svg
	blurb: string;
};

/** Honorable mentions: small cards with no picture, listed under the games and projects. */
export const mentions: Mention[] = [
	{ name: 'infinitape', blurb: 'A top-down co-op roguelike, still in the works' },
	{ name: 'awakening', blurb: "A Link's Awakening-inspired game in Godot" },
	{ name: 'play.ryly.dev', blurb: "Ryly's Silly Game of the Week" },
	{ name: 'itch.io', blurb: `All ${games.length} of my games, jam entries and all` },
	{ name: 'wolnet', blurb: 'A Wake-on-LAN server with a web UI, CLI, and API' },
	{ name: 'world-report', blurb: 'Spatial ticketing, QA, and docs for game dev, with a REST API for Godot' },
	{ name: 'queue', blurb: "A submission queue for playing viewers' games on stream" },
	{ name: 'meml', blurb: 'The Mangrove Engine Markup Language' },
	{ name: 'sketches', blurb: 'A sketching app made in Vue' },
];

/** Link buttons, at /links/<slug>.svg. They're all drawn the same width. */
export const links = ['ryly.dev', 'itch.io', 'linkedin'];
