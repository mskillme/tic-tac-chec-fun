import { Board, Position } from '@/types/game';
import { BoardCell } from './BoardCell';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  board: Board;
  validMoves: Position[];
  selectedPosition: Position | null;
  winningLine: Position[] | null;
  onCellClick: (position: Position) => void;
}

export const GameBoard = ({
  board,
  validMoves,
  selectedPosition,
  winningLine,
  onCellClick,
}: GameBoardProps) => {
  const isValidMove = (pos: Position) =>
    validMoves.some(m => m.row === pos.row && m.col === pos.col);

  const isSelected = (pos: Position) =>
    selectedPosition?.row === pos.row && selectedPosition?.col === pos.col;

  const isWinningCell = (pos: Position) =>
    winningLine?.some(w => w.row === pos.row && w.col === pos.col) ?? false;

  return (
    <div className="board-shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-4 gap-0 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <BoardCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isValidMove={isValidMove(cell.position)}
              isSelected={isSelected(cell.position)}
              isWinningCell={isWinningCell(cell.position)}
              onClick={() => onCellClick(cell.position)}
            />
          ))
        )}
      </div>
    </div>
  );
};
