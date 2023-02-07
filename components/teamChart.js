import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Bar, Line, Scatter, Bubble } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

export default function TeamChart({ rankList }) {
  const finalRank = [];
  const labels = [];
  for (var i = 0; i < rankList.length; i++) {
    finalRank.push(rankList[i].final_rank)
    labels.push(`${rankList[i].year} Week ${rankList[i].postseason ? "Final" : rankList[i].week}`)
  }
  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
      },
      zoom: {
        zoom: {
          mode: 'x',
          wheel: {
            enabled: true,
            speed: 0.3,
          }
        },
        limits: {
          x: {
            minRange: 15,
          },
        },
        pan: {
          enabled: true,
          mode: 'x',
        }
      }
    },
    datasets: {
      line: {
        borderJoinStyle: 'round',
        borderWidth: 2,
      }
    },
    scales: {
      y: {
        reverse: true,
        suggestedMin: 1,
        suggestedMax: 140,
      }
    },
  }

  var style = getComputedStyle(document.body);
  var primCol = style.getPropertyValue('--color-text-primary')

  const data = {
    labels: labels,
    datasets: [
      {
        data: finalRank,
        borderColor: primCol,
        backgroundColor: primCol,
      },
    ],
  }

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  )
}
