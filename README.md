This is an ongoing project, in which I am attempting to replicate the math puzzle _Chrono_ as a web game. It currently exists as a proof-of-concept showing how a game of Chrono can be generated, using an implementation of the _backbite_ algorithm.

**OVERVIEW**

_Chrono_ is a member of the _Mathable_ series of math puzzle games. Given a 5x5 board of numbers and a starting point, you must create a valid mathematical equation linking two tiles (the operands) to a third tile (the result of the operation), and repeat this process with valid equations (+, -, x and /) involving your previous result, until every number on the board has been used.

After being fascinated by this puzzle for quite some time, I researched how a web implementation of this obscure puzzle could be made. To generate a Chrono puzzle on a nxm grid (where n and m are odd), all that is required is a **Hamiltonian path** (a path that visits every tile on the grid), which can then be iterated over and populated with procedurally generated numbers following the valid set of math operations.

This project contains a Javascript implementation of the _backbite_ algorithm for generating Hamiltonian paths, which is extended to support diagonal movement on the path as seen in real-life Chrono puzzles. The puzzle is also extended to support a few larger grid sizes than in the original puzzle.

**FUTURE PLANS**

In the future, I hope to fully develop this into an interactive Chrono web game. For now, it can generate valid puzzle boards which you can try yourself, before displaying the solution!
