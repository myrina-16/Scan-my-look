
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import { ColorAnalysis, StyleAnalysis } from '../types';

const ColorPalette: React.FC<{ data: ColorAnalysis[] }> = ({ data }) => (
    <div className="flex h-10 rounded-full overflow-hidden shadow-inner bg-slate-200">
        {data.map(({ color, percentage }) => (
            <div
                key={color}
                className="h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${percentage}%`, backgroundColor: color.toLowerCase() }}
                title={`${color.charAt(0).toUpperCase() + color.slice(1)}: ${percentage}%`}
            />
        ))}
    </div>
);

const StyleDistribution: React.FC<{ data: StyleAnalysis[] }> = ({ data }) => (
    <div className="space-y-3">
        {data.map(({ style, percentage }) => (
            <div key={style}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-700">{style}</span>
                    <span className="text-sm font-bold text-brand-primary">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        ))}
    </div>
);


const WardrobeReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { wardrobeReport, wardrobeItems, error } = useAppContext();

  useEffect(() => {
    // Redirect if there's no report data
    if (!wardrobeReport) {
      navigate('/library');
    }
  }, [wardrobeReport, navigate]);

  if (error && !wardrobeReport) {
    return (
       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
           <h1 className="text-2xl font-bold text-feedback-red mb-4">Report Generation Failed</h1>
           <p className="text-slate-600 mb-6 max-w-md">{error}</p>
           <button onClick={() => navigate('/library')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg">
               Back to Closet
           </button>
       </div>
    );
  }

  if (!wardrobeReport) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <LoadingSpinner text="Loading report..." />
      </div>
    );
  }

  const { overallImpressions, colorAnalysis, styleAnalysis, wardrobeOrphans, shoppingSuggestions } = wardrobeReport;
  
  const getOrphanItemImage = (itemId: string) => {
      return wardrobeItems.find(item => item.id === itemId)?.image;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/library')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                <Icon icon="arrow-left" className="w-5 h-5" />
                <span>Back to Closet</span>
            </button>
        </div>
        
        <header className="text-center bg-gradient-to-br from-brand-secondary to-brand-accent p-8 rounded-2xl shadow-2xl mb-8">
            <Icon icon="heart-pulse" className="w-12 h-12 text-white mx-auto mb-4 opacity-80"/>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2">Wardrobe Wellness Report</h1>
        </header>

        <main className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <p className="text-slate-700 leading-relaxed text-lg">{overallImpressions}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Your Color Palette</h2>
                <ColorPalette data={colorAnalysis} />
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                    {colorAnalysis.map(({color, percentage}) => (
                        <div key={color} className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.toLowerCase() }}></div>
                           <span className="text-sm text-slate-600 font-medium capitalize">{color} ({percentage}%)</span>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Your Style DNA</h2>
                <StyleDistribution data={styleAnalysis} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Unlock Your "Wardrobe Orphans"</h2>
                <div className="space-y-6">
                    {wardrobeOrphans.map(orphan => {
                        const image = getOrphanItemImage(orphan.itemId);
                        return (
                            <div key={orphan.itemId} className="flex flex-col sm:flex-row items-start gap-4 bg-slate-50 p-4 rounded-lg">
                                {image && <img src={image} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />}
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-700 mb-1">{orphan.reason}</p>
                                    <p className="text-sm text-slate-600"><span className="font-bold text-brand-secondary">Suggestion:</span> {orphan.suggestion}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Strategic Shopping Suggestions</h2>
                <div className="space-y-4">
                     {shoppingSuggestions.map((suggestion, index) => (
                        <div key={index} className="bg-indigo-50 p-4 rounded-lg border-l-4 border-brand-accent">
                             <h3 className="font-bold text-brand-primary">{suggestion.itemName}</h3>
                             <p className="text-sm text-slate-700 mt-1">{suggestion.reason}</p>
                        </div>
                    ))}
                </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default WardrobeReportPage;