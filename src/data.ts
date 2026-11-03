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
	['Packages', live => `${live.repos} (github), ${itchGames} (itch)`],
	['Uptime', live => `${live.uptime} on GitHub`],
	['Shell', 'zsh on Fedora'],
	['Time', live => `${live.time}, Chicago time`],
];

/** Games on itch.io. Update this when you ship another one. */
export const itchGames = 19;

export type Game = {
	id: string; // /games/<id>.svg, drawn from src/images/games/<id>.webp
	name: string;
	event: string;
	place?: string;
	tier?: 'gold' | 'silver' | 'bronze'; // colors the placement chip
};

export const games: Game[] = [
	{
		id: 'tidal-towns',
		name: 'Tidal Towns',
		event: 'Ludum Dare 54',
		place: '#11 of ~3k',
		tier: 'bronze',
	},
	{
		id: 'process',
		name: 'Process',
		event: "Adroit Jam '25",
		place: '2nd place',
		tier: 'silver',
	},
	{
		id: 'poultry-pounders',
		name: 'Poultry Pounders',
		event: 'Made in 1 week',
	},
	{
		id: 'trix',
		name: 'Trix',
		event: "20 Second Jam '23",
	},
	{
		id: 'crater-goods',
		name: 'Crater Goods',
		event: "Tiger Hacks '25",
		place: '1st place',
		tier: 'gold',
	},
	{
		id: 'infinitape',
		name: 'Infinitape',
		event: 'Co-op roguelike',
	},
];

export type Project = {
	id: string; // /projects/<id>.svg, drawn from src/images/projects/<id>.webp unless it has art
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

/** Link buttons, at /links/<slug>.svg. They're all drawn the same width. */
export const links = ['ryly.dev', 'itch.io', 'linkedin'];
