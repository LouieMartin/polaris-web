const pieceValues = {
  k: 20000,
  q: 900,
  r: 500,
  b: 330,
  n: 320,
  p: 100,
};

const game = new Chess();

let board;

const onDragStart = (_, piece) => {
  if (piece.search(/^b/) !== -1) return;
  if (game.game_over()) return;
};

const evaluate = () => {
  const perspective = game.turn() === 'w' ? 1 : -1;
  
  let score = 0;

  for (let square of game.SQUARES) {
    const piece = game.get(square);

    if (!piece) continue;
    const color = piece.color === 'w' ? 1 : -1

    score += pieceValues[piece.type] * color;
  }

  return perspective * score;
};

const quiesce = (alpha, beta) => {
  let evaluation = evaluate();

  if (evaluation >= beta) {
    return beta;
  }

  alpha = Math.max(evaluation, alpha);
  const captures = game.ugly_moves().filter(move => move.captured);

  for (let capture of captures) {
    game.ugly_move(capture);
    const evaluation = -quiesce(-beta, -alpha)

    game.undo(capture);
    if (evaluation >= beta) {
      return beta;
    }

    alpha = Math.max(evaluation, alpha);
  }

  return alpha;
};

const negamax = (depth, alpha, beta) => {
  depth = Math.max(0, depth);
 
  const moves = game.ugly_moves();

  if (game.in_checkmate()) {
    return Number.NEGATIVE_INFINITY;
  }

  if (moves.length === 0) {
    return 0;
  }

  if (depth === 0) {
    return quiesce(alpha, beta);
  }

  for (let move of moves) {
    game.ugly_move(move);
    const evaluation = -negamax(depth - 1, -beta, -alpha);

    game.undo(move);
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

  for (let move of moves) {
    const prettyMove = game.ugly_move(move);
    const evaluation = -negamax(depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);

    game.undo(move);
    if (bestEvaluation <= evaluation) {
      bestEvaluation = evaluation;
      bestMove = move;
    }
  }

  return bestMove;
};

const playBestMove = depth => {
  const move = findBestMove(depth);

  game.ugly_move(move);
  board.position(game.fen());
};

const onDrop = (source, target) => {
  const move = game.move({
    promotion: 'q',
    from: source,
    to: target,
  });

  if (move === null) return 'snapback';

  playBestMove(4);
};

const onSnapEnd = () => {
  board.position(game.fen())
};

const config = {
  onDragStart: onDragStart,
  onSnapEnd: onSnapEnd,
  onDrop: onDrop,

  position: 'start',
  draggable: true,
};

board = Chessboard('board', config);

