import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const StyleProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { styleProfile, clearStyleProfile, error } = useAppContext();

  const handleRetakeQuiz = () => {
    clearStyleProfile();
    navigate('/quiz');
  };

  if (error && !styleProfile) {
    return (
       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
           <h1 className="text-2xl font-bold text-feedback-red mb-4">Profile Generation Failed</h1>
           <p className="text-slate-600 mb-6 max-w-md">{error}</p>
           <button
               onClick={() => navigate('/library')}
               className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition"
           >
               Back to Closet
           </button>
       </div>
    );
 }

  if (!styleProfile) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <LoadingSpinner text="Loading profile..." />
        <button onClick={() => navigate('/quiz')} className="mt-4 text-brand-accent font-semibold">
          Or, take the quiz!
        </button>
      </div>
    );
  }

  const { profileName, description, keyElements, styleIcons } = styleProfile;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                <Icon icon="arrow-left" className="w-5 h-5" />
                <span>Back to Closet</span>
            </button>
        </div>
        
        <header className="text-center bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-2xl shadow-2xl mb-8">
            <Icon icon="diamond" className="w-12 h-12 text-white mx-auto mb-4 opacity-80"/>
            <p className="text-sm font-bold text-indigo-300 tracking-widest">YOUR STYLE PROFILE</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2">{profileName}</h1>
        </header>

        <main className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-slate-700 leading-relaxed text-lg">{description}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Key Elements</h2>
                <div className="flex flex-wrap gap-3">
                    {keyElements.map((item, index) => (
                        <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full">
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Style Icons</h2>
                <div className="flex flex-wrap gap-3">
                    {styleIcons.map((item, index) => (
                        <span key={index} className="bg-slate-100 text-slate-800 text-sm font-semibold px-4 py-2 rounded-full">
                           {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="text-center pt-4">
                <button onClick={handleRetakeQuiz} className="text-slate-500 font-semibold hover:text-brand-accent transition">
                    Retake Quiz
                </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default StyleProfilePage;
