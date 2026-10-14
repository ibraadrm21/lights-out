import React from 'react';
import { HigherLowerGameView } from '../components/f1/HigherLowerGameView';

export const HigherLowerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-28 pb-16 px-4">
      <HigherLowerGameView />
    </div>
  );
};
