# Serializability in Concurrent Transactions

## Concept Overview
Serializability determines whether a concurrent schedule is "equivalent" to a serial execution. A schedule is serializable if it produces the same result as some serial execution of the same transactions.

---

## 1. Conflict Serializability
A schedule is conflict serializable if it can be transformed into a serial schedule by swapping non-conflicting instructions.

**Conflicting Operations**:
Two operations conflict if:
- They belong to different transactions.
- They access the same data item.
- At least one of them is a `Write`.

### Example Schedule
- **T1**: R(X)
- **T2**: W(X)
- **T1**: W(X)

This schedule is **Non-Serializable** because T1 reads X before T2 writes it, but T1 also writes X *after* T2, creating a cycle in any potential serial ordering.

---

## 2. View Serializability
A less restrictive form of serializability. A schedule $S$ is view equivalent to a serial schedule $S'$ if:
1.  **Initial Read**: If $T_i$ reads the initial value of $X$ in $S$, it must do the same in $S'$.
2.  **Updated Read**: If $T_i$ reads a value of $X$ written by $T_j$ in $S$, it must do the same in $S'$.
3.  **Final Write**: The transaction that performs the final write of $X$ in $S$ must be the same transaction in $S'$.

---

## 3. Precedence Graph Explanation
A Precedence Graph is a directed graph $G = (V, E)$ used to check for conflict serializability.
- **Vertices (V)**: Each transaction in the schedule.
- **Edges (E)**: A directed edge $T_i \to T_j$ exists if $T_i$ performs an operation that conflicts with a subsequent operation performed by $T_j$.

### Detection Rules
- **No Cycle**: The schedule is **Conflict Serializable**.
- **Cycle Exists**: The schedule is **Not Conflict Serializable**.

---

## Conclusion Examples

| Schedule Pattern | Precedence Graph | Serializable? |
| :--- | :--- | :--- |
| T1: R(X), T2: W(Y), T1: W(X) | T1 $\to$ (None) | **Yes** (Equivalent to T2, T1 or T1, T2) |
| T1: R(X), T2: W(X), T1: W(X) | T1 $\to$ T2 AND T2 $\to$ T1 | **No** (Cycle detected) |
| T1: W(X), T2: W(X), T3: W(X) | T1 $\to$ T2 $\to$ T3 | **Yes** (Serial Equivalent: T1, T2, T3) |
