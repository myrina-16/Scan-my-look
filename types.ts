export type Occasion = "Wedding" | "Office" | "Casual" | "Date Night" | "Party" | "Traditional Event";

export interface Suggestions {
  hairstyle: string[];
  makeup: string[];
  accessories: string[];
}

export interface AnalysisResult {
  detectedItems: string[];
  overallRating: "Perfect" | "Good" | "NeedsAdjustment";
  ratingReason: string;
  suggestions: Suggestions;
}

export interface SavedLook extends AnalysisResult {
  id: string;
  occasion: Occasion;
  image: string;
  date: string;
}

export interface OccasionGuide {
  [key: string]: {
    title: string;
    description: string;
    tips: string[];
  };
}

// Represents the shape of the data returned by the Gemini API for analysis
export interface GeminiAnalysisResponse {
    detectedItems: string[];
    overallRating: "Perfect" | "Good" | "NeedsAdjustment";
    ratingReason: string;
    suggestions: Suggestions;
}

// Represents an AI-generated outfit inspiration
export interface Inspiration {
  id: string;
  image: string;
  prompt: string;
  date: string;
}

// Represents a shoppable item found by the AI
export interface ShoppingItem {
  itemName: string;
  description: string;
}

// Represents a web source from Google Search grounding
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

// Represents the combined result for the shopping modal
export interface ShoppingResult {
  items: ShoppingItem[];
  sources: GroundingChunk[];
}

// Represents an individual clothing item in the user's virtual wardrobe
export interface WardrobeItem {
  id: string;
  image: string; // base64 encoded image
  category: string; // e.g., 'Top', 'Jeans', 'Sneakers'
  description: string; // e.g., 'White short-sleeve cotton t-shirt'
  dateAdded: string;
  colors: string[]; // e.g., ['blue', 'white']
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All';
  style: string; // e.g., 'Casual', 'Bohemian'
}

// Represents an event with a planned outfit
export interface PlannedEvent {
  id: string;
  name: string;
  date: string; // ISO string format for dates
  outfitItemIds: string[]; // Array of WardrobeItem IDs
}

// Represents a user-created or AI-generated outfit
export interface SavedOutfit {
  id: string;
  date: string;
  itemIds: string[];
  name?: string; // For manually created outfits
  prompt?: string; // For AI generated outfits
  reasoning?: string; // For AI generated outfits
}


// Travel Packer Feature Types
export interface SuggestedOutfit {
  itemIds: string[];
  description: string; // e.g., "A casual outfit for exploring the city."
}

export interface PackingListResult {
  packingListItemIds: string[];
  suggestedOutfits: SuggestedOutfit[];
  packingTips: string[];
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  tripType: "Business" | "Vacation" | "Weekend Getaway" | "Other";
  packingList?: PackingListResult;
}

// Style Profile Quiz Types
export interface QuizAnswer {
  text: string;
  value: string; // The value to be sent to Gemini
}

export interface QuizQuestion {
  id: number;
  question: string;
  answers: QuizAnswer[];
}

export interface StyleProfile {
  profileName: string;
  description: string;
  keyElements: string[];
  styleIcons: string[];
}

// Personal Color Analysis Types
export interface ColorProfile {
  season: string; // e.g., "Deep Winter", "Soft Autumn"
  description: string;
  palette: {
    name: string;
    hex: string;
  }[];
  celebrityExamples: string[];
  tips: {
    clothing: string[];
    makeup: string[];
    accessories: string[];
  }
}

// Trend Spotter Types
export interface Trend {
  title: string;
  summary: string;
  keyItems: string[];
}

export interface TrendResult {
  trends: Trend[];
  sources: GroundingChunk[];
}

// Wardrobe Wellness Report Types
export interface ColorAnalysis {
  color: string; // e.g., "blue"
  percentage: number; // e.g., 30
}

export interface StyleAnalysis {
  style: string; // e.g., "Casual"
  percentage: number; // e.g., 70
}

export interface WardrobeOrphan {
  itemId: string;
  reason: string; // e.g., "This vibrant jacket has few matching partners."
  suggestion: string; // e.g., "Pair it with your white t-shirt and blue jeans for a balanced look."
}

export interface ShoppingSuggestion {
    itemName: string; // e.g., "A classic trench coat"
    reason: string; // e.g., "This would bridge your casual and office pieces, adding versatility."
}

export interface WardrobeReport {
  overallImpressions: string;
  colorAnalysis: ColorAnalysis[];
  styleAnalysis: StyleAnalysis[];
  wardrobeOrphans: WardrobeOrphan[];
  shoppingSuggestions: ShoppingSuggestion[];
}

// Look Completion Types
export interface LookCompletionResult {
  outfitName: string;
  outfitReasoning: string;
  existingItemIds: string[];
  suggestedItems: ShoppingItem[];
}

// AI Stylist Chat types
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

// Palette Stylist Types
export interface PaletteOutfitResult {
    palette: string[]; // Array of hex color codes
    itemIds: string[];
    reasoning: string;
}