import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const TrendSpotterPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        findAndShowShoppingItems,
        trendResult,
        isSpottingTrends,
        fetchTrends,
        clearTrends,
        error,
        setError,
    } = useAppContext();
    
    useEffect(() => {
        // Clear trends and errors when component mounts to ensure a fresh state
        clearTrends();
        // The return function of useEffect is the cleanup function
        return () => {
            clearTrends();
        }
    }, [clearTrends]);

    const handleFetchTrends = () => {
        setError(null);
        fetchTrends();
    };
    
    const handleShopLook = (prompt: string) => {
        if (prompt) {
            findAndShowShoppingItems({ prompt });
        }
    };
    
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
                        <Icon icon="trending-up" className="w-8 h-8 text-brand-accent" />
                        Trend Spotter
                    </h1>
                </header>
                
                 <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
                    <div className="animate-fadeIn py-6 space-y-6">
                        {isSpottingTrends ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                <LoadingSpinner text="Scanning the fashion world..." />
                            </div>
                        ) : error && !trendResult ? (
                            <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg text-center">
                                <p className="font-bold">Couldn't Spot Trends</p>
                                <p className="text-sm">{error}</p>
                                <button onClick={handleFetchTrends} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-opacity-90">
                                    Try Again
                                </button>
                            </div>
                        ) : trendResult ? (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-700 mb-4 text-center">Today's Top Trends</h2>
                                <div className="space-y-6 mb-8">
                                    {trendResult.trends.map(trend => (
                                        <div key={trend.title} className="bg-slate-100 p-4 rounded-xl shadow-md">
                                            <h3 className="text-xl font-bold text-brand-secondary">{trend.title}</h3>
                                            <p className="text-slate-600 my-2">{trend.summary}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {trend.keyItems.map(item => <span key={item} className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-200 text-indigo-800">{item}</span>)}
                                            </div>
                                            <button onClick={() => handleShopLook(trend.title)} className="w-full sm:w-auto text-sm bg-brand-accent text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-opacity-90 flex items-center justify-center gap-2">
                                                <Icon icon="shopping-cart" className="w-4 h-4"/>
                                                Shop this Trend
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-3">AI-Referenced Sources</h3>
                                    <div className="space-y-2">
                                        {trendResult.sources.length > 0 ? trendResult.sources.map((source, index) => (
                                            <a href={source.web.uri} key={index} target="_blank" rel="noopener noreferrer" className="block bg-indigo-50 p-3 rounded-lg hover:bg-indigo-100 transition truncate">
                                                <p className="font-semibold text-brand-primary text-sm truncate">{source.web.title}</p>
                                            </a>
                                        )) : <p className="text-sm text-slate-500">No specific web sources were cited.</p>}
                                    </div>
                                </div>
                                <button onClick={handleFetchTrends} className="w-full mt-8 bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-300 transition">
                                    Check Again
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <Icon icon="trending-up" className="w-16 h-16 text-brand-secondary mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-brand-primary">Stay Ahead of the Curve</h2>
                                <p className="text-slate-600 my-4 max-w-md mx-auto">Use Gemini with Google Search to discover and summarize the latest fashion trends from across the web.</p>
                                <button onClick={handleFetchTrends} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all">
                                    Spot the Latest Trends
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendSpotterPage;