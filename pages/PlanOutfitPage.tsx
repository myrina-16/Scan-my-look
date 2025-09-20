
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';

const PlanOutfitPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const { plannedEvents, wardrobeItems, updatePlannedEventOutfit } = useAppContext();

    const event = useMemo(() => plannedEvents.find(e => e.id === eventId), [plannedEvents, eventId]);
    
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(event?.outfitItemIds || []);

    useEffect(() => {
        // If the event is not found, redirect to the main planner page.
        if (!event) {
            navigate('/plan', { replace: true });
        } else {
            setSelectedItemIds(event.outfitItemIds);
        }
    }, [event, navigate]);

    const handleItemToggle = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSaveChanges = () => {
        if (eventId) {
            updatePlannedEventOutfit(eventId, selectedItemIds);
            navigate('/plan');
        }
    };
    
    if (!event) {
        return null; // Render nothing while redirecting
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/plan')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                        <Icon icon="arrow-left" className="w-5 h-5" />
                        <span>Back to Planner</span>
                    </button>
                </div>
                
                <header className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <p className="text-sm font-semibold text-brand-secondary">PLANNING FOR</p>
                    <h1 className="text-3xl font-extrabold text-brand-primary">{event.name}</h1>
                    <p className="text-md text-slate-500 mt-1">{formatDate(event.date)}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">Your Wardrobe</h2>
                        {wardrobeItems.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-lg">
                                <p className="text-slate-500">Your wardrobe is empty.</p>
                                <Link to="/add-item" className="text-brand-accent font-bold mt-2 inline-block">Add some clothes!</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                {wardrobeItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemToggle(item.id)}
                                        className={`relative block border-4 rounded-lg overflow-hidden transition-all duration-200 ${selectedItemIds.includes(item.id) ? 'border-brand-accent scale-105' : 'border-transparent'}`}
                                    >
                                        <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                                        {selectedItemIds.includes(item.id) && (
                                            <div className="absolute inset-0 bg-brand-accent bg-opacity-40"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="md:col-span-1">
                         <div className="bg-white p-4 rounded-xl shadow-lg sticky top-6">
                             <h2 className="text-xl font-bold text-slate-700 mb-4">Selected Outfit</h2>
                             <div className="space-y-3 mb-4 min-h-[80px]">
                                {selectedItemIds.length > 0 ? (
                                    selectedItemIds.map(id => {
                                        const item = wardrobeItems.find(i => i.id === id);
                                        if (!item) return null;
                                        return (
                                            <div key={id} className="flex items-center gap-3">
                                                <img src={item.image} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-brand-primary">{item.category}</p>
                                                    <p className="text-xs text-slate-500 truncate">{item.description}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-slate-400 italic text-center pt-6">Tap items to build your outfit.</p>
                                )}
                             </div>

                             <div className="border-t pt-4 space-y-3">
                                <button
                                    onClick={handleSaveChanges}
                                    className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition"
                                >
                                    Save Outfit
                                </button>
                                <Link
                                    to="/mixer"
                                    state={{ eventName: event.name, eventId: event.id }}
                                    className="w-full block text-center bg-brand-accent text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition"
                                >
                                    Ask AI for Ideas
                                </Link>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanOutfitPage;
