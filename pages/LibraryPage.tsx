

import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

type FilterCategory = 'categories' | 'colors' | 'seasons' | 'styles';

const FilterPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  activeFilters: any;
  filterOptions: any;
}> = ({ isOpen, onClose, onApply, activeFilters, filterOptions }) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  const handleToggle = (category: FilterCategory, value: string) => {
    setLocalFilters((prev: any) => {
      const current = prev[category];
      const newValues = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
  };
  
  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { categories: [], colors: [], seasons: [], styles: [] };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  }

  if (!isOpen) return null;

  const renderFilterGroup = (title: string, category: FilterCategory, options: string[]) => (
    <div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2 border-b pb-1">{title}</h3>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
        {options.sort().map(option => (
          <label key={option} className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters[category].includes(option)}
              onChange={() => handleToggle(category, option)}
              className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-secondary"
            />
            <span className="text-sm text-slate-600 capitalize">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-brand-primary">Filter Wardrobe</h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><Icon icon="close" /></button>
        </div>
        {renderFilterGroup('Category', 'categories', filterOptions.categories)}
        {renderFilterGroup('Color', 'colors', filterOptions.colors)}
        {renderFilterGroup('Season', 'seasons', filterOptions.seasons)}
        {renderFilterGroup('Style', 'styles', filterOptions.styles)}
        <div className="flex justify-between pt-4">
          <button onClick={handleReset} className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300">Reset</button>
          <button onClick={handleApply} className="px-6 py-2 bg-brand-accent text-white font-bold rounded-lg shadow-md hover:bg-opacity-90">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};


const LibraryPage: React.FC = () => {
  const { 
    savedLooks, 
    inspirations, 
    wardrobeItems, 
    savedOutfits, 
    deleteOutfit, 
    deleteWardrobeItem, 
    openEditItemModal, 
    addStarterPack, 
    styleProfile,
    colorProfile,
    wardrobeReport,
    isGeneratingReport,
    generateAndSetWardrobeReport,
    error,
    setError
  } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.state?.defaultTab;

  const [activeTab, setActiveTab] = useState<'looks' | 'outfits' | 'inspirations' | 'wardrobe' | 'wellness'>(defaultTab || 'looks');
  
  // State for wardrobe filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    colors: [] as string[],
    seasons: [] as string[],
    styles: [] as string[],
  });

  const filterOptions = useMemo(() => {
    const categories = [...new Set(wardrobeItems.map(item => item.category))];
    const colors = [...new Set(wardrobeItems.flatMap(item => item.colors))];
    const seasons = [...new Set(wardrobeItems.map(item => item.season))];
    const styles = [...new Set(wardrobeItems.map(item => item.style).filter(Boolean))];
    return { categories, colors, seasons, styles };
  }, [wardrobeItems]);

  const wardrobeItemsWithColorMatch = useMemo(() => {
    if (!colorProfile) {
      return wardrobeItems.map(item => ({ ...item, isBestColor: false }));
    }

    const flatteringColors = new Set(colorProfile.palette.map(p => p.name.toLowerCase()));
    
    const itemColorsAreFlattering = (itemColors: string[]): boolean => {
        return itemColors.some(itemColor => {
            const lowerItemColor = itemColor.toLowerCase();
            for (const flatColor of flatteringColors) {
                if (flatColor.includes(lowerItemColor) || lowerItemColor.includes(flatColor)) {
                    return true;
                }
            }
            return false;
        });
    };

    return wardrobeItems.map(item => ({
      ...item,
      isBestColor: itemColorsAreFlattering(item.colors)
    }));
  }, [wardrobeItems, colorProfile]);


  const filteredWardrobeItems = useMemo(() => {
    return wardrobeItemsWithColorMatch.filter(item => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm.trim() === '' ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.category.toLowerCase().includes(lowerSearch) ||
        item.style.toLowerCase().includes(lowerSearch);

      const matchesCategory = activeFilters.categories.length === 0 || activeFilters.categories.includes(item.category);
      const matchesColor = activeFilters.colors.length === 0 || activeFilters.colors.some(color => item.colors.includes(color));
      const matchesSeason = activeFilters.seasons.length === 0 || activeFilters.seasons.includes(item.season);
      const matchesStyle = activeFilters.styles.length === 0 || activeFilters.styles.includes(item.style);

      return matchesSearch && matchesCategory && matchesColor && matchesSeason && matchesStyle;
    });
  }, [wardrobeItemsWithColorMatch, searchTerm, activeFilters]);
  
  const activeFilterCount = Object.values(activeFilters).reduce((count, arr) => count + arr.length, 0);
  
  const clearFilter = (category: FilterCategory, value: string) => {
      setActiveFilters(prev => ({
          ...prev,
          [category]: prev[category].filter((v: string) => v !== value)
      }));
  };

  const handleGenerateReport = async () => {
    setError(null);
    try {
        await generateAndSetWardrobeReport();
        navigate('/report');
    } catch (e: any) {
        // Error is already set in context, so we just catch it to prevent unhandled promise rejection
        console.error("Failed to generate report from LibraryPage:", e);
    }
  };

  const tabButtonClasses = "flex-1 py-3 text-sm font-bold transition-colors focus:outline-none";
  const activeTabClasses = "text-brand-accent border-b-2 border-brand-accent";
  const inactiveTabClasses = "text-slate-500 hover:text-brand-secondary";

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-brand-primary mb-4">My Closet</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {!styleProfile ? (
                <div className="bg-gradient-to-r from-brand-secondary to-brand-accent p-6 rounded-xl shadow-lg text-white text-center animate-fadeIn flex flex-col justify-center">
                    <Icon icon="diamond" className="w-10 h-10 mx-auto mb-2"/>
                    <h2 className="text-2xl font-bold">Discover Your Style Profile</h2>
                    <p className="mt-1 opacity-90">Take our quick AI-powered quiz to unlock personalized insights and recommendations.</p>
                    <Link to="/quiz" className="mt-4 inline-block bg-white text-brand-accent font-bold py-2 px-6 rounded-full shadow-md hover:bg-opacity-90 transition-transform hover:scale-105">
                        Start the Quiz
                    </Link>
                </div>
            ) : (
                 <div className="bg-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <p className="text-sm font-semibold text-brand-primary">MY STYLE PROFILE</p>
                        <p className="text-xl font-bold text-brand-secondary">{styleProfile.profileName}</p>
                    </div>
                    <Link to="/profile" className="font-bold text-brand-accent hover:underline">
                        View Details &rarr;
                    </Link>
                </div>
            )}
            {!colorProfile ? (
                <div className="bg-gradient-to-r from-pink-500 to-yellow-500 p-6 rounded-xl shadow-lg text-white text-center animate-fadeIn flex flex-col justify-center">
                    <Icon icon="palette" className="w-10 h-10 mx-auto mb-2"/>
                    <h2 className="text-2xl font-bold">Find Your Perfect Colors</h2>
                    <p className="mt-1 opacity-90">Get a personal color analysis to find which shades make you shine.</p>
                    <Link to="/color-analysis" className="mt-4 inline-block bg-white text-pink-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-opacity-90 transition-transform hover:scale-105">
                        Analyze My Colors
                    </Link>
                </div>
            ) : (
                 <div className="bg-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                    <div>
                        <p className="text-sm font-semibold text-brand-primary">MY COLOR PROFILE</p>
                        <p className="text-xl font-bold text-brand-secondary">{colorProfile.season}</p>
                    </div>
                    <Link to="/color-profile" className="font-bold text-brand-accent hover:underline">
                        View Palette &rarr;
                    </Link>
                </div>
            )}
        </div>

        <div className="mb-6 border-b border-slate-200">
            <div className="flex">
                <button
                    onClick={() => setActiveTab('looks')}
                    className={`${tabButtonClasses} ${activeTab === 'looks' ? activeTabClasses : inactiveTabClasses}`}
                >
                    Looks ({savedLooks.length})
                </button>
                <button
                    onClick={() => setActiveTab('outfits')}
                    className={`${tabButtonClasses} ${activeTab === 'outfits' ? activeTabClasses : inactiveTabClasses}`}
                >
                    Outfits ({savedOutfits.length})
                </button>
                <button
                    onClick={() => setActiveTab('wardrobe')}
                    className={`${tabButtonClasses} ${activeTab === 'wardrobe' ? activeTabClasses : inactiveTabClasses}`}
                >
                    Wardrobe ({wardrobeItems.length})
                </button>
                <button
                    onClick={() => setActiveTab('wellness')}
                    className={`${tabButtonClasses} ${activeTab === 'wellness' ? activeTabClasses : inactiveTabClasses}`}
                >
                    Wellness
                </button>
                 <button
                    onClick={() => setActiveTab('inspirations')}
                    className={`${tabButtonClasses} ${activeTab === 'inspirations' ? activeTabClasses : inactiveTabClasses}`}
                >
                    Inspirations ({inspirations.length})
                </button>
            </div>
        </div>
        
        {activeTab === 'wellness' && (
            <div className="animate-fadeIn text-center py-10 bg-white rounded-lg shadow-md">
                {isGeneratingReport ? (
                    <LoadingSpinner text="Analyzing your wardrobe..." />
                ) : (
                    <>
                        <Icon icon="heart-pulse" className="w-16 h-16 text-brand-secondary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-brand-primary">Wardrobe Wellness Report</h2>
                        <p className="text-slate-600 my-4 max-w-lg mx-auto">Get a holistic AI-powered analysis of your entire wardrobe—discover your color palette, style DNA, and get personalized tips to make the most of what you own.</p>
                        {error && <p className="text-feedback-red mb-4">{error}</p>}
                        {wardrobeReport ? (
                             <Link to="/report" className="bg-brand-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all">
                                View My Report
                            </Link>
                        ) : (
                             <button onClick={handleGenerateReport} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all">
                                Generate My Report
                            </button>
                        )}
                         <p className="text-xs text-slate-400 mt-4">Requires at least 5 items in your wardrobe.</p>
                    </>
                )}
            </div>
        )}

        {activeTab === 'looks' && (
          <div className="animate-fadeIn">
            {savedLooks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <p className="text-slate-500 text-lg">You haven't saved any looks yet.</p>
                <p className="text-slate-400 mt-2">Scan a look and save the results to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedLooks.map(look => (
                  <Link to={`/library/${look.id}`} key={look.id} className="block bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                    <img src={look.image} alt={`Look for ${look.occasion}`} className="w-full h-64 object-cover" />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                         <h2 className="text-xl font-bold text-brand-primary">{look.occasion}</h2>
                         <span className="text-sm text-slate-500">{look.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">"{look.ratingReason}"</p>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          look.overallRating === 'Perfect' ? 'bg-green-100 text-green-800' :
                          look.overallRating === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                        {look.overallRating === 'NeedsAdjustment' ? 'Adjustments Suggested' : look.overallRating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'outfits' && (
          <div className="animate-fadeIn">
            {savedOutfits.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-md">
                 <Icon icon="mixer" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">You haven't saved any outfits.</p>
                <p className="text-slate-400 mt-2">Go to the <Link to="/studio" state={{ defaultTab: 'mixer' }} className="font-bold text-brand-accent hover:underline">Style Studio</Link> to create some!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedOutfits.map(outfit => {
                    const outfitItems = outfit.itemIds.map(id => wardrobeItems.find(item => item.id === id)).filter(Boolean);
                    return (
                        <div key={outfit.id} className="bg-white rounded-xl shadow-lg flex flex-col">
                            <div className="p-4 flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-brand-primary line-clamp-2">{outfit.name || `AI: "${outfit.prompt}"`}</p>
                                    <p className="text-xs text-slate-500">{outfit.date}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteOutfit(outfit.id); }} className="p-1 text-slate-400 hover:text-feedback-red">
                                    <Icon icon="trash" className="w-5 h-5"/>
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1 px-4 flex-grow">
                               {outfitItems.slice(0, 6).map(item => (
                                   item ? <img key={item.id} src={item.image} className="w-full aspect-square object-cover rounded-md bg-slate-100" /> : null
                               ))}
                            </div>
                            {outfit.reasoning && (
                                <div className="p-4 mt-2">
                                    <p className="text-sm text-slate-600 bg-indigo-50 p-3 rounded-lg">"{outfit.reasoning}"</p>
                                </div>
                            )}
                            <div className="p-4 mt-auto">
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                    {outfitItems.length} {outfitItems.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                        </div>
                    );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inspirations' && (
           <div className="animate-fadeIn">
            {inspirations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <Icon icon="brush" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Your inspiration board is empty.</p>
                <p className="text-slate-400 mt-2">Go to the <Link to="/studio" className="font-bold text-brand-accent hover:underline">Style Studio</Link> to generate some AI-powered inspiration!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspirations.map(item => (
                  <div key={item.id} className="block bg-white rounded-xl shadow-lg overflow-hidden">
                    <img src={item.image} alt={item.prompt} className="w-full aspect-[9/16] object-cover" />
                    <div className="p-4">
                      <p className="text-xs text-slate-500 mb-2">{item.date}</p>
                      <p className="text-sm text-slate-700 font-medium line-clamp-3">"{item.prompt}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'wardrobe' && (
           <div className="animate-fadeIn">
            {wardrobeItems.length > 0 && (
                <div className="mb-4">
                <div className="flex gap-4">
                    <input
                    type="text"
                    placeholder="Search your wardrobe..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    />
                    <button
                    onClick={() => setIsFilterPanelOpen(true)}
                    className="relative flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-brand-primary font-semibold hover:bg-slate-50"
                    >
                    <Icon icon="filter" className="w-5 h-5" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{activeFilterCount}</span>}
                    </button>
                </div>
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(activeFilters).flatMap(([category, values]) => 
                            (values as string[]).map(value => (
                                <div key={`${category}-${value}`} className="flex items-center gap-1 bg-brand-secondary text-white text-xs font-semibold px-2 py-1 rounded-full">
                                    <span className="capitalize">{value}</span>
                                    <button onClick={() => clearFilter(category as FilterCategory, value)} className="font-bold">&times;</button>
                                </div>
                            ))
                        )}
                    </div>
                )}
                </div>
            )}

            {wardrobeItems.length === 0 ? (
              <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md animate-fadeIn">
                <Icon icon="hanger" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-brand-primary">Start Your Virtual Wardrobe</h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto">Add your clothes to unlock AI-powered features like the Outfit Mixer and Travel Packer. Not ready to scan? Add our starter pack to try it out!</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <button 
                    onClick={addStarterPack}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-brand-accent text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Icon icon="sparkles" className="w-5 h-5" />
                    <span>Add Starter Pack</span>
                  </button>
                  <Link to="/add-item" className="w-full sm:w-auto font-bold text-brand-primary hover:text-brand-accent transition">
                      Or Add Your Own First Item &rarr;
                  </Link>
                </div>
              </div>
            ) : filteredWardrobeItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                  <p className="text-slate-500 text-lg">No items match your search.</p>
                  <p className="text-slate-400 mt-2">Try adjusting your search term or filters.</p>
                </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredWardrobeItems.map(item => (
                  <div key={item.id} className="relative block bg-white rounded-xl shadow-lg overflow-hidden group">
                     {item.isBestColor && (
                        <div className="absolute top-1.5 left-1.5 z-10" title="This is one of your best colors!">
                            <Icon icon="sparkles" className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                        </div>
                     )}
                     <div className="absolute top-1.5 right-1.5 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); openEditItemModal(item.id); }}
                            className="bg-black bg-opacity-40 text-white rounded-full p-1 hover:bg-brand-secondary"
                            aria-label="Edit item"
                        >
                            <Icon icon="pencil" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteWardrobeItem(item.id);
                            }}
                            className="bg-black bg-opacity-40 text-white rounded-full p-1 hover:bg-feedback-red"
                            aria-label="Delete item"
                        >
                            <Icon icon="trash" className="w-4 h-4" />
                        </button>
                    </div>
                    <img src={item.image} alt={item.description} className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="text-sm text-brand-primary font-bold truncate">{item.category}</p>
                      <p className="text-xs text-slate-500 truncate mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.colors.slice(0, 3).map(color => (
                            <span key={color} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full capitalize">{color}</span>
                        ))}
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">{item.season}</span>
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full capitalize">{item.style}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {wardrobeItems.length > 0 &&
                <Link to="/add-item" className="fixed bottom-24 right-6 bg-brand-accent text-white rounded-full p-4 shadow-xl hover:bg-opacity-90 transform hover:scale-105 transition">
                    <Icon icon="plus" className="w-8 h-8"/>
                </Link>
            }
          </div>
        )}
      </div>
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={setActiveFilters}
        activeFilters={activeFilters}
        filterOptions={filterOptions}
      />
    </div>
  );
};

export default LibraryPage;