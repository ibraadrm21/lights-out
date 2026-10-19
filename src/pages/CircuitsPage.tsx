import React from 'react';
import { GeoGuessrView } from '../components/f1/GeoGuessrView';

export const CircuitsPage: React.FC = () => {
  return (
    <main className="bg-black w-screen h-screen overflow-hidden text-white relative">
      <GeoGuessrView />
    </main>
  );
};
