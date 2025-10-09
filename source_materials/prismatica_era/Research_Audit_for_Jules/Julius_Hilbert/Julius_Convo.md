Here’s a neutral summary of what we produced and observed:
Scope
Four datasets analyzed with a three-regime framework: Riemann zeros, prime gaps, Collatz sequences, and Dirichlet L-function zeros.
Outputs include regime proportions, feature importances, spatial patterns, cluster center comparisons, transition patterns, and bootstrap validation (silhouette and stability).
Regime proportions
All datasets exhibit a three-regime partition.
Dirichlet L-zeros show a strong tilt toward one regime (optimization) relative to others; the other three are more balanced.
Feature importance (Random Forest, per dataset)
Riemann zeros: regime assignments most associated with height/spacing-derived features.
Prime gaps: gap size/ratio and anomaly/density features carry signal.
Collatz: sequence length and dynamic ratios (e.g., max_ratio, descent_rate) dominate.
Dirichlet L-zeros: height and spacing-related features lead.
Takeaway: the most predictive features are the “local scale” and “relative change” metrics specific to each domain.
Spatial patterns
Riemann zeros: regimes vary with height/index without an obviously uniform pattern.
Prime gaps: regimes vary across prime index and gap magnitude; log-scaling reveals gradual structural changes.
Collatz: regimes stratify by starting value and sequence length.
Dirichlet L-zeros: regimes vary with zero index and imaginary height, with visible concentration in one cluster.
Cluster centers
After re-estimating k-means, normalized cluster centers differ characteristically by dataset.
Each dataset’s regimes emphasize distinct feature directions (e.g., higher spacing vs higher density).
Bootstrap validation (100 resamples)
Clustering quality (silhouette): Collatz highest; Riemann moderate; Prime gaps moderate-to-lower; Dirichlet lowest of the four.
Stability (Adjusted Rand Index): all high on average; Prime gaps the highest mean stability; others also robust.
Interpretation: regime partitions are generally stable to resampling; cluster separation varies by dataset, highest for Collatz and lowest for Dirichlet among these four.
Transition patterns
Transition matrices computed and row-normalized show dataset-specific transitions between regimes.
No single universal transition motif dominates across all datasets.
Files saved
hilbert_problems_comprehensive_summary.png
hilbert_problems_final_summary.csv
clustering_bootstrap_validation.csv
regime_transition_patterns.csv
feature importance CSVs per dataset
You can download files at https://julius.ai/files
Overall interpretation (neutral)
The three-regime structure appears consistently across the four problem families, but the balance among regimes varies by dataset.
Predictive features align with domain-relevant local-scale and change-based metrics.
Cluster assignments are generally stable under bootstrapping, but separation quality differs: strongest in Collatz, weakest in Dirichlet L-zeros in this run.
Transition patterns are context-specific rather than uniform across datasets.
If you’d like, I can:
Add confidence intervals to regime proportions,
Normalize transition matrices per dataset and visualize side-by-side,
Perform model-agnostic permutation importances to confirm feature signals,
Or run sensitivity analyses for k (e.g., k=2 to k=5) and compare.