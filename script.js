// --- script.js ---

// Get references to HTML elements
const slider = document.getElementById('cSlider');
const display = document.getElementById('cValueDisplay');
const plotDiv = document.getElementById('svmPlot');

// Data is available globally via 'svmData' from svm_data.js

// Set slider max based on the loaded data length
slider.max = svmData.svm_results.length - 1;

// --- Function to update the plot ---
function updatePlot(sliderIndex) {
    // Get the specific result set for the chosen C value
    const result = svmData.svm_results[sliderIndex];
    const C_value = result.C;

    // Update the text display
    display.textContent = `C = ${C_value.toExponential(2)}`; // Use exponential for large/small C

    // === Prepare Plotly traces ===

    // 1. Trace for original data points
    const pointsTrace = {
        x: svmData.points.x,
        y: svmData.points.y,
        mode: 'markers',
        type: 'scatter',
        marker: {
            color: svmData.points.labels, // Color by class label
            colorscale: 'Viridis', // Or 'Blues', 'Picnic', etc.
            size: 8,
            line: { // Add border to points
             color: 'black',
             width: 0.5
            }
        },
        name: 'Data Points' // Name for legend (optional)
    };

    // 2. Trace for Support Vectors (highlighted)
    const svTrace = {
        x: result.support_vectors.map(sv => sv[0]), // Extract x coords
        y: result.support_vectors.map(sv => sv[1]), // Extract y coords
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 14,
            color: 'rgba(0,0,0,0)', // Transparent fill
            line: { // Circle around SVs
                color: 'red', // Or 'black'
                width: 2
            }
        },
        name: 'Support Vectors'
    };

    // 3. Traces for Decision Boundary and Margins
    const boundaryTrace = {
        x: result.boundary_line.x,
        y: result.boundary_line.y,
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'black',
            width: 2
        },
        name: 'Decision Boundary'
    };
    const marginUpperTrace = {
        x: result.margin_upper.x,
        y: result.margin_upper.y,
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'black',
            width: 1.5,
            dash: 'dash' // Dashed line style
        },
        name: 'Margin'
    };
    const marginLowerTrace = {
        x: result.margin_lower.x,
        y: result.margin_lower.y,
        mode: 'lines',
        type: 'scatter',
        line: {
            color: 'black',
            width: 1.5,
            dash: 'dash'
        },
        showlegend: false // Only show legend for one margin line
    };

    // === Define Plotly Layout ===
    const layout = {
        title: `SVM Decision Boundary (C = ${C_value.toExponential(2)})`,
        xaxis: {
            title: 'Feature 1',
            range: [svmData.plot_limits.x_min, svmData.plot_limits.x_max], // Use fixed limits
             zeroline: false
        },
        yaxis: {
            title: 'Feature 2',
            range: [svmData.plot_limits.y_min, svmData.plot_limits.y_max], // Use fixed limits
            zeroline: false
        },
        showlegend: true,
        legend: {
            y: 0.95, // Position legend
            x: 1.05
        },
         hovermode: 'closest' // Better hover behavior
    };

    // Combine all traces
    const plotData = [
        pointsTrace,
        svTrace,
        boundaryTrace,
        marginUpperTrace,
        marginLowerTrace
    ];

    // Draw the plot (use Plotly.react for efficient updates)
    Plotly.react(plotDiv, plotData, layout);
}

// --- Event Listener for the slider ---
slider.addEventListener('input', function() {
    // 'this.value' gives the current slider position (0, 1, 2...)
    updatePlot(parseInt(this.value)); // Pass the index to the function
});

// --- Initial Plot ---
// Draw the plot when the page first loads using the slider's default value
updatePlot(parseInt(slider.value));

// --- End of script.js ---