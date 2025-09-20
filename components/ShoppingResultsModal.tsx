
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

const ShoppingResultsModal: React.FC = () => {
    const { 
        isShoppingModalOpen, 
        closeShoppingModal,
        isShoppingLoading,
        shoppingResult,
        shoppingError
    } = useAppContext();

    if (!isShoppingModalOpen) return null;

    const renderContent = () => {
        if (isShoppingLoading) {
            return <LoadingSpinner text="Searching for similar items..." />;
        }
        if (shoppingError) {
            return (
                <div className="text-center">
                    <Icon icon="close" className="w-12 h-12 text-feedback-red mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Search Failed</h3>
                    <p className="text-slate-600 mt-2">{shoppingError}</p>
                </div>
            );
        }
        if (shoppingResult) {
            return (
                <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-brand-primary mb-4">Shop the Look</h2>
                    
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Identified Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shoppingResult.items.map((item, index) => (
                                <div key={index} className="bg-slate-100 p-4 rounded-lg">
                                    <h4 className="font-bold text-brand-secondary">{item.itemName}</h4>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Web Sources</h3>
                        <p className="text-xs text-slate-500 mb-3">The following web pages were referenced by the AI to generate these results.</p>
                        <div className="space-y-2">
                             {shoppingResult.sources.length > 0 ? (
                                shoppingResult.sources.map((source, index) => (
                                    <a 
                                        href={source.web.uri} 
                                        key={index}
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="block bg-indigo-50 p-3 rounded-lg hover:bg-indigo-100 transition truncate"
                                    >
                                        <p className="font-semibold text-brand-primary text-sm truncate">{source.web.title}</p>
                                        <p className="text-xs text-indigo-400 truncate">{source.web.uri}</p>
                                    </a>
                                ))
                             ) : (
                                <p className="text-sm text-slate-500">No specific web sources were cited for this result.</p>
                             )}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={closeShoppingModal}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={closeShoppingModal}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition"
                    aria-label="Close"
                >
                    <Icon icon="close" className="w-6 h-6" />
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default ShoppingResultsModal;
