import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const PalettePage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        wardrobeItems,
        paletteOutfitResult,
        isGeneratingFromPalette,
        paletteError,
        generateOutfitFromPalette,
        clearPaletteOutfit,
        saveOutfit,
    } = useAppContext();
    
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                clearPaletteOutfit();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateFromPalette = () => {
        if (uploadedImage) {
            generateOutfitFromPalette(uploadedImage);
        }
    };
    
    const handleSavePaletteOutfit = () => {
        if (paletteOutfitResult) {
            saveOutfit({
                itemIds: paletteOutfitResult.itemIds,
                name: `Outfit from Color Palette`,
                reasoning: paletteOutfitResult.reasoning,
            });
            handleResetPalette();
            alert("Saved to Outfits in your Closet!");
        }
    };

    const handleResetPalette = () => {
        setUploadedImage(null);
        clearPaletteOutfit();
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
                        <Icon icon="palette" className="w-8 h-8 text-brand-accent" />
                        Palette Stylist
                    </h1>
                </header>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
                    <div className="animate-fadeIn py-6 space-y-6">
                        {isGeneratingFromPalette ? (
                            <div className="flex flex-col items-center justify-center h-96">
                                <LoadingSpinner text="Analyzing your image..." />
                            </div>
                        ) : paletteError ? (
                            <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg text-center">
                                <p className="font-bold">Analysis Failed</p>
                                <p className="text-sm">{paletteError}</p>
                                <button onClick={handleResetPalette} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
                            </div>
                        ) : paletteOutfitResult ? (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-slate-700 text-center">Your Palette-Inspired Outfit</h2>
                                <div className="flex justify-center gap-2">
                                    {paletteOutfitResult.palette.map((color, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: color }} title={color} />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl shadow-inner">
                                    {wardrobeItems.filter(item => paletteOutfitResult.itemIds.includes(item.id)).map(item => (
                                        <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
                                            <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                                            <p className="text-xs font-bold p-2 text-brand-primary bg-slate-100 truncate">{item.category}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-800 font-medium bg-indigo-100 p-4 rounded-lg">"{paletteOutfitResult.reasoning}"</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleSavePaletteOutfit} className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 rounded-lg">Save Outfit</button>
                                    <button onClick={handleResetPalette} className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 rounded-lg">Start Over</button>
                                </div>
                            </div>
                        ) : uploadedImage ? (
                            <div className="text-center space-y-4">
                                <img src={uploadedImage} alt="Uploaded inspiration" className="rounded-xl shadow-lg w-full max-w-sm mx-auto" />
                                <button onClick={handleGenerateFromPalette} className="w-full bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg">Generate Outfit</button>
                                <button onClick={() => setUploadedImage(null)} className="text-slate-500 font-semibold">Choose a different image</button>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <Icon icon="palette" className="w-16 h-16 text-brand-secondary mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-brand-primary">Find Inspiration Anywhere</h2>
                                <p className="text-slate-600 my-4 max-w-md mx-auto">Upload an image with colors you love, and we'll create an outfit from your wardrobe to match it.</p>
                                <label htmlFor="palette-upload" className="cursor-pointer bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 inline-block">
                                    Upload Image
                                </label>
                                <input id="palette-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PalettePage;