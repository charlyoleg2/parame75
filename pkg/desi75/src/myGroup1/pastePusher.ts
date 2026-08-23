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
		pCheckbox('secondSpring', false),
		pSectionSeparator('Guide'),
		pNumber('L12', 'mm', 1, 0, 10, 0.1),
		pNumber('W2', 'mm', 6, 1, 50, 1),
		pNumber('H2d', 'mm', 5, 0, 50, 0.1),
		pNumber('Ri', 'mm', 1, 0, 20, 0.1),
		pNumber('Re', 'mm', 1.4, 0, 20, 0.1)
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
		secondSpring: 'pastePusher_face.svg',
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
	const figSideB = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const H1 = param.H1a + param.H1b + param.H1c;
		const H2 = param.H1a + param.H1b + param.H1d;
		const L2b = param.L2 + param.L12;
		const Lbody = param.L1 + 2 * L2b;
		const R3 = param.H1b + param.H1d + param.E2 / 2;
		const R3i = R3 - param.T3;
		const LL3 = R3 + param.L3;
		const Ltot = LL3 + Lbody + param.secondSpring ? LL3 : 0;
		const W2b = (param.W1 - param.W2) / 2;
		const W24 = param.W2 / 4;
		const pi2 = Math.PI / 2;
		// step-5 : checks on the parameter values
		if (param.H1b < param.T3) {
			throw `err096: H1b ${param.H1b} is too small compare to T3 ${param.T3}`;
		}
		if (param.Re < param.Ri) {
			throw `err099: Re ${param.Re} is too small compare to Ri ${param.Ri}`;
		}
		if (W2b < 0) {
			throw `err104: W2 ${param.W2} is too large compare to W1 ${param.W1}`;
		}
		// step-6 : any logs
		rGeome.logstr += `H1 ${ffix(H1)}  H2 ${ffix(H2)} mm\n`;
		rGeome.logstr += `Ltotal ${ffix(Ltot)} mm\n`;
		// step-7 : drawing of the figures
		// figFace
		function ctrBodyFace(iK: number, iY: number): tContour {
			const rCtr = contour(LL3, iY)
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
		figFace.addSecond(ctrRectangle(LL3, param.H1a, Lbody, param.H1b));
		figFace.addSecond(ctrRectangle(LL3, H2 + param.E2 + param.H1d, Lbody, param.H1b));
		function ctrSpring(iK: number, iX: number): tContour {
			const rCtr = contour(iX, param.H1a)
				.addSegStrokeR(0, param.T3)
				.addSegStrokeR(-iK * param.L3, 0)
				.addPointR(-iK * R3i, R3i)
				.addPointR(0, 2 * R3i)
				.addSegArc2()
				.addSegStrokeR(iK * param.L3, 0)
				.addSegStrokeR(0, param.T3)
				.addSegStrokeR(-iK * param.L3, 0)
				.addPointR(-iK * R3, -R3)
				.addPointR(0, -2 * R3)
				.addSegArc2()
				.closeSegStroke();
			return rCtr;
		}
		figFace.addMainO(ctrSpring(1, LL3));
		if (param.secondSpring) {
			figFace.addMainO(ctrSpring(-1, LL3 + Lbody));
		}
		// figMid
		function ctrMid(iK: number, iY: number): tContour {
			const rCtr = contour(0, iY)
				.addPointR(param.W1 / 2, -iK * param.H1a)
				.addPointR(param.W1, 0)
				.addSegArc2()
				.addSegStrokeR(0, iK * param.H1b)
				.addPointR(-param.W1 / 2, iK * param.H1c)
				.addPointR(-param.W1, 0)
				.addSegArc2()
				.closeSegStroke();
			return rCtr;
		}
		const ctrMid1 = ctrMid(1, param.H1a);
		const ctrMid2 = ctrMid(-1, 2 * H2 + param.E2 - param.H1a);
		figMid.addMainO(ctrMid1);
		figMid.addMainO(ctrMid2);
		figMid.addSecond(ctrRectangle(0, param.H1a, param.W1, param.T3));
		const rectY2 = H2 + param.E2 + param.H1d + param.H1b - param.T3;
		figMid.addSecond(ctrRectangle(0, rectY2, param.W1, param.T3));
		// figSide
		function ctrSide(iK: number, iK2: number, iY: number, iSkip: boolean): tContour {
			const firstInE = iK * iK2 < 0;
			const RR1 = firstInE ? param.Ri : param.Re;
			const RR2 = firstInE ? param.Re : param.Ri;
			const rCtr = contour(0, iY)
				.addPointR(param.W1 / 2, -iK * param.H1a)
				.addPointR(param.W1, 0)
				.addSegArc2()
				.addSegStrokeR(0, iK * (param.H1b + param.H1d));
			if (iSkip) {
				if (firstInE) {
					rCtr.addSegStrokeR(-W2b, 0)
						.addSegStrokeR(-W24, iK2 * param.H2d)
						.addCornerRounded(RR1)
						.addSegStrokeR(-W24, -iK2 * param.H2d)
						.addSegStrokeR(-2 * W24 - W2b, 0);
				} else {
					rCtr.addSegStrokeR(-W2b - 2 * W24, 0)
						.addSegStrokeR(-W24, -iK2 * param.H2d)
						.addCornerRounded(RR2)
						.addSegStrokeR(-W24, iK2 * param.H2d)
						.addSegStrokeR(-W2b, 0);
				}
			} else {
				rCtr.addSegStrokeR(-W2b, 0)
					.addSegStrokeR(-W24, iK2 * param.H2d)
					.addCornerRounded(RR1)
					.addSegStrokeR(-2 * W24, -2 * iK2 * param.H2d)
					.addCornerRounded(RR2)
					.addSegStrokeR(-W24, iK2 * param.H2d)
					.addSegStrokeR(-W2b, 0);
			}
			rCtr.closeSegStroke();
			return rCtr;
		}
		const ctrSide1 = ctrSide(1, 1, param.H1a, false);
		const ctrSide2 = ctrSide(-1, 1, 2 * H2 + param.E2 - param.H1a, false);
		figSide.addMainO(ctrSide1);
		figSide.addMainO(ctrSide2);
		figSide.addSecond(ctrMid1);
		figSide.addSecond(ctrMid2);
		// figSideB
		const ctrSideB1 = ctrSide(1, 1, param.H1a, true);
		const ctrSideB2 = ctrSide(-1, 1, 2 * H2 + param.E2 - param.H1a, true);
		figSideB.addMainO(ctrSideB1);
		figSideB.addMainO(ctrSideB2);
		figSideB.addSecond(ctrSide1);
		figSideB.addSecond(ctrSide2);
		figSideB.addSecond(ctrMid1);
		figSideB.addSecond(ctrMid2);
		// final figure list
		rGeome.fig = {
			faceFace: figFace,
			faceMid: figMid,
			faceSide: figSide,
			faceSideB: figSideB
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_face`,
					face: `${designName}_faceFace`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.W1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_b1`,
					face: `${designName}_faceSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L2,
					rotate: [0, pi2, 0],
					translate: [LL3, 0, param.W1]
				},
				{
					outName: `subpax_${designName}_b2`,
					face: `${designName}_faceSideB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L12,
					rotate: [0, pi2, 0],
					translate: [LL3 + param.L2, 0, param.W1]
				},
				{
					outName: `subpax_${designName}_b3`,
					face: `${designName}_faceMid`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L1,
					rotate: [0, pi2, 0],
					translate: [LL3 + param.L2 + param.L12, 0, param.W1]
				},
				{
					outName: `subpax_${designName}_b4`,
					face: `${designName}_faceSideB`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L12,
					rotate: [0, pi2, 0],
					translate: [LL3 + param.L2 + param.L12 + param.L1, 0, param.W1]
				},
				{
					outName: `subpax_${designName}_b5`,
					face: `${designName}_faceSide`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.L2,
					rotate: [0, pi2, 0],
					translate: [LL3 + param.L2 + 2 * param.L12 + param.L1, 0, param.W1]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_face`,
						`subpax_${designName}_b1`,
						`subpax_${designName}_b2`,
						`subpax_${designName}_b3`,
						`subpax_${designName}_b4`,
						`subpax_${designName}_b5`
					]
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
