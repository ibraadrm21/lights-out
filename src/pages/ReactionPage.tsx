import React from 'react';
import { ReactionGameView } from '../components/f1/ReactionGameView';

export const ReactionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-28 pb-16 px-4">
      <ReactionGameView />
    </div>
  );
};
