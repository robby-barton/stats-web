import { useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { CHART_MAX_Y } from '../lib/constants';
import { ChartPoint } from '../lib/types';

function colorByTheme(): am5.Color {
	const theme = document.body.dataset.theme
	if (theme === "dark") {
		return am5.color(0xffffff)
	} else {
		return am5.color(0x000000)
	}
}

function createCategoryRange(start: string, end: string, axis: am5xy.CategoryAxis<am5xy.AxisRenderer>, setLabel: string) {
	let rangeDataItem = axis.makeDataItem({
		category: start,
		endCategory: end
	})

	let range = axis.createAxisRange(rangeDataItem)

	const label = range.get("label")
	if (label) {
		label.setAll({
			forceHidden: false,
			text: setLabel
		})
	}

	const grid = range.get("grid")
	if (grid) {
		grid.setAll({
			forceHidden: false,
			strokeOpacity: 0.4,
		})
	}
}

function createValueRange(start: number, axis: am5xy.ValueAxis<am5xy.AxisRenderer>, setLabel: string) {
	let rangeDataItem = axis.makeDataItem({
		value: start,
	})

	let range = axis.createAxisRange(rangeDataItem)

	const label = range.get("label")
	if (label) {
		label.setAll({
			forceHidden: false,
			text: setLabel
		})
	}

	const grid = range.get("grid")
	if (grid) {
		grid.setAll({
			forceHidden: false,
			strokeOpacity: 0.4,
		})
	}
}

type TeamChartProps = {
	rankList: ChartPoint[];
	years: number[];
}
export default function TeamChart({ rankList, years }: TeamChartProps) {
	const rootRef = useRef<am5.Root | null>(null)
	const seriesRef = useRef<am5xy.LineSeries | null>(null)

	useLayoutEffect(() => {
		let root = am5.Root.new("chartDiv");

		root.setThemes([
			am5themes_Animated.new(root)
		])

		const color = colorByTheme()
		root.interfaceColors.setAll({
			grid: color,
			text: color
		})

		let chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: true,
				wheelX: "panX",
				wheelY: "zoomX",
				pinchZoomX: true,
			})
		)

		let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
			behavior: "none"
		}))
		cursor.lineY.set("visible", false)

		let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
			categoryField: "week",
			renderer: am5xy.AxisRendererX.new(root, {})
		}))

		xAxis.data.setAll(rankList)

		xAxis.events.once("datavalidated", function(ev) {
			ev.target.zoomToIndexes(rankList.length - 50, rankList.length)
		})

		let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
			min: 1,
			max: CHART_MAX_Y,
			strictMinMax: true,
			renderer: am5xy.AxisRendererY.new(root, {
				inversed: true
			})
		}))

		let series = chart.series.push(am5xy.LineSeries.new(root, {
			name: "Ranking",
			xAxis: xAxis,
			yAxis: yAxis,
			categoryXField: "week",
			valueYField: "rank",
			maskBullets: false,
			tooltip: am5.Tooltip.new(root, {
				labelText: "{categoryX}: {valueY}",
				autoTextColor: true
			}),
			background: am5.Rectangle.new(root, {
				fillOpacity: 0,
				stroke: color,
				strokeOpacity: 0.4,
			}),
		}))
		let defaultColor = series.get("stroke")
		series.strokes.template.setAll({
			strokeWidth: 1
		})
		series.bullets.push(function() {
			let circle = am5.Circle.new(root, {
				radius: 3,
				fill: defaultColor
			})

			circle.on("x", function(x, circle) {
				if (circle === undefined) {
					return
				}
				if (typeof x === 'number' && ((x < 0) || (x > chart.plotContainer.width()))) {
					circle.hide(0)
				} else {
					circle.show(0)
				}
			})

			return am5.Bullet.new(root, {
				locationY: 0,
				sprite: circle,
			})
		})

		let rendererX = xAxis.get("renderer")
		rendererX.grid.template.set("forceHidden", true)
		rendererX.labels.template.set("forceHidden", true)

		for (let i = 0; i < years.length - 1; i++) {
			createCategoryRange(`${years[i]} Week 1`, `${years[i + 1]} Week 1`, xAxis, years[i].toString())
		}
		createCategoryRange(`${years[years.length - 1]} Week 1`, rankList[rankList.length - 1].week,
			xAxis, years[years.length - 1].toString())

		let rendererY = yAxis.get("renderer")
		rendererY.grid.template.set("forceHidden", true)
		rendererY.labels.template.set("forceHidden", true)

		createValueRange(1, yAxis, "1")
		createValueRange(25, yAxis, "25")
		createValueRange(50, yAxis, "50")
		createValueRange(75, yAxis, "75")
		createValueRange(100, yAxis, "100")
		createValueRange(125, yAxis, "125")
		createValueRange(150, yAxis, "150")

		let scrollbar = chart.set("scrollbarX", am5xy.XYChartScrollbar.new(root, {
			orientation: "horizontal",
			height: 50,
			background: am5.Rectangle.new(root, {
				fillOpacity: 0
			}),
		}))
		const gripProps = {
			height: 20,
			width: 10,
			icon: am5.Graphics.new(root, {
				visible: false
			})
		}
		scrollbar.startGrip.setAll(gripProps)
		scrollbar.endGrip.setAll(gripProps)

		let sbxAxis = scrollbar.chart.xAxes.push(am5xy.CategoryAxis.new(root, {
			categoryField: "week",
			renderer: am5xy.AxisRendererX.new(root, {})
		}))

		sbxAxis.data.setAll(rankList)

		let sbyAxis = scrollbar.chart.yAxes.push(am5xy.ValueAxis.new(root, {
			min: 0,
			max: CHART_MAX_Y,
			strictMinMax: true,
			renderer: am5xy.AxisRendererY.new(root, {
				inversed: true
			})
		}))

		let sbSeries = scrollbar.chart.series.push(am5xy.LineSeries.new(root, {
			xAxis: sbxAxis,
			yAxis: sbyAxis,
			categoryXField: "week",
			valueYField: "rank",
			stroke: defaultColor,
		}))

		let sbRendererX = sbxAxis.get("renderer")
		sbRendererX.grid.template.set("forceHidden", true)
		sbRendererX.labels.template.set("forceHidden", true)

		const startYear = 1930
		const endYear = new Date().getFullYear()

		for (let i = startYear; i <= (endYear - (endYear % 10)); i = i + 10) {
			createCategoryRange(`${i} Week 1`, `${i + 10} Week 1`, sbxAxis, `${i}s`)
		}

		series.data.setAll(rankList)
		sbSeries.data.setAll(rankList)

		rootRef.current = root
		seriesRef.current = series

		return () => {
			root.dispose()
		}
	}, [])

	window.addEventListener("theme", () => {
		const color = colorByTheme()
		if (rootRef.current) {
			rootRef.current.interfaceColors.setAll({
				grid: color,
				text: color,
			})
		}
		if (seriesRef.current) {
			const background = seriesRef.current.get("background")
			if (background !== undefined) {
				background.setAll({
					stroke: color,
				})
			}
		}
	})

	return (
		<div id="chartDiv" style={{ width: "100%", height: "400px" }}></div>
	)
}