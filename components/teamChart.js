import React from 'react';
import Chart from 'react-apexcharts';

export default function TeamChart({ rankList }) {
  const labels = [];
  const data = [];
  for (var i = 0; i < rankList.length; i++) {
    labels.push(`${rankList[i].year} Week ${rankList[i].postseason ? "Final" : rankList[i].week}`)
    data.push(rankList[i].final_rank)
  }

  const options = {
    chart: {
      id: "ranking",
      toolbar: {
        autoSelected: 'pan',
        show: false,
      },
      events: {
        markerClick: function(event, chartContext, { seriesIndex, dataPointIndex, config }) {
          const week = rankList[dataPointIndex]

          window.location.href=`/ranking/${week.fbs ? "fbs" : "fcs"}/${week.year}/${week.week}`
        },
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          cssClass: 'apexcharts-label',
        }
      }
    },
    yaxis: {
      reversed: true,
      labels: {
        style: {
          cssClass: 'apexcharts-label',
        }
      }
    },
    markers: {
      size: 1,
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        }
      }
    },
    stroke: {
      width: 3,
      lineCap: "round",
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
  }

  const brush = {
    chart: {
      id: 'brush',
      brush: {
        target: 'ranking',
        enabled: true,
      },
      selection: {
        enabled: true,
        xaxis: {
          min: Math.max(labels.length - 30, 0),
          max: labels.length,
        }
      }
    },
    plotOptions: {
      area: {
        fillTo: 'end',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.91,
        opacityTo: 0.1,
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    xaxis: {
      categories: labels,
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      reversed: true,
      tickAmount: 4,
      min: 1,
      max: 140,
      labels: {
        style: {
          cssClass: 'apexcharts-label',
        }
      }
    }
  }

  const series = [{
    name: "Ranking",
    data: data
  }]

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="line"
      />
      <Chart
        options={brush}
        series={series}
        type="area"
        height="175"
      />
    </div>
  )
}
