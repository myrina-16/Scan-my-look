


import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Occasion, GeminiAnalysisResponse, ShoppingResult, ShoppingItem, GroundingChunk, WardrobeItem, PackingListResult, StyleProfile, ColorProfile, TrendResult, Trend, WardrobeReport, LookCompletionResult, PaletteOutfitResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const styleTipsSchema = {
    type: Type.OBJECT,
    properties: {
        tips: {
            type: Type.ARRAY,
            description: "An array of 5 short, trendy, and quick style tips for today.",
            items: { type: Type.STRING }
        }
    },
    required: ["tips"]
};

export async function getStyleTips(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 5 short, trendy, and quick style tips for today.",
      config: {
        responseMimeType: "application/json",
        responseSchema: styleTipsSchema,
      }
    });
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.tips && Array.isArray(result.tips) && result.tips.length > 0) {
        return result.tips;
    }
    throw new Error("Invalid format for style tips");
  } catch (error) {
    console.error("Error fetching style tips:", error);
    return ["Could not fetch style tips at the moment. Please try again later."];
  }
}

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        detectedItems: {
            type: Type.ARRAY,
            description: "List of detected clothing items, hairstyle, and makeup.",
            items: { type: Type.STRING }
        },
        overallRating: {
            type: Type.STRING,
            description: "Overall rating of the look for the occasion.",
            enum: ["Perfect", "Good", "NeedsAdjustment"]
        },
        ratingReason: {
            type: Type.STRING,
            description: "A brief, constructive explanation for the rating."
        },
        suggestions: {
            type: Type.OBJECT,
            properties: {
                hairstyle: { 
                    type: Type.ARRAY, 
                    description: "3-4 alternative hairstyle suggestions.",
                    items: { type: Type.STRING } 
                },
                makeup: { 
                    type: Type.ARRAY,
                    description: "3-4 makeup palette or style suggestions.",
                    items: { type: Type.STRING }
                },
                accessories: { 
                    type: Type.ARRAY,
                    description: "3-4 accessory pairing suggestions.",
                    items: { type: Type.STRING }
                },
            },
            required: ["hairstyle", "makeup", "accessories"]
        }
    },
    required: ["detectedItems", "overallRating", "ratingReason", "suggestions"]
};


export async function analyzeLook(base64Image: string, occasion: Occasion): Promise<GeminiAnalysisResponse> {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
        text: `You are a world-class fashion stylist. Analyze the user's look in the provided image for a "${occasion}" event. Provide a detailed analysis based on the specified JSON schema.`
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisResponseSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as GeminiAnalysisResponse;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        console.error("Raw response text:", jsonText);
        throw new Error("The AI response was not in the expected format. Please try again.");
    }
}


export async function getOccasionGuide() {
    // This is a placeholder for a more complex implementation
    // In a real app, this might also use a Gemini call with a complex schema
    return Promise.resolve({
        "Wedding": {
            title: "Wedding Guest Etiquette",
            description: "Dressing for a wedding is about celebrating the couple while respecting the event's formality.",
            tips: [
                "Avoid wearing white, cream, or ivory.",
                "Opt for festive attire but don't upstage the bride.",
                "Check the dress code: black-tie, cocktail, or casual.",
                "Comfortable shoes are a must for dancing!"
            ]
        },
        "Office": {
            title: "Professional Polish",
            description: "Office wear should be professional, comfortable, and reflect your company's culture.",
            tips: [
                "Lean towards business casual unless a stricter dress code is in place.",
                "Ensure clothes are well-fitting, clean, and wrinkle-free.",
                "Avoid overly casual items like ripped jeans or graphic tees.",
                "When in doubt, it's better to be slightly overdressed."
            ]
        },
        "Date Night": {
            title: "Dazzling for Date Night",
            description: "Strike the perfect balance between comfort, confidence, and allure.",
            tips: [
                "Wear something that makes you feel confident and comfortable.",
                "Consider the venue: a fancy restaurant requires a different outfit than a movie night.",
                "A touch of personal style goes a long way.",
                "Pay attention to grooming and a nice fragrance."
            ]
        }
    });
}

export async function generateOutfitImage(prompt: string): Promise<string> {
    try {
      const fullPrompt = `A full-body, high-resolution, photorealistic image of a fashion model wearing ${prompt}. The model should be posed naturally. The background is a clean, minimalist, light gray studio setting to emphasize the clothing.`;
      
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: fullPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '9:16',
          },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      } else {
        throw new Error("No image was generated by the API.");
      }
    } catch (error) {
      console.error("Error generating outfit image:", error);
      throw new Error("Could not generate the outfit image. The request may have been blocked by safety filters. Please try a different prompt.");
    }
}

export async function findShoppingItems(options: { image?: string; prompt?: string }): Promise<ShoppingResult> {
    if (!options.image && !options.prompt) {
        throw new Error("Either an image or a prompt must be provided.");
    }

    const parts: any[] = [];
    let textPrompt = "";

    if (options.image) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: options.image } });
        textPrompt = `You are a fashion expert. Analyze the outfit in the image. Identify 3-5 key shoppable items (e.g., dress, shoes, handbag). For each item, provide a name and a brief, descriptive sentence. Use Google Search to find similar items and inform your descriptions. IMPORTANT: Respond ONLY with a valid JSON array of objects. Each object must have keys "itemName" and "description". Do not include any other text, greetings, or explanations before or after the JSON. Example: [{"itemName": "Red Floral Dress", "description": "A-line midi dress with a floral pattern and short sleeves."}]`;
    } else if (options.prompt) {
        textPrompt = `You are a fashion expert. The user wants to find items for this outfit: "${options.prompt}". Identify 3-5 key shoppable items based on this description. For each item, provide a name and a brief, descriptive sentence. Use Google Search to find similar items and inform your descriptions. IMPORTANT: Respond ONLY with a valid JSON array of objects. Each object must have keys "itemName" and "description". Do not include any other text, greetings, or explanations before or after the JSON. Example: [{"itemName": "Red Floral Dress", "description": "A-line midi dress with a floral pattern and short sleeves."}]`;
    }
    
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    let items: ShoppingItem[] = [];

    try {
        let jsonText = response.text.trim();
        // The model might wrap the JSON in markdown backticks
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        items = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse shopping items JSON from Gemini:", e);
        console.error("Raw text for shopping items:", response.text);
        throw new Error("The AI returned shopping data in an unexpected format. Please try again.");
    }

    return { items, sources };
}

const clothingItemSchema = {
    type: Type.OBJECT,
    properties: {
        category: {
            type: Type.STRING,
            description: "A single, specific category for the clothing item (e.g., 'Denim Jacket', 'T-Shirt', 'High-Heels', 'Handbag')."
        },
        description: {
            type: Type.STRING,
            description: "A concise, descriptive sentence about the item, including color, material, and style. e.g., 'A light-wash blue oversized denim jacket.'"
        },
        colors: {
            type: Type.ARRAY,
            description: "An array of the primary colors present in the item. Use simple, one-word, web-safe color names. e.g., ['blue', 'white']",
            items: { type: Type.STRING }
        },
        season: {
            type: Type.STRING,
            description: "The most appropriate season for this item.",
            enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'All']
        },
        style: {
            type: Type.STRING,
            description: "The primary style of the item (e.g., 'Casual', 'Formal', 'Bohemian', 'Sporty'). Keep it to a single word."
        }
    },
    required: ["category", "description", "colors", "season", "style"]
};

export async function analyzeClothingItem(base64Image: string): Promise<Omit<WardrobeItem, 'id' | 'image' | 'dateAdded'>> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: "Analyze the single clothing item in this image. The item is on a plain background. Identify its category and provide a detailed description according to the JSON schema." };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: clothingItemSchema,
        }
    });
    
    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse clothing item JSON from Gemini:", e);
        console.error("Raw text for clothing item:", jsonText);
        throw new Error("The AI returned clothing data in an unexpected format. Please try again.");
    }
}

const outfitSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        itemIds: {
            type: Type.ARRAY,
            description: "An array of the IDs of the selected wardrobe items.",
            items: { type: Type.STRING }
        },
        reasoning: {
            type: Type.STRING,
            description: "A short paragraph explaining why this outfit works."
        }
    },
    required: ["itemIds", "reasoning"]
};

type WardrobeItemSubset = Pick<WardrobeItem, 'id' | 'description' | 'colors' | 'season' | 'style' | 'category'>;

export async function createOutfitFromWardrobe(
    wardrobeItems: WardrobeItemSubset[], 
    prompt: string,
    styleProfile: StyleProfile | null,
    colorProfile: ColorProfile | null
): Promise<{ itemIds: string[]; reasoning: string; }> {
    const itemsList = wardrobeItems.map(item => JSON.stringify(item)).join('\n');
    const profileText = styleProfile 
      ? `The user's style profile is '${styleProfile.profileName}', described as: '${styleProfile.description}'. The key elements of their style are: ${styleProfile.keyElements.join(', ')}. Keep this profile in mind and prioritize creating an outfit that aligns with it.`
      : "The user has not completed a style profile, so focus solely on the user's prompt and general style principles.";
      
    const colorProfileText = colorProfile
        ? `The user's color profile is '${colorProfile.season}'. Their recommended color palette includes: ${colorProfile.palette.map(c => c.name).join(', ')}. Strongly prefer items with colors that match this palette.`
        : "The user has not completed a color profile analysis.";

    const fullPrompt = `You are an expert fashion stylist creating an outfit from a user's existing wardrobe.
    ${profileText}
    ${colorProfileText}

    The user's specific request for this outfit is: "${prompt}"

    Here is a list of available clothing items in their wardrobe, provided as a series of JSON objects:
    ${itemsList}

    Your task is to select 2 to 5 items from this list to create a coherent and stylish outfit that matches the user's request and their profiles (if provided).
    Pay close attention to the 'colors', 'season', and 'style' attributes to ensure the items match well. For example, don't mix 'Winter' and 'Summer' items unless appropriate, and try to create harmonious color palettes. If a color profile is available, prioritize those colors.
    
    Respond strictly with a JSON object that adheres to the provided schema.
    IMPORTANT: Only use IDs from the provided list. Do not invent new items.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: outfitSuggestionSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse outfit suggestion JSON from Gemini:", e);
        console.error("Raw text for outfit suggestion:", jsonText);
        throw new Error("The AI returned an outfit suggestion in an unexpected format. Please try again.");
    }
}

export async function getStyleSuggestions(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a list of 8 diverse, interesting, and currently relevant fashion styles. Examples could include things like 'Cottagecore', 'Minimalist', 'Gorpcore', 'Y2K Revival'. Respond with ONLY a comma-separated list of the style names.",
    });
    const styles = response.text.split(',').map(s => s.trim()).filter(s => s);
    if (styles.length < 5) {
        throw new Error("AI returned too few styles.");
    }
    return styles;
  } catch (error) {
    console.error("Error fetching style suggestions:", error);
    // Return a fallback list on error for robustness
    return ["Minimalist", "Vintage", "Bohemian", "Streetwear", "Formal", "Artsy", "Gorpcore", "Y2K"];
  }
}

const packingListSchema = {
    type: Type.OBJECT,
    properties: {
        packingListItemIds: {
            type: Type.ARRAY,
            description: "An array of the IDs of the selected wardrobe items for the whole trip. Be efficient and choose versatile items.",
            items: { type: Type.STRING }
        },
        suggestedOutfits: {
            type: Type.ARRAY,
            description: "An array of 3-5 specific outfits created from the selected items.",
            items: {
                type: Type.OBJECT,
                properties: {
                    itemIds: {
                        type: Type.ARRAY,
                        description: "An array of item IDs for this specific outfit.",
                        items: { type: Type.STRING }
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short, descriptive occasion for this outfit (e.g., 'Day 1: Casual sightseeing', 'Evening: Fancy dinner')."
                    }
                },
                required: ["itemIds", "description"]
            }
        },
        packingTips: {
            type: Type.ARRAY,
            description: "An array of 3-4 extra, helpful packing tips. Can include non-clothing items to bring or general advice.",
            items: { type: Type.STRING }
        }
    },
    required: ["packingListItemIds", "suggestedOutfits", "packingTips"]
};

export async function generatePackingList(
    wardrobeItems: WardrobeItemSubset[], 
    destination: string,
    durationInDays: number,
    tripType: string
): Promise<PackingListResult> {
    const itemsList = wardrobeItems.map(item => JSON.stringify(item)).join('\n');
    const fullPrompt = `You are an expert fashion stylist and travel planner. Create a smart packing list for a trip based on the user's wardrobe.

    Trip Details:
    - Destination: ${destination}
    - Duration: ${durationInDays} days
    - Type of Trip: ${tripType}

    Available Wardrobe Items (as JSON objects):
    ${itemsList}

    Your task:
    1.  Analyze the trip details to infer potential weather and activities. Use the 'season' property of items as a primary filter. For example, for a summer vacation in a hot climate, prioritize 'Summer' items.
    2.  Select a minimal, versatile set of clothing items from the wardrobe that can be mixed-and-matched. Pay attention to 'colors' and 'style' to ensure items are complementary.
    3.  Create 3-5 distinct sample outfits from the selected items, assigning each a suitable occasion description.
    4.  Provide a few extra packing tips relevant to the trip.
    
    Respond strictly with a JSON object that adheres to the provided schema.
    IMPORTANT: Only use IDs from the provided list. Do not invent new items. Ensure all item IDs in 'suggestedOutfits' are also present in 'packingListItemIds'.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: packingListSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as PackingListResult;
    } catch (e) {
        console.error("Failed to parse packing list JSON from Gemini:", e);
        console.error("Raw text for packing list:", jsonText);
        throw new Error("The AI returned a packing list in an unexpected format. Please try again.");
    }
}


const styleProfileSchema = {
    type: Type.OBJECT,
    properties: {
        profileName: {
            type: Type.STRING,
            description: "A creative and fitting name for the user's style profile, like 'Classic Minimalist' or 'Eclectic Visionary'. Two or three words max."
        },
        description: {
            type: Type.STRING,
            description: "A detailed, positive, and encouraging paragraph (3-4 sentences) describing the user's style personality, what it signifies, and how they express themselves through fashion."
        },
        keyElements: {
            type: Type.ARRAY,
            description: "A list of 4-5 key clothing items or style concepts that define this profile (e.g., 'Tailored blazers', 'Neutral color palette', 'Clean lines').",
            items: { type: Type.STRING }
        },
        styleIcons: {
            type: Type.ARRAY,
            description: "A list of 2-3 celebrities or public figures (past or present) who embody this style.",
            items: { type: Type.STRING }
        }
    },
    required: ["profileName", "description", "keyElements", "styleIcons"]
};

export async function generateStyleProfile(answers: string[]): Promise<StyleProfile> {
    const prompt = `You are a world-class fashion psychologist and stylist. Based on the user's answers to a style quiz, generate a personalized style profile for them.
    The user's answers are:
    - Weekend Outfit: ${answers[0]}
    - Color Palette: ${answers[1]}
    - Pattern Choice: ${answers[2]}
    - Go-to Accessory: ${answers[3]}
    - Fashion Era Inspiration: ${answers[4]}

    Analyze these preferences to create a cohesive and insightful style profile. Respond ONLY with a valid JSON object that adheres to the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: styleProfileSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as StyleProfile;
    } catch (e) {
        console.error("Failed to parse Style Profile JSON from Gemini:", e);
        console.error("Raw text for Style Profile:", jsonText);
        throw new Error("The AI returned a style profile in an unexpected format. Please try again.");
    }
}

const colorProfileSchema = {
    type: Type.OBJECT,
    properties: {
        season: {
            type: Type.STRING,
            description: "The user's color season, e.g., 'Cool Winter', 'Warm Autumn', 'Light Spring'. Be specific."
        },
        description: {
            type: Type.STRING,
            description: "A detailed paragraph explaining the characteristics of this color season and why the user fits into it based on their photo."
        },
        palette: {
            type: Type.ARRAY,
            description: "An array of 8-10 flattering colors for this season. Provide both a common name and its hex code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING }
                },
                required: ["name", "hex"]
            }
        },
        celebrityExamples: {
            type: Type.ARRAY,
            description: "A list of 2-3 celebrities who share this color season.",
            items: { type: Type.STRING }
        },
        tips: {
            type: Type.OBJECT,
            properties: {
                clothing: {
                    type: Type.ARRAY,
                    description: "3-4 tips on wearing their best colors in clothing.",
                    items: { type: Type.STRING }
                },
                makeup: {
                    type: Type.ARRAY,
                    description: "3-4 tips for makeup colors that will harmonize with their features.",
                    items: { type: Type.STRING }
                },
                accessories: {
                    type: Type.ARRAY,
                    description: "2-3 tips for choosing jewelry and accessory colors (e.g., silver vs. gold).",
                    items: { type: Type.STRING }
                }
            },
            required: ["clothing", "makeup", "accessories"]
        }
    },
    required: ["season", "description", "palette", "celebrityExamples", "tips"]
};


export async function analyzeUserColors(base64Image: string): Promise<ColorProfile> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const textPart = { text: "You are a professional color analyst. Analyze the user's selfie, paying close attention to their skin undertones, eye color, and hair color in natural lighting. Determine their seasonal color palette (e.g., Deep Winter, Soft Summer, Warm Spring, etc.) and provide a detailed analysis based on the provided JSON schema. The user is looking for actionable advice." };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: colorProfileSchema,
        }
    });
    
    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as ColorProfile;
    } catch (e) {
        console.error("Failed to parse color profile JSON from Gemini:", e);
        console.error("Raw text for color profile:", jsonText);
        throw new Error("The AI returned color profile data in an unexpected format. Please try again.");
    }
}

export async function spotTrends(): Promise<TrendResult> {
    const prompt = `You are a fashion trend analyst for a style app. Your task is to identify the top 3-4 current fashion trends using Google Search.
    For each trend, provide a concise title, a 1-2 sentence summary, and a list of 3-4 key clothing items associated with it.
    
    IMPORTANT: Respond ONLY with a valid JSON object. The JSON object should have a single key "trends" which is an array of trend objects.
    Each trend object must have the keys "title", "summary", and "keyItems" (which is an array of strings).
    Do not include any other text, greetings, or explanations before or after the JSON.
    
    Example format:
    {
      "trends": [
        {
          "title": "Gorpcore Ascendant",
          "summary": "Functional outdoor wear continues to influence mainstream fashion. Think technical fabrics, practical details, and a rugged aesthetic.",
          "keyItems": ["Cargo pants", "Technical jackets", "Hiking-style boots", "Fleece vests"]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    let trends: Trend[] = [];

    try {
        let jsonText = response.text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        const parsedJson = JSON.parse(jsonText);
        if (parsedJson.trends) {
            trends = parsedJson.trends;
        } else {
             throw new Error("AI response did not contain a 'trends' array.");
        }
    } catch (e) {
        console.error("Failed to parse trends JSON from Gemini:", e);
        console.error("Raw text for trends:", response.text);
        throw new Error("The AI returned trend data in an unexpected format. Please try again.");
    }

    return { trends, sources };
}

const wardrobeReportSchema = {
    type: Type.OBJECT,
    properties: {
        overallImpressions: {
            type: Type.STRING,
            description: "A brief, encouraging paragraph (2-3 sentences) summarizing the overall state of the user's wardrobe, highlighting its strengths."
        },
        colorAnalysis: {
            type: Type.ARRAY,
            description: "An array representing the color distribution. Calculate percentages for the top 5 most frequent colors and group the rest into 'Other'. Percentages should sum to 100.",
            items: {
                type: Type.OBJECT,
                properties: {
                    color: { type: Type.STRING },
                    percentage: { type: Type.INTEGER }
                },
                required: ["color", "percentage"]
            }
        },
        styleAnalysis: {
            type: Type.ARRAY,
            description: "An array representing the style distribution. Calculate percentages for each style present. Percentages should sum to 100.",
            items: {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING },
                    percentage: { type: Type.INTEGER }
                },
                required: ["style", "percentage"]
            }
        },
        wardrobeOrphans: {
            type: Type.ARRAY,
            description: "Identify 1-3 'wardrobe orphans' - versatile items that seem underutilized or hard to pair with the rest of the wardrobe. Provide a reason and a concrete outfit suggestion using other items from their wardrobe.",
            items: {
                type: Type.OBJECT,
                properties: {
                    itemId: { type: Type.STRING, description: "The ID of the orphan item." },
                    reason: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                },
                required: ["itemId", "reason", "suggestion"]
            }
        },
        shoppingSuggestions: {
            type: Type.ARRAY,
            description: "Suggest 2-3 specific new items (e.g., 'a white linen shirt', 'a pair of black ankle boots') that would significantly increase the versatility of the current wardrobe. Provide a reason for each suggestion.",
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    reason: { type: Type.STRING }
                },
                required: ["itemName", "reason"]
            }
        }
    },
    required: ["overallImpressions", "colorAnalysis", "styleAnalysis", "wardrobeOrphans", "shoppingSuggestions"]
};

export async function generateWardrobeReport(
    wardrobeItems: WardrobeItemSubset[],
    styleProfile: StyleProfile | null
): Promise<WardrobeReport> {
    const itemsList = wardrobeItems.map(item => JSON.stringify(item)).join('\n');
    const profileText = styleProfile ? `The user's style profile is '${styleProfile.profileName}', described as: '${styleProfile.description}'` : "The user has not completed a style profile.";

    const fullPrompt = `You are a master fashion analyst. Your task is to perform a holistic analysis of a user's entire wardrobe and provide a "Wardrobe Wellness Report".

    ${profileText}

    Here is a list of all items in their wardrobe, as JSON objects:
    ${itemsList}

    Your analysis must be constructive, insightful, and actionable. Follow these steps:
    1.  **Overall Impressions:** Write a brief summary of the wardrobe's character.
    2.  **Color Analysis:** Calculate the percentage of each color. Consolidate minor colors into an 'Other' category.
    3.  **Style Analysis:** Calculate the percentage of each style (e.g., Casual, Office).
    4.  **Wardrobe Orphans:** Find 1-3 items that are versatile but might be hard to style with the existing collection. Provide the item's ID, a reason, and a specific outfit suggestion using other items from the list.
    5.  **Shopping Suggestions:** Recommend 2-3 new, generic types of items (e.g., "a neutral blazer") that would fill gaps and enhance mix-and-match potential, aligning with their style profile if available.

    Respond STRICTLY with a single JSON object that adheres to the provided schema. Do not include any other text, greetings, or explanations.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: wardrobeReportSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as WardrobeReport;
    } catch (e) {
        console.error("Failed to parse wardrobe report JSON from Gemini:", e);
        console.error("Raw text for wardrobe report:", jsonText);
        throw new Error("The AI returned a wardrobe report in an unexpected format. Please try again.");
    }
}


const lookCompletionSchema = {
    type: Type.OBJECT,
    properties: {
        outfitName: {
            type: Type.STRING,
            description: "A creative and fitting name for the completed outfit."
        },
        outfitReasoning: {
            type: Type.STRING,
            description: "A short paragraph explaining why the suggested items complete the look and what the overall style is."
        },
        existingItemIds: {
            type: Type.ARRAY,
            description: "An array of IDs for existing wardrobe items that should be part of the completed outfit. This must include the user's initial selection plus any other complementary items from their wardrobe.",
            items: { type: Type.STRING }
        },
        suggestedItems: {
            type: Type.ARRAY,
            description: "An array of 1-2 new, essential items to purchase to complete the look. If the outfit is complete with existing items, this should be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING, description: "The generic name of the new item (e.g., 'Black Leather Ankle Boots')." },
                    description: { type: Type.STRING, description: "A brief, descriptive sentence about the suggested item and why it works." }
                },
                required: ["itemName", "description"]
            }
        }
    },
    required: ["outfitName", "outfitReasoning", "existingItemIds", "suggestedItems"]
};

export async function completeTheLook(
    baseItems: WardrobeItemSubset[],
    allWardrobeItems: WardrobeItemSubset[]
): Promise<LookCompletionResult> {
    const baseItemsList = baseItems.map(item => JSON.stringify(item)).join('\n');
    const allItemsList = allWardrobeItems.map(item => JSON.stringify(item)).join('\n');

    const fullPrompt = `You are an expert fashion stylist. A user wants to build an outfit starting with the following pieces from their wardrobe:
    ${baseItemsList}

    Here is the user's entire available wardrobe for context:
    ${allItemsList}

    Your task is to create the best possible complete outfit.
    1. Use the user's base selection as the starting point.
    2. Add other complementary items from their full wardrobe to make the outfit as complete as possible.
    3. If, and only if, a crucial piece is missing to make the look cohesive (like shoes or a specific type of layer), suggest 1 or 2 new items they could acquire. If the outfit can be completed with existing items, the suggested new items array should be empty.
    4. Provide a catchy name for the complete outfit and a brief reasoning for your choices.

    Respond STRICTLY with a single JSON object that adheres to the provided schema. Ensure all IDs in 'existingItemIds' come from the provided wardrobe list.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: lookCompletionSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as LookCompletionResult;
    } catch (e) {
        console.error("Failed to parse look completion JSON from Gemini:", e);
        console.error("Raw text for look completion:", jsonText);
        throw new Error("The AI returned outfit completion data in an unexpected format. Please try again.");
    }
}

const paletteOutfitSchema = {
    type: Type.OBJECT,
    properties: {
        palette: {
            type: Type.ARRAY,
            description: "An array of 5 hex color codes that represent the dominant colors in the image.",
            items: { type: Type.STRING }
        },
        itemIds: {
            type: Type.ARRAY,
            description: "An array of IDs of the selected wardrobe items that match the palette.",
            items: { type: Type.STRING }
        },
        reasoning: {
            type: Type.STRING,
            description: "A short paragraph explaining why this outfit, based on the color palette, is a good match."
        }
    },
    required: ["palette", "itemIds", "reasoning"]
};

export async function createOutfitFromColorPalette(
    base64Image: string,
    wardrobeItems: WardrobeItemSubset[]
): Promise<PaletteOutfitResult> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const itemsList = wardrobeItems.map(item => JSON.stringify(item)).join('\n');

    const textPart = { text: `You are a fashion stylist with a keen eye for color.
    1.  First, analyze the provided image and extract a 5-color palette of the most dominant and interesting colors. Provide them as hex codes.
    2.  Next, review the user's available wardrobe items, provided below as a series of JSON objects.
    3.  From the wardrobe, select 2 to 5 items that create a cohesive and stylish outfit inspired by the color palette you extracted from the image.
    4.  Provide a brief reasoning for your outfit selection, explaining how it connects to the image's mood and colors.

    Here is the list of available wardrobe items:
    ${itemsList}

    Respond STRICTLY with a single JSON object that adheres to the provided schema. Only use item IDs from the provided list.
    `};

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: paletteOutfitSchema,
        }
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as PaletteOutfitResult;
    } catch (e) {
        console.error("Failed to parse palette outfit JSON from Gemini:", e);
        console.error("Raw text for palette outfit:", jsonText);
        throw new Error("The AI returned an outfit in an unexpected format. Please try again.");
    }
}

export async function fuseImages(userImage: string, itemImage: string): Promise<string> {
    const userImagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: userImage,
        },
    };

    const itemImagePart = {
        inlineData: {
            mimeType: 'image/png', // Starter pack SVGs are converted to data URLs; PNG is a safe generic choice.
            data: itemImage,
        },
    };

    const textPart = {
        text: `You are an expert fashion photo editor. Your task is to seamlessly edit the person in the first image to make it look like they are realistically wearing the clothing item from the second image. Pay close attention to lighting, shadows, the person's pose, and the drape of the fabric to ensure the final image is photorealistic and believable. The background of the person should be preserved. The output should only be the edited image.`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [userImagePart, itemImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("AI did not return an image. It might have responded with text only.");

    } catch (error) {
        console.error("Error fusing images:", error);
        throw new Error("Could not fuse the images with AI. The request may have been blocked or failed.");
    }
}