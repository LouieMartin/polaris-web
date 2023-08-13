const game = new Chess();

let board;

const onDragStart = (_, piece) => {
  if (piece.search(/^b/) !== -1) return;
  if (game.game_over()) return;
};

const onDrop = (source, target) => {
  const move = game.move({
    promotion: 'q',
    from: source,
    to: target,
  });

  if (move === null) return 'snapback';

  // TODO: Make Polaris and make move here.
}

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
