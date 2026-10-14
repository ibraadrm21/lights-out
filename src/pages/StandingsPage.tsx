import React from 'react';
import { LeaderboardView } from '../components/f1/LeaderboardView';
import { Footer } from '../components/layout/Footer';

export const StandingsPage: React.FC = () => {
  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <div className="py-6">
        <LeaderboardView />
      </div>
      <Footer />
    </main>
  );
};
