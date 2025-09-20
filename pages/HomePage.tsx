import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { OCCASIONS } from '../constants';
import { getStyleTips } from '../services/geminiService';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    occasion, 
    setOccasion,
    wardrobeItems,
    dailyOutfit,
    isGeneratingDailyOutfit,
    dailyOutfitError,
    generateDailyOutfit,
    saveOutfit
  } = useAppContext();
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      setLoadingTips(true);
      const fetchedTips = await getStyleTips();
      setTips(fetchedTips);
      setLoadingTips(false);
    };
    fetchTips();
  }, []);

  useEffect(() => {
    // Generate an outfit suggestion when the component mounts if one doesn't exist
    if (wardrobeItems.length >= 3 && !dailyOutfit && !dailyOutfitError && !isGeneratingDailyOutfit) {
        generateDailyOutfit();
    }
  }, [wardrobeItems.length, dailyOutfit, dailyOutfitError, isGeneratingDailyOutfit, generateDailyOutfit]);


  const handleScanClick = () => {
    navigate('/scan');
  };

  const handleSaveDailyOutfit = () => {
    if (!dailyOutfit) return;

    const outfitName = `Outfit of the Day - ${new Date().toLocaleDateString()}`;
    saveOutfit({
      itemIds: dailyOutfit.items.map(item => item.id),
      name: outfitName,
      reasoning: dailyOutfit.reasoning,
    });
    navigate('/library', { state: { defaultTab: 'outfits' } });
  };


  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-center animate-fadeIn pb-12">
      <header className="my-8 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary">
          Scan My Look
        </h1>
        <p className="text-lg text-slate-600 mt-2">
          Your AI stylist for a confident, creative you.
        </p>
      </header>

      {/* Hero Section */}
      <div className="mb-8 w-full max-w-3xl px-4">
        <img 
          src="https://images.pexels.com/photos/7648733/pexels-photo-7648733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="A happy, diverse group of stylish young people smiling outdoors" 
          className="w-full h-56 md:h-72 object-cover rounded-2xl shadow-xl"
        />
      </div>

      <main className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div className="space-y-6">
          <div>
            <label htmlFor="occasion-select" className="block text-sm font-medium text-slate-700 mb-2">
              Choose an Occasion
            </label>
            <select
              id="occasion-select"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as any)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleScanClick}
            className="w-full flex items-center justify-center gap-3 bg-brand-accent text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all duration-300"
          >
            <Icon icon="camera" className="w-6 h-6" />
            <span>Scan My Look</span>
          </button>
           <div className="flex items-center gap-4">
            <hr className="flex-grow border-slate-200" />
            <span className="text-slate-400 text-sm">OR</span>
            <hr className="flex-grow border-slate-200" />
          </div>
          <Link
            to="/add-item"
            className="w-full flex items-center justify-center gap-3 bg-white border border-brand-secondary text-brand-secondary font-bold py-3 px-6 rounded-lg shadow-md hover:bg-brand-secondary hover:text-white transform hover:-translate-y-1 transition-all duration-300"
          >
            <Icon icon="plus" className="w-6 h-6" />
            <span>Add to Wardrobe</span>
          </Link>
        </div>
      </main>
      
      <section className="mt-12 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
              <Icon icon="sparkles" className="w-6 h-6 text-brand-accent" />
              Outfit of the Day
            </h2>
            <button 
              onClick={() => generateDailyOutfit()} 
              disabled={isGeneratingDailyOutfit || wardrobeItems.length < 3}
              className="p-2 rounded-full text-brand-primary hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition"
              aria-label="Generate new outfit"
            >
              <Icon icon="refresh" className="w-6 h-6" />
            </button>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg min-h-[15rem] flex items-center justify-center">
          {isGeneratingDailyOutfit ? (
            <LoadingSpinner text="Finding a look for you..." />
          ) : dailyOutfitError ? (
            <div className="text-center text-feedback-red">
              <p>{dailyOutfitError}</p>
            </div>
          ) : wardrobeItems.length < 3 ? (
            <div className="text-center text-slate-500">
              <p>Add at least 3 items to your wardrobe to get daily outfit suggestions!</p>
            </div>
          ) : dailyOutfit ? (
            <div className="w-full animate-fadeIn space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {dailyOutfit.items.map(item => (
                  <div key={item.id} className="bg-slate-100 rounded-lg overflow-hidden shadow">
                    <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-brand-secondary">
                 <p className="text-sm text-slate-800 font-medium">"{dailyOutfit.reasoning}"</p>
              </div>
              <button 
                onClick={handleSaveDailyOutfit}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition"
              >
                <Icon icon="save" className="w-5 h-5" />
                <span>Save this Outfit</span>
              </button>
            </div>
          ) : null}
        </div>
    </section>

      <section className="mt-12 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-brand-primary mb-4 flex items-center justify-center gap-2">
          <Icon icon="sparkles" className="w-6 h-6 text-brand-accent" />
          Quick Style Tips
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {loadingTips ? (
            <div className="flex justify-center items-center h-24">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-secondary"></div>
            </div>
          ) : (
            <ul className="space-y-3 text-left">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-700">
                  <span className="text-brand-accent font-bold mt-1">&#8226;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;