import { ChartPoint } from '@lib/types';

/**
 * Pure math for the team rank-history chart (lib/teamChart.ts). No DOM, no
 * canvas, no browser APIs — everything here is data-index/coordinate math
 * extracted from createChart so it can be unit-tested. Rendering constants
 * and draw calls stay in teamChart.ts.
 *
 * All window math operates on data indices into rankList (winStart inclusive,
 * winEnd exclusive). All pixel math is in CSS pixels.
 */

// --- Layout constants (shared with teamChart.ts) ---

export const BRUSH_HEIGHT = 30;
export const BRUSH_TOP = 10;
export const PLOT_TOP = BRUSH_TOP + BRUSH_HEIGHT + 20;
export const MARGIN_LEFT = 45;
export const MARGIN_RIGHT = 20;
export const MARGIN_BOTTOM = 25;
export const HANDLE_WIDTH = 8;
export const MIN_WINDOW = 3; // minimum visible data points

const INITIAL_WINDOW_POINTS = 50; // points shown before the user interacts

// --- Types ---

export type IndexWindow = {
	start: number;
	end: number;
};

export type PlotArea = {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
};

// --- Basics ---

export function clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Plot rect in CSS pixels for a canvas of the given CSS size.
 */
export function plotArea(W: number, H: number): PlotArea {
	const left = MARGIN_LEFT;
	const right = W - MARGIN_RIGHT;
	const top = PLOT_TOP;
	const bottom = H - MARGIN_BOTTOM;
	return { left, right, top, bottom, width: right - left, height: bottom - top };
}

// --- Coordinate scales ---

/**
 * Map a data index in the visible window to an x pixel. With fewer than two
 * visible points, all points sit at the horizontal center of the plot.
 */
export function dataX(i: number, winStart: number, winEnd: number, left: number, width: number): number {
	const count = winEnd - winStart;
	if (count <= 1) return left + width / 2;
	return left + ((i - winStart) / (count - 1)) * width;
}

/**
 * Map a rank to a y pixel (inverted: rank 1 at top, chartMaxY at bottom).
 * chartMaxY must be > 1; for chartMaxY <= 1 the result is NaN, matching the
 * original inline arithmetic.
 */
export function rankToY(rank: number, chartMaxY: number, top: number, height: number): number {
	return top + ((rank - 1) / (chartMaxY - 1)) * height;
}

// --- Window management ---

/**
 * Initial visible window: the most recent INITIAL_WINDOW_POINTS data points.
 */
export function initialWindow(total: number): IndexWindow {
	const end = total;
	const start = Math.max(0, total - INITIAL_WINDOW_POINTS);
	return { start, end };
}

/**
 * Y gridline tick values: rank 1 plus every 25th rank up to chartMaxY.
 */
export function yTickValues(chartMaxY: number): number[] {
	const yValues = [1];
	for (let v = 25; v <= chartMaxY; v += 25) yValues.push(v);
	return yValues;
}

/**
 * X gridline ticks: for each year, the index of its "Week 1" point, if that
 * point exists and falls inside the visible window. A year whose Week 1 point
 * lies before the window is dropped entirely (not re-anchored), matching the
 * original findIndex-based lookup.
 */
export function yearGridIndices(
	years: number[],
	rankList: ChartPoint[],
	winStart: number,
	winEnd: number,
): { year: number; idx: number }[] {
	const ticks: { year: number; idx: number }[] = [];
	for (const year of years) {
		const label = `${year} Week 1`;
		const idx = rankList.findIndex((p) => p.week === label);
		if (idx < 0) continue;
		if (idx < winStart || idx >= winEnd) continue;
		ticks.push({ year, idx });
	}
	return ticks;
}

// --- Brush (mini chart) geometry ---

/**
 * Rank range covered by the brush mini chart. A flat series is expanded by
 * one rank in each direction so the mini line still spans the brush height.
 */
export function brushRankRange(rankList: ChartPoint[]): { min: number; max: number } {
	let minR = Infinity;
	let maxR = -Infinity;
	for (const p of rankList) {
		if (p.rank < minR) minR = p.rank;
		if (p.rank > maxR) maxR = p.rank;
	}
	if (minR === maxR) {
		minR -= 1;
		maxR += 1;
	}
	return { min: minR, max: maxR };
}

/**
 * Pixel bounds of the selected region within the brush strip. total must be
 * >= 2 (callers guard on this).
 */
export function brushSelection(
	winStart: number,
	winEnd: number,
	total: number,
	left: number,
	width: number,
): { selLeft: number; selRight: number } {
	const selLeft = left + (winStart / (total - 1)) * width;
	const selRight = left + ((winEnd - 1) / (total - 1)) * width;
	return { selLeft, selRight };
}

/**
 * Hit test within the brush strip: left/right handle, pan area, or null.
 * selLeft/selRight come from brushSelection.
 */
export function brushHitTest(
	mx: number,
	my: number,
	selLeft: number,
	selRight: number,
): 'left' | 'right' | 'pan' | null {
	if (my < BRUSH_TOP || my > BRUSH_TOP + BRUSH_HEIGHT) return null;
	if (Math.abs(mx - selLeft) <= HANDLE_WIDTH) return 'left';
	if (Math.abs(mx - selRight) <= HANDLE_WIDTH) return 'right';
	if (mx >= selLeft && mx <= selRight) return 'pan';
	return null;
}

// --- Window interaction (pointer, wheel, pinch) ---

/** Horizontal drag distance (px) converted to data-index distance. */
function dxToIndex(dx: number, total: number, plotWidth: number): number {
	return dx * ((total - 1) / plotWidth);
}

/**
 * New window start when dragging the left brush handle: never below 0 and
 * never closer than MIN_WINDOW points to the current end.
 */
export function brushDragLeft(dx: number, origStart: number, curEnd: number, total: number, plotWidth: number): number {
	const di = dxToIndex(dx, total, plotWidth);
	return Math.round(clamp(origStart + di, 0, curEnd - MIN_WINDOW));
}

/**
 * New window end when dragging the right brush handle: never beyond total and
 * never closer than MIN_WINDOW points to the current start.
 */
export function brushDragRight(
	dx: number,
	origEnd: number,
	curStart: number,
	total: number,
	plotWidth: number,
): number {
	const di = dxToIndex(dx, total, plotWidth);
	return Math.round(clamp(origEnd + di, curStart + MIN_WINDOW, total));
}

/**
 * Pan by dragging inside the brush strip: shifts the window, preserving its
 * span, clamped to the data.
 */
export function brushPan(
	dx: number,
	origStart: number,
	origEnd: number,
	total: number,
	plotWidth: number,
): IndexWindow {
	const span = origEnd - origStart;
	const di = dxToIndex(dx, total, plotWidth);
	const newStart = Math.round(clamp(origStart + di, 0, total - span));
	return { start: newStart, end: newStart + span };
}

/**
 * Pan by dragging inside the plot: drag right moves the window to earlier
 * points (content follows the pointer).
 */
export function plotPan(dx: number, origStart: number, origEnd: number, total: number, plotWidth: number): IndexWindow {
	const span = origEnd - origStart;
	const di = Math.round(-dx * (span / plotWidth));
	const newStart = clamp(origStart + di, 0, total - span);
	return { start: newStart, end: newStart + span };
}

/**
 * Wheel zoom: scales the span by 1.15 (zoom out for positive deltaY, in for
 * negative), keeping the cursor position anchored, with the span clamped to
 * [MIN_WINDOW, total] and the start clamped to [0, total - newSpan]. When
 * total < MIN_WINDOW the original arithmetic can produce a negative start;
 * that behavior is preserved.
 */
export function wheelZoom(
	mx: number,
	winStart: number,
	winEnd: number,
	total: number,
	deltaY: number,
	left: number,
	plotWidth: number,
): IndexWindow {
	const span = winEnd - winStart;
	const factor = deltaY > 0 ? 1.15 : 1 / 1.15;
	const newSpan = Math.round(clamp(span * factor, MIN_WINDOW, total));

	const cursorFrac = (mx - left) / plotWidth;
	const cursorIdx = winStart + cursorFrac * (span - 1);
	const newStart = clamp(Math.round(cursorIdx - cursorFrac * (newSpan - 1)), 0, total - newSpan);
	return { start: newStart, end: newStart + newSpan };
}

/**
 * Pinch zoom: scales the span by the ratio of the touch distances, centered
 * on the original window midpoint, clamped like wheelZoom. Callers guard
 * against startDist < 1 before calling.
 */
export function pinchZoom(
	startDist: number,
	curDist: number,
	origStart: number,
	origEnd: number,
	total: number,
): IndexWindow {
	const scale = startDist / curDist;
	const origSpan = origEnd - origStart;
	const newSpan = Math.round(clamp(origSpan * scale, MIN_WINDOW, total));

	const origMid = (origStart + origEnd) / 2;
	const newStart = clamp(Math.round(origMid - newSpan / 2), 0, total - newSpan);
	return { start: newStart, end: newStart + newSpan };
}

// --- Tooltip ---

/**
 * Index of the visible point whose x pixel is nearest the cursor; ties go to
 * the earlier index. Callers guard against an empty window.
 */
export function nearestPointIndex(mx: number, winStart: number, winEnd: number, xOf: (i: number) => number): number {
	let bestIdx = winStart;
	let bestDist = Infinity;
	for (let i = winStart; i < winEnd; i++) {
		const px = xOf(i);
		const d = Math.abs(mx - px);
		if (d < bestDist) {
			bestDist = d;
			bestIdx = i;
		}
	}
	return bestIdx;
}

/**
 * Tooltip offset from its anchor point: 10px right / 25px up by default,
 * flipped left when it would overflow the canvas and flipped below when it
 * would overflow the top.
 */
export function tooltipPosition(px: number, py: number, width: number): { tx: number; ty: number } {
	let tx = px + 10;
	let ty = py - 25;
	if (tx + 120 > width) tx = px - 120;
	if (ty < 0) ty = py + 10;
	return { tx, ty };
}
