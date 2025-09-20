
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';

const RatingBanner: React.FC<{ rating: 'Perfect' | 'Good' | 'NeedsAdjustment' }> = ({ rating }) => {
  const ratingStyles = useMemo(() => {
    switch (rating) {
      case 'Perfect':
        return {
          bgColor: 'bg-feedback-green',
          text: 'Perfect for the Occasion!',
          iconColor: 'text-green-100',
        };
      case 'Good':
        return {
          bgColor: 'bg-feedback-yellow',
          text: 'Great Look, a Few Tweaks Possible',
          iconColor: 'text-yellow-100',
        };
      case 'NeedsAdjustment':
        return {
          bgColor: 'bg-feedback-red',
          text: 'Could Use Some Adjusting',
          iconColor: 'text-red-100',
        };
      default:
        return {
          bgColor: 'bg-slate-500',
          text: 'Analysis Complete',
          iconColor: 'text-slate-100',
        };
    }
  }, [rating]);

  return (
    <div className={`p-4 rounded-lg text-white text-center shadow-lg ${ratingStyles.bgColor}`}>
      <h2 className="text-2xl font-bold">{ratingStyles.text}</h2>
    </div>
  );
};

const SuggestionSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold text-brand-primary mb-3">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, index) => (
        <div key={index} className="bg-slate-100 p-3 rounded-md text-sm text-slate-700 flex items-center gap-2">
            <Icon icon="sparkles" className="w-4 h-4 text-brand-accent flex-shrink-0" />
            <span>{item}</span>
        </div>
      ))}
    </div>
  </div>
);


const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult, scannedImage, saveCurrentLook, error, findAndShowShoppingItems } = useAppContext();

  const handleShare = async () => {
    if (navigator.share && analysisResult) {
      try {
        await navigator.share({
          title: 'Scan My Look Analysis',
          text: `I just got my look analyzed! Scan My Look said: "${analysisResult.ratingReason}"`,
          // Note: Sharing files (the image) is more complex and not universally supported.
          // We're sticking to text for broad compatibility.
        });
      } catch (err) {
        // This can happen if the user cancels the share dialog.
        console.info('Share was cancelled or failed.', err);
      }
    } else {
      alert('Share feature is not available in your browser.');
    }
  };

  const handleShopLook = () => {
    if (scannedImage) {
        findAndShowShoppingItems({ image: scannedImage });
    }
  }


  if (error) {
     return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold text-feedback-red mb-4">Analysis Failed</h1>
            <p className="text-slate-600 mb-6 max-w-md">{error}</p>
            <button
                onClick={() => navigate('/')}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition"
            >
                Try Again
            </button>
        </div>
     );
  }

  if (!analysisResult || !scannedImage) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <p className="text-slate-600">No analysis result found. Please scan your look first.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-accent font-semibold">
          Back to Home
        </button>
      </div>
    );
  }
  
  const { detectedItems, overallRating, ratingReason, suggestions } = analysisResult;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                <Icon icon="arrow-left" className="w-5 h-5" />
                <span>New Scan</span>
            </button>
            <div className="flex gap-2">
                 <button onClick={handleShare} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-200 transition">
                    <Icon icon="share" className="w-5 h-5 text-brand-primary" />
                </button>
                 <button onClick={saveCurrentLook} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-200 transition">
                    <Icon icon="save" className="w-5 h-5 text-brand-primary" />
                </button>
            </div>
        </div>
        
        <RatingBanner rating={overallRating} />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Before */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-slate-700">Your Detected Look</h2>
            <img src={scannedImage} alt="Scanned look" className="rounded-xl shadow-lg w-full aspect-[9/16] object-cover" />
             <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-brand-primary mb-2">Detected Items</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {detectedItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
          </div>
          
          {/* After / Suggestions */}
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-center text-slate-700">AI-Powered Suggestions</h2>
             <div className="bg-indigo-100 p-4 rounded-lg shadow-md border-l-4 border-brand-secondary">
                <p className="text-slate-800 font-medium">"{ratingReason}"</p>
            </div>
            
            <SuggestionSection title="Hairstyle Ideas" items={suggestions.hairstyle} />
            <SuggestionSection title="Makeup Palettes" items={suggestions.makeup} />
            <SuggestionSection title="Accessory Pairings" items={suggestions.accessories} />
            
            <button 
                onClick={handleShopLook}
                className="w-full bg-brand-accent text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
                <Icon icon="shopping-cart" className="w-5 h-5" />
                Shop Similar Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
