import { ChartPoint } from '@lib/types';

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

const BRUSH_HEIGHT = 30;
const BRUSH_TOP = 10;
const PLOT_TOP = BRUSH_TOP + BRUSH_HEIGHT + 20;
const MARGIN_LEFT = 45;
const MARGIN_RIGHT = 20;
const MARGIN_BOTTOM = 25;
const DOT_RADIUS = 3;
const HANDLE_WIDTH = 8;
const MIN_WINDOW = 3; // minimum visible data points

// --- Helpers ---

function clamp(v: number, lo: number, hi: number): number {
	return v < lo ? lo : v > hi ? hi : v;
}

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
		return MARGIN_LEFT;
	}
	function plotRight(): number {
		return W - MARGIN_RIGHT;
	}
	function plotTop(): number {
		return PLOT_TOP;
	}
	function plotBottom(): number {
		return H - MARGIN_BOTTOM;
	}
	function plotWidth(): number {
		return plotRight() - plotLeft();
	}
	function plotHeight(): number {
		return plotBottom() - plotTop();
	}

	// Map data index in visible window to x pixel
	function dataXToPixel(i: number): number {
		const count = winEnd - winStart;
		if (count <= 1) return plotLeft() + plotWidth() / 2;
		return plotLeft() + ((i - winStart) / (count - 1)) * plotWidth();
	}

	// Map rank to y pixel (inversed: rank 1 at top, chartMaxY at bottom)
	function rankToY(rank: number): number {
		return plotTop() + ((rank - 1) / (chartMaxY - 1)) * plotHeight();
	}

	// --- Initial window ---
	function initWindow() {
		const total = rankList.length;
		winEnd = total;
		winStart = Math.max(0, total - 50);
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
		const selLeft = bLeft + (winStart / (total - 1)) * bWidth;
		const selRight = bLeft + ((winEnd - 1) / (total - 1)) * bWidth;

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

		const yValues = [1];
		for (let v = 25; v <= chartMaxY; v += 25) yValues.push(v);

		for (const v of yValues) {
			const y = rankToY(v);
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

		for (const year of years) {
			const label = `${year} Week 1`;
			const idx = rankList.findIndex((p) => p.week === label);
			if (idx < 0) continue;
			if (idx < winStart || idx >= winEnd) continue;

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
			const y = rankToY(rankList[i].rank);
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
			const y = rankToY(rankList[i].rank);
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

		let bestIdx = winStart;
		let bestDist = Infinity;
		for (let i = winStart; i < winEnd; i++) {
			const px = dataXToPixel(i);
			const d = Math.abs(mx - px);
			if (d < bestDist) {
				bestDist = d;
				bestIdx = i;
			}
		}

		const point = rankList[bestIdx];
		tooltip.textContent = `${point.week}: ${point.rank}`;
		tooltip.style.display = 'block';
		tooltip.style.background = color === '#ffffff' ? '#333' : '#fff';
		tooltip.style.color = color === '#ffffff' ? '#fff' : '#000';

		// Position tooltip near the point
		const px = dataXToPixel(bestIdx);
		const py = rankToY(point.rank);
		let tx = px + 10;
		let ty = py - 25;
		if (tx + 120 > W) tx = px - 120;
		if (ty < 0) ty = py + 10;
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

	function brushHitTest(mx: number, my: number): 'left' | 'right' | 'pan' | null {
		const total = rankList.length;
		if (total < 2) return null;

		const bLeft = plotLeft();
		const bRight = plotRight();
		const bWidth = bRight - bLeft;
		const bTop = BRUSH_TOP;

		if (my < bTop || my > bTop + BRUSH_HEIGHT) return null;

		const selLeft = bLeft + (winStart / (total - 1)) * bWidth;
		const selRight = bLeft + ((winEnd - 1) / (total - 1)) * bWidth;

		if (Math.abs(mx - selLeft) <= HANDLE_WIDTH) return 'left';
		if (Math.abs(mx - selRight) <= HANDLE_WIDTH) return 'right';
		if (mx >= selLeft && mx <= selRight) return 'pan';
		return null;
	}

	canvas.addEventListener('mousedown', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;

		const hit = brushHitTest(mx, my);
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
			const diPerPx = (total - 1) / (plotRight() - plotLeft());
			const di = dx * diPerPx;

			if (brushDrag.mode === 'left') {
				const newStart = Math.round(clamp(brushDrag.origStart + di, 0, winEnd - MIN_WINDOW));
				winStart = newStart;
			} else if (brushDrag.mode === 'right') {
				const newEnd = Math.round(clamp(brushDrag.origEnd + di, winStart + MIN_WINDOW, total));
				winEnd = newEnd;
			} else {
				// pan
				const span = brushDrag.origEnd - brushDrag.origStart;
				let newStart = Math.round(brushDrag.origStart + di);
				newStart = clamp(newStart, 0, total - span);
				winStart = newStart;
				winEnd = newStart + span;
			}
			draw();
			return;
		}

		if (plotDrag) {
			const dx = mx - plotDrag.startX;
			const total = rankList.length;
			const span = plotDrag.origEnd - plotDrag.origStart;
			const diPerPx = span / plotWidth();
			const di = Math.round(-dx * diPerPx);
			const newStart = clamp(plotDrag.origStart + di, 0, total - span);
			winStart = newStart;
			winEnd = newStart + span;
			draw();
			return;
		}

		// Tooltip
		showTooltip(e.clientX, e.clientY);

		// Update cursor for brush handles
		const my = e.clientY - rect.top;
		const hit = brushHitTest(mx, my);
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
			const span = winEnd - winStart;
			// zoom factor
			const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
			const newSpan = Math.round(clamp(span * factor, MIN_WINDOW, total));

			// Keep the cursor position anchored
			const cursorFrac = (mx - plotLeft()) / plotWidth();
			const cursorIdx = winStart + cursorFrac * (span - 1);
			let newStart = Math.round(cursorIdx - cursorFrac * (newSpan - 1));
			newStart = clamp(newStart, 0, total - newSpan);
			winStart = newStart;
			winEnd = newStart + newSpan;

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
				const hit = brushHitTest(mx, my);
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
				const diPerPx = (total - 1) / (plotRight() - plotLeft());
				const di = dx * diPerPx;

				if (brushDrag.mode === 'left') {
					winStart = Math.round(clamp(brushDrag.origStart + di, 0, winEnd - MIN_WINDOW));
				} else if (brushDrag.mode === 'right') {
					winEnd = Math.round(clamp(brushDrag.origEnd + di, winStart + MIN_WINDOW, total));
				} else {
					const span = brushDrag.origEnd - brushDrag.origStart;
					let newStart = Math.round(brushDrag.origStart + di);
					newStart = clamp(newStart, 0, total - span);
					winStart = newStart;
					winEnd = newStart + span;
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
				const span = touchState.origEnd - touchState.origStart;
				const diPerPx = span / plotWidth();
				const di = Math.round(-dx * diPerPx);
				const newStart = clamp(touchState.origStart + di, 0, total - span);
				winStart = newStart;
				winEnd = newStart + span;
				draw();
			} else if (touchState.mode === 'pinch' && e.touches.length === 2) {
				const startDist = Math.abs(touchState.startTouches[1].x - touchState.startTouches[0].x);
				const curDist = Math.abs(e.touches[1].clientX - e.touches[0].clientX);
				if (startDist < 1) return;

				const scale = startDist / curDist;
				const origSpan = touchState.origEnd - touchState.origStart;
				const newSpan = Math.round(clamp(origSpan * scale, MIN_WINDOW, total));

				// Center the zoom on the midpoint
				const origMid = (touchState.origStart + touchState.origEnd) / 2;
				let newStart = Math.round(origMid - newSpan / 2);
				newStart = clamp(newStart, 0, total - newSpan);
				winStart = newStart;
				winEnd = newStart + newSpan;
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
