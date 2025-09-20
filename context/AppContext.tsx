import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { GoogleGenAI, Chat, Type, Part } from '@google/genai';
import { Occasion, AnalysisResult, SavedLook, Inspiration, ShoppingResult, WardrobeItem, PlannedEvent, SavedOutfit, Trip, PackingListResult, StyleProfile, ColorProfile, TrendResult, WardrobeReport, LookCompletionResult, PaletteOutfitResult, ChatMessage } from '../types';
import { OCCASIONS } from '../constants';
import { findShoppingItems, analyzeClothingItem, createOutfitFromWardrobe, generatePackingList, generateStyleProfile, analyzeUserColors, spotTrends, generateWardrobeReport, completeTheLook, createOutfitFromColorPalette, fuseImages, generateOutfitImage as generateImage } from '../services/geminiService';
import { STARTER_PACK } from '../data/starter-pack-data';

type WardrobeItemUpdates = Partial<Pick<WardrobeItem, 'category' | 'description' | 'colors' | 'season' | 'style'>>;
interface AppContextType {
  occasion: Occasion;
  setOccasion: (occasion: Occasion) => void;
  scannedImage: string | null;
  setScannedImage: (image: string | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  savedLooks: SavedLook[];
  saveCurrentLook: () => void;
  inspirations: Inspiration[];
  saveInspiration: (image: string, prompt: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Shopping Modal State
  isShoppingModalOpen: boolean;
  isShoppingLoading: boolean;
  shoppingResult: ShoppingResult | null;
  shoppingError: string | null;
  findAndShowShoppingItems: (options: { image?: string; prompt?: string }) => Promise<void>;
  closeShoppingModal: () => void;

  // Wardrobe State
  wardrobeItems: WardrobeItem[];
  addWardrobeItem: (image: string) => Promise<void>;
  deleteWardrobeItem: (itemId: string) => void;
  updateWardrobeItem: (itemId: string, updates: WardrobeItemUpdates) => void;
  editingItem: WardrobeItem | null;
  openEditItemModal: (itemId: string) => void;
  closeEditItemModal: () => void;
  addStarterPack: () => void;

  // Outfit Mixer State
  isGeneratingOutfit: boolean;
  outfitSuggestion: { items: WardrobeItem[], reasoning: string } | null;
  outfitError: string | null;
  generateOutfitSuggestion: (prompt: string, eventId?: string) => Promise<void>;
  clearOutfitSuggestion: () => void;
  savedOutfits: SavedOutfit[];
  saveOutfit: (outfitData: Omit<SavedOutfit, 'id' | 'date'>) => void;
  deleteOutfit: (outfitId: string) => void;


  // Planner State
  plannedEvents: PlannedEvent[];
  addPlannedEvent: (name: string, date: string) => void;
  updatePlannedEventOutfit: (eventId: string, outfitItemIds: string[]) => void;
  deletePlannedEvent: (eventId: string) => void;

  // Trip State
  trips: Trip[];
  addTrip: (destination: string, startDate: string, endDate: string, tripType: Trip['tripType']) => void;
  deleteTrip: (tripId: string) => void;
  generateAndSetPackingList: (tripId: string) => Promise<void>;
  isGeneratingPackingList: boolean;

  // Style Profile State
  styleProfile: StyleProfile | null;
  isGeneratingProfile: boolean;
  generateAndSetStyleProfile: (answers: string[]) => Promise<void>;
  clearStyleProfile: () => void;

  // Color Profile State
  colorProfile: ColorProfile | null;
  isGeneratingColorProfile: boolean;
  generateAndSetColorProfile: (image: string) => Promise<void>;
  clearColorProfile: () => void;

  // Trend Spotter State
  trendResult: TrendResult | null;
  isSpottingTrends: boolean;
  fetchTrends: () => Promise<void>;
  clearTrends: () => void;

  // Wardrobe Wellness State
  wardrobeReport: WardrobeReport | null;
  isGeneratingReport: boolean;
  generateAndSetWardrobeReport: () => Promise<void>;

  // Look Completion State
  lookCompletionResult: LookCompletionResult | null;
  isCompletingLook: boolean;
  lookCompletionError: string | null;
  findLookCompletions: (items: WardrobeItem[]) => Promise<void>;
  clearLookCompletion: () => void;
  
  // Palette Stylist State
  paletteOutfitResult: PaletteOutfitResult | null;
  isGeneratingFromPalette: boolean;
  paletteError: string | null;
  generateOutfitFromPalette: (image: string) => Promise<void>;
  clearPaletteOutfit: () => void;

  // Daily Outfit Suggestion
  dailyOutfit: { items: WardrobeItem[], reasoning: string } | null;
  isGeneratingDailyOutfit: boolean;
  dailyOutfitError: string | null;
  generateDailyOutfit: () => Promise<void>;

  // AI Fusion for Virtual Try-On
  isFusingLook: boolean;
  fuseLookError: string | null;
  generateFusedLook: (userImage: string, itemImage: string) => Promise<string | null>;
  
  // Stylist Chat
  chatSession: Chat | null;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isGeneratingImage: boolean;
  chatError: string | null;
  initializeChat: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [occasion, setOccasion] = useState<Occasion>(OCCASIONS[0]);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Shopping state
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [isShoppingLoading, setIsShoppingLoading] = useState(false);
  const [shoppingResult, setShoppingResult] = useState<ShoppingResult | null>(null);
  const [shoppingError, setShoppingError] = useState<string | null>(null);

  // Wardrobe state
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  // Outfit Mixer state
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [outfitSuggestion, setOutfitSuggestion] = useState<{ items: WardrobeItem[], reasoning: string } | null>(null);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  // Planner state
  const [plannedEvents, setPlannedEvents] = useState<PlannedEvent[]>([]);

  // Trip state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isGeneratingPackingList, setIsGeneratingPackingList] = useState(false);

  // Style Profile state
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  // Color Profile state
  const [colorProfile, setColorProfile] = useState<ColorProfile | null>(null);
  const [isGeneratingColorProfile, setIsGeneratingColorProfile] = useState(false);

  // Trend Spotter state
  const [trendResult, setTrendResult] = useState<TrendResult | null>(null);
  const [isSpottingTrends, setIsSpottingTrends] = useState(false);

  // Wardrobe Wellness state
  const [wardrobeReport, setWardrobeReport] = useState<WardrobeReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Look Completion state
  const [lookCompletionResult, setLookCompletionResult] = useState<LookCompletionResult | null>(null);
  const [isCompletingLook, setIsCompletingLook] = useState(false);
  const [lookCompletionError, setLookCompletionError] = useState<string | null>(null);
  
  // Palette Stylist State
  const [paletteOutfitResult, setPaletteOutfitResult] = useState<PaletteOutfitResult | null>(null);
  const [isGeneratingFromPalette, setIsGeneratingFromPalette] = useState(false);
  const [paletteError, setPaletteError] = useState<string | null>(null);

  // Daily Outfit Suggestion state
  const [dailyOutfit, setDailyOutfit] = useState<{ items: WardrobeItem[], reasoning: string } | null>(null);
  const [isGeneratingDailyOutfit, setIsGeneratingDailyOutfit] = useState(false);
  const [dailyOutfitError, setDailyOutfitError] = useState<string | null>(null);

  // AI Fusion state
  const [isFusingLook, setIsFusingLook] = useState(false);
  const [fuseLookError, setFuseLookError] = useState<string | null>(null);
  
  // AI Stylist Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // --- Callback Functions ---
  
  const saveCurrentLook = useCallback(() => {
    if (analysisResult && scannedImage) {
      const newSavedLook: SavedLook = {
        id: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        image: scannedImage,
        occasion,
        ...analysisResult,
      };
      setSavedLooks(prevLooks => [newSavedLook, ...prevLooks]);
      alert("Look saved to your closet!");
    }
  }, [analysisResult, scannedImage, occasion]);

  const saveInspiration = useCallback((image: string, prompt: string) => {
    const newInspiration: Inspiration = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      image,
      prompt,
    };
    setInspirations(prev => [newInspiration, ...prev]);
  }, []);

  const findAndShowShoppingItems = useCallback(async (options: { image?: string; prompt?: string }) => {
    setIsShoppingLoading(true);
    setShoppingResult(null);
    setShoppingError(null);
    setIsShoppingModalOpen(true);
    
    try {
      const base64Image = options.image ? options.image.split(',')[1] : undefined;
      const result = await findShoppingItems({ image: base64Image, prompt: options.prompt });
      setShoppingResult(result);
    } catch (e: any) {
        setShoppingError(e.message || "An unknown error occurred while finding items.");
    } finally {
        setIsShoppingLoading(false);
    }
  }, []);

  const closeShoppingModal = useCallback(() => {
    setIsShoppingModalOpen(false);
    setShoppingResult(null);
    setShoppingError(null);
  }, []);

  const addWardrobeItem = useCallback(async (image: string) => {
      const base64Image = image.split(',')[1];
      const { category, description, colors, season, style } = await analyzeClothingItem(base64Image);
      const newWardrobeItem: WardrobeItem = {
          id: new Date().toISOString(),
          dateAdded: new Date().toLocaleDateString(),
          image: image,
          category,
          description,
          colors,
          season,
          style
      };
      setWardrobeItems(prev => [newWardrobeItem, ...prev]);
  }, []);

  const deleteWardrobeItem = useCallback((itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item? It will also be removed from any saved or planned outfits.")) {
        return;
    }

    setWardrobeItems(prev => prev.filter(item => item.id !== itemId));

    setSavedOutfits(prev =>
        prev
            .map(outfit => ({
                ...outfit,
                itemIds: outfit.itemIds.filter(id => id !== itemId),
            }))
            .filter(outfit => outfit.itemIds.length > 0)
    );

    setPlannedEvents(prev =>
        prev.map(event => ({
            ...event,
            outfitItemIds: event.outfitItemIds.filter(id => id !== itemId),
        }))
    );

    setTrips(prev => 
        prev.map(trip => {
            if (!trip.packingList) return trip;
            
            const updatedPackingList: PackingListResult = {
                ...trip.packingList,
                packingListItemIds: trip.packingList.packingListItemIds.filter(id => id !== itemId),
                suggestedOutfits: trip.packingList.suggestedOutfits
                    .map(outfit => ({
                        ...outfit,
                        itemIds: outfit.itemIds.filter(id => id !== itemId)
                    }))
                    .filter(outfit => outfit.itemIds.length > 0)
            };
            
            return { ...trip, packingList: updatedPackingList };
        })
    );
  }, [setWardrobeItems, setSavedOutfits, setPlannedEvents, setTrips]);
  
  const openEditItemModal = useCallback((itemId: string) => {
    const itemToEdit = wardrobeItems.find(item => item.id === itemId);
    if (itemToEdit) {
        setEditingItem(itemToEdit);
    }
  }, [wardrobeItems]);

  const closeEditItemModal = useCallback(() => {
    setEditingItem(null);
  }, []);

  const updateWardrobeItem = useCallback((itemId: string, updates: WardrobeItemUpdates) => {
    setWardrobeItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
    ));
    closeEditItemModal();
  }, [closeEditItemModal]);

  const addStarterPack = useCallback(() => {
    setWardrobeItems(STARTER_PACK);
  }, []);

  const updatePlannedEventOutfit = useCallback((eventId: string, outfitItemIds: string[]) => {
    setPlannedEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, outfitItemIds } : event
    ));
  }, []);

  const generateOutfitSuggestion = useCallback(async (prompt: string, eventId?: string) => {
    if (wardrobeItems.length < 2) {
        setOutfitError("You need at least two items in your wardrobe to generate an outfit.");
        return;
    }

    setIsGeneratingOutfit(true);
    setOutfitSuggestion(null);
    setOutfitError(null);

    try {
      const itemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
      const { itemIds, reasoning } = await createOutfitFromWardrobe(itemsForPrompt, prompt, styleProfile, colorProfile);
      
      const suggestedItems = wardrobeItems.filter(item => itemIds.includes(item.id));

      if (suggestedItems.length === 0) {
        throw new Error("The AI couldn't create an outfit from your current wardrobe. Try a different prompt or add more items!");
      }

      setOutfitSuggestion({ items: suggestedItems, reasoning });

      if (eventId) {
        updatePlannedEventOutfit(eventId, itemIds);
      }

    } catch (e: any) {
        setOutfitError(e.message || "An unknown error occurred while creating your outfit.");
    } finally {
        setIsGeneratingOutfit(false);
    }
  }, [wardrobeItems, styleProfile, colorProfile, updatePlannedEventOutfit]);

  const clearOutfitSuggestion = useCallback(() => {
    setOutfitSuggestion(null);
    setOutfitError(null);
  }, []);
  
  const saveOutfit = useCallback((outfitData: Omit<SavedOutfit, 'id' | 'date'>) => {
    const newOutfit: SavedOutfit = {
        id: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        ...outfitData
    };
    setSavedOutfits(prev => [newOutfit, ...prev]);
    alert("Outfit saved to your closet!");
  }, []);

  const deleteOutfit = useCallback((outfitId: string) => {
    setSavedOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
  }, []);

  const addPlannedEvent = useCallback((name: string, date: string) => {
    const newEvent: PlannedEvent = {
        id: `event_${new Date().toISOString()}`,
        name,
        date,
        outfitItemIds: [],
    };
    setPlannedEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, []);

  const deletePlannedEvent = useCallback((eventId: string) => {
    setPlannedEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const addTrip = useCallback((destination: string, startDate: string, endDate: string, tripType: Trip['tripType']) => {
    const newTrip: Trip = {
        id: `trip_${new Date().toISOString()}`,
        destination,
        startDate,
        endDate,
        tripType,
    };
    setTrips(prev => [...prev, newTrip].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  }, []);

  const generateAndSetPackingList = useCallback(async (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) {
        setError("Could not find the specified trip.");
        return;
    }
    if (wardrobeItems.length < 2) {
        setError("You need at least two items in your wardrobe to generate a packing list.");
        return;
    }
    
    setIsGeneratingPackingList(true);
    setError(null);

    try {
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
        const itemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));

        const result = await generatePackingList(itemsForPrompt, trip.destination, duration, trip.tripType);
        
        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, packingList: result } : t));

    } catch (e: any) {
        setError(e.message || "An unknown error occurred while creating your packing list.");
    } finally {
        setIsGeneratingPackingList(false);
    }
  }, [trips, wardrobeItems]);

  const generateAndSetStyleProfile = useCallback(async (answers: string[]) => {
    setIsGeneratingProfile(true);
    setError(null);
    try {
        const profile = await generateStyleProfile(answers);
        setStyleProfile(profile);
    } catch (e: any) {
        setError(e.message || "An unknown error occurred while generating your style profile.");
        throw e; 
    } finally {
        setIsGeneratingProfile(false);
    }
  }, []);

  const clearStyleProfile = useCallback(() => {
    setStyleProfile(null);
  }, []);

  const generateAndSetColorProfile = useCallback(async (image: string) => {
    setIsGeneratingColorProfile(true);
    setError(null);
    try {
        const base64Image = image.split(',')[1];
        const profile = await analyzeUserColors(base64Image);
        setColorProfile(profile);
    } catch (e: any) {
        setError(e.message || "An unknown error occurred while analyzing your colors.");
        throw e;
    } finally {
        setIsGeneratingColorProfile(false);
    }
  }, []);

  const clearColorProfile = useCallback(() => {
    setColorProfile(null);
  }, []);

  const fetchTrends = useCallback(async () => {
    setIsSpottingTrends(true);
    setError(null);
    try {
        const result = await spotTrends();
        setTrendResult(result);
    } catch (e: any) {
        setError(e.message || "Could not fetch trends at this time.");
    } finally {
        setIsSpottingTrends(false);
    }
  }, []);

  const clearTrends = useCallback(() => {
    setTrendResult(null);
    setError(null);
  }, []);

  const generateAndSetWardrobeReport = useCallback(async () => {
    if (wardrobeItems.length < 5) {
        setError("You need at least 5 items in your wardrobe to generate a meaningful report.");
        return;
    }
    setIsGeneratingReport(true);
    setError(null);
    try {
        const itemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
        const report = await generateWardrobeReport(itemsForPrompt, styleProfile);
        setWardrobeReport(report);
    } catch (e: any) {
        setError(e.message || "An unknown error occurred while generating your wardrobe report.");
        throw e;
    } finally {
        setIsGeneratingReport(false);
    }
  }, [wardrobeItems, styleProfile]);

  const findLookCompletions = useCallback(async (baseItems: WardrobeItem[]) => {
    if (baseItems.length === 0) {
        setLookCompletionError("Please select at least one item from your wardrobe.");
        return;
    }

    setIsCompletingLook(true);
    setLookCompletionResult(null);
    setLookCompletionError(null);

    try {
        const baseItemsForPrompt = baseItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
        const allItemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
        const result = await completeTheLook(baseItemsForPrompt, allItemsForPrompt);
        setLookCompletionResult(result);
    } catch (e: any) {
        setLookCompletionError(e.message || "An unknown error occurred while completing your look.");
    } finally {
        setIsCompletingLook(false);
    }
  }, [wardrobeItems]);

  const clearLookCompletion = useCallback(() => {
    setLookCompletionResult(null);
    setLookCompletionError(null);
  }, []);
  
  const generateOutfitFromPalette = useCallback(async (image: string) => {
    if (wardrobeItems.length < 2) {
        setPaletteError("You need at least two items in your wardrobe for this feature.");
        return;
    }
    setIsGeneratingFromPalette(true);
    setPaletteOutfitResult(null);
    setPaletteError(null);
    try {
        const base64Image = image.split(',')[1];
        const itemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
        const result = await createOutfitFromColorPalette(base64Image, itemsForPrompt);
        setPaletteOutfitResult(result);
    } catch (e: any) {
        setPaletteError(e.message || "An unknown error occurred while creating your outfit.");
    } finally {
        setIsGeneratingFromPalette(false);
    }
  }, [wardrobeItems]);

  const clearPaletteOutfit = useCallback(() => {
    setPaletteOutfitResult(null);
    setPaletteError(null);
  }, []);
  
  const generateDailyOutfit = useCallback(async () => {
    if (wardrobeItems.length < 3) {
      setDailyOutfitError("Add at least 3 items to your wardrobe for daily suggestions.");
      return;
    }
    setIsGeneratingDailyOutfit(true);
    setDailyOutfit(null);
    setDailyOutfitError(null);
    try {
      const itemsForPrompt = wardrobeItems.map(({ id, description, colors, season, style, category }) => ({ id, description, colors, season, style, category }));
      const prompt = "Create a stylish, coherent, and versatile outfit for today. Consider common daily activities.";
      const { itemIds, reasoning } = await createOutfitFromWardrobe(itemsForPrompt, prompt, styleProfile, colorProfile);

      const suggestedItems = wardrobeItems.filter(item => itemIds.includes(item.id));

      if (suggestedItems.length < 2) {
        throw new Error("Couldn't find a suitable outfit. Try adding more versatile items!");
      }

      setDailyOutfit({ items: suggestedItems, reasoning });

    } catch (e: any) {
      setDailyOutfitError(e.message || "An unknown error occurred while creating your outfit.");
    } finally {
      setIsGeneratingDailyOutfit(false);
    }
  }, [wardrobeItems, styleProfile, colorProfile]);

  const generateFusedLook = useCallback(async (userImage: string, itemImage: string): Promise<string | null> => {
    setIsFusingLook(true);
    setFuseLookError(null);
    try {
        const userImageBase64 = userImage.split(',')[1];
        const itemImageBase64 = itemImage.split(',')[1];
        const fusedImage = await fuseImages(userImageBase64, itemImageBase64);
        return fusedImage;
    } catch (e: any) {
        setFuseLookError(e.message || "An unknown error occurred during AI fusion.");
        return null;
    } finally {
        setIsFusingLook(false);
    }
  }, []);
  
  const initializeChat = useCallback(async () => {
    try {
        if (chatSession) return; 

        setIsChatLoading(true);
        setChatError(null);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const wardrobeSummary = wardrobeItems.length > 0 
            ? `Here is the user's wardrobe: ${JSON.stringify(wardrobeItems.map(({ id, category, description, colors, style }) => ({ id, category, description, colors, style })))}`
            : "The user's wardrobe is currently empty.";
            
        const profileSummary = styleProfile 
            ? `The user's style profile is '${styleProfile.profileName}': ${styleProfile.description}. Key elements are ${styleProfile.keyElements.join(', ')}.`
            : "The user has not defined a style profile.";

        const colorSummary = colorProfile
            ? `The user's color season is '${colorProfile.season}'. Their best colors are ${colorProfile.palette.map(c => c.name).join(', ')}.`
            : "The user has not done a color analysis.";

        const systemInstruction = `You are a friendly, expert AI fashion stylist named 'Stylo'. Your goal is to provide helpful, personalized fashion advice based on the user's wardrobe and style preferences.
        You have a tool to generate images of outfits. When a user asks for style advice or to see an outfit, use this tool to create a visual representation.
        First, create a detailed, photorealistic prompt for the image based on items in the user's wardrobe. The prompt should describe a person wearing the selected items in a suitable setting. Then call the 'generateOutfitImage' tool with this prompt.
        Be conversational and encouraging.
        Here is the user's information:
        - ${wardrobeSummary}
        - ${profileSummary}
        - ${colorSummary}
        
        Start the conversation by introducing yourself and asking how you can help.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                tools: [{
                    functionDeclarations: [{
                        name: "generateOutfitImage",
                        description: "Generates a photorealistic image of an outfit based on a detailed text description.",
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                prompt: {
                                    type: Type.STRING,
                                    description: "A detailed description of the outfit to generate. e.g., 'A photorealistic image of a fashion model wearing a stylish black leather moto jacket, a classic white crew-neck cotton t-shirt, and blue slim-fit denim jeans. The background is a clean, minimalist, light gray studio setting.'"
                                }
                            },
                            required: ["prompt"]
                        }
                    }]
                }],
            },
        });

        // FIX: chat.sendMessage expects an object with a `message` property.
        const initialResponse = await newChat.sendMessage({ message: "Hello" });

        setChatSession(newChat);
        setChatMessages([{ role: 'model', text: initialResponse.text }]);
    } catch (e: any) {
        setChatError(e.message || "Failed to start the stylist chat.");
        console.error("Chat initialization error:", e);
    } finally {
        setIsChatLoading(false);
    }
  }, [wardrobeItems, styleProfile, colorProfile, chatSession]);
  
  const sendChatMessage = useCallback(async (message: string) => {
    if (!chatSession) {
        setChatError("Chat is not initialized.");
        return;
    }

    setIsChatLoading(true);
    setIsGeneratingImage(false);
    setChatError(null);
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);

    try {
        // FIX: chat.sendMessage expects an object with a `message` property.
        const response = await chatSession.sendMessage({ message });
        
        const functionCallPart = response.candidates?.[0]?.content?.parts.find(part => part.functionCall);

        if (functionCallPart?.functionCall) {
            if (functionCallPart.functionCall.name === 'generateOutfitImage') {
                setIsGeneratingImage(true);
                const args = functionCallPart.functionCall.args;
                const prompt = args?.prompt;

                try {
                    if (typeof prompt !== 'string' || !prompt.trim()) {
                        throw new Error("The AI stylist didn't provide a description. Please try rephrasing your request.");
                    }
                    
                    const imageUrl = await generateImage(prompt);
                    
                    const functionResponse: Part[] = [{
                        functionResponse: {
                            name: "generateOutfitImage",
                            response: { imageUrl }
                        }
                    }];

                    // FIX: chat.sendMessage expects an object with a `message` property.
                    const finalResponse = await chatSession.sendMessage({ message: functionResponse });
                    
                    setChatMessages(prev => [...prev, { role: 'model', text: finalResponse.text, image: imageUrl }]);

                } catch (e: any) {
                    setChatError(e.message);
                    const errorResponsePayload: Part[] = [{
                        functionResponse: {
                            name: "generateOutfitImage",
                            response: { error: e.message || "Image generation failed." }
                        }
                    }];
                    // FIX: chat.sendMessage expects an object with a `message` property.
                    const errorResponse = await chatSession.sendMessage({ message: errorResponsePayload });
                    setChatMessages(prev => [...prev, { role: 'model', text: errorResponse.text }]);
                } finally {
                    setIsGeneratingImage(false);
                }
            } else {
                 setChatMessages(prev => [...prev, { role: 'model', text: "An unknown tool was called by the AI." }]);
            }
        } else {
            setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
        }

    } catch (e: any) {
        setChatError(e.message || "An error occurred while getting a response.");
        console.error("Send message error:", e);
    } finally {
        setIsChatLoading(false);
        setIsGeneratingImage(false);
    }
  }, [chatSession]);


  const clearChat = useCallback(() => {
      setChatSession(null);
      setChatMessages([]);
      setIsChatLoading(false);
      setChatError(null);
  }, []);



  const contextValue: AppContextType = {
    occasion,
    setOccasion,
    scannedImage,
    setScannedImage,
    analysisResult,
    setAnalysisResult,
    savedLooks,
    saveCurrentLook,
    inspirations,
    saveInspiration,
    isLoading,
    setIsLoading,
    error,
    setError,
    isShoppingModalOpen,
    isShoppingLoading,
    shoppingResult,
    shoppingError,
    findAndShowShoppingItems,
    closeShoppingModal,
    wardrobeItems,
    addWardrobeItem,
    deleteWardrobeItem,
    updateWardrobeItem,
    editingItem,
    openEditItemModal,
    closeEditItemModal,
    addStarterPack,
    isGeneratingOutfit,
    outfitSuggestion,
    outfitError,
    generateOutfitSuggestion,
    clearOutfitSuggestion,
    savedOutfits,
    saveOutfit,
    deleteOutfit,
    plannedEvents,
    addPlannedEvent,
    updatePlannedEventOutfit,
    deletePlannedEvent,
    trips,
    addTrip,
    deleteTrip,
    generateAndSetPackingList,
    isGeneratingPackingList,
    styleProfile,
    isGeneratingProfile,
    generateAndSetStyleProfile,
    clearStyleProfile,
    colorProfile,
    isGeneratingColorProfile,
    generateAndSetColorProfile,
    clearColorProfile,
    trendResult,
    isSpottingTrends,
    fetchTrends,
    clearTrends,
    wardrobeReport,
    isGeneratingReport,
    generateAndSetWardrobeReport,
    lookCompletionResult,
    isCompletingLook,
    lookCompletionError,
    findLookCompletions,
    clearLookCompletion,
    paletteOutfitResult,
    isGeneratingFromPalette,
    paletteError,
    generateOutfitFromPalette,
    clearPaletteOutfit,
    dailyOutfit,
    isGeneratingDailyOutfit,
    dailyOutfitError,
    generateDailyOutfit,
    isFusingLook,
    fuseLookError,
    generateFusedLook,
    chatSession,
    chatMessages,
    isChatLoading,
    isGeneratingImage,
    chatError,
    initializeChat,
    sendChatMessage,
    clearChat,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};