import { describe, expect, it } from 'vitest';

import {
	brushDragLeft,
	brushDragRight,
	brushHitTest,
	brushPan,
	brushRankRange,
	brushSelection,
	clamp,
	dataX,
	initialWindow,
	nearestPointIndex,
	pinchZoom,
	plotArea,
	plotPan,
	rankToY,
	tooltipPosition,
	wheelZoom,
	yTickValues,
	yearGridIndices,
} from './chartMath';

describe('clamp', () => {
	it('clamps to the range bounds and passes through in-range values', () => {
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('returns hi when v > hi, even if hi < lo (original behavior behind degenerate windows)', () => {
		expect(clamp(5, 3, 2)).toBe(2);
	});
});

describe('plotArea', () => {
	it('derives the plot rect from the canvas size minus the fixed margins', () => {
		expect(plotArea(800, 600)).toEqual({
			left: 45,
			right: 780,
			top: 60, // BRUSH_TOP(10) + BRUSH_HEIGHT(30) + 20
			bottom: 575,
			width: 735,
			height: 515,
		});
	});
});

describe('dataX', () => {
	it('maps the first and last window indices to the plot edges and interpolates linearly', () => {
		expect(dataX(10, 10, 20, 45, 735)).toBe(45);
		expect(dataX(19, 10, 20, 45, 735)).toBe(780);
		expect(dataX(15, 10, 20, 45, 735)).toBeCloseTo(45 + (5 / 9) * 735, 10);
	});

	it('centers the point when the window holds fewer than two points', () => {
		expect(dataX(5, 5, 6, 45, 735)).toBe(45 + 367.5);
		expect(dataX(3, 3, 3, 45, 735)).toBe(45 + 367.5);
	});
});

describe('rankToY', () => {
	it('maps rank 1 to the plot top and chartMaxY to the plot bottom', () => {
		expect(rankToY(1, 150, 60, 515)).toBe(60);
		expect(rankToY(150, 150, 60, 515)).toBe(575);
	});

	it('interpolates linearly for interior ranks', () => {
		expect(rankToY(76, 150, 60, 515)).toBeCloseTo(60 + (75 / 149) * 515, 10);
	});

	it('yields NaN when chartMaxY <= 1 (original behavior, division by zero)', () => {
		expect(rankToY(1, 1, 60, 515)).toBeNaN();
	});
});

describe('initialWindow', () => {
	it('shows the last 50 points of a long series', () => {
		expect(initialWindow(120)).toEqual({ start: 70, end: 120 });
	});

	it('shows everything for short or empty series', () => {
		expect(initialWindow(30)).toEqual({ start: 0, end: 30 });
		expect(initialWindow(0)).toEqual({ start: 0, end: 0 });
	});
});

describe('yTickValues', () => {
	it('starts at 1 and steps by 25 up to chartMaxY, staying within [1, chartMaxY]', () => {
		expect(yTickValues(150)).toEqual([1, 25, 50, 75, 100, 125, 150]);

		const ticks = yTickValues(140);
		expect(ticks.every((v, i) => i === 0 || v > ticks[i - 1])).toBe(true);
		expect(ticks[0]).toBe(1);
		expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(140);
	});

	it('returns only rank 1 when chartMaxY is below the first step', () => {
		expect(yTickValues(24)).toEqual([1]);
		expect(yTickValues(25)).toEqual([1, 25]);
	});
});

describe('yearGridIndices', () => {
	const rankList = [
		{ week: '2019 Week 1', rank: 5, fillLevel: 0 },
		{ week: '2019 Final', rank: 4, fillLevel: 0 },
		{ week: '2020 Week 1', rank: 3, fillLevel: 0 },
		{ week: '2020 Final', rank: 2, fillLevel: 0 },
	];

	it("returns the index of each year's Week 1 point that is inside the window", () => {
		expect(yearGridIndices([2019, 2020], rankList, 0, 4)).toEqual([
			{ year: 2019, idx: 0 },
			{ year: 2020, idx: 2 },
		]);
		expect(yearGridIndices([2020], rankList, 1, 4)).toEqual([{ year: 2020, idx: 2 }]);
	});

	it('drops years whose Week 1 point is missing or outside the window', () => {
		expect(yearGridIndices([2021], rankList, 0, 4)).toEqual([]);
		// 2019's Week 1 sits before the window: dropped, not re-anchored to a later 2019 point
		expect(yearGridIndices([2019, 2020], rankList, 1, 4)).toEqual([{ year: 2020, idx: 2 }]);
		expect(yearGridIndices([2020], rankList, 3, 4)).toEqual([]);
	});
});

describe('brushRankRange', () => {
	it('returns the min and max rank of the series', () => {
		const rankList = [
			{ week: 'a', rank: 1, fillLevel: 0 },
			{ week: 'b', rank: 10, fillLevel: 0 },
			{ week: 'c', rank: 4, fillLevel: 0 },
		];
		expect(brushRankRange(rankList)).toEqual({ min: 1, max: 10 });
	});

	it('expands a flat series by one rank in each direction', () => {
		const rankList = [
			{ week: 'a', rank: 5, fillLevel: 0 },
			{ week: 'b', rank: 5, fillLevel: 0 },
		];
		expect(brushRankRange(rankList)).toEqual({ min: 4, max: 6 });
	});
});

describe('brushSelection', () => {
	it('maps a full window to the full brush width', () => {
		expect(brushSelection(0, 100, 100, 45, 735)).toEqual({ selLeft: 45, selRight: 780 });
	});

	it('positions the selected region proportionally within the brush', () => {
		const { selLeft, selRight } = brushSelection(50, 60, 100, 45, 735);
		expect(selLeft).toBeCloseTo(45 + (50 / 99) * 735, 10);
		expect(selRight).toBeCloseTo(45 + (59 / 99) * 735, 10);
	});
});

describe('brushHitTest', () => {
	const selLeft = 100;
	const selRight = 300;

	it('hits the handles within HANDLE_WIDTH and pans between them', () => {
		expect(brushHitTest(95, 25, selLeft, selRight)).toBe('left');
		expect(brushHitTest(306, 25, selLeft, selRight)).toBe('right');
		expect(brushHitTest(200, 25, selLeft, selRight)).toBe('pan');
	});

	it('misses outside the brush band and the selection', () => {
		expect(brushHitTest(200, 5, selLeft, selRight)).toBeNull();
		expect(brushHitTest(200, 41, selLeft, selRight)).toBeNull();
		expect(brushHitTest(320, 25, selLeft, selRight)).toBeNull();
	});
});

describe('window drags', () => {
	it('brushDragLeft clamps the start to [0, current end - MIN_WINDOW]', () => {
		// total=101, plotWidth=735 -> 100 indices over 735px, so dx=735 shifts 100 indices
		expect(brushDragLeft(735, 10, 101, 101, 735)).toBe(98); // clamped to winEnd - MIN_WINDOW
		expect(brushDragLeft(-7350, 10, 101, 101, 735)).toBe(0);
		expect(brushDragLeft(-367.5, 60, 101, 101, 735)).toBe(10); // shifts 50 indices
	});

	it('brushDragRight clamps the end to [current start + MIN_WINDOW, total]', () => {
		expect(brushDragRight(735, 50, 0, 101, 735)).toBe(101);
		expect(brushDragRight(-7350, 50, 0, 101, 735)).toBe(3); // clamped to winStart + MIN_WINDOW
		expect(brushDragRight(367.5, 50, 0, 101, 735)).toBe(100);
	});

	it('brushPan shifts the window, preserving its span and clamping to the data', () => {
		expect(brushPan(367.5, 20, 50, 100, 735)).toEqual({ start: 70, end: 100 });
		expect(brushPan(-36750, 20, 50, 100, 735)).toEqual({ start: 0, end: 30 });
		expect(brushPan(36750, 20, 50, 100, 735)).toEqual({ start: 70, end: 100 });
	});

	it('plotPan inverts the drag direction and clamps to the data', () => {
		// dx=-100 over width 735 with span 30 -> -round(-100 * 30/735) = +4 indices
		expect(plotPan(-100, 20, 50, 100, 735)).toEqual({ start: 24, end: 54 });
		expect(plotPan(100000, 20, 50, 100, 735)).toEqual({ start: 0, end: 30 });
		expect(plotPan(-100000, 20, 50, 100, 735)).toEqual({ start: 70, end: 100 });
	});
});

describe('wheelZoom', () => {
	it('grows the span on positive deltaY and shrinks it on negative, anchored at the cursor', () => {
		// Cursor at the left edge (frac 0): start stays put
		expect(wheelZoom(45, 0, 50, 100, 120, 45, 735)).toEqual({ start: 0, end: 57 }); // round(50*1.15) — 57.499… in FP
		expect(wheelZoom(45, 0, 50, 100, -120, 45, 735)).toEqual({ start: 0, end: 43 }); // round(50/1.15)

		// Cursor at the right edge (frac 1): end stays at origEnd - (newSpan - span) ... start clamps
		expect(wheelZoom(780, 0, 50, 100, 120, 45, 735)).toEqual({ start: 0, end: 57 });
	});

	it('clamps the span to [MIN_WINDOW, total] and the start to [0, total - newSpan]', () => {
		expect(wheelZoom(45, 0, 100, 100, 120000, 45, 735)).toEqual({ start: 0, end: 100 });
		expect(wheelZoom(45, 0, 3, 100, -120, 45, 735)).toEqual({ start: 0, end: 3 }); // span cannot drop below MIN_WINDOW
		expect(wheelZoom(780, 97, 100, 100, -120000, 45, 735)).toEqual({ start: 97, end: 100 }); // start clamped to total - newSpan
	});

	it('preserves the original negative-start behavior when total < MIN_WINDOW', () => {
		// total=2 < MIN_WINDOW=3: clamp lo>hi makes newSpan=3, then start clamps to total-newSpan=-1
		expect(wheelZoom(45, 0, 2, 2, 120, 45, 735)).toEqual({ start: -1, end: 2 });
	});
});

describe('pinchZoom', () => {
	it('scales the span by the touch-distance ratio, centered on the original midpoint', () => {
		expect(pinchZoom(100, 50, 10, 30, 100)).toEqual({ start: 0, end: 40 }); // 2x, mid 20
		expect(pinchZoom(100, 200, 10, 30, 100)).toEqual({ start: 15, end: 25 }); // 0.5x, mid 20
	});

	it('clamps the span and the start like wheel zoom', () => {
		expect(pinchZoom(100, 1, 10, 30, 100)).toEqual({ start: 0, end: 100 });
		expect(pinchZoom(100, 100000, 10, 30, 100)).toEqual({ start: 19, end: 22 }); // clamped to MIN_WINDOW, round(18.5) = 19
	});
});

describe('nearestPointIndex', () => {
	const xOf = (i) => i * 10;

	it('returns the index of the visible point closest in x', () => {
		expect(nearestPointIndex(21, 0, 5, xOf)).toBe(2);
		expect(nearestPointIndex(9, 0, 5, xOf)).toBe(1);
	});

	it('breaks ties in favor of the earlier index', () => {
		expect(nearestPointIndex(15, 0, 5, xOf)).toBe(1);
	});

	it('respects the visible window bounds', () => {
		expect(nearestPointIndex(0, 2, 4, xOf)).toBe(2);
	});
});

describe('tooltipPosition', () => {
	it('offsets right and up by default', () => {
		expect(tooltipPosition(100, 100, 800)).toEqual({ tx: 110, ty: 75 });
	});

	it('flips left when it would overflow the right edge', () => {
		expect(tooltipPosition(750, 100, 800)).toEqual({ tx: 630, ty: 75 });
	});

	it('flips below the anchor when it would overflow the top', () => {
		expect(tooltipPosition(100, 10, 800)).toEqual({ tx: 110, ty: 20 });
	});
});
