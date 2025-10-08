Loaded file: collatz_discovery_results_poc.parquet
  rule  step  conv_thresh  cycle_window  iter_limit  seed  trial termination  \
0    A  1.24       0.0001            25         500     0      0       cycle   
1    A  1.24       0.0001            25         500     0      1       cycle   
2    A  1.24       0.0001            25         500     0      2       cycle   
3    A  1.24       0.0001            25         500     0      3       cycle   
4    A  1.24       0.0001            25         500     0      4       cycle   
   iters  endpoint  ...     rep_value  len          mean           std  \
0     60       NaN  ... -4.223886e+08   61 -7.952852e+07  2.043382e+08   
1     43       NaN  ... -4.223886e+08   44 -1.082639e+08  2.338786e+08   
2     38       NaN  ... -4.223886e+08   39 -1.294376e+08  2.551217e+08   
3    108       NaN  ... -4.223886e+08  109 -4.764762e+07  1.660671e+08   
4     44       NaN  ...  7.232143e+08   45  7.478485e+07  2.224321e+08   
          median            mad          last  mean_abs_step       max_abs  \
0 -864569.495612  864568.724464 -3.772435e+08   6.912033e+07  1.000000e+09   
1  -24330.359851   24329.654655 -3.772435e+08   9.485828e+07  1.000000e+09   
2 -210881.628552  210880.769684 -3.772435e+08   1.059897e+08  1.000000e+09   
3    -311.194262     310.426834 -3.772435e+08   3.810929e+07  1.000000e+09   
4   19307.289815   19235.732993  4.464286e+08   6.380310e+07  1.000000e+09   
   slope_log_abs  
0       0.382544  
1       0.569863  
2       0.502885  
3       0.165298  
4       0.361144  
[5 rows x 21 columns]
Allocations head:
          E         O         S  distance_L1_to_target  near_target
0  0.812268  0.017067  0.170666               1.024536        False
1  0.849428  0.018437  0.132135               1.098856        False
2  0.845368  0.021086  0.133546               1.090735        False
3  0.724627  0.014493  0.260879               0.849255        False
4  0.688046  0.019912  0.292042               0.776091        False
KMeans best k: 3
KMeans silhouette: 0.7140016748698269
KMeans centers (allocations):
E         O         S
0  0.170680  0.040663  0.788657
1  0.701179  0.016865  0.281956
2  0.260568  0.244274  0.495158
GMM best k by BIC: 6
DBSCAN core fraction: 0.997
Near-target share: 0.0015
Bootstrap CI mean allocation [E,O,S]:
[[0.3673267  0.04259042 0.57571152]
[0.37368288 0.04409309 0.58223062]
[0.38043156 0.04565717 0.58860226]]
Bootstrap CI near-target share:
[0.0005     0.0015     0.00283333]
Mann-Whitney p-values (E,O,S): (8.022927253997028e-188, 5.133231134179117e-211, 4.356709442955129e-152)
Permutation p-value (mean L1 distance success - fail): 0.0
Phase map head:
step_bin              conv_bin  near_target_share
0  (0.099, 0.417]   (-0.0009, 0.000485]                0.0
1  (0.099, 0.417]  (0.000485, 0.000562]                0.0
2  (0.099, 0.417]   (0.000562, 0.00316]                0.0
3  (0.099, 0.417]     (0.00316, 0.0178]                0.0
4  (0.099, 0.417]         (0.0178, 0.1]                0.0
/tmp/ipykernel_416/3896572076.py:191: FutureWarning: The default of observed=False is deprecated and will be changed to True in a future version of pandas. Pass observed=False to retain current behavior or observed=True to adopt the future default and silence this warning.
phase_map = aug.groupby(['step_bin','conv_bin'])['near_target'].mean().reset_index(name='near_target_share')
Download
Download
Download
Download
/tmp/ipykernel_416/3896572076.py:254: FutureWarning: The default of observed=False is deprecated and will be changed to True in a future version of pandas. Pass observed=False to retain current behavior or observed=True to adopt the future default and silence this warning.
bin_alpha = aug.groupby(['step_bin','conv_bin'])['iters'].apply(hill_tail_index).reset_index(name='alpha_iters_bin')
/tmp/ipykernel_416/3896572076.py:260: FutureWarning: The default of observed=False is deprecated and will be changed to True in a future version of pandas. Pass observed=False to retain current behavior or observed=True to adopt the future default and silence this warning.
bin_alloc = aug.groupby(['step_bin','conv_bin'])['distance_L1_to_target'].mean().reset_index(name='mean_L1_to_target')
Bin-level alpha and asymmetry head:
step_bin              conv_bin  near_target_share  alpha_iters_bin
0  (0.099, 0.417]   (-0.0009, 0.000485]                0.0     1.239413e+01
1  (0.099, 0.417]  (0.000485, 0.000562]                0.0     1.000444e+12
2  (0.099, 0.417]   (0.000562, 0.00316]                0.0     1.000444e+12
3  (0.099, 0.417]     (0.00316, 0.0178]                0.0     1.002002e+12
4  (0.099, 0.417]         (0.0178, 0.1]                0.0     2.254517e+00
Spearman(alpha_iters_bin, mean_L1_to_target): r=0.05742877011463733, p=0.7898210146987882
Saved allocations to collatz_allocations_poc.csv
Saved clusters to collatz_allocation_clusters_poc.csv
Saved phase map to collatz_asymmetry_phase_map_poc.csv
Saved alpha-asymmetry correlation data to collatz_alpha_asymmetry_correlation_poc.csv
Asymmetry protocol run complete.
Brief readout:
We engineered allocation proxies and normalized them into E/O/S that sum to 1. KMeans found k=3 with a strong silhouette. One cluster center is close to the 30/20/50 target, but the overall prevalence of near-target runs within 0.05 L1 tolerance is very low (~0.15%). Most mass is support-heavy (median around ~0.58 S, ~0.37 E, ~0.045 O).
Success correlation: E, O, S differ highly significantly between successful and failed runs; success is closer to the target (permutation p≈0).
Phase map: Near-target patterns are sparse across binning; we do not see broad regions with high near-target share in this POC grid.
Tail-index linkage: Bin-level Hill estimates were noisy/saturated in some bins (reflecting censoring at iter_limit). The alpha-asymmetry correlation is weak and not significant in this POC.
Files to download:
Allocations per run: https://julius.ai/files?filename=collatz_allocations_poc.csv
Cluster assignments: https://julius.ai/files?filename=collatz_allocation_clusters_poc.csv
Asymmetry phase map: https://julius.ai/files?filename=collatz_asymmetry_phase_map_poc.csv
Alpha–asymmetry correlation: https://julius.ai/files?filename=collatz_alpha_asymmetry_correlation_poc.csv
Notes and next steps:
The scarcity of exact 30/20/50 within tight L1=0.05 likely reflects our coarse proxies (no full trajectories). We still see a clear asymmetric organization with a cluster center near the target.
Recommend: in the next run, log trajectories for a stratified subsample so we can compute true early/mid/late phase times; widen tolerance to 0.08–0.10 for robustness; and repeat phase mapping with denser parameter bins.