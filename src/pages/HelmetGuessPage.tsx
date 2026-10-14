import React from 'react';
import { HelmetGuessGameView } from '../components/f1/HelmetGuessGameView';

export const HelmetGuessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-28 pb-16 px-4">
      <HelmetGuessGameView />
    </div>
  );
};
