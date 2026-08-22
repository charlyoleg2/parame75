#!/usr/bin/env node
// desi75-cli.ts

import { geom_cli } from 'geomcli';
import packag from '../package.json' with { type: 'json' };
import { designList } from './designList.ts';

//console.log('desi75-cli says hello');
await geom_cli(process.argv, designList, packag, 'output');
//console.log('desi75-cli says bye');
