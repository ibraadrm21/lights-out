import React from 'react';
import { GeoGuessrView } from '../components/f1/GeoGuessrView';
import { Footer } from '../components/layout/Footer';

export const CircuitsPage: React.FC = () => {
  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <div className="py-6">
        <GeoGuessrView />
      </div>
      <Footer />
    </main>
  );
};
