
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { Trip } from '../types';

const AddEventModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addPlannedEvent } = useAppContext();
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventName.trim() && eventDate) {
            addPlannedEvent(eventName, eventDate);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Add New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="event-name" className="block text-sm font-medium text-slate-700">Event Name</label>
                        <input
                            type="text"
                            id="event-name"
                            value={eventName}
                            onChange={e => setEventName(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            placeholder="e.g., Tech Conference"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="event-date" className="block text-sm font-medium text-slate-700">Date</label>
                        <input
                            type="date"
                            id="event-date"
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md shadow-md hover:bg-opacity-90">Add Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddTripModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addTrip } = useAppContext();
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tripType, setTripType] = useState<Trip['tripType']>('Vacation');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (destination.trim() && startDate && endDate) {
            addTrip(destination, startDate, endDate, tripType);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-brand-primary mb-4">Plan New Trip</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" className="w-full px-3 py-2 border border-slate-300 rounded-md" required />
                    <select value={tripType} onChange={e => setTripType(e.target.value as Trip['tripType'])} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                        <option>Vacation</option>
                        <option>Business</option>
                        <option>Weekend Getaway</option>
                        <option>Other</option>
                    </select>
                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-accent text-white rounded-md shadow-md hover:bg-opacity-90">Add Trip</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PlanPage: React.FC = () => {
    const { plannedEvents, trips, wardrobeItems, deletePlannedEvent, deleteTrip } = useAppContext();
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isTripModalOpen, setIsTripModalOpen] = useState(false);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    const allPlans = useMemo(() => {
        const events = plannedEvents.map(e => ({...e, type: 'event' as const, sortDate: e.date}));
        const tripsWithDate = trips.map(t => ({...t, type: 'trip' as const, sortDate: t.startDate}));
        return [...events, ...tripsWithDate].sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
    }, [plannedEvents, trips]);

    const getOutfitImages = (itemIds: string[]) => {
        return itemIds.map(id => wardrobeItems.find(item => item.id === id)?.image).filter(Boolean) as string[];
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
    };
    
    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-primary flex items-center justify-center gap-3">
                        <Icon icon="calendar" className="w-8 h-8" />
                        My Plans
                    </h1>
                    <p className="text-lg text-slate-600 mt-2">
                        Schedule your looks for any upcoming event or trip.
                    </p>
                </header>

                {allPlans.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <Icon icon="calendar" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">No plans yet.</p>
                        <p className="text-slate-400 mt-2">Tap the '+' button to add your first event or trip!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allPlans.map(plan => (
                            plan.type === 'event' ? (
                                <div key={plan.id} className="bg-white p-4 rounded-xl shadow-lg flex items-start gap-4">
                                    <Icon icon="calendar" className="w-8 h-8 text-brand-secondary mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="font-bold text-xl text-brand-primary">{plan.name}</h2>
                                                <p className="text-sm text-slate-500">{formatFullDate(plan.date)}</p>
                                            </div>
                                            <button onClick={() => deletePlannedEvent(plan.id)} className="text-slate-400 hover:text-feedback-red p-1">
                                                <Icon icon="trash" className="w-5 h-5"/>
                                            </button>
                                        </div>
                                        <div className="mt-4">
                                            {plan.outfitItemIds.length > 0 ? (
                                                 <div className="flex items-center gap-2">
                                                    {getOutfitImages(plan.outfitItemIds).slice(0, 4).map((img, i) => (
                                                        <img key={i} src={img} className="w-14 h-14 rounded-md object-cover border-2 border-white shadow-sm" />
                                                    ))}
                                                    {plan.outfitItemIds.length > 4 && <div className="w-14 h-14 rounded-md bg-slate-200 flex items-center justify-center text-brand-primary font-bold">+{plan.outfitItemIds.length - 4}</div>}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No outfit planned yet.</p>
                                            )}
                                        </div>
                                        <Link to={`/plan/${plan.id}`} className="mt-4 inline-block text-sm font-bold text-brand-accent hover:underline">
                                            {plan.outfitItemIds.length > 0 ? 'Edit Outfit' : 'Plan Outfit'} &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div key={plan.id} className="bg-white p-4 rounded-xl shadow-lg flex items-start gap-4">
                                     <Icon icon="suitcase" className="w-8 h-8 text-brand-secondary mt-1" />
                                     <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="font-bold text-xl text-brand-primary">{plan.destination}</h2>
                                                <p className="text-sm text-slate-500">{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</p>
                                            </div>
                                            <button onClick={() => deleteTrip(plan.id)} className="text-slate-400 hover:text-feedback-red p-1">
                                                <Icon icon="trash" className="w-5 h-5"/>
                                            </button>
                                        </div>
                                         <div className="mt-4">
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">{plan.tripType}</span>
                                        </div>
                                        <Link to={`/plan/trip/${plan.id}`} className="mt-4 inline-block text-sm font-bold text-brand-accent hover:underline">
                                            {plan.packingList ? 'View Packing List' : 'Create Packing List'} &rarr;
                                        </Link>
                                     </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
                
                <div className="fixed bottom-24 right-6 z-30">
                    {isFabMenuOpen && (
                        <div className="flex flex-col items-end gap-4 mb-4" style={{ animation: 'fadeInUp 0.3s' }}>
                            <button onClick={() => { setIsTripModalOpen(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-white text-brand-primary font-bold py-2 px-4 rounded-full shadow-lg hover:bg-slate-100">
                                Add Trip <Icon icon="suitcase" className="w-5 h-5"/>
                            </button>
                             <button onClick={() => { setIsEventModalOpen(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 bg-white text-brand-primary font-bold py-2 px-4 rounded-full shadow-lg hover:bg-slate-100">
                                Add Event <Icon icon="calendar" className="w-5 h-5"/>
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setIsFabMenuOpen(prev => !prev)}
                        className="bg-brand-accent text-white rounded-full p-4 shadow-xl hover:bg-opacity-90 transform transition-transform duration-300"
                        style={{ transform: isFabMenuOpen ? 'rotate(45deg)' : 'none' }}
                        aria-label="Add new plan"
                    >
                        <Icon icon="plus" className="w-8 h-8" />
                    </button>
                </div>

            </div>
            {isEventModalOpen && <AddEventModal onClose={() => setIsEventModalOpen(false)} />}
            {isTripModalOpen && <AddTripModal onClose={() => setIsTripModalOpen(false)} />}
        </div>
    );
};

export default PlanPage;
