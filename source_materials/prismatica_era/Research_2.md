Given that we have reduced to TREE EVALUATION, it may be instructive to think about what is happening in the final algorithm, conceptually. At a high level, for our instances of TREE EVALUATION, the
Cook-Mertz procedure on RG′ uses O((t(n)/b(n)) · log b(n)) space to specify the current node v of G′
being examined (given by a path from that node v to the node (1, B)) as well as an element from a field of
size poly(b(n)) for each node along that path. The algorithm also reuses O(b(n)) space at each node, in
order to compute low-degree extensions of the function Fh,i by interpolation over carefully chosen elements
of the field. For our setting of b(n), we are using equal amounts of space to store a path in the graph G′
labeled with field elements, and to compute a low-degree extension of the “block evaluation” function Fh,i
at each node (with aggressive reuse of the latter space, at every level of the tree).
3.3 On Possibly Removing the Square-Root-Log Factor
We observe that, if TREE EVALUATION turns out to be in LOGSPACE = SPACE[log n], then we would
obtain a simulation that runs in O(b
′ + t(n)/b′
) space when the number of children is upper bounded by a
constant. This is due to our succinct encoding of the computation graph, which only needs O(b
′
) space to
be stored. Setting b
′ =
p
t(n), this would remove the pesky O(
√
log t) factor from our space bound above:
Corollary 3.6. If TREE EVALUATION is in LOGSPACE, then TIME[t(n)] ⊆ SPACE[
p
t(n)].
There may be a path to removing the √
log t factor that does not require solving TREE EVALUATION
in logspace. The simulations of time t building on Hopcroft-Paul-Valiant [HPV75, PV76, PR81, DT85,
HLMW86], which save a log t factor in space and alternating time, utilize strategies which seem orthogonal
to our approach via TREE EVALUATION. Roughly speaking, there are two kinds of strategies: a pebbling
strategy on computation graphs which minimizes the total number of pebbles needed [HPV75, PR81], and
a recursive composition strategy which cuts the graph into halves and performs one of two recursive approaches based on the cardinality of the cut [PV76, DT85, HLMW86].7 Neither of these seem comparable
to the Cook-Mertz algorithm. However, so far we have been unable to merge the TREE EVALUATION
approach and the other strategies. The following hypothesis seems plausible:
Hypothesis 3.7. For “reasonable” b(n) and t(n), time-t(n) multitape computations can be space-efficiently
reduced to TREE EVALUATION instances with constant degree d, height O(t(n)/b(n))/ log(t(n)/b(n)), and
functions from O(b)-bits to b-bits at each inner node.
Results such as [PV76, DT85] which show that TIME[t] ⊆ ATIME[t/ log t] and that circuits of size
t can be simulated in depth O(t/ log t), prove that the hypothesis is actually true for b = Θ(1). If the
hypothesis is also true for b =
√
t, then we could conclude TIME[t] ⊆ SPACE[
√
t], by applying Cook and
Mertz (Theorem 2.2).
3.4 Extension to Higher Dimensional Tapes
The simulation of Theorem 1.1 extends to Turing machines with higher-dimensional tapes. The proof is
very similar in spirit to Theorem 1.1, but a few crucial changes are needed to carry out the generalization.
Reminder of Theorem 1.5. Every decision problem solvable by a t(n)-time d-dimensional multitape
Turing machine can be decided in O((tlog t)
1−1/(d+1)) space.
7There is even a third strategy, based on an “overlap” argument [AL81].
13
Proof. (Sketch) As there is no d-dimensional version of block-respecting Turing machines, we have to take
a different approach. Similarly to Theorem 3.1 and Paul-Reischuk [PR80], we upper-bound the number of
tape blocks that may be relevant to any given time block, and use that information to construct a series of
TREE EVALUATION instances.
Suppose our time-t(n) Turing machine M has p tapes which are d-dimensional, and we wish to simulate
M on an input x of length n. We assume x is written on the first tape in a single direction starting from the
cell indexed by (0, . . . , 0) ∈ N
d
. (For concreteness, for i = 1, . . . , n we may assume the i-th bit of x is
written in the cell (0, . . . , 0, i − 1) ∈ N
d
.)
For a parameter c, we partition the time t(n) into time blocks of length c, so there are B = ⌈t(n)/c⌉
total time blocks. Besides time blocks 1, . . . , B, we also define a time block 0 (similarly to Theorem 3.1
and Theorem 1.1). Each d-dimensional tape is partitioned into tape blocks of b = c
d
contiguous cells: in
particular, each tape block is a d-dimensional cube with side-length c in each direction. Observe that each
tape block has up to 3
d − 1 adjacent tape blocks in d dimensions. We define a tape block T to be active in
time block i > 1 if some cells of T are accessed during time block i, and all tape blocks are defined to be
active in time block 0. Since each time block is only for c steps and each tape block has side-length c in
each direction, observe that for each i ∈ [B] and each tape h ∈ [p], there are at most 2
d blocks of tape h
that may be active during time block i. Therefore across all p tapes, the total number of active blocks is at
most 2
d
· p. Note that each active tape block of tape h during time block i can be indexed by some vector in
{−1, 0, 1}
d
indicating its position relative to the tape block in which tape h started the time block.
Similar to the proofs of Theorem 3.1 and Theorem 1.1, we define a computation graph GM,x. The set of
nodes will be the set S = {(h, i) | h ∈ [p], i ∈ [B]} unioned with a subset T ⊆ {(h, 0, v) | h ∈ [p], v ∈ N
d},
where |T| ≤ p · B.
Each node will have a content value as before. The content(h, 0, v) nodes will store a portion of the
input, or the all-blank content, depending on the vector v ∈ N
d
. The vector v gives the index of a block of
tape h. (In the one-dimensional case, the tape blocks were simply indexed by N.) The content(h, i) nodes
will store information at the end of time block i: the state of M′
, the head position of tape h, and a list of the
contents of those blocks of tape h that are active during time block i. Note that content(h, i) can be encoded
in O(2d
· b(n)) bits.
As before, we label each node (h, i) ∈ [p] × [B] to indicate the head movements between time blocks,
but our labels are more complicated than before. We use a d-dimensional vector m(h,i) ∈ {−1, 0, 1}
d
to
indicate the difference between the index of the tape block u(h,i) ∈ N
d
that tape head h is in at the start of
time block i, and the index of the tape block v(h,i) ∈ N
d
that head h is in at the end of time block i. We
have v(h,i) − u(h,i) ∈ {−1, 0, 1}
d
, since every time block takes c steps and the side-length of a tape block
is c cells. We also label each node with a list L(h,i) of up to 2
d other vectors in {−1, 0, 1}
d
, describing the
indices of all other blocks of tape h that are active in time block i. Observe that the vectors m(h,i) and the
lists L(h,i) over all nodes can be encoded in O(d · 2
d
· B) ≤ O(B) bits. Moreover, given the vectors m(h,i)
and the lists L(h,i)
, we can reconstruct any v(h,i) and u(h,i)
in only logspace by maintaining counters.
As before, we put an edge from (h, i) to (h
′
, j) if either
• j = i + 1, or
• i < j and there is some tape block active on tape h in both time blocks i and j that is not active for
all time blocks i + 1 through j − 1.
We put an edge from (h, 0, v) to (h
′
, j) if during time block j, the tape head h accesses the tape block
indexed by v for the first time in the computation.
14
We observe that the indegree of each (h, i) is at most (2d + 1)· p: there are at most 2
d
active tape blocks
for each of the p tapes, each of which may require information from a different previous node, and there are
also p edges from the previous time block providing the state and head positions at the start of time block i.
Generalizing Claim 3.4 and Claim 3.5, we claim that the edges of GM,x can be determined in logspace,
given the vectors m(h,i) and the lists L(h,i) encoded in O(B) bits. We enumerate over all possible computation graphs G′
, using this encoding. Note that the encoding also allows us to determine which source nodes
(h, 0, v) appear in G′
, by tracking the tape head movements as claimed by the vectors m(h,i) and the lists
L(h,i)
, and noting when a tape head h enters a new block that has not been accessed before.
For each node (h, i), the evaluation function Fh,i is defined similarly as in the proofs of Theorem 3.1
and Theorem 1.1. Given all the necessary information at the start of a time block: the state q, the contents
of the (at most) 2
d
· p active blocks, and each of the p head positions encoded in O(d log t) bits, the function
Fh,i computes content(h, i): it simulates M for c steps on the active blocks, then outputs updated contents
of all O(2d
) active blocks on tape h, in b
′ ≤ O(2d
· c
d + 2d
· d log t) bits for some b
′ = Θ(c
d
), including the
head position of tape h at the end of the time block and the state q
′
reached.
As before, Fh,i checks that the claimed active tape blocks in L(h,i) and the claimed vector m(h,i) are
consistent with the simulation of time block i; if they are not, then Fh,i outputs FAIL and we design the
Fh,i as before so that a single FAIL value is propagated to the root of RG′. We can think of each Fh,i as a
mapping from (2d + 1)· p · b
′ bits to b
′ bits, where we allow a special encoding to “pad” the input and output
when the number of active blocks on some tape is less than 2
d
.
Finally, for each guessed graph G′ we define a TREE EVALUATION RG′ instance analogously as in
the proof of Theorem 1.1. The root of the tree corresponds to the node (1, B), where we wish to check if
content(1, B) contains the accept or reject state. The children of a given node in the tree RG′ are determined directly by the predecessors of the corresponding node in GM,x. The leaves correspond to the nodes
(h, 0, v) in GM,x such that content(h, 0, v) contains either an all-blank d-dimensional cube of c
d
cells, or a
d-dimensional cube of c
d
cells which includes up to c symbols of the input x and is otherwise all-blank.
As before, if a call to TREE EVALUATION for some RG′ ever returns an answer other than FAIL, we
return the appropriate accept/reject decision. If all calls FAIL, we increment the guess for the running time
t(n) and try again.
Our TREE EVALUATION instance RG′ has height at most B = ⌈t(n)/c⌉, where each inner node has at
most (2d+1)·p children, working on blocks of bitlength 2
d
·b
′ ≤ O(c
d+d log t). Applying the Cook-Mertz
algorithm for TREE EVALUATION, recalling that d and p are both constants, and including the O(B) bits
we use to encode a candidate graph G′
, we obtain a simulation running in space
O

c
d + d log t +
t(n)
c
· log(c
d
)

≤ O

c
d +
t(n)
c
· log t(n)

,
since c ≤ t(n) and d is constant.
Setting c = (t(n) log t(n))1/(d+1), the resulting space bound is O((t(n) log t(n))1−1/(d+1)).
We remark that putting TREE EVALUATION in LOGSPACE would also directly improve the above simulation as well, to use O(t(n)
1−1/(d+1)) space.
4 Some Consequences
First, we describe some simple lower bounds that follow by diagonalization. We will use the following form
of the space hierarchy theorem:
15
Theorem 4.1 ([SHL65]). For space constructible s
′
(n), s(n) ≥ n such that s
′
(n) < o(s(n)), we have
SPACE[s(n)] ̸⊂ SPACE[s
′
(n)].
Reminder of Corollary 1.2. For space constructible s(n) ≥ n and all ε > 0, SPACE[s(n)] ̸⊂
TIME[s(n)
2−ε
].
Proof. Assume to the contrary that SPACE[s(n)] ⊆ TIME[s(n)
2−ε
] for some ε > 0 and some space constructible s(n). By Theorem 1.1, we have
SPACE[s(n)] ⊆ TIME[s(n)
2−ε
] ⊆ SPACE[(s(n)
2−ε
log s(n))1/2
] ⊆ SPACE[s
′
(n)]
for a function s
′
(n) which is o(s(n)). This contradicts Theorem 4.1.
Reminder of Corollary 1.3. The language L = {⟨M, x, 1
k
⟩ | |M| ≤ k and M(x) halts in space k}
requires n
2−ε
time to solve on a multitape Turing machine, for every ε > 0.
Proof. Suppose L can be solved in n
2−ε
time for some ε > 0. We show every language in SPACE[n] could
then be solved in time O(n
2−ε
), contradicting Corollary 1.2. Let L
′ ∈ SPACE[n] be decided by a Turing
machine M using space cn for a constant c ≥ 1. Given an input x to M, we call our n
2−ε
time algorithm
for L on the input ⟨M, x, 1
c|x|
⟩ of length n = O(|x|). This takes O(|x|
2−ε
) time, a contradiction.
Observe the same proof also shows a time lower bound of the form n
2/ logc n, for a constant c > 0.
4.1 Subexponential Size Branching Programs for Circuits
Here, we observe that Theorem 1.1 implies that subquadratic size circuits can be simulated with subexponential size branching programs:
Reminder of Corollary 1.4. There is a universal k ≥ 1 such that for all s ≥ n, every bounded fan-in
circuit of size s and n inputs has a branching program of size at most 2
k
√
s logk
s
.
Recall the CIRCUIT EVALUATION problem: given the description of a Boolean circuit C of fan-in two
with one output, and given an input x, does C on x evaluate to 1? We assume C is encoded in topological
order: the gates are numbered 1, . . . , s, and for all i ∈ [s], the i-th gate in the encoding only takes inputs
from gates appearing earlier in the encoding. For simplicity, we further assume each gate i provides a correct
list of all future gates j1, . . . , jk > i that will consume the output of gate i. Note that when s(n) is at least the
number of input bits, we can still afford an encoding of size-s(n) circuits in O(s(n) log s(n)) bits, carrying
this extra information. An old result commonly credited to Pippenger is that CIRCUIT EVALUATION on
topologically-ordered circuits can be efficiently solved on multitape Turing machines:
Theorem 4.2 (Pippenger [Pip77]). CIRCUIT EVALUATION ∈ TIME[n · poly(log n)].
The reference [Pip77] is difficult to find, however the PhD thesis of Swamy ([Swa78, Chapter 2, Theorem 2.1]) gives an exposition of an O(n · (log n)
3
) time bound.8 Swamy describes his construction as
simulating oblivious RAMs / straight-line programs; it readily applies to circuits. The high-level idea is
to solve a more general problem: given the description of a circuit C and input x, we wish to insert the
output values of each gate of C(x) directly into the description of C. To solve this problem on C of size
8Available at http://static.cs.brown.edu/research/pubs/theses/phd/1978/swamy.pdf.
16
s, we first recursively evaluate the circuit on the first ⌊s/2⌋ gates (in topological order) which sets values
to all those gates. We pass over those values, and collect the outputs of all gates among the first ⌊s/2⌋ that
will be used as inputs to the remaining ⌈s/2⌉ gates. We sort these outputs by gate index, then recursively
evaluate the remaining ⌈s/2⌉ gates on x plus the list of outputs. This leads to a runtime recurrence of
T(n) ≤ 2 · T(n/2) + O(n · (log n)
2
) (using the fact that n = Θ(s log s)).
Combining Theorem 4.2 and Theorem 1.1, we directly conclude that CIRCUIT EVALUATION can be
solved in √
n · poly(log n) space. Now, given any circuit C of size s, we hardcode its description into
the input of a multitape Turing machine using s
′
(n) = √
s · poly(log s) space for CIRCUIT EVALUATION.
Applying the standard translation of s
′
(n)-space algorithms into branching programs of 2
O(s
′
(n)) size (see
for instance the survey [Raz91]), Corollary 1.4 follows.
5 Discussion
We have shown that multitape Turing machines and circuits have surprisingly space-efficient evaluation
algorithms, via a reduction to the TREE EVALUATION problem. Two reflective remarks come to mind.
First, we find it very interesting that TREE EVALUATION, which was originally proposed and studied in
the hopes of getting a handle on LOGSPACE ̸= P, may turn out to be more useful for making progress on
P ̸= PSPACE. In any case, it is clear that TREE EVALUATION is a central problem in complexity theory.
Second, we find it fortunate that the main reduction of this paper (from time-t multitape Turing machine
computations to TREE EVALUATION) was found after the Cook-Mertz procedure was discovered. Had our
reduction been found first, the community (including the author) would have likely declared the following
theorem (a cheeky alternative way of presenting the main reduction of Theorem 1.1) as a “barrier” to further
progress on TREE EVALUATION, and possibly discouraged work on the subject:
“Theorem.” Unless the 50-year-old [HPV75] simulation TIME[t] ⊆ SPACE[t/ log t] can be
improved, TREE EVALUATION instances of constant arity, height h, and b-bit values cannot be
solved in o(h · b/ log(h · b)) space.9
Theorem 1.1 and its relatives open up an entirely new set of questions that did not seem possible to ask
before. Here are a few tantalizing ones.
Can the simulation of Theorem 1.1 be improved to show TIME[t] ⊆ SPACE[
√
t]? We discussed
some prospects for a yes-answer in Section 3.3 (e.g., showing TREE EVALUATION is in LOGSPACE). An
interesting secondary question is whether the longstanding O(
√
t)-space simulation of one tape time-t Turing machines [HU68, Pat72] can be improved to O(t
1/2−ε
) space, for some ε > 0.
Is there an ε > 0 such that TIME[t] ⊆ ATIME[t
1−ε
]? Is there a better speedup of time t, using
alternating Turing machines? Recall the best-known simulation is TIME[t] ⊆ ATIME[t/ log t] [DT85]. A
yes-answer to this question would imply (for example) a super-linear time lower bound on solving quantified
Boolean formulas (QBF), which is still open [Wil08, LW13]. Note that if Theorem 1.1 could be improved
to TIME[t] ⊆ SPACE[t
1/2−ε
] for some ε > 0, then we would have TIME[t] ⊆ ATIME[t
1−2ε
].
Can time-t random-access Turing machines be simulated in space O(t
1−ε
), for some ε > 0? As
mentioned in Remark 1.6, the answer is yes for “oblivious” models in which data access patterns can be
calculated in advance. In both Theorem 1.1 and Theorem 1.5, we exploit the locality of low-dimensional
tape storage: without that property, the indegrees of nodes in the computation graph would be rather high,
9Here, we think of o(h · b/ log(h · b)) as shorthand for O(h · b/(f(h · b) · log(h · b))) for some unbounded function f.
17
and (as far as we can tell) the resulting simulation would not improve the known O(t/ log t) space bounds
for simulating t time in random-access models [PR81, HLMW86]. Similarly to the previous question, if
TIME[t] ⊆ SPACE[t
1/2−ε
] for some ε > 0, then for those random-access models where time t can be
simulated by time-O(t
2
) multitape Turing machines, the answer to the question would be yes. On the other
hand, if the answer to the question is no, then we would separate linear time for multitape Turing machines
and linear time for random-access models, another longstanding open question (see for example [GS02]).
Is a time-space tradeoff possible? For example, is TIME[t] ⊆ TIMESPACE[2O˜(t
ε
)
, O˜(t
1−ε
)], for
all ε > 0? The Cook-Mertz procedure needs to compute a low-degree extension of the function at each
node, which is time-consuming: for time blocks of b steps, it takes 2
Θ(b)
time to compute the low-degree
extension at a given point. If low-degree extensions of time-t computations could be computed more timeefficiently, then such a time-space tradeoff may be possible. Note that if the multilinear extension of a
given CNF on n variables and m clauses could be evaluated over a large field in 1.999n
· 2
o(m)
time, then
the Strong Exponential Time Hypothesis would be false: the multilinear extension is the identically-zero
polynomial if and only if the CNF is unsatisfiable, so one could use a version of Schwartz-Zippel to test
for unsatisfiability. However, this observation does not apparently rule out the possibility of evaluating
low-degree but non-multilinear extensions efficiently.
Can the simulation be applied recursively, to show that TIME[t] ⊆ SPACE[t
ε
] for all ε > 0? Note
that a yes-answer would imply P ̸= PSPACE. At first glance, a recursive extension of Theorem 1.1 seems
natural: we decompose a time-t computation into O(t/b) blocks, each of which are time-b computations.
(This property was successfully exploited recursively in [LW13], for example, to show some weak lower
bounds on QBF.) However, we cannot directly apply recursion to time blocks, because in the Cook-Mertz
procedure, the task at each function evaluation is not just to simulate for b steps, but to compute a lowdegree extension of the function (as noted in the previous question). If low-degree extensions of time-t
computations can be computed in small space, then there is a possibility of recursion. However, given the
discussion on the previous question, there is reason to think this will be difficult.
Is there a barrier to further progress? Perhaps lower bounds for the Node-Named Jumping Automata
on Graphs (NNJAG) model (a popular model for restricted space lower bounds) [Poo93, Poo00, EPA99]
could demonstrate a barrier. Many complex algorithms such as Reingold’s [Rei08] can be simulated in the
NNJAG model [LZPC05]; does the Cook-Mertz algorithm have this property as well? We believe the answer
is probably no: NNJAG is fundamentally a node-pebbling model, and the Cook-Mertz procedure definitely
breaks space lower bounds for pebbling DAGs and trees [LT82, CMW+12]. Pebbling lower bounds were a
major bottleneck to improving [HPV75].
While Theorem 1.1 and Theorem 3.1 are non-relativizing, the simulations do permit a restricted form
of relativization, as do all prior simulations of time in smaller space. Define TIME-LENGTHA[t(n), ℓ(n)]
to be the class of problems solvable in O(t(n)) time with queries to the oracle A, where all oracle queries
are restricted to have length at most ℓ(n). Similarly define SPACE-LENGTHA[s(n), ℓ(n)]. We observe the
following extension of Theorem 3.1:
Theorem 5.1. For every oracle A and t(n) ≥ n, TIME-LENGTHA[t(n),
p
t(n) log t(n)] is contained in
SPACE-LENGTHA[
p
t(n) log t(n),
p
t(n) log t(n)].
The theorem follows because each oracle query can be arranged to be written in a single tape block of
length O(
p
t(n) log t(n)), and the Cook-Mertz procedure treats the evaluation functions as black boxes.
(Tretkoff [Tre86] made a similar observation for the simulation of TIME[t] in Σ2TIME[o(t)], of PaulPippenger-Szemeredi-Trotter [ ´ PPST83]. Such a length-restricted oracle model was also studied in [CW06].)
18
Is there a barrier to improving such (restricted) relativizing results to obtain P ̸= PSPACE? This seems related to the fact that Cai and Watanabe [CW06] were unable to collapse PSPACE to P with “random access
to advice” (length-restricted access to oracles).
Acknowledgments. I am grateful to Rahul Ilango, Egor Lifar, Priya Malhotra, Danil Sibgatullin, and Virginia Vassilevska Williams for valuable discussions on TREE EVALUATION and the Cook-Mertz procedure.
I am also grateful to Shyan Akmal, Paul Beame, Lijie Chen, Ce Jin, Dylan McKay, and the anonymous
STOC reviewers for helpful comments on an earlier draft of this paper.
References
[AB09] Sanjeev Arora and Boaz Barak. Computational Complexity - A Modern Approach. Cambridge University Press, 2009. URL: http://www.cambridge.org/catalogue/catalogue.
asp?isbn=9780521424264.
[AL81] Leonard M. Adleman and Michael C. Loui. Space-bounded simulation of multitape turing machines. Math. Syst. Theory, 14:215–222, 1981. URL: https://doi.org/10.1007/
BF01752397.
[CM20] James Cook and Ian Mertz. Catalytic approaches to the tree evaluation problem. In Proceedings of STOC, pages 752–760. ACM, 2020. URL: https://doi.org/10.1145/3357713.
3384316.
[CM21] James Cook and Ian Mertz. Encodings and the tree evaluation problem. Electron. Colloquium
Comput. Complex., TR21-054, 2021. URL: https://eccc.weizmann.ac.il/report/2021/
054.
[CM22] James Cook and Ian Mertz. Trading time and space in catalytic branching programs. In
37th Computational Complexity Conference, CCC, volume 234 of LIPIcs, pages 8:1–8:21.
Schloss Dagstuhl - Leibniz-Zentrum fur Informatik, 2022. URL: ¨ https://doi.org/10.
4230/LIPIcs.CCC.2022.8.
[CM24] James Cook and Ian Mertz. Tree evaluation is in space O(log n · log log n). In Proceedings of
the 56th Annual ACM Symposium on Theory of Computing (STOC), pages 1268–1278. ACM,
2024. URL: https://doi.org/10.1145/3618260.3649664.
[CMW+12] Stephen A. Cook, Pierre McKenzie, Dustin Wehr, Mark Braverman, and Rahul Santhanam.
Pebbles and branching programs for tree evaluation. ACM Trans. Comput. Theory, 3(2):4:1–
4:43, 2012. URL: https://doi.org/10.1145/2077336.2077337.
[CW06] Jin-yi Cai and Osamu Watanabe. Random access to advice strings and collapsing results.
Algorithmica, 46(1):43–57, 2006. URL: https://doi.org/10.1007/s00453-006-0078-8.
[DT85] Patrick W. Dymond and Martin Tompa. Speedups of deterministic machines by synchronous
parallel machines. J. Comput. Syst. Sci., 30(2):149–161, 1985. URL: https://doi.org/10.
1016/0022-0000(85)90011-X.
[EPA99] Jeff Edmonds, Chung Keung Poon, and Dimitris Achlioptas. Tight lower bounds for stconnectivity on the NNJAG model. SIAM J. Comput., 28(6):2257–2284, 1999.
19
[FLvMV05] Lance Fortnow, Richard J. Lipton, Dieter van Melkebeek, and Anastasios Viglas. Time-space
lower bounds for satisfiability. J. ACM, 52(6):835–865, 2005. URL: https://doi.org/10.
1145/1101821.1101822.
[Gol08] Oded Goldreich. Computational complexity - a conceptual perspective. Cambridge University
Press, 2008. URL: https://doi.org/10.1017/CBO9780511804106.
[Gol24] Oded Goldreich. On the Cook-Mertz Tree Evaluation procedure. Electron. Colloquium Comput. Complex., TR24-109, 2024. URL: https://eccc.weizmann.ac.il/report/2024/109.
[GS02] Etienne Grandjean and Thomas Schwentick. Machine-independent characterizations and
complete problems for deterministic linear time. SIAM J. Comput., 32(1):196–230, 2002.
doi:10.1137/S0097539799360240.
[HLMW86] Joseph Y. Halpern, Michael C. Loui, Albert R. Meyer, and Daniel Weise. On time versus space
III. Math. Syst. Theory, 19(1):13–28, 1986. URL: https://doi.org/10.1007/BF01704903.
[HPV75] John E. Hopcroft, Wolfgang J. Paul, and Leslie G. Valiant. On time versus space. J. ACM,
24(2):332–337, 1977. Conference version in FOCS’75. URL: https://doi.org/10.1145/
322003.322015.
[HS66] F. C. Hennie and Richard Edwin Stearns. Two-tape simulation of multitape turing machines.
J. ACM, 13(4):533–546, 1966. URL: https://doi.org/10.1145/321356.321362.
[HU68] John E. Hopcroft and Jeffrey D. Ullman. Relations between time and tape complexities. J.
ACM, 15(3):414–427, 1968. URL: https://doi.org/10.1145/321466.321474.
[IM83] Oscar H. Ibarra and Shlomo Moran. Some time-space tradeoff results concerning single-tape
and offline TM’s. SIAM J. Comput., 12(2):388–394, 1983. URL: https://doi.org/10.
1137/0212025.
[Juk12] Stasys Jukna. Boolean Function Complexity - Advances and Frontiers, volume 27 of
Algorithms and combinatorics. Springer, 2012. URL: https://doi.org/10.1007/
978-3-642-24508-4.
[KLRS12] Subrahmanyam Kalyanasundaram, Richard J. Lipton, Kenneth W. Regan, and Farbod
Shokrieh. Improved simulation of nondeterministic turing machines. Theor. Comput. Sci.,
417:66–73, 2012. URL: https://doi.org/10.1016/j.tcs.2011.05.018.
[KLV03] George Karakostas, Richard J. Lipton, and Anastasios Viglas. On the complexity of intersecting finite state automata and NL versus NP. Theor. Comput. Sci., 302(1-3):257–274, 2003.
URL: https://doi.org/10.1016/S0304-3975(02)00830-7.
[Kur64] S.-Y. Kuroda. Classes of languages and linear-bounded automata. Information and control,
7(2):207–223, 1964.
[LL90] Maciej Liskiewicz and Krzysztof Lorys. Fast simulations of time-bounded one-tape turing
machines by space-bounded ones. SIAM J. Comput., 19(3):511–521, 1990. URL: https:
//doi.org/10.1137/0219034.
20
[Lou81] Michael C. Loui. A space bound for one-tape multidimensional turing machines. Theor. Comput. Sci., 15:311–320, 1981. URL: https://doi.org/10.1016/0304-3975(81)90084-0.
[LT82] Thomas Lengauer and Robert Endre Tarjan. Asymptotically tight bounds on time-space tradeoffs in a pebble game. J. ACM, 29(4):1087–1130, 1982. doi:10.1145/322344.322354.
[LW13] Richard J. Lipton and Ryan Williams. Amplifying circuit lower bounds against polynomial
time, with applications. Comput. Complex., 22(2):311–343, 2013. URL: https://doi.org/
10.1007/s00037-013-0069-5.
[LZPC05] Pinyan Lu, Jialin Zhang, Chung Keung Poon, and Jin-yi Cai. Simulating undirected stconnectivity algorithms on uniform JAGs and NNJAGs. In Proceedings of 16th International
Symposium on Algorithms and Computation (ISAAC), volume 3827 of Lecture Notes in Computer Science, pages 767–776. Springer, 2005. URL: https://doi.org/10.1007/11602613_
77.
[MW17] Cody D. Murray and R. Ryan Williams. Easiness amplification and uniform circuit lower
bounds. In 32nd Computational Complexity Conference (CCC), volume 79 of LIPIcs, pages
8:1–8:21. Schloss Dagstuhl - Leibniz-Zentrum fur Informatik, 2017. URL: ¨ https://doi.
org/10.4230/LIPIcs.CCC.2017.8.
[NW94] Noam Nisan and Avi Wigderson. Hardness vs randomness. J. Comput. Syst. Sci., 49(2):149–
167, 1994. URL: https://doi.org/10.1016/S0022-0000(05)80043-1.
[Pat72] Mike Paterson. Tape bounds for time-bounded turing machines. J. Comput. Syst. Sci.,
6(2):116–124, 1972. URL: https://doi.org/10.1016/S0022-0000(72)80017-5.
[PF79] Nicholas Pippenger and Michael J. Fischer. Relations among complexity measures. J. ACM,
26(2):361–381, 1979. URL: https://doi.org/10.1145/322123.322138.
[Pip77] Nicholas Pippenger. Fast simulation of combinational logic networks by machines without
random-access storage. In Proceedings of the Fifteenth Annual Allerton Conference on Communication, Control and Computing, pages 25–33, 1977.
[Poo93] Chung Keung Poon. Space bounds for graph connectivity problems on node-named jags and
node-ordered jags. In 34th Annual Symposium on Foundations of Computer Science (FOCS),
pages 218–227. IEEE Computer Society, 1993. URL: https://doi.org/10.1109/SFCS.
1993.366865.
[Poo00] Chung Keung Poon. A space lower bound for st-connectivity on node-named jags. Theor.
Comput. Sci., 237(1-2):327–345, 2000. URL: https://doi.org/10.1016/S0304-3975(00)
00019-0.
[PPST83] Wolfgang J. Paul, Nicholas Pippenger, Endre Szemeredi, and William T. Trotter. On deter- ´
minism versus non-determinism and related problems (preliminary version). In 24th Annual
Symposium on Foundations of Computer Science (FOCS), pages 429–438. IEEE Computer
Society, 1983.
[PR80] Wolfgang J. Paul and Rudiger Reischuk. On alternation II. A graph theoretic approach to ¨
determinism versus nondeterminism. Acta Informatica, 14:391–403, 1980. URL: https:
//doi.org/10.1007/BF00286494.
21
[PR81] Wolfgang J. Paul and Rudiger Reischuk. On time versus space II. ¨ J. Comput. Syst. Sci.,
22(3):312–327, 1981. URL: https://doi.org/10.1016/0022-0000(81)90035-0.
[PV76] Mike Paterson and Leslie G. Valiant. Circuit size is nonlinear in depth. Theor. Comput. Sci.,
2(3):397–400, 1976. URL: https://doi.org/10.1016/0304-3975(76)90090-6.
[Raz91] Alexander A. Razborov. Lower bounds for deterministic and nondeterministic branching programs. In Lothar Budach, editor, 8th International Symposium on Fundamentals of Computation Theory (FCT), volume 529 of Lecture Notes in Computer Science, pages 47–60. Springer,
1991. URL: https://doi.org/10.1007/3-540-54458-5_49.
[Rei08] Omer Reingold. Undirected connectivity in log-space. J. ACM, 55(4):17:1–17:24, 2008. doi:
10.1145/1391289.1391291.
[SHL65] Richard Edwin Stearns, Juris Hartmanis, and Philip M. Lewis II. Hierarchies of memory
limited computations. In 6th Annual Symposium on Switching Circuit Theory and Logical
Design, pages 179–190. IEEE Computer Society, 1965. URL: https://doi.org/10.1109/
FOCS.1965.11.
[Sip88] Michael Sipser. Expanders, randomness, or time versus space. J. Comput. Syst. Sci.,
36(3):379–383, 1988. URL: https://doi.org/10.1016/0022-0000(88)90035-9.
[SM73] Larry J. Stockmeyer and Albert R. Meyer. Word problems requiring exponential time: Preliminary report. In Proceedings of STOC, pages 1–9. ACM, 1973. URL: https://doi.org/10.
1145/800125.804029.
[SSZ98] Michael E. Saks, Aravind Srinivasan, and Shiyu Zhou. Explicit or-dispersers with polylogarithmic degree. J. ACM, 45(1):123–154, 1998. URL: https://doi.org/10.1145/273865.
273915.
[SvEB88] Cees F. Slot and Peter van Emde Boas. The problem of space invariance for sequential machines. Inf. Comput., 77(2):93–122, 1988. URL: https://doi.org/10.1016/
0890-5401(88)90052-1.
[Swa78] Sowmitri Swamy. On Space-Time Tradeoffs. PhD thesis, Brown University, USA, 1978. URL:
https://cs.brown.edu/research/pubs/theses/phd/1978/swamy.pdf.
[Tre86] Carol Tretkoff. Bounded oracles and complexity classes inside linear space. In Alan L. Selman, editor, Proceedings of Structure in Complexity Theory, volume 223 of Lecture Notes
in Computer Science, pages 347–361. Springer, 1986. URL: https://doi.org/10.1007/
3-540-16486-3_110.
[vEB90] Peter van Emde Boas. Machine models and simulation. In Jan van Leeuwen, editor, Handbook
of Theoretical Computer Science, Volume A: Algorithms and Complexity, pages 1–66. Elsevier
and MIT Press, 1990.
[Wil08] Ryan Williams. Non-linear time lower bound for (succinct) quantified boolean formulas. Electron. Colloquium Comput. Complex., TR08-076, 2008. URL: https://eccc.weizmann.ac.
il/eccc-reports/2008/TR08-076/index.html.
22
A Appendix: An Overview of The Cook-Mertz Procedure
The goal of this appendix is to describe the Cook-Mertz procedure for TREE EVALUATION, and how it
extends to arbitrary d-ary trees of maximum height h, and not just complete d-ary trees of height h, with the
full set of (d
h − 1)/(d − 1) possible nodes. In particular, any tree with every inner node having at most d
children and depth at most h can be evaluated using their algorithm.
Reminder of Theorem 2.2. [CM24, Theorem 7] TREE EVALUATION on trees of bit-length b, maximum
height h, and fan-in at most d, can be computed in O(d · b + h log(d · b)) space.
Our description below heavily draws from Goldreich’s exposition of the Cook-Mertz procedure [Gol24].
Let us stress that we make absolutely no claims of originality in the exposition below; we are only including
the following in order to make our paper more self-contained.
First, let us describe how to handle inner nodes in the tree which have less than d children. Letting
deg(u) denote the number of children of u, for all j ∈ [b] we let fu,j : {0, 1}
deg(u)·b → {0, 1} be the function
which returns the j-th bit of the function fu computed at node u. For every node u with deg(u) < d, we
add extra children to u which are simply leaves with value 0
b
, so that u has exactly d children. The resulting
new functions fu,j : {0, 1}
d·b → {0, 1} at node u are defined to simply ignore all bits of input with index
larger than deg(u) · b. Now all inner nodes of the tree have exactly d children, and all values of inner nodes
remain the same as before. For our intended application to an implicit TREE EVALUATION instance, we note
that the reduction of this paragraph can also be implemented in a space-efficient way: we only need to be
able to check the number of children of the current node u, which we can easily do in our applications (e.g.,
Theorem 3.1 and Theorem 1.5). In particular, in our reduction the memory stores the entire computation
graph which defines the tree, so we know the number of children of every tree node.
Let F be a field of characteristic two such that |F| ≥ db2
. For a node u and index j ∈ [b], let feu,j be
the multilinear extension (over F) of the function fu,j : {0, 1}
d·b → {0, 1} which returns the j-th bit of the
function fu computed at node u. In particular, feu,j is a polynomial of degree d · b on d · b variables. Letting
⃗xi denote a block of b variables for i = 1, . . . , d,
feu,j ( ⃗x1, . . . , ⃗xd) = X
a1,...,ad∈{0,1}
b
χa1,...,ad
( ⃗x1, . . . , ⃗xd) · fu,j (a1, . . . , ad), (2)
where χa1,...,ad
( ⃗x1, . . . , ⃗xd) is the unique multilinear polynomial of degree d · b such that
χa1,...,ad
(a1, . . . , ad) = 1,
and χa1,...,ad
(a
′
1
, . . . , a′
d
) = 0 for all (a
′
1
, . . . , a′
d
) ∈ ({0, 1}
b
)
d
such that (a
′
1
, . . . , a′
d
) ̸= (a1, . . . , ad).
Let [d]
⋆ be the set of all strings over the alphabet {1, . . . , d} (including the empty string). Observe that
for every node with label u ∈ [d]
⋆
, its children have labels u1, . . . , ud. Thus by definition, the value of u is
vu = fu(vu1, . . . , vud) = (fu,1(vu1, . . . , vud), . . . , fu,b(vu1, . . . , vud)) (3)
= (feu,1(vu1, . . . , vud), . . . , fe
u,b(vu1, . . . , vud)). (4)
The TREE EVALUATION procedure has two types of storage:
• One storage type is “local”, holding the index of the current node (O(h log d) bits), as well as a
recursion stack of height at most h with O(log(d · b)) bits stored at each level of recursion, which is
O(h log(d · b))) bits in total.
23
• The other type of storage is “catalytic” or “global” storage ([Gol24]). This O(d · b) space is used to
store d + 1 separate b-bit blocks. In the final version of the algorithm that we describe, each b-bit
block corresponds to storing O(b/ log |F|) elements of F. These blocks are repeatedly reused at every
node of the tree, to evaluate the functions at each node.
In the following, for simplicity, we will describe an O(d · b log(d · b)) space bound using multilinear
extensions; with minor modifications, Cook-Mertz [CM24] (see also Goldreich [Gol24]) show how
relaxing to merely low-degree extensions allows us to use only O(d · b) space. At the end, we will
discuss how to achieve this space bound.
At any point in time, we will denote the entire storage content of the algorithm by (u, xˆ1, . . . , xˆd, yˆ), where
• u ∈ [d]
⋆
, |u| ≤ h, is the label of a node in the tree, denoting the path from root to that node. (ε denotes
the root node, i ∈ [d] denotes the i-th child of the root, etc.),
• each xˆi
is a collection of b registers xˆ
(1)
i
, . . . , xˆ
(b)
i
holding b elements of F, and
• yˆ is a collection of b registers yˆ
(1)
, . . . , yˆ
(b)
, also holding b elements of F.
Initially, we set the storage content to be
(ε,⃗0, . . . ,⃗0),
i.e., all-zeroes, starting at the root node.
For a node label u, let vu ∈ {0, 1}
b be the value of u; we think of vu as an element of F
b
. Our goal is to
compute vε, the value of the root of the tree. We will give a recursive procedure ADD which takes storage
content (u, xˆ1, . . . , xˆd, yˆ) and returns the content (u, xˆ1, . . . , xˆd, yˆ+ vu). That is, ADD adds the value vu to
the last register, over the field F. Observe that, if ADD works correctly, then calling ADD on (ε,⃗0, . . . ,⃗0)
will put the value of the root node into the last register.
Now we describe ADD. Let m be such that |F| = m + 1 ≥ d · b, and let ω be an m-th root of unity in
F. The following page gives pseudocode for ADD.
24
ADD: Given the storage content (u, xˆ1, . . . , xˆd, yˆ),
If u is a leaf, look up the value vu in the input, and return (u, xˆ1, . . . , xˆd, yˆ + vu).
For i = 1, . . . , m,
For r = 1, . . . , d,
Rotate registers, so (ˆxr, . . . , xˆd, y, ˆ xˆ
′
1
, . . . , xˆ
′
r−1
) shifts to (ˆxr+1, . . . , xˆd, y, ˆ xˆ
′
1
, . . . , xˆ
′
r−1
, xˆr).
Multiply xˆr by ω
i
, and call ADD on (ur, xˆr+1, . . . , xˆd, y, ˆ xˆ
′
1
, . . . , xˆ
′
r−1
, ωi
· xˆr),
which returns (ur, xˆr+1, . . . , xˆd, y, ˆ xˆ
′
1
, . . . , xˆ
′
r−1
, xˆ
′
r
), where xˆ
′
r = ω
i
· xˆr + vur.
(here, ur is just the concatenation of the string u with the symbol r)
(at this point, the storage has the form: (ud, y, ω ˆ
i
· xˆ1 + vu1, . . . , ωi
· xˆd + vud))
Update ud back to u.
For all j = 1, . . . , b,
Compute feu,j (ω
i
· xˆ1 + vu1, . . . , ωi
· xˆd + vud) using O(b) extra space.
Update yˆ
(j) = ˆy
(j) + feu,j (ω
i
· xˆ1 + vu1, . . . , ωi
· xˆd + vud).
Erase the O(b) space used to compute feu,j .
For r = d, . . . , 1,
Call ADD on (ur, xˆr+1, . . . , xˆd, y, ω ˆ
i
· xˆ1 + vu1, . . . , ωi
· xˆr + vur),
which returns (ur, xˆr+1, . . . , xˆd, y, ω ˆ
i
· xˆ1 + vu1, . . . , ωi
· xˆr−1 + vu(r−1), xˆ
′′
r
), where xˆ
′′
r = ω
i
· xˆr.
(note: here we use the fact that F is characteristic two)
Divide xˆ
′′
r by ω
i
, so that xˆ
′′
r = ˆxr.
Rotate registers, so (ˆxr+1, . . . , xˆd, y, ω ˆ
i
· xˆ1 + vu1, . . . , ωi
· xˆr−1 + vu(r−1), xˆr) shifts to
(ˆxr, xˆr+1, . . . , xˆd, y, ω ˆ
i
· xˆ1 + vu1, . . . , ωi
· xˆr−1 + vu(r−1)).
Update u1 back to u.
(claim: now the storage has the form (u, xˆ1, . . . , xˆd, yˆ + feu(vu1, . . . , vud)))
(note that vu = feu(vu1, . . . , vud), by (3) and (4))
Return (u, xˆ1, . . . , xˆd, yˆ + vu).
Recall that F is characteristic two, so that adding vur twice to the register xˆr has a net contribution of zero. The key to the correctness of ADD (and the claim in the pseudocode) is the following
polynomial interpolation formula (proved in [CM24]): for every m-th root of unity ω over F, for every
xˆ1, . . . , xˆd, vu1, . . . , vud ∈ F
b
, and for every polynomial P of degree less than m,
Xm
i=1
P(ω
i
· xˆ1 + vu1, . . . , ωi
· xˆd + vud) = P(vu1, . . . , vud). (5)
(Note that our formula is slightly simpler than Cook-Mertz [CM24] and Goldreich [Gol24], because we
assume F is a field of characteristic two.) Equation (5) ensures that the content of yˆ is indeed updated to be
yˆ + feu(vu1, . . . , vud), which equals yˆ + vu by equations (3) and (4).
Let us briefly compare ADD to the “obvious” algorithm for TREE EVALUATION. The “obvious” algorithm allocates fresh new space for each recursive call to store the values of the children, traversing the tree
in a depth-first manner. Each level of the stack holds O(d · b) bits, and this approach takes Θ(h · d · b) space
overall. In contrast, the algorithm ADD adds the values of the d children to the existing O(d· b log b) content
of the d registers, and uses polynomial interpolation to add the correct value of the node to the last register.
More prescisely, while ADD has no initial control over the content of xˆ1, . . . , xˆd, equation (5) allows
ADD to perform a type of “worst-case to arbitrary-case” reduction: in order to add the value of function fu
25
on specific vu1, . . . , vud to the register yˆ, given that the initial space content is some arbitrary xˆ1, . . . , xˆd, yˆ,
it suffices to perform a running sum from i = 1 to m, where we multiply the xˆ1, . . . , xˆd content by ω
i
, add
vu1, . . . , vud into the current space content, then evaluate the functions ˜fu,j on that content, storing the result
of the running sum into yˆ, which (after summing from i = 1, . . . , m) results in adding the value vu into yˆ.
That is, starting from any arbitrary values in the registers which are beyond our control, we can compute fu
on any desired input registers.
The overall space usage of the above procedure is
O(h · log(d · b) + d · b log(d · b)).
The “local” storage is used to store current values i ∈ [m], r ∈ [d], and O(1) bits to store a program counter
(storing which of the two sets of recursive calls we’re at), at each level of the tree. This takes O(log(d · b))
bits for each level of recursion, and O(h · log(d · b)) space overall. The node index u ∈ [d]
⋆
is also stored,
which takes O(h · log d) bits.
The “global” storage holds the content (ˆx1, . . . , xˆd, yˆ). Each xˆi and y consist of b elements of F, which
take O(b log(d·b)) bits each. To compute the multilinear extension feu,j on (ω
i
·xˆ1+vu1, . . . , ωi
·xˆd+vud), we
follow equation (2): we use O(b) bits of space to sum over all a1, . . . , ad ∈ {0, 1}
b
, and we use O(log |F|) ≤
O(log(d · b)) extra space to evaluate the expression χa1,...,ad
(ω
i
· xˆ1 + vu1, . . . , ωi
· xˆd + vud) and multiply
it with the value fu,j (a1, . . . , ad) ∈ {0, 1}.
Finally, we describe how to improve the space usage to O(h log(d · b) + d · b). The idea is to use
“low-degree extensions” of fu, rather than multilinear extensions, and to group the b-bit output of fu into
approximately ⌈b/ log |F|⌉ blocks, instead of b blocks. In more detail, we modify the polynomials feu,j over
F so that they have O(d · (b/ log |F|)) variables instead of O(d · b) variables, and the j ranges over a set
{1, . . . , ⌈cb/ log |F|⌉} for a constant c > 0, instead of [b] = {1, . . . , b}. To accommodate this, we will need
to adjust the order of F slightly.
Let |F| = 2q
, for an even integer q to be determined later (recall F is characteristic two). Let S ⊆ F
be a set of cardinality 2
q/2
, which is put in one-to-one correspondence with the elements of {0, 1}
q/2
, and
let t = ⌈b/ log |S|⌉. We can then view the function fu : {0, 1}
d·b → {0, 1}
b
as instead having domain
(S
t
)
d
, and co-domain S
t
. That is, we can think of the output of fu as the concatenation of t subfunctions
(fu,1, . . . , fu,t), with each fu,j : (S
t
)
d → S. For each j = 1, . . . , t, the multilinear polynomial feu,j of
equation (2) can then be replaced by another polynomial in d · t variables over F:
feu,j ( ⃗x1, . . . , ⃗xd) = X
a1,...,ad∈St
χa1,...,ad
( ⃗x1, . . . , ⃗xd) · fu,j (a1, . . . , ad), (6)
where again χa1,...,ad
( ⃗x1, . . . , ⃗xd) is a polynomial over F such that χa1,...,ad
(a1, . . . , ad) = 1, and χa1,...,ad
vanishes on all a
′
1
, . . . , a′
d ∈ S
t
such that (a
′
1
, . . . , a′
d
) ̸= (a1, . . . , ad). Such a polynomial χa1,...,ad
can be
constructed with degree d ·(|S| − 1)· t = d ·(
p
|F| − 1)· t. As long as this quantity is less than |F|, we can
pick an m-th root of unity ω with m = |F| − 1 and we may apply the polynomial interpolation formula of
equation (5). WLOG, we may assume d and b are even powers of two (otherwise, we can round them up to
the closest such powers of two). Setting 2
q = d
2
b
2
, we have
d · (|S| − 1) · t ≤ d · (d · b − 1) · b < d2
b
2 = |F|.
As a result, each of the registers xˆ1, . . . , xˆd, yˆ can now be represented with t = ⌈b/ log |S|⌉ elements
of F, rather than b elements of F as before. Since log |S| = Θ(log |F|), each such register can now be
represented with O(d · b) bits instead, and the new polynomials of (6) can still be evaluated in O(b) space.
26
ECCC ISSN 1433-8092
https://eccc.weizmann.ac.il