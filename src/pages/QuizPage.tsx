import React from 'react';
import { QuizMasterView } from '../components/f1/QuizMasterView';
import { Footer } from '../components/layout/Footer';

export const QuizPage: React.FC = () => {
  return (
    <main className="bg-black min-h-screen text-white pt-20">
      <div className="py-6">
        <QuizMasterView />
      </div>
      <Footer />
    </main>
  );
};
