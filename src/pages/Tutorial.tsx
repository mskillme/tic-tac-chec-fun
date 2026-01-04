import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Crown, Move, Target, Zap } from 'lucide-react';

const Tutorial = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Crown,
      title: 'Goal',
      description: 'Align 4 of your pieces in a row — horizontally, vertically, or diagonally — to win the game.',
    },
    {
      icon: Zap,
      title: 'Placement Phase',
      description: 'Take turns placing pieces from your rack onto empty squares. Each piece moves like its chess counterpart.',
    },
    {
      icon: Move,
      title: 'Movement Phase',
      description: 'Once all pieces are placed, take turns moving your pieces on the board according to chess rules.',
    },
    {
      icon: Target,
      title: 'Capturing',
      description: 'You can capture opponent pieces by moving onto their square. Captured pieces return to their owner\'s rack.',
    },
  ];

  const pieceRules = [
    { piece: '♚', name: 'King', rule: 'Moves one square in any direction' },
    { piece: '♛', name: 'Queen', rule: 'Moves any number of squares in any direction' },
    { piece: '♜', name: 'Rook', rule: 'Moves any number of squares horizontally or vertically' },
    { piece: '♝', name: 'Bishop', rule: 'Moves any number of squares diagonally' },
    { piece: '♞', name: 'Knight', rule: 'Moves in an L-shape (2+1 squares)' },
    { piece: '♟', name: 'Pawn', rule: 'Moves forward one square, captures diagonally' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 wood-grain">
      <div className="max-w-lg w-full space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-3xl text-foreground">How to Play</h1>
        </div>

        {/* Game Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card/80 border-border">
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Piece Rules */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-display text-lg text-foreground">Piece Movements</h3>
            <div className="grid gap-2">
              {pieceRules.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-2xl w-8 text-center">{item.piece}</span>
                  <div>
                    <span className="text-foreground font-medium">{item.name}:</span>
                    <span className="text-muted-foreground ml-1">{item.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Play Button */}
        <Button
          onClick={() => navigate('/')}
          className="w-full h-14 text-lg font-display bg-primary hover:bg-primary/90"
        >
          Back to Menu
        </Button>
      </div>
    </div>
  );
};

export default Tutorial;
