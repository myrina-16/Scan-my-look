
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { AnalysisResult } from '../types';

const RatingBanner: React.FC<{ rating: AnalysisResult['overallRating'] }> = ({ rating }) => {
  const ratingStyles = React.useMemo(() => {
    switch (rating) {
      case 'Perfect': return { bgColor: 'bg-feedback-green', text: 'Rated: Perfect!' };
      case 'Good': return { bgColor: 'bg-feedback-yellow', text: 'Rated: Good' };
      case 'NeedsAdjustment': return { bgColor: 'bg-feedback-red', text: 'Rated: Needs Adjustment' };
      default: return { bgColor: 'bg-slate-500', text: 'Analysis Result' };
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


const LookDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { lookId } = useParams<{ lookId: string }>();
  const { savedLooks } = useAppContext();

  const look = savedLooks.find(l => l.id === lookId);

  React.useEffect(() => {
    // If look is not found after initial render, redirect.
    if (!look) {
      navigate('/library', { replace: true });
    }
  }, [look, navigate]);

  if (!look) {
    // Render a loader or null while redirecting
    return null; 
  }

  const { image, detectedItems, overallRating, ratingReason, suggestions, occasion, date } = look;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                <Icon icon="arrow-left" className="w-5 h-5" />
                <span>Back to Library</span>
            </button>
            <div className="text-right">
                <p className="font-bold text-brand-primary">{occasion}</p>
                <p className="text-sm text-slate-500">{date}</p>
            </div>
        </div>
        
        <RatingBanner rating={overallRating} />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Image */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center text-slate-700">Saved Look</h2>
            <img src={image} alt={`Saved look for ${occasion}`} className="rounded-xl shadow-lg w-full aspect-[9/16] object-cover" />
             <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-brand-primary mb-2">Detected Items</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {detectedItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
          </div>
          
          {/* Suggestions */}
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-center text-slate-700">AI Analysis</h2>
             <div className="bg-indigo-100 p-4 rounded-lg shadow-md border-l-4 border-brand-secondary">
                <p className="text-slate-800 font-medium">"{ratingReason}"</p>
            </div>
            
            <SuggestionSection title="Hairstyle Ideas" items={suggestions.hairstyle} />
            <SuggestionSection title="Makeup Palettes" items={suggestions.makeup} />
            <SuggestionSection title="Accessory Pairings" items={suggestions.accessories} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookDetailPage;
