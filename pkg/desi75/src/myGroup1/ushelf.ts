// ushelf.ts
// a U-shape bookshelf

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	//DesignParam,
	//tInherit,
	tExtrude,
	//tSubInst,
	//tSubDesign
	//Transform2d,
	//Transform3d,
	tPageDef
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

const pDef: tParamDef = {
	partName: 'ushelf',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('L1', 'mm', 1200, 1, 4000, 1),
		pNumber('H1', 'mm', 100, 1, 4000, 1),
		pNumber('H2', 'mm', 340, 1, 4000, 1),
		pNumber('H3', 'mm', 150, 1, 4000, 1),
		pNumber('H4', 'mm', 150, 1, 4000, 1),
		pNumber('W1', 'mm', 250, 1, 4000, 1),
		pSectionSeparator('details'),
		pNumber('E1', 'mm', 20, 1, 400, 1),
		pNumber('E2', 'mm', 30, 1, 400, 1),
		pNumber('W2', 'mm', 150, 1, 4000, 1),
		pNumber('H5', 'mm', 60, 0, 400, 1),
		pNumber('W5', 'mm', 30, 0, 400, 1)
	],
	paramSvg: {
		L1: 'ushelf_face.svg',
		H1: 'ushelf_face.svg',
		H2: 'ushelf_side.svg',
		H3: 'ushelf_top.svg',
		H4: 'ushelf_top.svg',
		W1: 'ushelf_top.svg',
		E1: 'ushelf_top.svg',
		E2: 'ushelf_top.svg',
		W2: 'ushelf_top.svg',
		H5: 'ushelf_top.svg',
		W5: 'ushelf_face.svg'
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
	const figSideR = figure();
	const figTop = figure();
	const figBeamTop = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Htot1 = param.H1 + param.E1 + param.H2;
		const HtotR = Htot1 + param.H3;
		const Htot = HtotR + param.H4;
		const xx1 = [0, param.L1 - param.E1];
		const xx2 = [param.E1, param.L1 - param.E1 - param.E2];
		const Lback = param.L1 - 2 * param.E1;
		const Hback = Htot1 - param.H5;
		const Lplateau = Lback;
		const Wtot = param.W5 + param.W1;
		const Wplateau = Wtot - param.E1;
		const LHorBeam = Lplateau - 2 * param.E2;
		// step-5 : checks on the parameter values
		if (param.H1 < param.H5 + param.E2) {
			throw `err096: H1 ${param.H1} is too small compare to E2 ${param.E2} and H5 ${param.H5}`;
		}
		if (LHorBeam < 0) {
			throw `err108: LHorBeam ${LHorBeam} is too small compare to E2 ${param.E2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Htotal ${ffix(Htot)}  Wtotal ${ffix(Wtot)} mm\n`;
		rGeome.logstr += `BOM ${ffix(param.E1)} mm\n`;
		rGeome.logstr += `plate-back ${ffix(Lback)} x ${ffix(Hback)} mm  x1\n`;
		rGeome.logstr += `plateau ${ffix(Lplateau)} x ${ffix(Wplateau)} mm  x1\n`;
		rGeome.logstr += `plate-sideL ${ffix(Htot)} x ${ffix(Wtot)} mm  x1\n`;
		rGeome.logstr += `plate-sideR ${ffix(Htot1 + param.H3)} x ${ffix(Wtot)} mm  x1\n`;
		rGeome.logstr += `BOM ${ffix(param.E2)} x ${ffix(param.E2)} mm\n`;
		rGeome.logstr += `beam-Y ${ffix(param.W2)} mm  x2\n`;
		rGeome.logstr += `beam-X ${ffix(LHorBeam)} mm  x1\n`;
		// step-7 : drawing of the figures
		// figFace
		figFace.addSecond(ctrRectangle(param.E1, param.H1, Lplateau, param.E1));
		figFace.addMainO(ctrRectangle(param.E1, param.H5, Lback, Hback));
		figFace.addSecond(ctrRectangle(xx1[0], 0, param.E1, Htot));
		figFace.addSecond(ctrRectangle(xx1[1], 0, param.E1, HtotR));
		for (const ix of xx2) {
			figFace.addSecond(ctrRectangle(ix, param.H1 - param.E2, param.E2, param.E2));
		}
		// figSide
		figSide.addSecond(ctrRectangle(0, param.H5, param.E1, Hback));
		function ctrSide(iH: number): tContour {
			const rCtr = contour(Wtot, 0).addSegStrokeR(0, iH).addSegStrokeR(-Wtot, 0);
			if (param.H5 > 0 && param.W5 > 0) {
				rCtr.addSegStrokeR(0, -iH + param.H5)
					.addSegStrokeR(param.W5, 0)
					.addSegStrokeR(0, -param.H5);
			} else {
				rCtr.addSegStrokeR(0, -iH);
			}
			rCtr.closeSegStroke();
			return rCtr;
		}
		figSide.addMainO(ctrSide(Htot));
		figSide.addSecond(ctrRectangle(param.E1, param.H1, Wplateau, param.E1));
		figSide.addSecond(ctrRectangle(param.E1, param.H1 - param.E2, param.W2, param.E2));
		// figSideR
		figSideR.mergeFigure(figSide, true);
		figSideR.addMainO(ctrSide(HtotR));
		// figTop
		figTop.addMainO(ctrRectangle(param.E1, param.E1, Lplateau, Wplateau));
		figTop.addSecond(ctrRectangle(param.E1, 0, Lback, param.E1));
		figTop.addSecond(ctrRectangle(xx1[0], 0, param.E1, Wtot));
		figTop.addSecond(ctrRectangle(xx1[1], 0, param.E1, Wtot));
		figTop.addSecond(ctrRectangle(param.E1 + param.E2, param.E1, LHorBeam, param.E2));
		// figBeamTop
		figBeamTop.mergeFigure(figTop, true);
		const beamTop: tContour[] = [];
		for (const ix of xx2) {
			beamTop.push(ctrRectangle(ix, param.E1, param.E2, param.W2));
		}
		beamTop.push(ctrRectangle(param.E1 + param.E2, param.E1, LHorBeam, param.E2));
		for (const iCtr of beamTop) {
			figTop.addSecond(iCtr);
			figBeamTop.addMainO(iCtr);
		}
		// final figure list
		rGeome.fig = {
			faceFace: figFace,
			faceSide: figSide,
			faceSideR: figSideR,
			faceTop: figTop,
			faceBeamTop: figBeamTop
		};
		// volume
		const designName = rGeome.partName;
		//const partInherit: tInherit[] = [];
		const partExtrude: tExtrude[] = [];
		const partList: string[] = [];
		const pi2 = Math.PI / 2;
		if (param.E1 > 0) {
			const eName = `subpax_${designName}_top`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_faceTop`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [0, 0, 0],
				translate: [0, 0, Htot1]
			});
			partList.push(eName);
		}
		if (param.E1 > 0) {
			const eName = `subpax_${designName}_back`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_faceFace`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [pi2, 0, 0],
				translate: [0, param.E1, 0]
			});
			partList.push(eName);
		}
		for (let ii = 0; ii < 2; ii++) {
			const eName = `subpax_${designName}_side${ii}`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_faceSide`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [pi2, 0, pi2],
				translate: [ii * (param.L1 - param.E1), 0, 0]
			});
			partList.push(eName);
		}
		if (param.E2 > 0) {
			const eName = `subpax_${designName}_beam`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_faceBeamTop`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E2,
				rotate: [0, 0, 0],
				translate: [0, 0, param.H1 - param.E2]
			});
			partList.push(eName);
		}
		rGeome.vol = {
			extrudes: partExtrude,
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: partList
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'U-shelf drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const ushelfDef: tPageDef = {
	pTitle: 'ushelf',
	pDescription: 'A U-shape bookshelf',
	pDef: pDef,
	pGeom: pGeom
};

export { ushelfDef };
