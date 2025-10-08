Simulating Time With Square-Root Space*
Ryan Williams†
MIT
February 24, 2025
Abstract
We show that for all functions t(n) ≥ n, every multitape Turing machine running in time t can
be simulated in space only O(
√
tlog t). This is a substantial improvement over Hopcroft, Paul, and
Valiant’s simulation of time t in O(t/ log t) space from 50 years ago [FOCS 1975, JACM 1977]. Among
other results, our simulation implies that bounded fan-in circuits of size s can be evaluated on any input
in only √
s · poly(log s) space, and that there are explicit problems solvable in O(n) space which require
n
2−ε
time on a multitape Turing machine for all ε > 0, thereby making a little progress on the P versus
PSPACE problem.
Our simulation reduces the problem of simulating time-bounded multitape Turing machines to a
series of implicitly-defined Tree Evaluation instances with nice parameters, leveraging the remarkable
space-efficient algorithm for Tree Evaluation recently found by Cook and Mertz [STOC 2024].
*To appear in STOC 2025.
†Work supported in part by NSF CCF-2127597 and NSF CCF-2420092.
ISSN 1433-8092
Electronic Colloquium on Computational Complexity, Report No. 17 (2025)
1 Introduction
One of the most fundamental questions in theoretical computer science is: how does time relate to space,
in computation? For instance, can every problem solvable in polynomial space (PSPACE) also be solved in
polynomial time (P)? Although it is widely believed that P ̸= PSPACE, there has been scant progress on
separating time and space over the decades [SHL65, HU68, SM73, HPV75, PR81, HLMW86]. In particular,
for general models of computation (beyond one-tape models), only time lower bounds of the form Ω(n log n)
have been reported for linear-space problems, whereas P ̸= PSPACE requires showing that there is a linearspace problem that cannot be solved in O(n
k
) time for every constant k ≥ 1.
In this paper, we make another step towards separating P from PSPACE, by showing that there are
problems solvable in O(n) space that cannot be solved in n
2/ logc n time for some constant c > 0. This
is the first generic polynomial separation of time and space in a robust computational model (namely, the
multitape Turing machine). The separation is accomplished by exhibiting a surprisingly space-efficient
simulation of generic time-bounded algorithms. More formally, let TIME[t(n)] be the class of decision
problems decided by O(t(n))-time multitape Turing machines, and let SPACE[s(n)] the class decided by
O(s(n))-space multitape Turing machines.
Theorem 1.1. For every function t(n) ≥ n, TIME[t(n)] ⊆ SPACE[
p
t(n) log t(n)].
We find Theorem 1.1 to be very surprising. It appears to have been a common belief for decades that t
time cannot be simulated in t
1−ε
space, for any constant ε > 0. For example, assuming that t time cannot
be simulated in t
1−ε
space, Sipser gave a poly-time derandomization of RP [Sip88]
1
and Nisan-Wigderson
gave a subexponential-time derandomization of BPP ([NW94, Section 3.6]).2
Given the power of multitape Turing machines, Theorem 1.1 has many interesting consequences. Along
with the ability to evaluate generic straight-line programs of length n (over a bounded domain) in only
O˜(
√
n) space (see Section 4.1), Theorem 1.1 immediately implies by diagonalization that there are s(n)-
space problems that cannot be solved in s(n)
2−ε
time for all ε > 0: a “truly-polynomial” time lower bound.
Corollary 1.2. For space constructible s(n) ≥ n, and all ε > 0, SPACE[s(n)] ̸⊂ TIME[s(n)
2−ε
].
Similarly, if Theorem 1.1 could be extended to show for all ε > 0 that every time-t(n) Turing machine
can be simulated in O(t(n)
ε
) space, then P ̸= PSPACE would follow (see the arguments in Section 4). We
discuss this possibility at the end of the paper, in Section 5. It follows from Corollary 1.2 that any complete
problem for linear space requires quadratic time to be solved. For example:
Corollary 1.3. The language L = {⟨M, x, 1
k
⟩ | |M| ≤ k and M(x) halts in space k} requires n
2−ε
time
to solve on a multitape Turing machine, for every ε > 0.
Another consequence is that there are context-sensitive languages which need essentially n
2
time to be
recognized by multitape Turing machines. This follows from the fact that NSPACE[n] (nondeterministic
linear space) is equivalent to the class of context-sensitive languages [Kur64].
Since multitape Turing machines can evaluate any circuit of size s (and fan-in two) on any given input
of length n ≤ s in only s · poly(log s) time [Pip77], it follows that arbitrary subquadratic-size circuits can
be simulated by subexponential-size branching programs.3
1
Sipser also assumed explicit constructions of certain bipartite expander graphs, which were later constructed [SSZ98].
2Note that the derandomization of Nisan and Wigderson can also be based on assuming the weaker hypothesis TIME[t] ̸⊂
Σ2TIME[t
1−ε
], which remains open and almost certainly cannot be refuted using the ideas of this paper.
3Unfortunately, the reference [Pip77] does not seem to be available online. See Section 4.1 for an alternative sketch of the
argument.
1
Corollary 1.4. There is a universal k ≥ 1 such that for all s ≥ n, every bounded fan-in circuit of size s and
n inputs has a branching program of size at most 2
k
√
s logk
s
.
It is an interesting question whether the simulation of Theorem 1.1 can be extended beyond multitape
Turing machines, to more powerful computational models. We can generalize Theorem 1.1 to d-dimensional
multitape Turing machines, as follows:
Theorem 1.5. Every decision problem solvable by a t(n)-time d-dimensional multitape Turing machine can
be decided in O((t(n) log t(n))1−1/(d+1)) space (on a typical one-dimensional multitape Turing machine).
The space bound of Theorem 1.5 matches the best known space bounds for simulating time-t machines
with one d-dimensional tape [Lou81, LL90]. See Section 2.1 for more references on prior simulations.
Remark 1.6 (Extension to Oblivious Random-Access Models). At the present time, we do not know how to
extend Theorem 1.1 to arbitrary random-access models of computation. The main issue is that the indegree
of the resulting computation graph (defined in Section 3) is so high that the computation graph cannot be
stored in O(t
1−ε
) memory. However, we remark that if the pattern of reads and writes of a given randomaccess machine model is oblivious, in the sense that given a step-count i = 1, . . . , t specified in O(log t)
bits, the names of the registers being accessed in step i can be computed in O(
√
t) space, then Theorem 1.1
does apply, with only a poly(log t) extra space factor. This is because such machines can be simulated by
circuits of t · poly(log t) size, which can in turn be simulated efficiently by multitape Turing machines in
t · poly(log t) time (see Section 4.1).
1.1 Intuition
The key idea behind Theorem 1.1 is to reduce the problem of simulating arbitrary time-bounded computations to particular instances of the TREE EVALUATION problem, defined by S. Cook, McKenzie, Wehr,
Braverman, and Santhanam [CMW+12]. In this problem, one is given a complete d-ary tree of height h,
where each leaf of the tree is labeled with a b-bit string, and each inner node of the tree is labeled with a
function from d · b bits to b bits.4
(Each function is presented as a table of 2
d·b values, each of which are b
bits.) Each inner node computes its value by evaluating its function on the values of its d children. The task
of TREE EVALUATION is to determine the value of the root of the tree. To make this a decision problem, we
will decide whether the first bit of the root’s value equals 1 or not.
The obvious depth-first algorithm for TREE EVALUATION uses O(d · b · h) space, to store intermediate
results at each level of the tree. The authors of [CMW+12] conjectured that TREE EVALUATION is not in
NL, which would separate NL from P (in fact, stronger separations would hold). Recent algorithmic work
has led to significant skepticism that this conjecture is true. In a line of work, J. Cook and Mertz have found
surprisingly space-efficient methods for TREE EVALUATION [CM20, CM21, CM22, CM24], culminating
in a marvelous algorithm using space only O(d · b + h log(d · b)) ([CM24, Theorem 7], see Appendix A).
Utilizing the old notion of “block-respecting” Turing machines [HPV75], we show how to reduce time-t
computations to (implicitly defined) TREE EVALUATION instances of height h = Θ(t/b), bit-length b, and
fan-in d, where b is a parameter from 1 to t that we can choose, and d is a fixed constant depending on
the machine. In particular, one can generate arbitrary bits of our TREE EVALUATION instance in a spaceefficient way as needed.
4Our notation is slightly different from the usual setup, where there is a parameter k = 2b
. Here, our notation more closely
follows Goldreich’s exposition [Gol24].
2
Very roughly speaking, each level of the tree will correspond to a “time block” of b steps, and the value
of each node v of the tree will be a “block of tape” of length Θ(b) (a sequence of Θ(b) contiguous cells)
from some particular tape of a k-tape Turing machine; the value of the root will contain the contents of the
final tape block of the computation, including the relevant accept/reject state. The evaluation function Fv at
node v will simulate the Turing machine for Θ(b) steps, using the contents of k tape blocks of length Θ(b)
from previous time blocks; this Fv can be computed in O(b) time and space, given the relevant contents of
O(b)-length tape blocks from all k tapes and the state from the previous time block. (The leaves of the tree
roughly correspond to strings of Θ(b) blank symbols, or a block of Θ(b) symbols from the input x.) We end
up with a TREE EVALUATION instance of height h = O(t/b) and fan-in d = O(1), where Θ(b) steps of the
Turing machine are processed at each node, and where each node is labeled with a string of about Θ(b) bits.
(There are several technical details to worry over, such as the problem of knowing which tape blocks to use
at each time step, but this is the high-level idea.)
Observe that, under the above parameter settings, the obvious depth-first TREE EVALUATION procedure
would yield an algorithm running in Θ(h · b) = Θ(t) space. Applying the Cook-Mertz procedure, and
setting d · b = h log(d · b) = Θ(t · log(d · b)/b) to optimize the space usage, we find b = Θ(√
tlog t) and
obtain the O(
√
tlog t) space bound of Theorem 1.1.
Organization. Section 2 discusses preliminaries (which we do not recommend skipping, but it is short).
Section 3 begins by proving a short “warm-up” simulation (Theorem 3.1) which already achieves O(
√
tlog t)
space and gives many of the key ideas. Section 3.2 proves Theorem 1.1, discusses the possibility of improvement, and proves Theorem 1.5. Section 4 discusses various corollaries mentioned earlier, and Section 5
concludes with a number of new directions to consider.
2 Preliminaries
We assume the reader is familiar with basic notions in time and space bounded complexity [Gol08, AB09].
There are a few pieces not covered in the usual complexity textbooks which are important for this work.
Robustness of Space Complexity. It is important to recall that the class of problems SPACE[s(n)] is
robust under changes in the definition of the underlying machine model. For essentially any model (with
sequential access versus random access, or tapes versus registers) that measures space usage by the total
number of bits needed to represent the storage, SPACE[s(n)] is the same complexity class. This is part of
what is known as the “invariance thesis” [SvEB88, vEB90]. As a consequence, we do not have to worry
much about machine models when we’re trying to design a space s(n) algorithm and we’re ignoring time
complexity. This allows us to be more lax in our exposition.
Block-Respecting Turing Machines. In our main simulation (Theorem 1.1) we will utilize a construction
to simplify the analysis of multitape Turing machines. The construction was originally used by Hopcroft,
Paul, and Valiant [HPV75] in their O(t/ log t)-space simulation of t time, and it has been used in many
subsequent works to “decompose” time-bounded computations (such as [PPST83, KLV03, KLRS12, LW13,
MW17]). A time-t(n) block-respecting multitape Turing machine with blocks of length b(n) has the property
that on all inputs of length n, the computation is partitioned into O(t(n)/b(n)) time blocks of length b(n),
while each tape is partitioned into O(t(n)/b(n)) contiguous tape blocks of length b(n). The key property
is that for every time block, each tape head is in exactly one tape block during that time block, so that
3
tape heads can switch between tape blocks only at the end of a time block. In particular, every tape head
only crosses from one tape block to another, on time steps that are integer multiples of b(n). A key lemma
of [HPV75] is that every multitape Turing machine can be made block-respecting with low overhead.
Lemma 2.1 ([HPV75]). For every time-constructible b(n), t(n) such that log t(n) ≤ b(n) ≤ t(n) and
every t(n)-time ℓ-tape Turing machine M, there is an equivalent O(t(n))-time block-respecting (ℓ + 1)-
tape Turing machine M′ with blocks of length b(n).
The Tree Evaluation Problem. As mentioned earlier, we will reduce time-t computations to the TREE
EVALUATION problem. Our formulation of TREE EVALUATION will be relaxed from the original notion:
we allow a tree of height at most h, where each inner node v of the tree has kv ≤ d children for some integer
kv ≥ 2 depending on v, and v is labeled with a function from kv · b bits to b bits. As before, each leaf is
labeled with a b-bit string, and we wish to determine the first bit of the root’s value. Prior work on TREE
EVALUATION assumed a complete d-ary tree where all root-to-leaf paths have length equal to h; in our
setting, we allow some paths to have length than h, and some nodes to have fewer than d children. However,
the algorithm of Cook and Mertz works just as well in our relaxed formulation:
Theorem 2.2 ([CM24], Theorem 7). TREE EVALUATION on trees of bit-length b, maximum height h, and
fan-in at most d, can be computed in O(d · b + h log(d · b)) space.
In Appendix A, we give an overview of how the Cook-Mertz algorithm works, and describe why it
extends to our case.
2.1 More Related Work
As mentioned earlier, Hopcroft, Paul, and Valiant showed that time-t multitape Turing machines can be
simulated in O(t/ log t) space [HPV75]. This simulation was later extended beyond the multitape model,
yielding a more space-efficient simulation for essentially all common models of computation used in algorithms and complexity [PR81, HLMW86]. Paterson and Valiant [PV76] showed that circuits of size s
can be simulated by depth O(s/ log s) circuits, implying a space-efficient simulation of circuits. Similarly,
Dymond and Tompa [DT85] showed that time t can be simulated in alternating time O(t/ log t).
For decades, a square-root space simulation of the form in Theorem 1.1 has been known for one-tape
Turing machines: Hopcroft and Ullman [HU68] showed that time-t Turing machines with one read-write
tape can be simulated in space O(
√
t). Other improvements on this simulation (e.g., improving the time of
the simulation, improving the model(s) slightly) include [Pat72, IM83, LL90].
Paul, Pippenger, Szemeredi, and Trotter [ ´ PPST83] proved the separation NTIME[n] ̸= TIME[n] for
multitape Turing machines. Unfortunately, their proof only works for (one-dimensional) multitape Turing
machines, and it is infamously still open to prove NTIME[n] ̸= TIME[n] in more general models. We prove
Theorem 1.5 (an extension to the d-dimensional case) to illustrate that our approach via TREE EVALUATION
is more broadly applicable.
3 A More Space-Efficient Simulation of Time
In this section, we prove Theorem 1.1, showing that any multitape Turing machine M running in time t
can be simulated in space O(
√
tlog t). We will proceed by reducing the computation of M on an input x
(of length n) to an instance of TREE EVALUATION with particular parameters. (In fact, in the full proof of
Theorem 1.1, we will reduce computing M on x to a series of TREE EVALUATION instances.)
4
One initial remark is in order. First, note that we did not specify in the statement of Theorem 1.1 that the
time function t(n) is time constructible, in that there is a Turing machine that can print the value of t(n) on
1
n
in O(t(n)) steps. This is because in our space-bounded simulation, we can simply try increasing values
t(n) = n, n + 1, n + 2, . . ., one at a time, and not worry about constructibility issues. (This trick is used in
other space-bounded simulations, such as [HPV75].)
Assume M has ℓ tapes which are infinite in one direction, and all tape heads are initially at the leftmost
cell. We also assume that the input x is received on tape 1.
3.1 A Warm-up Result
Before describing the full O(
√
tlog t) space simulation, first we present a slightly worse algorithm which
uses O(
√
tlog t) space and requires t(n) ≥ n
2
, but is simpler to describe. This bound is already extremely
surprising (to the author), and the simulation gives most of the key intuition as well.
Theorem 3.1. For every function t(n) ≥ n
2
, TIME[t(n)] ⊆ SPACE[
p
t(n) log t(n)].
The proof of Theorem 3.1 will utilize the well-known oblivious two-tape simulation of multitape Turing
machines. A multitape Turing machine M is oblivious if for every n, and every input x of length n, the tape
head movements of M on x depend only on n, and not on x itself.
Theorem 3.2 ([HS66, PF79, FLvMV05]). For every time-t(n) multitape Turing machine M, there is an
equivalent time-T(n) two-tape Turing machine M′ which is oblivious, with T(n) ≤ O(t(n) log t(n)). Furthermore, given n and i ∈ [T(n)] specified in O(log t(n)) bits, the two head positions of M′ on a length-n
input at time step i can be computed in poly(log t(n)) time.
Let M′ be the machine obtained from Theorem 3.2. The first idea behind our simulation is to conceptually partition the computation of M′ on a length-n input x into time and tape “blocks” of length b(n), for a
parameter b(n) ≥ log t(n) to be set later. In particular, the two tapes of M′
are split into tape blocks of b(n)
contiguous cells, and the T(n) steps of M′ on x are split into B := B(n) = O(T(n)/b(n)) contiguous time
blocks of length up to b(n). Observe that, for any block of b(n) steps on M′
, and any given tape h ∈ {1, 2},
there are at most two tape blocks of tape h that may have been accessed during the time block (moreover,
they are adjacent tape blocks on tape h). We will construct a TREE EVALUATION instance where the functions at each node of the tree evaluate a single time block, taking as input some relevant tape blocks from
previous time blocks. In fact, the same time block may be recomputed many times over the entire TREE
EVALUATION instance, in order to evaluate the last time block at the root of the tree.
A Computation Graph. To this end, we define a computation graph GM′
,x on B + 1 = O(T(n)/b(n))
nodes, a directed acyclic graph whose edges model the information flow from earlier time blocks in the
computation to later time blocks: the reads and writes of M′
and the head movements across blocks of
tape. Our notion is very similar to the computation graphs defined in [HPV75, PR80]. Eventually, the
computation being performed on the (B + 1)-node graph GM′
,x will be viewed as a TREE EVALUATION
instance of height B + 1.
Our graph GM′
,x has a node i for each time block i ∈ {0, 1, . . . , B}, and the edges will indicate which
previous time block contents need to be read in order to compute the content of the tape blocks accessed
during time block i. In particular, we say that all tape blocks on the two tapes are active during time block 0,
and for i > 0, a tape block is active during time block i if the tape head visits some cell of the block during
time block i. We put an edge from (i, j) in GM′
,x with i < j if and only if:
5
• either j = i + 1, or
• when M′
is run on input x, there is some tape block active during time block i that is not active again
until time block j. That is, for some tape head h, it reads the same tape block C in both time blocks
i and j, but h does not read tape block C during any time blocks i + 1, . . . , j − 1. (Alternatively, if
some tape block is being accessed for the first time in time block i, we have an edge (0, i) to reflect
the fact that all tape blocks are defined to be active in time block 0.)
Observe that each node i has indegree at most 5: one edge from i − 1, and at most four other edges for (at
most) four active tape blocks during time block i (two active tape blocks for each of the two tapes).
The key insight behind the computation graph notion is that the information needed to simulate M′
during a time block j only requires knowing the information computed in previous time blocks i, where
(i, j) is an edge in GM′
,x. In particular, the state and head positions of M′
at the start of time block j may
be obtained from the state and head positions at the end of time block j − 1, so we have the edge (j − 1, j),
and we have an edge (i, j) for each of those blocks of tape accessed during a time block i which are not
accessed again until time block j.
Due to the obliviousness of M′
(Theorem 3.2), we have the following claim:
Claim 3.3. Given the indices of any two nodes i, j in GM′
,x, we can determine if there is an edge from i to
j in poly(log t(n)) additional space.
The claim follows because determining whether (i, j) is an edge just requires us to keep track of the
locations of the two tape heads, from some time block i to a later time block j. By Theorem 3.2, we can
calculate the two tape head locations at any point in time using only poly(log t(n)) time, so we only have to
use poly(log t(n)) space to keep track of whether a tape block accessed during time block i is only accessed
later at time block j.
The Functions at the Nodes. Now we define what is being computed at each node of GM′
,x. The content
of time block i, denoted by content(i), is defined as follows:
• content(0) is the initial configuration of M′
running on the input x of length n, encoded in n + O(1)
bits. (Recalling we have t(n) ≥ n
2
, we will eventually set b(n) ≥ n. Thus the initial configuration of
M′ on x can “fit” in one tape block.)
• For i ∈ {1, . . . , B}, content(i) encodes information about the status of M′ on x at the end of time
block i: the state of M′
, the two tape head positions, and a list of the contents of those tape blocks
accessed during time block i. As there are at most four such tape blocks which may have been
accessed during time block i, content(i) can be encoded in O(b(n) + log t(n)) ≤ O(b(n)) bits.
Note that for every fixed j ∈ [B], if we are given content(i) for all edges (i, j) in GM′
,x, then we can
compute content(j) in O(b(n)) time and space, by simply simulating M′
for b(n) steps on the tape blocks
of the relevant content(i) values.
Our goal is to determine content(B), the content of the final time block, which will contain either an
accept or reject state and determine the answer.
A Tree Evaluation Instance. To do this, we construct a TREE EVALUATION instance in which the root
node computes content(B), its children compute content(i) for all i such that (i, B) is an edge in GM′
,x,
and so on; the leaves of our TREE EVALUATION instance will compute content(0), the initial configuration
6
of M′ on x. This transformation is analogous to how depth-d Boolean circuits of fan-in F can be modeled
by formulas of depth-d and size at most O(F
d
), by tracing over all possible paths from the output gate of
the circuit to an input gate of the circuit; see for example [Juk12, Chapter 6].
More precisely, we define a tree RM′
,x of height at most B + 1 and fan-in at most 5, with a root node
that will evaluate to content(B). Each node v of RM′
,x is labeled by a distinct path from some node j in
GM′
,x to the node B of GM′
,x. Inductively, we define the labels as follows:
• the root node of RG′ is labeled by the empty string ε (the empty path from B to itself), and
• for every node v in RM′
,x labeled by a distinct path P from j to B, and for every node i with an edge
to j in GM′
,x, the node v has a child w in RM′
,x labeled by the path which takes the edge (i, j) then
the path P to B.
Observe that paths P of length ℓ from a node j to node B can be encoded in O(ℓ) bits, since the indegree of
each node is at most 5. Furthermore, given such a path P encoded in this way, observe we can determine the
node j at the start of P in poly(log t) space, by making repeated calls to the edge relation (as in Claim 3.3).
The desired value to be computed at node v (labeled by a path from j to B) is precisely content(j). For
j = 0, this value is just the initial configuration of M′ on x, which can be produced immediately in O(n)
time and space. For j > 0, content(j) can be computed in O(b(n)) time and space given the values of the
children of v. Since GM′
,x has at most B+1 total nodes, the height of RM′
,x is at most B+1. By induction,
the value of the root of RM′
,x is precisely content(B).
While the tree RM′
,x has 2
Θ(B) ≤ 2
Θ(T(n)/b(n)) nodes, observe that for any given node v of RM′
,x
(labeled by a path to B), we can easily compute the labels of the children of v in poly(log t(n)) space, using
Claim 3.3 to compute the edges of the graph GM′
,x. Thus, it takes only poly(log t(n)) additional space to
determine the children of any given node of RM′
,x, and this space can be immediately reused once these
children are determined. So without loss of generality, we may assume we have random access to the tree
RM′
,x, its leaves, and its functions at each node.
Finally, we call the Cook-Mertz TREE EVALUATION algorithm (Theorem 2.2) in its most general form
on RM′
,x. Recall that the space bound of this algorithm, for trees of height at most h, fan-in at most d,
computing b-bit values at each node, is
O(d · b + h log(d · b)).
For us, d = 5, b = b(n), and h = O(T(n)/b(n)) ≤ O(t(n) log t(n))/b(n). We only use O(b(n)) additional
time and space for each function call to compute some content(j), and we can reuse this space for every
separate call. Therefore our space bound is optimized up to constant factors, by setting b(n) such that
b(n)
2 = Θ(t(n) log t(n) · log b(n)),
so b(n) = p
t(n) · log t(n) suffices. This completes the proof of Theorem 3.1.
3.2 The Main Result
Now we describe how to improve the bound of the space simulation, by avoiding the tlog t blowup of the
oblivious simulation. This will establish Theorem 1.1. The main difficulty is that without the oblivious
guarantee of Theorem 3.2, we do not know how to determine the edges of computation graph GM,x in an
efficient way. To remedy this, we will use more space: we will enumerate over possible computation graphs
G′
, and introduce a method for checking that G′ = GM′
,x in the functions of our TREE EVALUATION
7
instance. Our graph enumeration will be performed in a particularly space-efficient way, so that if TREE
EVALUATION turns out to be in logspace, the simulation of this paper will yield an O(
p
t(n)) space bound.
As before, we start with a multitape M which runs in t(n) time, and let x be an input of length n.
First, we make M block-respecting as in Lemma 2.1 with block-length b = b(n) on inputs of length n,
for a parameter b to be set later. The new multitape machine M′ has p := ℓ + 1 tapes, runs in time O(t(n)),
and has B := O(t(n)/b(n)) time and tape blocks.5
The Computation Graph. We start by refining the computation graph notion from Theorem 3.1. Here,
our computation graph GM′
,x is similar but not identical to that of [HPV75] and the warm-up Theorem 3.1.
Because we will allow for space bounds which are smaller than the input length n = |x|, we have to make
several modifications to GM′
,x to fit the specifications of TREE EVALUATION. We define the set of nodes in
GM′
,x to be
S = {(h, i),(h, 0, i) | h ∈ [p], i ∈ [B]}.
Intuitively, each (h, i) ∈ [p] × [B] will correspond to the content of the relevant block of tape h after time
block i, while each (h, 0, i) will be a source node in GM′
,x corresponding to the content of the i-th block of
tape h when it is accessed for the first time, i.e., the initial configuration of the i-th block of tape h.
6
(We
imagine that on each tape, the tape blocks are indexed 1, 2, . . . starting from the leftmost block, with up to
B tape blocks for each tape.) We think of all (h, 0, i) nodes as associated with “time block 0”.
Each node (h, i) ∈ [p] × [B] is labeled with an integer m(h,i) ∈ {−1, 0, 1}, indicating the tape head h
movement at the end of time block i:
m(h,i) =



1 if the head h moves one tape block to the right of the current tape block,
−1 if h moves one tape block to the left, and
0 if h stays in the same tape block for both time blocks i and i + 1.
Next, we describe the edges of GM′
,x; there are two types. For each h, h′ ∈ [p] and i, j ∈ [B] with
i < j, the edge ((h
′
, i),(h, j)) is put in GM′
,x if either:
• j = i + 1, or
• while M′
is running during time block j, the tape block accessed by h
′ during time block i is not
accessed again until time block j. That is, tape head h
′
reads the same tape block T in both time
blocks i and j, but head h
′ does not read tape block T during any of the time blocks i + 1, . . . , j − 1.
For h, h′ ∈ [p] and i, j ∈ [B], the edge ((h
′
, 0, i),(h, j)) is put in GM′
,x if, while M′
is running during time
block j, the tape head h
′
accesses its i-th tape block for the first time in the computation. (For example, note
that , for all h, h′
, ((h
′
, 0, 1),(h, 1)) is an edge.)
Observe that the indegree of each node (h, j) ∈ [p] × [B] is at most 2p for all j > 0: for all h
′ ∈ [p],
there is an edge from (h
′
, j − 1) to (h, j) for j > 1 (and from (h
′
, 0, 1) to (h, 1) for j = 1), and there is
5
Strictly speaking, we do not have to make M block-respecting, but it does make aspects of the presentation a little cleaner: we
do not have to reason about “active” tape blocks as we did in the warm-up (Theorem 3.1). Foreshadowing a bit, we will not use a
block-respecting notion in the later extension to d-dimensional Turing machines (Theorem 1.5) and again use “active” tape blocks.
6A little explanation may be in order. In the warm-up Theorem 3.1, we assumed t(n) ≥ n
2
, so that the entire initial configuration
of the machine on x could fit in a length-b(n) block. This made the leaf nodes of our TREE EVALUATION instance RG′ particularly
easy to describe. For t(n) ≪ n
2
, we may have |x| = n ≪ b(n), so the input x may not fit in one tape block. To accommodate this
possibility and obtain a clean reduction to TREE EVALUATION in the end, we define multiple source nodes in GM′
,x to account
for different b(n)-length blocks of input x in the initial configuration of M′
on x, along with b(n)-length blocks of all-blank tape
when these blocks are accessed for the first time.
8
an edge from a node labeled by h
′
(either of the form (h
′
, ih′
,j ) or (h
′
, 0, ih′
,j )) to (h, j), indicating which
block of tape h
′
is needed to compute the block of tape h during time block j. (Note that some of these
edges might be double-counted, so the indegree is at most 2p.)
A Succinct Graph Encoding. The obvious way to store the computation graph GM′
,x uses O(B log B)
bits. To save space, we will be more careful, and use additional observations on the structure of such
computation graphs. (These observations are similar but not identical to those used in the separation of
NTIME[n] and TIME[n], of Paul-Pippenger-Szemeredi-Trotter [ ´ PPST83].)
Recall that each node (h, i) is labeled by a head movement m(h,i) ∈ {−1, 1, 0} indicating whether the
tape block of head h is decremented by 1, incremented by 1, or stays the same, at the end of time block i.
Our key observation is that the numbers m(h,i) alone already tell us the entire structure of the graph GM′
,x.
This immediately implies that every possible guess of GM′
,x can be encoded in only O(B) bits: we only
need a constant number of bits for each of the O(B) nodes.
In particular, for an index i ∈ [B], we define block(h, i) ∈ [B] to be the index of the tape block of tape
h being accessed at the start of time block i. For all h ∈ [p], we have block(h, 1) = 1, and for i > 1, by
definition of the m(h,i) we have
block(h, i) = 1 +X
i−1
j=1
m(h,j)
. (1)
Equation (1) is true because each m(h,j)
tells us how the index of the tape block of tape h changes at the end
of time block j, which is the same as the tape block index at the start of time block j + 1.
For i < j, observe that there is an edge from (h
′
, i) to (h, j) in GM′
,x if and only if either:
• j = i + 1, or
• block(h
′
, i) = block(h
′
, j) and for all k ∈ {i + 1, . . . , j − 1}, block(h
′
, k) ̸= block(h
′
, i). (The tape
block accessed by h
′
in time block i is not accessed again until time block j.)
Furthermore, there is an edge from (h
′
, 0, i) to (h, j) in GM′
,x if and only if i = block(h
′
, j) and for all
k ∈ {1, . . . , j − 1}, block(h
′
, j) ̸= block(h
′
, k). (The tape block accessed by h
′
in time block j was never
accessed before, and its index is equal to i.)
We will use a few claims about the block function and the computation graph.
Claim 3.4. Given (h
′
, i′
) ∈ [p] × [B] and the claimed sequence {m(h,i)}, we can compute block(h
′
, i′
) in
O(log t(n)) additional space.
Proof. Given any h
′
, i′
, each block(h
′
, i′
) can be computed in logspace using (1), by maintaining a counter
and streaming over the sequence m(h,i)
.
Claim 3.5. Given the indices of a pair of nodes u, v in GM′
,x, and the claimed sequence {m(h,i)}, we can
determine if (u, v) is an edge in the encoded graph in O(log t(n)) additional space.
Proof. We can easily check if j = i+1 in logspace. By Claim 3.4, we can compute block(h
′
, j) for any h
′
, j
in logspace as well. Therefore the three possible conditions for an edge in the computation graph GM′
,x can
each be checked in logspace.
To summarize, we can encode GM′
,x in O(B) bits, and given such an encoding, we can determine any
desired edge (u, v) of the graph in logspace.
9
Values of Nodes. Similarly to our warm-up Theorem 3.1, we define contents for each of the nodes of
GM′
,x. For all h ∈ [p] and i ∈ [B], we define content(h, 0, i) for the source nodes (h, 0, i) as follows:
• If h > 1, then we are reading a tape h that does not contain the input. In this case, content(h, 0, i) is
defined to be all-blank tape content: b(n) blanks, with the tape head at the leftmost cell of the block,
and head position equal to (i − 1) · b(n). (Note that, assuming we start numbering tape cells at 0,
(i − 1) · b(n) is the leftmost cell of the i-th block of tape.)
• If h = 1, then we may need to read portions of the input x of length n. If i > ⌈n/b(n)⌉, then the i-th
tape block of tape 1 does not contain any symbol of x, and content(1, 0, i) is defined to be all-blank
tape content as above. Otherwise, if i ≤ ⌈n/b(n)⌉, then content(1, 0, i) is defined to be the relevant
b(n)-length substring of x (possibly padded with blanks at the end) with the tape head at the leftmost
cell of the block, head position equal to (i − 1) · b(n), and the initial state of M′
included if i = 0.
Note that the source nodes of our GM′
,x will eventually be the leaf nodes of the TREE EVALUATION
instance; in the above, we are also defining the values of those leaves.
For h ∈ [p] and i ∈ [B], we define content(h, i) of node (h, i) similarly as in Theorem 3.1: it is a string
encoding the pair (h, i), the state of M′
and the head position of tape h at the end of time block i, and the
content of the tape block read by head h at the end of time block i. With a reasonable encoding, content(h, i)
can be represented in O(b(n) + log t(n)) ≤ O(b(n)) bits, and our computation graph GM′
,x has been set up
(just as in Theorem 3.1) so that given the strings content(u) for all nodes u with edges to (h, j), the string
content(h, j) can be computed in O(b(n)) time and space.
Computation Graph Enumeration. In what follows, we enumerate over all possible O(t(n)/b(n))-bit
choices G′ of the encoding of the computation graph GM′
,x on O(B) ≤ O(t(n)/b(n)) nodes. For each
G′
, we construct a TREE EVALUATION instance RG′ based on G′
, which will attempt to simulate M′ on x
assuming G′ = GM′
,x. We will set up RG′ so that the following conditions hold:
• If G′ ̸= GM′
,x, this means that at the end of some time block i, some tape head h of M′ on x moves
inconsistently with the guessed label m(h,i)
in G′
. In this case, evaluating RG′ will result in a special
FAIL value at the root.
• If G′ = GM′
,x, then RG′ will evaluate to content(1, B) at the root, which will include either an accept
or reject state at the end of the computation of M′ on x. Thus we will be able to conclude decisively
whether M accepts or rejects x after this call to TREE EVALUATION.
Finally, if we exhaust all computation graphs G′
and always receive FAIL from all TREE EVALUATION
calls, we then increase our guess of t(n) by 1 (starting from t(n) = n), and restart the entire process. (Recall
that we do not assume t(n) is constructible.) Eventually, we will choose an appropriate t(n), in which case
the above enumeration of graphs G′ will result in either acceptance or rejection.
The Functions At The Nodes. We now define the functions at the nodes of our TREE EVALUATION
instance RG′. These functions will allow us to detect when the current graph G′ we are considering has
an error. We have to be a little careful here, as the Cook-Mertz algorithm is only guaranteed to produce
the value of the root of a given tree, and not the values of any intermediate nodes along the way. (Indeed,
the values of other nodes may become quite “scrambled” from evaluating a low-degree extension of the
functions involved.)
10
For each tape h ∈ [p] and time block i ∈ [B], we define a time block function Fh,i which attempts to
simulate M′ over time block i, and to output content(h, i), the content of the relevant block of tape h at the
end of time block i.
First, we choose an encoding of content(h, i) strings so that there is also a special FAIL string of length
O(b(n)), which is distinct from all valid content strings.
• The input to Fh,i consists of up to 2p strings of length O(b(n)). Some strings may be O(b(n))-bit
FAIL strings. In the case where G′ = GM′
,x, p of the input strings have the form content(h
′
, i − 1)
(or content(h
′
, 0, 1) if i = 1) for all h
′ ∈ [p]. These content strings contain the index of the node in
G′
they correspond to, the state q of M′
at the start of time block i, the content of the relevant tape
blocks at the end of time block i − 1, and the head positions of all p tapes at the start of time block
i, where each head position is encoded in O(log b(n)) bits. When some of the tape blocks accessed
in time block i were not accessed in the previous time block, there are also (up to) p other strings
content(u1), . . . , content(up) which contain tape block content c1, . . . , cp for each of the p tapes at
the start of time block i.
• The output of Fh,i is defined as follows. First of all, if some input string is a FAIL string, then Fh,i
immediately outputs FAIL as well. In this way, a single FAIL detection at any node will propagate
to the root value of RG′.
Assuming no FAIL strings have been given as input, Fh,i attempts to simulate M′
for time block i,
using the given content strings. While simulating, Fh,i checks that for all h
′ ∈ [p], the tape head h
′
moves consistently with the integer m(h′
,i) ∈ {0, 1, −1}. In particular, if m(h′
,i) = −1 then it checks
tape head h
′ moves to its left-adjacent tape block at the end of time block i, if m(h′
,i) = 1 then it
checks h
′ moves to its right-adjacent tape block, and if m(h′
,i) = 0 then it checks h
′
remains in the
same tape block. If all heads h
′ move consistently with the integers m(h′
,i)
, then the output of Fh,i is
set to be content(h, i). Otherwise, the output of Fh,i is FAIL.
Observe that Fh,i can be computed in O(b(n)) time and space, by simply simulating M′
for b(n) steps,
starting from the contents c1, . . . , cp for each of the tapes, and the state and head information given. Furthermore, by setting b
′
(n) = Θ(b(n)) appropriately, we may think of each Fh,i as a function from an ordered
collection of 2p separate b
′
(n)-bit strings, to a single b
′
(n)-bit string. These will be the functions at the
nodes of our TREE EVALUATION instance.
Construct a Tree Evaluation Instance. Observe that the depth of every G′
is at most B + 1: for every
edge (u, v) in G′
, the time block of u is always smaller than the time block of v, and there are B + 1 time
blocks. For each possible computation graph G′
, we will construct an equivalent and implicitly-defined
TREE EVALUATION instance RG′ of height at most B + 1 ≤ O(t(n)/b(n)), such that the edge relation
of the tree can be determined in small space. The idea is analogous to that described in the warm-up
(Theorem 3.1); for completeness, we will be a little more formal than Theorem 3.1.
Recall that each candidate G′
is defined so that each non-source node (h, i) has indegree at most 2p. Let
V be the set of all O((2p)
B+1) sequences of the form h1 · · · hℓ for all ℓ = 0, . . . , B, where each hi ∈ [2p],
and let ε denote the empty string (also in V ). The nodes of RG′ will be indexed by sequences in V . For all
ℓ = 0, . . . , B − 1, each node h1 · · · hℓ ∈ V has at most 2p children h1 · · · hℓhℓ+1 for some hℓ+1 ∈ [2p].
Each node of RG′ is directly associated with a path from a node v to the node (1, B) in the guessed
graph G′
, as follows.
11
• The node ε ∈ V corresponds to the node (1, B) in G′
(tape 1, in the last time block), and we associate
the function F1,B with this node.
• Inductively assume the node h1 · · · hℓ ∈ V corresponds to some node (h, j) in G′
. We associate the
function Fh,j with this node.
For every h
′ ∈ {1, . . . , p}, the node h1 · · · hℓh
′ ∈ V corresponds to a node (h
′
, i) (or (h
′
, 0, i)) in
G′ with an edge to (h, j), for some i. This corresponds to the case where the tape block of tape h
′
accessed in time block i is accessed later in time block j (or when h
′
is reading tape block i for the
first time in time block j).
For every h
′ ∈ {p + 1, . . . , 2p}, let h
′′ = h
′ − p, so h
′′ ∈ [p]. The node h1 · · · hℓh
′ ∈ V corresponds
to the node (h
′′, j − 1) with an edge to (h, j) when j > 1, and the node (h
′′
, 0, 1) with an edge to
(h, j) when j = 1. This corresponds to the case where the state and head position of tape h
′′ at the
end of time block j − 1 is passed to the start of time block j, and to the case where the initial state
and head position is passed to the start of time block 1.
If there is an edge from (h
′
, 0, i) to (h, j) for some i, then the tape head h
′ has never previously visited
the tape block i that is used to compute time block j. In that case, we set h1 · · · hℓh
′
to be a leaf node
in the tree. The value of that leaf node is set to be content(h
′
, 0, i).
Finishing up. We call TREE EVALUATION on RG′. If the current guessed G′
is not equal to GM′
,x,
then some guessed integer m(h,i) ∈ {−1, 1, 0} is an incorrect value (recall that G′
is specified entirely by
the integers {m(h,i)}). This incorrect head movement will be detected by the function Fh,i, which will then
output FAIL. This FAIL value will propagate to the root value of RG′ by construction. When RG′ evaluates
to FAIL, we move to the next possible G′
, encoded in O(B) bits.
Assuming the current graph G′
is correct, i.e., G′ = GM′
,x, then the value of the root of RG′ is
content(1, B), the output of F1,B on the final time block B. This value contains the correct accept/reject
state of M′ on x. This follows from the construction of the functions Fh,i, and can be proved formally by
an induction on the nodes of G′
in topological order. Therefore if our TREE EVALUATION call returns some
content with an accept/reject state, we can immediately return the decision.
Space Complexity. Observe that, by Claim 3.4 and Claim 3.5, any bits of the TREE EVALUATION instance
RG′ defined above can be computed in O(B) space, given the computation graph G′
encoded in O(B) space.
In particular, given the index of a node of RG′ of the tree as defined above (as a path from a node v to (1, B)
in G′
), we can determine the corresponding node of G′
and its children in O(B) space.
Therefore, we can call the Cook-Mertz algorithm (Theorem 2.2) on this implicitly-defined instance of
TREE EVALUATION, using O(B) space plus O(d
′
· b
′ + h
′
· log(d · b
′
)) space, where
• b
′ = Θ(b(n)) is the bit-length of the output of our functions Fh,i,
• d
′ = 2p = Θ(1), the number of children of each inner node, and
• h
′ = B = Θ(t(n)/b(n)), the maximum height of the tree.
At each node, each call to one of the functions Fh,i requires only O(b(n)) space. Therefore the overall space
bound is
O

b(n) + t(n)
b(n)
· log(b(n))
.
12
Setting b(n) = p
t(n) log t(n) obtains the bound O(
p
t(n) log t(n)). This completes the proof of Theorem 1.1.
