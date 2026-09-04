// bookshelf.ts
// a low-board bookshelf

import type {
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//contour,
	//contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';

const pDef: tParamDef = {
	partName: 'bookshelf',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 120, 1, 4000, 1),
		pNumber('H1', 'mm', 100, 1, 4000, 1),
		pNumber('H2', 'mm', 200, 1, 4000, 1),
		pNumber('H3', 'mm', 200, 1, 4000, 1),
		pNumber('W1', 'mm', 200, 1, 4000, 1),
		pCheckbox('mid', true),
		pSectionSeparator('details'),
		pNumber('E1', 'mm', 20, 1, 400, 1),
		pNumber('E2', 'mm', 30, 1, 400, 1),
		pNumber('W2', 'mm', 150, 1, 4000, 1),
		pNumber('H5', 'mm', 60, 1, 400, 1),
		pNumber('W5', 'mm', 30, 1, 400, 1)
	],
	paramSvg: {
		L1: 'bookshelf_face.svg',
		H1: 'bookshelf_face2.svg',
		H2: 'bookshelf_side.svg',
		H3: 'bookshelf_top2.svg',
		W1: 'bookshelf_top2.svg',
		mid: 'bookshelf_top2.svg',
		E1: 'bookshelf_top.svg',
		E2: 'bookshelf_top.svg',
		W2: 'bookshelf_top.svg',
		H5: 'bookshelf_top.svg',
		W5: 'bookshelf_face.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFace = figure();
	const figSide = figure();
	const figTop = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Htot1 = param.H1 + param.H2 + param.H3 + 2 * param.E1;
		const Htot = Htot1 + param.E1;
		// step-5 : checks on the parameter values
		if (param.E2 > param.H1) {
			throw `err096: H1 ${param.H1} is too small compare to E2 ${param.E2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Htotal ${ffix(Htot)} mm\n`;
		// step-7 : drawing of the figures
		// figFace
		figFace.addMainO(ctrRectangle(0, Htot1, param.L1, param.E1));
		// figSide
		// figTop
		// final figure list
		rGeome.fig = {
			faceFace: figFace,
			faceSide: figSide,
			faceTop: figTop
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: 10,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_top`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'bookshelf drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const bookshelfDef: tPageDef = {
	pTitle: 'bookshelf',
	pDescription: 'A low-board bookshelf',
	pDef: pDef,
	pGeom: pGeom
};

export { bookshelfDef };
