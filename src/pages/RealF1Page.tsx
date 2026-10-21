import React from 'react';
import { RealF1Hub } from '../components/f1/RealF1Hub';
import { Footer } from '../components/layout/Footer';

export const RealF1Page: React.FC = () => {
  return (
    <main className="bg-[#15151E] min-h-screen text-white pt-20">
      <div className="py-2 sm:py-6">
        <RealF1Hub />
      </div>
      <Footer />
    </main>
  );
};
