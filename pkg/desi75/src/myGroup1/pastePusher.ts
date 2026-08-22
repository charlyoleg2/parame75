// pastePusher.ts
// a tool to empty your toothpaste tube

// step-1 : import from geometrix
import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'pastePusher',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 40, 1, 500, 1),
		pNumber('L2', 'mm', 6, 1, 50, 1),
		pNumber('L3', 'mm', 3, 0, 50, 1),
		pNumber('W1', 'mm', 8, 1, 50, 1),
		pNumber('H1a', 'mm', 3, 0, 50, 0.5),
		pNumber('H1b', 'mm', 3, 0, 50, 0.5),
		pNumber('H1c', 'mm', 4, 0, 50, 0.1),
		pNumber('H1d', 'mm', 4.1, 0, 50, 0.1),
		pNumber('T3', 'mm', 2, 0.1, 20, 0.1),
		pNumber('E2', 'mm', 1, 0, 20, 0.1),
		pSectionSeparator('Guide'),
		pNumber('L12', 'mm', 1, 0, 10, 0.1),
		pNumber('W2', 'mm', 6, 1, 50, 1),
		pNumber('H2d', 'mm', 5, 0, 50, 0.1),
		pNumber('Ri', 'mm', 1, 0, 20, 0.1),
		pNumber('Re', 'mm', 2, 0, 20, 0.1)
	],
	paramSvg: {
		L1: 'pastePusher_face.svg',
		L2: 'pastePusher_face.svg',
		L3: 'pastePusher_face.svg',
		W1: 'pastePusher_profile_mid.svg',
		H1a: 'pastePusher_profile_mid.svg',
		H1b: 'pastePusher_profile_mid.svg',
		H1c: 'pastePusher_profile_mid.svg',
		H1d: 'pastePusher_profile_side.svg',
		T3: 'pastePusher_face.svg',
		E2: 'pastePusher_profile_side.svg',
		L12: 'pastePusher_face.svg',
		W2: 'pastePusher_profile_side.svg',
		H2d: 'pastePusher_profile_side.svg',
		Ri: 'pastePusher_profile_side.svg',
		Re: 'pastePusher_profile_side.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figFace = figure();
	const figMid = figure();
	const figSide = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const H1 = param.H1a + param.H1b + param.H1c;
		const H2 = param.H1a + param.H1b + param.H1d;
		const L2b = param.L2 + param.L12;
		const Lbody = param.L1 + 2 * L2b;
		const R3 = param.H1b + param.H1d + param.E2 / 2;
		const R3i = R3 - param.T3;
		const Ltot = R3 + param.L3 + Lbody;
		// step-5 : checks on the parameter values
		if (param.H1b < param.T3) {
			throw `err096: H1b ${param.H1b} is too small compare to T3 ${param.T3}`;
		}
		if (param.Re < param.Ri) {
			throw `err099: Re ${param.Re} is too small compare to Ri ${param.Ri}`;
		}
		// step-6 : any logs
		rGeome.logstr += `H1 ${ffix(H1)}  H2 ${ffix(H2)} mm\n`;
		rGeome.logstr += `Ltotal ${ffix(Ltot)} mm\n`;
		// step-7 : drawing of the figures
		// figFace
		function ctrBodyFace(iK: number, iY: number): tContour {
			const rCtr = contour(R3 + param.L3, iY)
				.addSegStrokeR(Lbody, 0)
				.addSegStrokeR(0, iK * H2)
				.addSegStrokeR(-L2b, 0)
				.addSegStrokeR(0, iK * (-H2 + H1))
				.addSegStrokeR(-param.L1, 0)
				.addSegStrokeR(0, iK * (-H1 + H2))
				.addSegStrokeR(-L2b, 0)
				.closeSegStroke();
			return rCtr;
		}
		figFace.addSecond(ctrBodyFace(1, 0));
		figFace.addSecond(ctrBodyFace(-1, 2 * H2 + param.E2));
		figFace.addSecond(ctrRectangle(R3 + param.L3, param.H1a, Lbody, param.H1b));
		figFace.addSecond(ctrRectangle(R3 + param.L3, H2 + param.E2 + param.H1d, Lbody, param.H1b));
		const ctrSpring = contour(R3 + param.L3, param.H1a)
			.addSegStrokeR(0, param.T3)
			.addSegStrokeR(-param.L3, 0)
			.addPointR(-R3i, R3i)
			.addPointR(0, 2 * R3i)
			.addSegArc2()
			.addSegStrokeR(param.L3, 0)
			.addSegStrokeR(0, param.T3)
			.addSegStrokeR(-param.L3, 0)
			.addPointR(-R3, -R3)
			.addPointR(0, -2 * R3)
			.addSegArc2()
			.closeSegStroke();
		figFace.addMainO(ctrSpring);
		// figMid
		// figSide
		// figSideL12
		// final figure list
		rGeome.fig = {
			faceFace: figFace,
			faceMid: figMid,
			faceSide: figSide
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_bottom`,
					face: `${designName}_faceBottom`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: H2,
					rotate: [0, 0, 0],
					translate: [0, 0, param.H2]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_bottom`, `subpax_${designName}_top`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'pastePusher drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const pastePusherDef: tPageDef = {
	pTitle: 'pastePusher',
	pDescription: 'a tool to empty your toothpaste tube',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { pastePusherDef };
