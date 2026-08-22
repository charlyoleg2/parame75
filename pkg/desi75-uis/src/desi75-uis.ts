#!/usr/bin/env node
// desi75-uis.ts

import { feli_cli } from 'feli';
import process from 'node:process';
import path from 'node:path';

const scrDir = import.meta.dirname;
const defaultPublicDir = path.join(scrDir, 'public');

//console.log('desi75-uis says Hello!');
try {
	await feli_cli(defaultPublicDir, process.argv);
} catch (err) {
	console.error(`Error from feli: ${err}`);
}
//console.log('desi75-uis says Bye!');
