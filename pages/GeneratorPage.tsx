import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateOutfitImage } from '../services/geminiService';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const GeneratorPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        saveInspiration, 
        setIsLoading, 
        isLoading, 
        setError, 
        error, 
        findAndShowShoppingItems
    } = useAppContext();

    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [usedPrompt, setUsedPrompt] = useState('');

    const stylePresets = ["Minimalist", "Vintage", "Bohemian", "Futuristic", "Streetwear", "Formal"];
    
    const handleGenerate = async (currentPrompt: string) => {
        if (!currentPrompt.trim()) {
            setError("Please describe the outfit you want to see.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setUsedPrompt(currentPrompt);

        try {
            const image = await generateOutfitImage(currentPrompt);
            setGeneratedImage(image);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (generatedImage) {
            saveInspiration(generatedImage, usedPrompt);
            resetFlow();
            alert("Saved to Inspirations in your Closet!");
        }
    };
    
    const handleShopLook = (prompt: string) => {
        if (prompt) {
            findAndShowShoppingItems({ prompt });
        }
    }

    const resetFlow = () => {
        setGeneratedImage(null);
        setPrompt('');
        setError(null);
    }
    
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/studio')} className="flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-accent">
                        <Icon icon="arrow-left" className="w-5 h-5" />
                        <span>Back to Studio</span>
                    </button>
                </div>

                <header className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-brand-primary flex items-center justify-center gap-3">
                        <Icon icon="sparkles" className="w-8 h-8 text-brand-accent" />
                        AI Outfit Generator
                    </h1>
                </header>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
                     {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <LoadingSpinner text="Bringing your vision to life..." />
                        </div>
                    ) : error && !generatedImage ? (
                        <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg my-6 text-center">
                            <p className="font-bold">Generation Failed</p>
                            <p className="text-sm">{error}</p>
                            <button 
                                onClick={() => setError(null)} 
                                className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90">
                                Try Again
                            </button>
                        </div>
                    ) : generatedImage ? (
                        <div className="text-center space-y-4 py-6 animate-fadeIn">
                            <h2 className="text-xl font-bold text-slate-700">Your Generated Look</h2>
                            <img src={generatedImage} alt={usedPrompt} className="rounded-xl shadow-lg w-full max-w-sm mx-auto aspect-[9/16] object-cover" />
                            <p className="text-sm text-slate-600 bg-indigo-100 p-3 rounded-lg">"{usedPrompt}"</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition">
                                    <Icon icon="save" className="w-5 h-5" />
                                    Save Inspiration
                                </button>
                                <button onClick={() => handleShopLook(usedPrompt)} className="flex-1 flex items-center justify-center gap-2 bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition">
                                    <Icon icon="shopping-cart" className="w-5 h-5" />
                                    Shop this Look
                                </button>
                            </div>
                            <button onClick={resetFlow} className="w-full bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-300 transition">
                                Create Another
                            </button>
                        </div>
                    ) : (
                        <main className="space-y-4 pt-6">
                            <p className="text-center text-slate-600">Describe an outfit, and let AI bring it to life!</p>
                            <div>
                                <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700 mb-2">
                                    Outfit Description
                                </label>
                                <textarea
                                    id="prompt-input"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., a vibrant floral sundress with white sneakers"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary h-28 resize-none"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Or add a style preset:</p>
                                <div className="flex flex-wrap gap-2">
                                    {stylePresets.map(style => (
                                        <button 
                                            key={style}
                                            onClick={() => setPrompt(prev => `${prev} in a ${style.toLowerCase()} style`)}
                                            className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-brand-secondary hover:text-white transition"
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleGenerate(prompt)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-brand-accent text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all duration-300 disabled:bg-slate-400 disabled:transform-none"
                            >
                                <Icon icon="sparkles" className="w-6 h-6" />
                                <span>Generate Outfit</span>
                            </button>
                        </main>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneratorPage;