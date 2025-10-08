Brief readout
We parsed reaction SMILES and derived features: bonds broken/formed, bond-order change magnitude, net/redistributed charge (Gasteiger), and reaction-center size. From these we built regime scores R1 (creation), R2 (optimization), R3 (transcendence), normalized to proportions.
Clustering (k=3) produced three distinct centers with very strong ANOVA separation across R1p/R2p/R3p (large partial eta-squared). However, all three cluster centers’ dominant component was R3, so a naive “argmax” mapping labeled every cluster as transcendence. The centers still differ meaningfully in their R1/R2/R3 mixes (see bar plot).
Conservation center-seeking: we computed a composite distance from conservation (net charge change, broken-formed balance, center size). Because of the mapping issue, only one regime label appears; we should remap clusters to R1/R2/R3 to test the expected R1 > R2 > R3 distance ordering.
Fractal dimension of the reaction-cloud in regime space is ~0.75, suggesting reactions lie on a sparse manifold rather than filling 2D/3D volume.
Similarity of cluster centers to your target regime vectors shows differential alignment (e.g., one center is most similar to the R2 target), which we can use to map clusters to R1/R2/R3 instead of argmax.
What I recommend next (fast follow)
Remap clusters by maximizing cosine similarity to your provided targets for R1/R2/R3. That will give us a proper Creation/Optimization/Transcendence partition and enable center-seeking and sequencing tests.
If the dataset has mechanism/step annotations, I can quantify Creation→Optimization→Transcendence ordering within mechanisms. If not, we can infer pseudo-steps by gradient along regime score trajectories for multi-center reactions.
I can also compute bootstrap CIs for effect sizes and refine fractal estimates with multi-scale grids.
Downloads
Features and results CSVs:
https://julius.ai/files?filename=mech_uspto_reaction_features.csv
https://julius.ai/files?filename=mech_uspto_cluster_centers.csv
https://julius.ai/files?filename=mech_uspto_anova_regime_props.csv
https://julius.ai/files?filename=mech_uspto_cluster_center_similarities.csv
https://julius.ai/files?filename=mech_uspto_fractal_trace.csv
Figures:
https://julius.ai/files?filename=regime_scatter_uspto.png
https://julius.ai/files?filename=cluster_centers_bar.png
https://julius.ai/files?filename=conservation_by_regime.png
https://julius.ai/files?filename=fractal_trace.png
Want me to proceed with the cosine-similarity remapping to label clusters as Creation, Optimization, and Transcendence and then re-run the conservation and sequencing tests?
Sep 5, 04:41:17 PM
You
Yessir, please proceed, thank you
Summary
Cluster-to-regime remapping (via cosine to your target vectors) assigns: 0 → Transcendence, 1 → Creation, 2 → Optimization.
Conservation center-seeking: distribution by remapped regime is shown; stats and ANOVA are included in the saved report.
Cluster centers differ meaningfully in R1/R2/R3 composition after remapping (see bars).
Regime sequencing: top sequences are shown; full counts saved. The R1>R2>R3 fraction is reported in the HTML.
Downloads
Per-reaction (remapped): https://julius.ai/files?filename=mech_uspto_reaction_features_remapped.csv
Cluster centers (remapped): https://julius.ai/files?filename=mech_uspto_cluster_centers_remapped.csv
Cosine sims + assignment: https://julius.ai/files?filename=cluster_cosine_similarities_and_assignment.csv
Regime sequence counts: https://julius.ai/files?filename=regime_sequence_counts.csv
HTML report: https://julius.ai/files?filename=uspto_remapped_report.html
Figures:
https://julius.ai/files?filename=conservation_by_regime_remapped.png
https://julius.ai/files?filename=cluster_centers_bar_remapped.png
https://julius.ai/files?filename=sequence_counts_bar.png
If you’d like, I can:
Quantify effect sizes and CIs for conservation differences.
Drill into representative reactions per regime and visualize atom-mapped bond changes.
Refine fractal dimension with multi-scale grids and bootstrapping.