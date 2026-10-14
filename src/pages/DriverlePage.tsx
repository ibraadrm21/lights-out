import React from 'react';
import { DriverleView } from '../components/f1/DriverleView';
import { Footer } from '../components/layout/Footer';

export const DriverlePage: React.FC = () => {
  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <div className="py-6">
        <DriverleView />
      </div>
      <Footer />
    </main>
  );
};
