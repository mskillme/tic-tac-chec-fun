import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InitialsInputProps {
  open: boolean;
  onSubmit: (initials: string) => void;
  onCancel: () => void;
}

export const InitialsInput: React.FC<InitialsInputProps> = ({ open, onSubmit, onCancel }) => {
  const [letters, setLetters] = useState(['', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (open) {
      setLetters(['', '', '']);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    
    const newLetters = [...letters];
    newLetters[index] = letter;
    setLetters(newLetters);

    // Auto-advance to next input
    if (letter && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter' && letters.every(l => l)) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const initials = letters.join('');
    if (initials.length === 3) {
      onSubmit(initials);
    }
  };

  const isValid = letters.every(l => l);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-accent/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center text-primary">
            🏆 Enter Your Initials
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Join the global leaderboard with your 3-letter arcade name!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-3 my-6">
          {letters.map((letter, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              value={letter}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-20 text-4xl font-bold text-center uppercase bg-background border-2 border-accent/50 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              maxLength={1}
              autoComplete="off"
            />
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel}>
            Skip
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="px-8"
          >
            Join Leaderboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
