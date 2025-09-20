
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const ColorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { colorProfile, clearColorProfile, error } = useAppContext();

  const handleRetake = () => {
    clearColorProfile();
    navigate('/color-analysis');
  };

  if (error && !colorProfile) {
    return (
       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
           <h1 className="text-2xl font-bold text-feedback-red mb-4">Analysis Failed</h1>
           <p className="text-slate-600 mb-6 max-w-md">{error}</p>
           <button onClick={() => navigate('/library')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg">
               Back to Closet
           </button>
       </div>
    );
 }

  if (!colorProfile) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <LoadingSpinner text="Loading your color profile..." />
        <button onClick={() => navigate('/color-analysis')} className="mt-4 text-brand-accent font-semibold">
          Start your analysis!
        </button>
      </div>
    );
  }

  const { season, description, palette, celebrityExamples, tips } = colorProfile;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                <Icon icon="arrow-left" className="w-5 h-5" />
                <span>Back to Closet</span>
            </button>
        </div>
        
        <header className="text-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-8 rounded-2xl shadow-2xl mb-8">
            <Icon icon="palette" className="w-12 h-12 text-white mx-auto mb-4 opacity-80"/>
            <p className="text-sm font-bold text-yellow-200 tracking-widest">YOUR COLOR PROFILE</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2">{season}</h1>
        </header>

        <main className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-slate-700 leading-relaxed text-lg">{description}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-brand-primary mb-4">Your Power Palette</h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {palette.map((color, index) => (
                        <div key={index} className="text-center">
                            <div className="w-full aspect-square rounded-full shadow-md border-4 border-white" style={{ backgroundColor: color.hex }}></div>
                            <p className="text-sm font-semibold text-slate-700 mt-2">{color.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-brand-primary mb-4">Style Tips</h2>
                    <ul className="space-y-3">
                        {tips.clothing.map((tip, i) => <li key={i} className="flex items-start gap-2 text-slate-700"><Icon icon="sparkles" className="w-4 h-4 text-brand-accent mt-1 flex-shrink-0" />{tip}</li>)}
                        {tips.accessories.map((tip, i) => <li key={i} className="flex items-start gap-2 text-slate-700"><Icon icon="sparkles" className="w-4 h-4 text-brand-accent mt-1 flex-shrink-0" />{tip}</li>)}
                        {tips.makeup.map((tip, i) => <li key={i} className="flex items-start gap-2 text-slate-700"><Icon icon="sparkles" className="w-4 h-4 text-brand-accent mt-1 flex-shrink-0" />{tip}</li>)}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-brand-primary mb-4">Celebrity Matches</h2>
                    <div className="flex flex-wrap gap-3">
                        {celebrityExamples.map((name, index) => (
                            <span key={index} className="bg-slate-100 text-slate-800 text-sm font-semibold px-4 py-2 rounded-full">
                               {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>


            <div className="text-center pt-4">
                <button onClick={handleRetake} className="text-slate-500 font-semibold hover:text-brand-accent transition">
                    Retake Analysis
                </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ColorProfilePage;
