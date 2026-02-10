import {useEffect, useRef} from "react";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import {X_AXIS_LABEL} from "../utils/constants.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Legend, Title, Tooltip);

/**
 * Reusable LineChart component that uses Chart.js to display statistical metrics, with the option for multiple datasets with standard formatting.
 */
function LineChart({title, datasets, yAxisLabel}) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);


    // Update the chart whenever the datasets or configuration options change
    useEffect(() => {
        if (!chartRef.current || !datasets || datasets.length === 0) return;

        const existingChart = ChartJS.getChart(chartRef.current);

        if (existingChart) {
            existingChart.destroy();
        }
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        const ctx = chartRef.current.getContext('2d');

        // Labels are just the indices of the data points (step count)
        const dataLength = datasets[0].data.length;
        const labels = Array.from({length: dataLength}, (_, i) => i);

        // Create a new Chart.js instance with the provided datasets and configuration options
        chartInstanceRef.current = new ChartJS(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: datasets.map((dataset, _) => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.borderColour,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {display: datasets.length > 1, position: 'top'},
                    title: {display: true, text: title},
                    tooltip: {mode: 'index', intersect: false}
                },
                scales: {
                    x: {title: {display: true, text: X_AXIS_LABEL}, ticks: {maxTicksLimit: 20}},
                    y: {title: {display: true, text: yAxisLabel}, ticks: {maxTicksLimit: 10}, beginAtZero: true}
                }
            }
        });


        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [datasets, title, yAxisLabel]);

    return <canvas ref={chartRef}></canvas>;
}


export default LineChart;