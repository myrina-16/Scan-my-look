import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import { getStyleSuggestions } from '../services/geminiService';
import { WardrobeItem } from '../types';

const MixAndMatchPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventName, eventId, defaultMode } = location.state || {};

    const { 
        wardrobeItems, 
        generateOutfitSuggestion, 
        isGeneratingOutfit, 
        outfitSuggestion, 
        outfitError,
        clearOutfitSuggestion,
        saveOutfit,
        lookCompletionResult,
        isCompletingLook,
        lookCompletionError,
        findLookCompletions,
        clearLookCompletion,
        findAndShowShoppingItems,
        styleProfile,
        colorProfile
    } = useAppContext();

    const [mode, setMode] = useState<'ai' | 'complete' | 'manual'>(defaultMode || 'ai');
    const [prompt, setPrompt] = useState(eventName ? `An outfit for: ${eventName}` : '');
    const [stylePresets, setStylePresets] = useState<string[]>([]);
    const [loadingPresets, setLoadingPresets] = useState(true);

    // Manual mode state
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [outfitName, setOutfitName] = useState('');
    
    // Complete the Look state
    const [completionItemIds, setCompletionItemIds] = useState<string[]>([]);

    useEffect(() => {
        clearOutfitSuggestion();
        clearLookCompletion();
    }, [clearOutfitSuggestion, clearLookCompletion]);

    useEffect(() => {
        const fetchStyles = async () => {
            setLoadingPresets(true);
            const styles = await getStyleSuggestions();
            setStylePresets(styles);
            setLoadingPresets(false);
        };
        fetchStyles();
    }, []);

    const addStyleToPrompt = (style: string) => {
        if (prompt.toLowerCase().includes(style.toLowerCase())) return;
        setPrompt(prev => `${prev} ${style}`.trim());
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        generateOutfitSuggestion(prompt, eventId);
    }
    
    const handleSaveGeneratedOutfit = () => {
        if (!outfitSuggestion) return;
        saveOutfit({
            itemIds: outfitSuggestion.items.map(item => item.id),
            prompt: prompt,
            reasoning: outfitSuggestion.reasoning
        });
        clearOutfitSuggestion();
        setPrompt('');
        navigate('/library');
    }
    
    const handleItemToggle = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSaveManualOutfit = () => {
        if (selectedItemIds.length === 0) {
            alert("Please select at least one item for your outfit.");
            return;
        }
        if (!outfitName.trim()) {
            alert("Please give your outfit a name.");
            return;
        }
        saveOutfit({
            itemIds: selectedItemIds,
            name: outfitName.trim()
        });
        setSelectedItemIds([]);
        setOutfitName('');
        navigate('/library');
    };

    const handleReset = () => {
        setPrompt(eventName ? `An outfit for: ${eventName}` : '');
        clearOutfitSuggestion();
    };

    const handleCompletionItemToggle = (itemId: string) => {
        setCompletionItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };
    
    const handleFindCompletions = () => {
        const selectedItems = wardrobeItems.filter(item => completionItemIds.includes(item.id));
        findLookCompletions(selectedItems);
    };

    const handleCompletionReset = () => {
        clearLookCompletion();
        setCompletionItemIds([]);
    };

    const handleShopCompletion = () => {
        if (lookCompletionResult) {
            const prompt = lookCompletionResult.suggestedItems.map(item => item.itemName).join(', ');
            findAndShowShoppingItems({ prompt });
        }
    };

    const handleSaveCompletedOutfit = (items: WardrobeItem[], name: string) => {
        if (items.length === 0) return;
        saveOutfit({
            itemIds: items.map(i => i.id),
            name: name,
            reasoning: lookCompletionResult?.outfitReasoning
        });
        handleCompletionReset();
        navigate('/library');
    };
    
    const isSuggestionForEvent = outfitSuggestion && eventId;

    const tabButtonClasses = "w-full py-3 text-sm font-bold transition-colors focus:outline-none rounded-t-lg flex items-center justify-center gap-2";
    const activeTabClasses = "bg-white text-brand-accent shadow-inner";
    const inactiveTabClasses = "bg-slate-200 text-slate-500 hover:bg-slate-300";

    const renderEmptyState = () => (
         <div className="text-center py-20 bg-white rounded-lg shadow-md col-span-full">
            <Icon icon="hanger" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Your wardrobe is a little empty.</p>
            <p className="text-slate-400 mt-2">Add at least two items to start mixing outfits.</p>
            <Link to="/add-item" className="mt-6 inline-block bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition">
                Add Items to Wardrobe
            </Link>
        </div>
    );

    const renderContent = () => {
        if (mode === 'ai') {
            return (
                <div className="animate-fadeIn">
                    {isGeneratingOutfit ? (
                        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-b-lg shadow-md">
                            <LoadingSpinner text="Styling your next look..." />
                        </div>
                    ) : outfitError ? (
                        <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg my-6 text-center shadow-md">
                            <p className="font-bold">Oops!</p>
                            <p className="text-sm">{outfitError}</p>
                            <button onClick={handleReset} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90">
                                Try Again
                            </button>
                        </div>
                    ) : outfitSuggestion ? (
                        <div className="text-center space-y-4 animate-fadeIn bg-white p-6 rounded-b-lg shadow-md">
                            {isSuggestionForEvent && (
                                <div className="bg-feedback-green text-white p-4 rounded-lg shadow-md">
                                    <h2 className="font-bold text-lg">Success!</h2>
                                    <p>This outfit has been automatically planned for "{eventName}".</p>
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-slate-700">Your AI-Styled Outfit:</h2>
                            <p className="text-md text-slate-600 bg-indigo-100 p-3 rounded-lg font-semibold">"{prompt}"</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl shadow-inner">
                                {outfitSuggestion.items.map(item => (
                                    <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
                                        <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                                        <p className="text-xs font-bold p-2 text-brand-primary bg-slate-100 truncate">{item.category}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-indigo-100 p-4 rounded-lg shadow-md border-l-4 border-brand-secondary">
                               <p className="text-slate-800 font-medium">"{outfitSuggestion.reasoning}"</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleSaveGeneratedOutfit} className="flex-1 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition">Save Outfit</button>
                                <button onClick={handleReset} className="flex-1 w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-300 transition">Create Another</button>
                            </div>
                        </div>
                    ) : (
                        <main className="bg-white p-6 rounded-b-lg shadow-md space-y-4">
                            <textarea
                              id="prompt-input"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="e.g., a casual weekend brunch, or a professional look for an important meeting"
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary h-28 resize-none"
                            />
                             {styleProfile && (
                                <div className="text-center text-sm text-slate-500 bg-indigo-50 p-3 rounded-lg flex items-center justify-center gap-2">
                                    <Icon icon="diamond" className="w-4 h-4 text-brand-secondary" />
                                    <span>Using your <span className="font-bold">{styleProfile.profileName}</span> profile for personalized suggestions.</span>
                                </div>
                            )}
                            {colorProfile && (
                                <div className="text-center text-sm text-slate-500 bg-indigo-50 p-3 rounded-lg flex items-center justify-center gap-2">
                                    <Icon icon="palette" className="w-4 h-4 text-brand-secondary" />
                                    <span>Using your <span className="font-bold">{colorProfile.season}</span> palette for color suggestions.</span>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Need inspiration? Add a style:</p>
                                {loadingPresets ? (
                                    <div className="h-8 flex items-center justify-center">
                                         <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-secondary"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {stylePresets.map(style => (
                                            <button 
                                                key={style}
                                                onClick={() => addStyleToPrompt(style)}
                                                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-brand-secondary hover:text-white transition"
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGeneratingOutfit || !prompt.trim()}
                                className="w-full flex items-center justify-center gap-3 bg-brand-accent text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all duration-300 disabled:bg-slate-400 disabled:transform-none"
                            >
                                <Icon icon="sparkles" className="w-6 h-6" />
                                <span>Generate Outfit</span>
                            </button>
                        </main>
                    )}
                </div>
            );
        }
        if (mode === 'complete') {
            return (
                 <div className="animate-fadeIn bg-white p-6 rounded-b-lg shadow-md">
                     {isCompletingLook ? (
                         <LoadingSpinner text="Completing your look..." />
                     ) : lookCompletionError ? (
                         <div className="text-center p-4">
                             <p className="text-feedback-red font-bold mb-2">Error</p>
                             <p className="text-slate-600 mb-4">{lookCompletionError}</p>
                             <button onClick={handleCompletionReset} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
                         </div>
                     ) : lookCompletionResult ? (
                         <div>
                             <h3 className="text-xl font-bold text-brand-primary text-center">"{lookCompletionResult.outfitName}"</h3>
                             <p className="text-slate-600 text-center my-4 bg-indigo-50 p-3 rounded-lg">"{lookCompletionResult.outfitReasoning}"</p>
                             
                             <div className="space-y-4">
                                 <div>
                                     <h4 className="font-bold text-slate-700 mb-2">From Your Wardrobe:</h4>
                                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                         {wardrobeItems.filter(item => lookCompletionResult.existingItemIds.includes(item.id)).map(item => (
                                             <div key={item.id}><img src={item.image} className="w-full aspect-square object-cover rounded-lg bg-slate-100" /></div>
                                         ))}
                                     </div>
                                 </div>

                                 {lookCompletionResult.suggestedItems.length > 0 && (
                                     <div>
                                         <h4 className="font-bold text-slate-700 mb-2">Suggested New Items:</h4>
                                         <div className="space-y-2">
                                             {lookCompletionResult.suggestedItems.map(item => (
                                                 <div key={item.itemName} className="bg-slate-100 p-3 rounded-lg">
                                                     <p className="font-semibold text-brand-secondary">{item.itemName}</p>
                                                     <p className="text-sm text-slate-600">{item.description}</p>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                             
                             <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button onClick={() => handleSaveCompletedOutfit(wardrobeItems.filter(i => lookCompletionResult.existingItemIds.includes(i.id)), lookCompletionResult.outfitName)} className="flex-1 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 rounded-lg">Save Outfit</button>
                                {lookCompletionResult.suggestedItems.length > 0 && <button onClick={handleShopCompletion} className="flex-1 w-full flex items-center justify-center gap-2 bg-brand-accent text-white font-bold py-3 rounded-lg">Shop New Items</button>}
                             </div>
                             <button onClick={handleCompletionReset} className="w-full mt-3 bg-slate-200 text-slate-800 font-bold py-3 rounded-lg">Start Over</button>
                         </div>
                     ) : (
                         <>
                             <p className="text-center text-slate-600 mb-4">Select one or more items to build an outfit around.</p>
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2">
                                {wardrobeItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleCompletionItemToggle(item.id)}
                                        className={`relative block border-4 rounded-lg overflow-hidden transition-all duration-200 ${completionItemIds.includes(item.id) ? 'border-brand-accent scale-105' : 'border-transparent'}`}
                                    >
                                        <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                                        {completionItemIds.includes(item.id) && <div className="absolute inset-0 bg-brand-accent bg-opacity-40" />}
                                    </button>
                                ))}
                             </div>
                             <button
                                onClick={handleFindCompletions}
                                disabled={completionItemIds.length === 0}
                                className="w-full mt-6 flex items-center justify-center gap-3 bg-brand-accent text-white font-bold py-4 px-6 rounded-lg shadow-lg disabled:bg-slate-400"
                              >
                                <Icon icon="sparkles" className="w-6 h-6" />
                                <span>Complete the Look</span>
                            </button>
                         </>
                     )}
                 </div>
            );
        }
        if (mode === 'manual') {
            return (
                <div className="animate-fadeIn bg-white p-6 rounded-b-lg shadow-md">
                    <p className="text-center text-slate-600 mb-4">Select items from your wardrobe to create a new outfit.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-2">
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
                    <div className="mt-6 border-t pt-4">
                        <input
                            type="text"
                            value={outfitName}
                            onChange={e => setOutfitName(e.target.value)}
                            placeholder="Give your outfit a name..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                        />
                        <button
                            onClick={handleSaveManualOutfit}
                            disabled={selectedItemIds.length === 0 || !outfitName.trim()}
                            className="w-full mt-4 flex items-center justify-center gap-3 bg-brand-primary text-white font-bold py-4 px-6 rounded-lg shadow-lg disabled:bg-slate-400"
                          >
                            <Icon icon="save" className="w-5 h-5" />
                            <span>Save Outfit ({selectedItemIds.length} items)</span>
                        </button>
                    </div>
                </div>
            );
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-primary flex items-center justify-center gap-3">
                        <Icon icon="mixer" className="w-8 h-8"/>
                        Mix & Match
                    </h1>
                     {eventName && (
                        <p className="text-lg text-slate-600 mt-2">
                           Creating an outfit for: <span className="font-bold text-brand-secondary">{eventName}</span>
                        </p>
                    )}
                </header>

                <div className="mb-6 border-b-2 border-slate-200">
                    <div className="flex bg-slate-200 rounded-t-lg">
                        <button onClick={() => setMode('ai')} className={`${tabButtonClasses} ${mode === 'ai' ? activeTabClasses : inactiveTabClasses}`}>
                            <Icon icon="sparkles" className="w-5 h-5"/> AI Generator
                        </button>
                        <button onClick={() => setMode('complete')} className={`${tabButtonClasses} ${mode === 'complete' ? activeTabClasses : inactiveTabClasses}`}>
                            <Icon icon="puzzle-piece" className="w-5 h-5"/> Complete the Look
                        </button>
                        <button onClick={() => setMode('manual')} className={`${tabButtonClasses} ${mode === 'manual' ? activeTabClasses : inactiveTabClasses}`}>
                            <Icon icon="pencil" className="w-5 h-5"/> Manual
                        </button>
                    </div>
                </div>
                
                {wardrobeItems.length < 2 ? renderEmptyState() : renderContent()}
            </div>
        </div>
    );
};

export default MixAndMatchPage;