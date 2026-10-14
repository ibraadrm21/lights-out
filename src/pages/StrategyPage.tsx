import React from 'react';
import { StrategyMasterView } from '../components/f1/StrategyMasterView';
import { Footer } from '../components/layout/Footer';

export const StrategyPage: React.FC = () => {
  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <div className="py-6">
        <StrategyMasterView />
      </div>
      <Footer />
    </main>
  );
};
