import { ChartPoint } from '@lib/types';
import {
	BRUSH_HEIGHT,
	BRUSH_TOP,
	HANDLE_WIDTH,
	brushDragLeft,
	brushDragRight,
	brushHitTest,
	brushPan,
	brushRankRange,
	brushSelection,
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

// --- Types ---

type ChartData = {
	rankList: ChartPoint[];
	years: number[];
	chartMaxY: number;
};

export type ChartHandle = {
	setData(data: ChartData): void;
	setTheme(theme: string): void;
	resize(): void;
	dispose(): void;
};

// --- Constants ---

const DOT_RADIUS = 3;

// --- Chart ---

export function createChart(container: HTMLElement, data: ChartData, theme: string): ChartHandle {
	let { rankList, years, chartMaxY } = data;
	let color = themeColor(theme);

	// View window (data indices)
	let winStart: number;
	let winEnd: number;

	// Canvas + tooltip
	const canvas = document.createElement('canvas');
	canvas.style.display = 'block';
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvas.style.cursor = 'default';
	container.style.position = 'relative';
	container.appendChild(canvas);
	const ctx = canvas.getContext('2d')!;

	const tooltip = document.createElement('div');
	tooltip.style.cssText =
		'position:absolute;pointer-events:none;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;display:none;z-index:10;';
	container.appendChild(tooltip);

	// Dimensions (CSS pixels)
	let W = 0;
	let H = 0;
	let dpr = 1;

	function plotLeft(): number {
		return plotArea(W, H).left;
	}
	function plotRight(): number {
		return plotArea(W, H).right;
	}
	function plotTop(): number {
		return plotArea(W, H).top;
	}
	function plotBottom(): number {
		return plotArea(W, H).bottom;
	}
	function plotWidth(): number {
		return plotArea(W, H).width;
	}
	function plotHeight(): number {
		return plotArea(W, H).height;
	}

	// Map data index in visible window to x pixel
	function dataXToPixel(i: number): number {
		return dataX(i, winStart, winEnd, plotLeft(), plotWidth());
	}

	// Map rank to y pixel (inversed: rank 1 at top, chartMaxY at bottom)
	function rankToYPixel(rank: number): number {
		return rankToY(rank, chartMaxY, plotTop(), plotHeight());
	}

	// --- Initial window ---
	function initWindow() {
		const win = initialWindow(rankList.length);
		winStart = win.start;
		winEnd = win.end;
	}

	// --- Drawing ---

	function draw() {
		ctx.save();
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, W, H);

		drawBrush();
		drawGridlines();
		drawPlot();

		ctx.restore();
	}

	function drawBrush() {
		const total = rankList.length;
		if (total < 2) return;

		const bLeft = plotLeft();
		const bRight = plotRight();
		const bWidth = bRight - bLeft;
		const bTop = BRUSH_TOP;
		const bHeight = BRUSH_HEIGHT;

		// Find rank range for brush mini chart
		const { min: minR, max: maxR } = brushRankRange(rankList);

		// Draw mini line
		ctx.save();
		ctx.beginPath();
		ctx.rect(bLeft, bTop, bWidth, bHeight);
		ctx.clip();

		ctx.beginPath();
		for (let i = 0; i < total; i++) {
			const x = bLeft + (i / (total - 1)) * bWidth;
			const y = bTop + ((rankList[i].rank - minR) / (maxR - minR)) * bHeight;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.restore();

		// Selected region highlight
		const { selLeft, selRight } = brushSelection(winStart, winEnd, total, bLeft, bWidth);

		// Dim unselected areas
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.08;
		ctx.fillRect(bLeft, bTop, selLeft - bLeft, bHeight);
		ctx.fillRect(selRight, bTop, bRight - selRight, bHeight);
		ctx.globalAlpha = 1;

		// Border around selected
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.strokeRect(selLeft, bTop, selRight - selLeft, bHeight);

		// Handles
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.5;
		const handleH = bHeight;
		ctx.fillRect(selLeft - HANDLE_WIDTH / 2, bTop, HANDLE_WIDTH, handleH);
		ctx.fillRect(selRight - HANDLE_WIDTH / 2, bTop, HANDLE_WIDTH, handleH);
		ctx.globalAlpha = 1;
	}

	function drawGridlines() {
		const pw = plotWidth();
		if (pw <= 0) return;

		ctx.save();

		// Y gridlines + labels
		ctx.strokeStyle = color;
		ctx.globalAlpha = 0.4;
		ctx.lineWidth = 1;
		ctx.fillStyle = color;
		ctx.font = '11px sans-serif';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';

		const yValues = yTickValues(chartMaxY);

		for (const v of yValues) {
			const y = rankToYPixel(v);
			ctx.globalAlpha = 0.4;
			ctx.beginPath();
			ctx.moveTo(plotLeft(), y);
			ctx.lineTo(plotRight(), y);
			ctx.stroke();

			ctx.globalAlpha = 1;
			ctx.fillText(`${v}`, plotLeft() - 6, y);
		}

		// X gridlines + labels (year boundaries)
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';

		for (const { year, idx } of yearGridIndices(years, rankList, winStart, winEnd)) {
			const x = dataXToPixel(idx);
			ctx.globalAlpha = 0.4;
			ctx.beginPath();
			ctx.moveTo(x, plotTop());
			ctx.lineTo(x, plotBottom());
			ctx.stroke();

			ctx.globalAlpha = 1;
			ctx.fillText(`${year}`, x, plotBottom() + 6);
		}

		ctx.restore();
	}

	function drawPlot() {
		const visibleCount = winEnd - winStart;
		if (visibleCount < 1) return;

		ctx.save();
		// Clip to plot area
		ctx.beginPath();
		ctx.rect(plotLeft(), plotTop(), plotWidth(), plotHeight());
		ctx.clip();

		// Line
		ctx.beginPath();
		for (let i = winStart; i < winEnd; i++) {
			const x = dataXToPixel(i);
			const y = rankToYPixel(rankList[i].rank);
			if (i === winStart) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.stroke();

		// Dots
		ctx.fillStyle = color;
		for (let i = winStart; i < winEnd; i++) {
			const x = dataXToPixel(i);
			const y = rankToYPixel(rankList[i].rank);
			ctx.beginPath();
			ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	}

	// --- Tooltip ---

	function showTooltip(clientX: number, clientY: number) {
		const rect = canvas.getBoundingClientRect();
		const mx = clientX - rect.left;
		const my = clientY - rect.top;

		if (mx < plotLeft() || mx > plotRight() || my < plotTop() || my > plotBottom()) {
			hideTooltip();
			return;
		}

		// Find nearest point by x
		const visibleCount = winEnd - winStart;
		if (visibleCount < 1) return;

		const bestIdx = nearestPointIndex(mx, winStart, winEnd, (i) => dataXToPixel(i));

		const point = rankList[bestIdx];
		tooltip.textContent = `${point.week}: ${point.rank}`;
		tooltip.style.display = 'block';
		tooltip.style.background = color === '#ffffff' ? '#333' : '#fff';
		tooltip.style.color = color === '#ffffff' ? '#fff' : '#000';

		// Position tooltip near the point
		const px = dataXToPixel(bestIdx);
		const py = rankToYPixel(point.rank);
		const { tx, ty } = tooltipPosition(px, py, W);
		tooltip.style.left = `${tx}px`;
		tooltip.style.top = `${ty}px`;
	}

	function hideTooltip() {
		tooltip.style.display = 'none';
	}

	// --- Interaction ---

	// Track brush drag state
	let brushDrag: null | { mode: 'left' | 'right' | 'pan'; startX: number; origStart: number; origEnd: number } = null;

	// Track plot drag state
	let plotDrag: null | { startX: number; origStart: number; origEnd: number } = null;

	function brushHit(mx: number, my: number): 'left' | 'right' | 'pan' | null {
		const total = rankList.length;
		if (total < 2) return null;

		const bLeft = plotLeft();
		const bWidth = plotRight() - bLeft;
		const { selLeft, selRight } = brushSelection(winStart, winEnd, total, bLeft, bWidth);
		return brushHitTest(mx, my, selLeft, selRight);
	}

	canvas.addEventListener('mousedown', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;

		const hit = brushHit(mx, my);
		if (hit) {
			brushDrag = { mode: hit, startX: mx, origStart: winStart, origEnd: winEnd };
			e.preventDefault();
			return;
		}

		// Plot area drag pan
		if (mx >= plotLeft() && mx <= plotRight() && my >= plotTop() && my <= plotBottom()) {
			plotDrag = { startX: mx, origStart: winStart, origEnd: winEnd };
			canvas.style.cursor = 'grabbing';
			hideTooltip();
			e.preventDefault();
		}
	});

	window.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;

		if (brushDrag) {
			const total = rankList.length;
			const dx = mx - brushDrag.startX;

			if (brushDrag.mode === 'left') {
				winStart = brushDragLeft(dx, brushDrag.origStart, winEnd, total, plotWidth());
			} else if (brushDrag.mode === 'right') {
				winEnd = brushDragRight(dx, brushDrag.origEnd, winStart, total, plotWidth());
			} else {
				// pan
				const win = brushPan(dx, brushDrag.origStart, brushDrag.origEnd, total, plotWidth());
				winStart = win.start;
				winEnd = win.end;
			}
			draw();
			return;
		}

		if (plotDrag) {
			const dx = mx - plotDrag.startX;
			const total = rankList.length;
			const win = plotPan(dx, plotDrag.origStart, plotDrag.origEnd, total, plotWidth());
			winStart = win.start;
			winEnd = win.end;
			draw();
			return;
		}

		// Tooltip
		showTooltip(e.clientX, e.clientY);

		// Update cursor for brush handles
		const my = e.clientY - rect.top;
		const hit = brushHit(mx, my);
		if (hit === 'left' || hit === 'right') {
			canvas.style.cursor = 'ew-resize';
		} else if (hit === 'pan') {
			canvas.style.cursor = 'grab';
		} else if (mx >= plotLeft() && mx <= plotRight() && my >= plotTop() && my <= plotBottom()) {
			canvas.style.cursor = 'default';
		} else {
			canvas.style.cursor = 'default';
		}
	});

	window.addEventListener('mouseup', () => {
		if (brushDrag || plotDrag) {
			brushDrag = null;
			plotDrag = null;
			canvas.style.cursor = 'default';
		}
	});

	canvas.addEventListener('mouseleave', () => {
		hideTooltip();
	});

	// Mouse wheel zoom
	canvas.addEventListener(
		'wheel',
		(e) => {
			const rect = canvas.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			if (mx < plotLeft() || mx > plotRight()) return;
			const my = e.clientY - rect.top;
			if (my < plotTop() || my > plotBottom()) return;

			e.preventDefault();

			const total = rankList.length;
			const win = wheelZoom(mx, winStart, winEnd, total, e.deltaY, plotLeft(), plotWidth());
			winStart = win.start;
			winEnd = win.end;

			draw();
		},
		{ passive: false },
	);

	// --- Touch support ---

	let touchState: null | {
		mode: 'pan' | 'pinch';
		startTouches: { x: number; y: number }[];
		origStart: number;
		origEnd: number;
	} = null;

	canvas.addEventListener(
		'touchstart',
		(e) => {
			if (e.touches.length === 1) {
				const t = e.touches[0];
				const rect = canvas.getBoundingClientRect();
				const mx = t.clientX - rect.left;
				const my = t.clientY - rect.top;

				// Check brush first
				const hit = brushHit(mx, my);
				if (hit) {
					brushDrag = { mode: hit, startX: mx, origStart: winStart, origEnd: winEnd };
					e.preventDefault();
					return;
				}

				if (mx >= plotLeft() && mx <= plotRight() && my >= plotTop() && my <= plotBottom()) {
					touchState = {
						mode: 'pan',
						startTouches: [{ x: t.clientX, y: t.clientY }],
						origStart: winStart,
						origEnd: winEnd,
					};
					e.preventDefault();
				}
			} else if (e.touches.length === 2) {
				touchState = {
					mode: 'pinch',
					startTouches: [
						{ x: e.touches[0].clientX, y: e.touches[0].clientY },
						{ x: e.touches[1].clientX, y: e.touches[1].clientY },
					],
					origStart: winStart,
					origEnd: winEnd,
				};
				e.preventDefault();
			}
		},
		{ passive: false },
	);

	canvas.addEventListener(
		'touchmove',
		(e) => {
			if (brushDrag && e.touches.length === 1) {
				const rect = canvas.getBoundingClientRect();
				const mx = e.touches[0].clientX - rect.left;
				const total = rankList.length;
				const dx = mx - brushDrag.startX;

				if (brushDrag.mode === 'left') {
					winStart = brushDragLeft(dx, brushDrag.origStart, winEnd, total, plotWidth());
				} else if (brushDrag.mode === 'right') {
					winEnd = brushDragRight(dx, brushDrag.origEnd, winStart, total, plotWidth());
				} else {
					const win = brushPan(dx, brushDrag.origStart, brushDrag.origEnd, total, plotWidth());
					winStart = win.start;
					winEnd = win.end;
				}
				draw();
				e.preventDefault();
				return;
			}

			if (!touchState) return;
			e.preventDefault();

			const total = rankList.length;

			if (touchState.mode === 'pan' && e.touches.length === 1) {
				const dx = e.touches[0].clientX - touchState.startTouches[0].x;
				const win = plotPan(dx, touchState.origStart, touchState.origEnd, total, plotWidth());
				winStart = win.start;
				winEnd = win.end;
				draw();
			} else if (touchState.mode === 'pinch' && e.touches.length === 2) {
				const startDist = Math.abs(touchState.startTouches[1].x - touchState.startTouches[0].x);
				const curDist = Math.abs(e.touches[1].clientX - e.touches[0].clientX);
				if (startDist < 1) return;

				const win = pinchZoom(startDist, curDist, touchState.origStart, touchState.origEnd, total);
				winStart = win.start;
				winEnd = win.end;
				draw();
			}
		},
		{ passive: false },
	);

	canvas.addEventListener('touchend', () => {
		brushDrag = null;
		touchState = null;
	});

	// --- Resize ---

	function resize() {
		dpr = window.devicePixelRatio || 1;
		const rect = container.getBoundingClientRect();
		W = rect.width;
		H = rect.height;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		draw();
	}

	const ro = new ResizeObserver(() => resize());
	ro.observe(container);

	// --- Public API ---

	function setData(newData: ChartData) {
		rankList = newData.rankList;
		years = newData.years;
		chartMaxY = newData.chartMaxY;
		initWindow();
		draw();
	}

	function setTheme(newTheme: string) {
		color = themeColor(newTheme);
		draw();
	}

	function dispose() {
		ro.disconnect();
		canvas.remove();
		tooltip.remove();
	}

	// Init
	initWindow();
	resize();

	return { setData, setTheme, resize, dispose };
}

function themeColor(theme: string): string {
	return theme === 'dark' ? '#ffffff' : '#000000';
}
