// pastePusher.ts
// a box

// step-1 : import from geometrix
import type {
	tContour,
	tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	contourCircle,
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

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'pastePusher',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 120, 1, 400, 1),
		pNumber('L2', 'mm', 80, 1, 400, 1),
		pNumber('W1', 'mm', 2, 0.1, 10, 0.1),
		pNumber('H1', 'mm', 40, 1, 400, 1),
		pNumber('H2', 'mm', 2, 0.1, 10, 0.1),
		//pSectionSeparator(name)
		pSectionSeparator('hollow'),
		//pCheckbox(name, init)
		pCheckbox('holes', true),
		pNumber('D1', 'mm', 10, 1, 400, 1),
		pNumber('D2', 'mm', 5, 1, 400, 1),
		pSectionSeparator('corners'),
		pNumber('Rc', 'mm', 10, 0, 400, 1)
	],
	paramSvg: {
		L1: 'pastePusher_top.svg',
		L2: 'pastePusher_top.svg',
		W1: 'pastePusher_side.svg',
		H1: 'pastePusher_side.svg',
		H2: 'pastePusher_side.svg',
		holes: 'pastePusher_top.svg',
		D1: 'pastePusher_top.svg',
		D2: 'pastePusher_top.svg',
		Rc: 'pastePusher_top.svg'
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
	const figBottom = figure();
	const figTop = figure();
	const figSide = figure();
	const figFace = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const L1b = param.L1 - 2 * param.W1;
		const L2b = param.L2 - 2 * param.W1;
		const Rcb = Math.max(param.Rc - param.W1, 0);
		const H3b = param.H1 - param.H2;
		const circleDelta = ((param.D1 + param.D2) * 3) / 4;
		// step-5 : checks on the parameter values
		if (L1b < 0) {
			throw `err085: L1 ${param.L1} is too small compare to W1 ${param.W1}`;
		}
		if (L2b < 0) {
			throw `err088: L2 ${param.L2} is too small compare to W1 ${param.W1}`;
		}
		if (H3b < 0) {
			throw `err091: H1 ${param.H1} is too small compare to H2 ${param.H2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `box-base surface ${ffix(param.L1 * param.L2)} mm2\n`;
		rGeome.logstr += `box volume ${ffix(param.L1 * param.L2 * param.H1)} mm3\n`;
		// step-7 : drawing of the figures
		// figTop
		const ctrExt = contour(0, 0)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(param.L1, 0)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(param.L1, param.L2)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(0, param.L2)
			.addCornerRounded(param.Rc)
			.closeSegStroke();
		const ctrInt = ctrRectangle(param.W1, param.W1, L1b, L2b, Rcb);
		const ctrsTop: tOuterInner = [ctrExt, ctrInt];
		figTop.addMainOI(ctrsTop);
		const hole1 = contourCircle(param.L1 / 2, param.L2 / 2, param.D1 / 2);
		const hole2 = contourCircle(param.L1 / 2 + circleDelta, param.L2 / 2, param.D2 / 2);
		if (param.holes) {
			figTop.addSecond(hole1);
			figTop.addSecond(hole2);
		}
		// figBottom
		if (param.holes) {
			figBottom.addMainOI([ctrExt, hole1, hole2]);
		} else {
			figBottom.addMainO(ctrExt);
		}
		figBottom.addSecond(ctrInt);
		// figSide
		function shapeU(hLength: number): tContour {
			const rCtr = contour(0, 0)
				.addSegStrokeR(hLength, 0)
				.addSegStrokeR(0, param.H1)
				.addSegStrokeR(-param.W1, 0)
				.addSegStrokeR(0, -H3b)
				.addSegStrokeR(-hLength + 2 * param.W1, 0)
				.addSegStrokeR(0, H3b)
				.addSegStrokeR(-param.W1, 0)
				.closeSegStroke();
			return rCtr;
		}
		figSide.addMainOI([shapeU(param.L2)]);
		if (param.holes) {
			const x1 = param.L2 / 2 - param.D1 / 2;
			figSide.addSecond(ctrRectangle(x1, 0, param.D1, param.H2));
		}
		// figFace
		figFace.addMainO(shapeU(param.L1));
		if (param.holes) {
			const x1 = param.L1 / 2 - param.D1 / 2;
			figFace.addSecond(ctrRectangle(x1, 0, param.D1, param.H2));
			const x2 = param.L1 / 2 + circleDelta - param.D2 / 2;
			figFace.addSecond(ctrRectangle(x2, 0, param.D2, param.H2));
		}
		// final figure list
		rGeome.fig = {
			faceBottom: figBottom,
			faceTop: figTop,
			faceSide: figSide,
			faceFace: figFace
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
					length: H3b,
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
	pDescription: 'A box',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { pastePusherDef };
