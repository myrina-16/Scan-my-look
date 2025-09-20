
import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const TripDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { tripId } = useParams<{ tripId: string }>();
    const { trips, wardrobeItems, generateAndSetPackingList, isGeneratingPackingList, error, setError } = useAppContext();

    const trip = useMemo(() => trips.find(t => t.id === tripId), [trips, tripId]);

    useEffect(() => {
        if (!trip) {
            navigate('/plan', { replace: true });
        }
    }, [trip, navigate]);
    
    useEffect(() => {
        // Clear any previous errors when the component loads
        setError(null);
    }, [setError]);

    const handleGenerate = () => {
        if (tripId) {
            generateAndSetPackingList(tripId);
        }
    };

    if (isGeneratingPackingList) {
        return (
            <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center text-white p-4">
                <LoadingSpinner text="Packing your bags... virtually!" />
            </div>
        );
    }
    
    if (!trip) {
        return null;
    }
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };
    
    const packedItems = trip.packingList ? wardrobeItems.filter(item => trip.packingList?.packingListItemIds.includes(item.id)) : [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/plan')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                        <Icon icon="arrow-left" className="w-5 h-5" />
                        <span>Back to Plans</span>
                    </button>
                </div>
                
                <header className="bg-white p-6 rounded-xl shadow-lg mb-6 text-center">
                    <p className="text-sm font-semibold text-brand-secondary">{trip.tripType}</p>
                    <h1 className="text-3xl font-extrabold text-brand-primary">{trip.destination}</h1>
                    <p className="text-md text-slate-500 mt-1">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                </header>
                
                {error && (
                     <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg mb-6 text-center shadow-md">
                        <p className="font-bold">Generation Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {trip.packingList ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Packing List ({packedItems.length} items)</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {packedItems.map(item => (
                                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                                        <p className="text-xs text-brand-primary font-semibold p-2 truncate">{item.category}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                             <h2 className="text-2xl font-bold text-slate-700 mb-4">Suggested Outfits</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trip.packingList.suggestedOutfits.map((outfit, index) => {
                                    const outfitItems = wardrobeItems.filter(item => outfit.itemIds.includes(item.id));
                                    return (
                                        <div key={index} className="bg-white p-4 rounded-xl shadow-lg">
                                            <p className="font-bold text-brand-secondary mb-3">{outfit.description}</p>
                                            <div className="flex items-center gap-2">
                                                {outfitItems.map(item => (
                                                    <img key={item.id} src={item.image} className="w-16 h-16 rounded-md object-cover border-2 border-white shadow-sm" />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                        
                        <div>
                             <h2 className="text-2xl font-bold text-slate-700 mb-4">AI Travel Tips</h2>
                             <div className="bg-indigo-100 p-4 rounded-lg shadow-md border-l-4 border-brand-secondary">
                                <ul className="space-y-2">
                                    {trip.packingList.packingTips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-800">
                                            <span className="text-brand-accent font-bold mt-1">&bull;</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center bg-white rounded-lg shadow-lg p-8">
                        <Icon icon="suitcase" className="w-20 h-20 text-brand-secondary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-brand-primary">Ready to Pack?</h2>
                        <p className="text-slate-600 my-4 max-w-md mx-auto">Let AI analyze your trip details and wardrobe to create the perfect packing list and suggest outfits for every occasion.</p>
                        <button 
                            onClick={handleGenerate}
                            className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all"
                        >
                            Generate Packing List
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TripDetailPage;
