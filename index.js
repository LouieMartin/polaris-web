const whitePieceSquareTables = {
  kEndgame: [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  r: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  p: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
};

const blackPieceSquareTables = {
  kEndgame: whitePieceSquareTables.kEndgame.slice().reverse(),
  k: whitePieceSquareTables.k.slice().reverse(),
  q: whitePieceSquareTables.q.slice().reverse(),
  r: whitePieceSquareTables.r.slice().reverse(),
  b: whitePieceSquareTables.b.slice().reverse(),
  n: whitePieceSquareTables.n.slice().reverse(),
  p: whitePieceSquareTables.p.slice().reverse(),
};

const pieceValues = {
  k: 20000,
  q: 900,
  r: 500,
  b: 330,
  n: 320,
  p: 100,
};

const pieceSquareTables = {
  w: whitePieceSquareTables,
  b: blackPieceSquareTables,
};

const game = new Chess();

let board;

const isEndgame = () => {
  let queens = 0;
  let minors = 0;

  game.SQUARES.forEach(square => {
    const piece = game.get(square);
    if (!piece) return;

    if (['b', 'n'].includes(piece.type)) {
      minors++;
    } else if (piece.type === 'q') {
      queens++;
    }
  });
  return queens === 0 || (queens >= 2 && minors <= 1)
};

const getPositionalValue = (square, piece, endgame) => {
  const pieceSquareTable = pieceSquareTables[piece.color];
  const squareIndex = game.SQUARES.indexOf(square);

  if (piece.type === 'k' && endgame) {
    return pieceSquareTable.kEndgame[squareIndex];
  }

  return pieceSquareTable[piece.type][squareIndex];
};

const evaluatePiece = (square, piece, endgame) => {
  const positionalValue = getPositionalValue(square, piece, endgame);
  const materialValue = pieceValues[piece.type];

  return positionalValue + materialValue;
};

const evaluate = () => {
  const perspective = game.turn() === 'w' ? 1 : -1;
  const endgame = isEndgame();
  
  let score = 0;

  game.SQUARES.forEach(square => {
    const piece = game.get(square);

    if (!piece) return;
    const evaluation = evaluatePiece(square, piece, endgame);
    const color = piece.color === 'w' ? 1 : -1;
    
    score += evaluation * color;
  });

  return perspective * score;
};

const quiesce = (alpha, beta) => {
  let evaluation = evaluate();
  if (evaluation >= beta) {
    return beta;
  }

  alpha = Math.max(evaluation, alpha);

  const captures = game.ugly_moves().filter(move => move.captured);

  for (const capture of captures) {
    game.ugly_move(capture);
    const evaluation = -quiesce(-beta, -alpha);

    game.undo();
    if (evaluation >= beta) {
      return beta;
    }

    alpha = Math.max(evaluation, alpha);
  }

  return alpha;
};

const negamax = (depth, alpha, beta) => {
  depth = Math.max(depth, 0);
  if (game.in_checkmate()) {
    return Number.NEGATIVE_INFINITY;
  } else if (game.in_draw()) {
    return 0;
  }

  if (depth === 0) return quiesce(alpha, beta);

  const moves = game.ugly_moves();

  for (const move of moves) {
    game.ugly_move(move);
    const evaluation = -negamax(depth - 1, -beta, -alpha);

    game.undo();
    if (evaluation >= beta) {
      return beta;
    }

    alpha = Math.max(evaluation, alpha);
  }

  return alpha;
};

const findBestMove = depth => {
  const moves = game.ugly_moves();

  let bestEvaluation = Number.NEGATIVE_INFINITY;
  let bestMove;

  moves.forEach(move => {
    game.ugly_move(move);
    const evaluation = -negamax(depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

    game.undo();
    if (bestEvaluation <= evaluation) {
      bestEvaluation = evaluation;
      bestMove = move;
    }
  });

  return bestMove;
};
// 5.321
const makeBestMove = () => {
  const start = new Date();
  const move = findBestMove(3);

  game.ugly_move(move);
  board.position(game.fen());
  
  console.log((new Date() - start) / 1000);
};

const onDragStart = (_, piece) => {
  if (piece.search(/^b/) !== -1) return false;
  if (game.game_over()) return false;
};

const onDrop = (source, target) => {
  var move = game.move({
    promotion: 'q',
    from: source,
    to: target,
  });

  if (move === null) return 'snapback';

  setTimeout(makeBestMove, 300);
};

const onSnapEnd = () => {
  board.position(game.fen());
};

const config = {
  onDragStart: onDragStart,
  onSnapEnd: onSnapEnd,
  onDrop: onDrop,

  position: 'start',
  draggable: true,
};

board = Chessboard('board', config);
