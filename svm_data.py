# --- generate_data.py ---
import numpy as np
from sklearn import svm
from sklearn.datasets import make_blobs
import json # To save data for JavaScript

# 1. Create consistent dataset
X, y = make_blobs(n_samples=50, centers=2, random_state=6, cluster_std=1.2)

# 2. Define C values (logarithmic scale is good)
# More values = smoother slider, but more data
C_values_log = np.linspace(-2, 3, 11) # From 10^-2 to 10^3 (e.g., 11 steps)
C_values = np.power(10, C_values_log)

# 3. Store results for each C
svm_results = []

# Get plot limits once based on the data
x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1

for C in C_values:
    clf = svm.SVC(kernel='linear', C=C)
    clf.fit(X, y)

    # Get coefficients (w) and intercept (b) for boundary: w0*x + w1*y + b = 0
    w = clf.coef_[0]
    b = clf.intercept_[0]

    # Calculate points for the decision boundary line
    # y = (-w[0] * x - b) / w[1]
    x_boundary = np.array([x_min, x_max])
    y_boundary = (-w[0] * x_boundary - b) / w[1]

    # Calculate points for margin lines
    # w0*x + w1*y + b = 1  => y = (-w[0] * x - b + 1) / w[1]
    y_margin_upper = (-w[0] * x_boundary - b + 1) / w[1]
    # w0*x + w1*y + b = -1 => y = (-w[0] * x - b - 1) / w[1]
    y_margin_lower = (-w[0] * x_boundary - b - 1) / w[1]

    # Store relevant data
    result = {
        'C': C,
        'support_vectors': clf.support_vectors_.tolist(), # Convert numpy array to list for JSON
        'boundary_line': {'x': x_boundary.tolist(), 'y': y_boundary.tolist()},
        'margin_upper': {'x': x_boundary.tolist(), 'y': y_margin_upper.tolist()},
        'margin_lower': {'x': x_boundary.tolist(), 'y': y_margin_lower.tolist()}
    }
    svm_results.append(result)

# 4. Prepare final data structure for JavaScript
# Include original data points once
output_data = {
    'points': {
        'x': X[:, 0].tolist(),
        'y': X[:, 1].tolist(),
        'labels': y.tolist() # Class labels
    },
    'plot_limits': { # Send limits to JS for consistent axes
      'x_min': x_min, 'x_max': x_max, 'y_min': y_min, 'y_max': y_max
    },
    'svm_results': svm_results # List of results for each C
}

# 5. Save data to a .js file
# We wrap it in "const svmData = ... ;" so it's a JS variable
with open('svm_data.js', 'w') as f:
    f.write('const svmData = ')
    json.dump(output_data, f, indent=4) # indent for readability
    f.write(';')

print("svm_data.js generated successfully.")
# --- End of generate_data.py ---