// bookshelf.ts
// a low-board bookshelf

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
		pNumber('L1', 'mm', 1200, 1, 4000, 1),
		pNumber('H1', 'mm', 100, 1, 4000, 1),
		pNumber('H2', 'mm', 340, 1, 4000, 1),
		pNumber('H3', 'mm', 150, 1, 4000, 1),
		pNumber('W1', 'mm', 250, 1, 4000, 1),
		pCheckbox('mid', true),
		pSectionSeparator('details'),
		pNumber('E1', 'mm', 20, 1, 400, 1),
		pNumber('E2', 'mm', 30, 1, 400, 1),
		pNumber('W2', 'mm', 150, 1, 4000, 1),
		pNumber('H5', 'mm', 60, 0, 400, 1),
		pNumber('W5', 'mm', 30, 0, 400, 1)
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
	const figSideMid = figure();
	const figTop = figure();
	const figPlateau = figure();
	const figBeamFace = figure();
	const figBeamTop = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Htot1 = param.H1 + param.H2 + param.H3 + 2 * param.E1;
		const Htot = Htot1 + param.E1;
		const L12 = param.L1 / 2 - param.E1 / 2;
		const xx1 = [0, param.L1 - param.E1];
		const xx2 = [param.E1, param.L1 - param.E1 - param.E2];
		const xx3 = [param.E1];
		const H22 = param.H1 + param.E1 + param.H2;
		const H32 = H22 + param.E1 + param.H3;
		const yy1 = [param.H1, H22];
		const yy2 = [param.H1 - param.E2, H22 - param.E2, H32 - param.E2];
		if (param.mid) {
			xx1.push(L12);
			xx2.push(L12 - param.E2);
			xx2.push(L12 + param.E1);
			xx3.push(L12 + param.E1);
		}
		const Lback = param.L1 - 2 * param.E1;
		const Hback = Htot1 - param.H5;
		const Lplateau1 = param.L1 - 2 * param.E1;
		const Lplateau2 = (param.L1 - 3 * param.E1) / 2;
		const Lplateau = param.mid ? Lplateau2 : Lplateau1;
		const Wplateau = param.W5 + param.W1 - param.E1;
		const LHorBeam = Lplateau - 2 * param.E2;
		const LVerBeam = [param.H2 - param.E2, param.H3 - param.E2];
		const Wtot = param.W5 + param.W1;
		// step-5 : checks on the parameter values
		if (param.H1 < param.H5 + param.E2) {
			throw `err096: H1 ${param.H1} is too small compare to E2 ${param.E2} and H5 ${param.H5}`;
		}
		if (LVerBeam[0] < 0) {
			throw `err102: H2 ${param.H2} is too small compare to E2 ${param.E2}`;
		}
		if (LVerBeam[1] < 0) {
			throw `err105: H3 ${param.H2} is too small compare to E2 ${param.E2}`;
		}
		if (LHorBeam < 0) {
			throw `err108: LHorBeam ${LHorBeam} is too small compare to E2 ${param.E2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `Htotal ${ffix(Htot)}  Wtotal ${ffix(Wtot)} mm\n`;
		// step-7 : drawing of the figures
		// figFace
		figFace.addSecond(ctrRectangle(0, Htot1, param.L1, param.E1));
		figFace.addMainO(ctrRectangle(param.E1, param.H5, Lback, Hback));
		for (const ix of xx1) {
			figFace.addSecond(ctrRectangle(ix, 0, param.E1, Htot1));
		}
		for (const ix of xx2) {
			for (const iy of yy2) {
				figFace.addSecond(ctrRectangle(ix, iy, param.E2, param.E2));
			}
		}
		for (const ix of xx3) {
			for (const iy of yy1) {
				figFace.addSecond(ctrRectangle(ix, iy, Lplateau, param.E1));
			}
		}
		// figSide
		figSide.addSecond(ctrRectangle(0, Htot1, Wtot, param.E1));
		figSide.addSecond(ctrRectangle(0, param.H5, param.E1, Htot1 - param.H5));
		const ctrSide = contour(Wtot, 0).addSegStrokeR(0, Htot1).addSegStrokeR(-Wtot, 0);
		if (param.H5 > 0 && param.W5 > 0) {
			ctrSide
				.addSegStrokeR(0, -Htot1 + param.H5)
				.addSegStrokeR(param.W5, 0)
				.addSegStrokeR(0, -param.H5);
		} else {
			ctrSide.addSegStrokeR(0, -Htot1);
		}
		ctrSide.closeSegStroke();
		figSide.addMainO(ctrSide);
		for (const iy of yy1) {
			figSide.addSecond(ctrRectangle(param.E1, iy, Wplateau, param.E1));
		}
		figSide.addSecond(ctrRectangle(param.E1, yy1[0] + param.E1, param.E2, LVerBeam[0]));
		figSide.addSecond(ctrRectangle(param.E1, yy1[1] + param.E1, param.E2, LVerBeam[1]));
		for (const iy of yy2) {
			figSide.addSecond(ctrRectangle(param.E1, iy, param.W2, param.E2));
		}
		// figSideMid
		figSideMid.mergeFigure(figSide, true);
		const ctrSideMid = contour(Wtot, 0)
			.addSegStrokeR(0, Htot1)
			.addSegStrokeR(-Wtot + param.E1, 0);
		if (param.H5 > 0 && param.W5 > param.E1) {
			ctrSideMid
				.addSegStrokeR(0, -Htot1 + param.H5)
				.addSegStrokeR(param.W5 - param.E1, 0)
				.addSegStrokeR(0, -param.H5);
		} else {
			ctrSideMid.addSegStrokeR(0, -Htot1);
		}
		ctrSideMid.closeSegStroke();
		figSideMid.addMainO(ctrSideMid);
		// figTop
		figTop.addMainO(ctrRectangle(0, 0, param.L1, Wtot));
		figTop.addSecond(ctrRectangle(param.E1, 0, Lback, param.E1));
		figTop.addSecond(ctrRectangle(xx1[0], 0, param.E1, Wtot));
		figTop.addSecond(ctrRectangle(xx1[1], 0, param.E1, Wtot));
		if (param.mid) {
			figTop.addSecond(ctrRectangle(xx1[2], param.E1, param.E1, Wtot - param.E1));
		}
		for (const ix of xx3) {
			figTop.addSecond(ctrRectangle(ix + param.E2, param.E1, LHorBeam, param.E2));
		}
		// figPlateau
		figPlateau.mergeFigure(figTop, true);
		for (const ix of xx3) {
			figPlateau.addMainO(ctrRectangle(ix, param.E1, Lplateau, Wtot - param.E1));
		}
		// figBeamFace
		figBeamFace.mergeFigure(figFace, true);
		const beamFace: tContour[] = [];
		for (const ix of xx3) {
			for (const iy of yy2) {
				beamFace.push(ctrRectangle(ix + param.E2, iy, LHorBeam, param.E2));
			}
		}
		for (const ix of xx2) {
			beamFace.push(ctrRectangle(ix, yy1[0] + param.E1, param.E2, LVerBeam[0]));
			beamFace.push(ctrRectangle(ix, yy1[1] + param.E1, param.E2, LVerBeam[1]));
		}
		for (const iCtr of beamFace) {
			figFace.addSecond(iCtr);
			figBeamFace.addMainO(iCtr);
		}
		// figBeamTop
		figBeamTop.mergeFigure(figTop, true);
		const beamTop: tContour[] = [];
		for (const ix of xx2) {
			beamTop.push(ctrRectangle(ix, param.E1, param.E2, param.W2));
		}
		for (const iCtr of beamTop) {
			figTop.addSecond(iCtr);
			figPlateau.addSecond(iCtr);
			figBeamTop.addMainO(iCtr);
		}
		// final figure list
		rGeome.fig = {
			faceFace: figFace,
			faceSide: figSide,
			faceSideMid: figSideMid,
			faceTop: figTop,
			facePlateau: figPlateau,
			faceBeamFace: figBeamFace,
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
			const eName = `subpax_${designName}_plateau1`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_facePlateau`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [0, 0, 0],
				translate: [0, 0, param.H1]
			});
			partList.push(eName);
		}
		if (param.E1 > 0) {
			const eName = `subpax_${designName}_plateau2`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_facePlateau`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [0, 0, 0],
				translate: [0, 0, H22]
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
		if (param.mid) {
			const eName = `subpax_${designName}_sideMid`;
			partExtrude.push({
				outName: eName,
				face: `${designName}_faceSideMid`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.E1,
				rotate: [pi2, 0, pi2],
				translate: [L12, 0, 0]
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
