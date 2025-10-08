Per-step trajectory head:
   traj_id  t         E         O         S               regime rule  step  \
0        0  0  0.323325  0.000588  0.676088  Balanced-asymmetric    B   0.1   
1        0  1  0.265233  0.031540  0.703227     Support-dominant    B   0.1   
2        0  2  0.195948  0.014953  0.789100     Support-dominant    B   0.1   
3        0  3  0.097343  0.002282  0.900375     Support-dominant    B   0.1   
4        0  4  0.039923  0.000001  0.960076     Support-dominant    B   0.1   
   conv_thresh  cycle_window  iter_limit          seed_regime  
0          0.1         100.0      2000.0  Balanced-asymmetric  
1          0.1         100.0      2000.0  Balanced-asymmetric  
2          0.1         100.0      2000.0  Balanced-asymmetric  
3          0.1         100.0      2000.0  Balanced-asymmetric  
4          0.1         100.0      2000.0  Balanced-asymmetric  
Trajectory summary head:
   traj_id          seed_regime  switches  mean_dwell  max_dwell  volatility
0        0  Balanced-asymmetric         4   40.000000      144.0    0.014724
1        1  Balanced-asymmetric         5   33.333333      154.0    0.021695
2        2  Balanced-asymmetric         1  100.000000      189.0    0.019650
3        3  Balanced-asymmetric         3   50.000000      184.0    0.021231
4        4  Balanced-asymmetric         3   50.000000      194.0    0.020613
Transition matrix P (rows: from, cols: to) in reg_order Support, Exploration, Balanced:
[[0.983 0.    0.017]
 [0.    0.991 0.009]
 [0.031 0.025 0.944]]
Stationary distribution:
                 regime  stationary_prob
0      Support-dominant         0.333613
1  Exploration-dominant         0.484321
2   Balanced-asymmetric         0.182066
Dwell durations head:
regime  duration
0  Balanced-asymmetric         1
1     Support-dominant        50
2  Balanced-asymmetric         1
3     Support-dominant         4
4  Balanced-asymmetric       144
ROC AUC for switch prediction from regime Support-dominant: 0.9795740454332618
ROC AUC for switch prediction from regime Exploration-dominant:
0.9890845932523524
ROC AUC for switch prediction from regime Balanced-asymmetric:
0.686246398641113
Saved full per-step trajectories to collatz_multi_regime_traj_full_steps_poc.csv
Saved transition matrix to collatz_transition_matrix_poc.csv
Saved stationary distribution to collatz_stationary_distribution_poc.csv
Saved dwell survival to collatz_dwell_survival_poc.csv
Saved dwell hazard to collatz_dwell_hazard_poc.csv
Phase 4A — Transition Intelligence
Transition matrix and stationary distribution computed across all surrogate trajectories. Rows are from-regime; columns to-regime in order [Support, Exploration, Balanced]. Stationary distribution shows the long-run equilibrium mix implied by the observed transitions.
Phase 4B — Survival Dynamics
Survival curves S(t) by regime: persistence probability of remaining in the same regime at least t steps.
Hazard rates h(t) by regime: conditional probability of switching exactly at t given survival up to t.
Interpretation: where hazard rises, the regime becomes less stable as time elapses; plateaus indicate longer “attention spans.”
Phase 4C — Trigger Mechanisms
Immediate switch probability P(switch at next step) estimated over step and conv_thresh bins for each regime, plus logistic models predicting switching using step, conv_thresh, and current allocations E/O/S.
ROC AUC indicates high predictability of switches from Support and Exploration regimes, moderate from Balanced. Heatmaps reveal “crisis zones” where switch odds spike.
Phase 4D — Complete Trajectory Export
Full per-time-step trajectories saved, along with all artifacts.