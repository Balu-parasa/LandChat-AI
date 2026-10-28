const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Comprehensive location aliases & clusters for Indian & regional real estate
const LOCATION_MAP = {
    'hyd': { canonical: 'Hyderabad', nearby: ['Hyderabad', 'Patancheru', 'Shadnagar', 'Yadagirigutta', 'Vikarabad', 'Telangana'] },
    'hyderabad': { canonical: 'Hyderabad', nearby: ['Hyderabad', 'Patancheru', 'Shadnagar', 'Yadagirigutta', 'Vikarabad', 'Telangana'] },
    'secunderabad': { canonical: 'Hyderabad', nearby: ['Hyderabad', 'Patancheru', 'Telangana'] },
    'cyberabad': { canonical: 'Hyderabad', nearby: ['Hyderabad', 'Patancheru', 'Telangana'] },
    'vja': { canonical: 'Vijayawada', nearby: ['Vijayawada', 'Kankipadu', 'Gannavaram', 'Kaza', 'Guntur'] },
    'vijayawada': { canonical: 'Vijayawada', nearby: ['Vijayawada', 'Kankipadu', 'Gannavaram', 'Kaza', 'Guntur'] },
    'bezawada': { canonical: 'Vijayawada', nearby: ['Vijayawada', 'Kankipadu', 'Gannavaram', 'Kaza', 'Guntur'] },
    'gnt': { canonical: 'Guntur', nearby: ['Guntur', 'Kaza', 'Vijayawada'] },
    'guntur': { canonical: 'Guntur', nearby: ['Guntur', 'Kaza', 'Vijayawada'] },
    'vizag': { canonical: 'Visakhapatnam', nearby: ['Visakhapatnam'] },
    'visakhapatnam': { canonical: 'Visakhapatnam', nearby: ['Visakhapatnam'] },
    'rjy': { canonical: 'Rajamundry', nearby: ['Rajamundry', 'tallapudi', 'East Godavari'] },
    'rajamundry': { canonical: 'Rajamundry', nearby: ['Rajamundry', 'tallapudi', 'East Godavari'] },
    'rajahmundry': { canonical: 'Rajamundry', nearby: ['Rajamundry', 'tallapudi', 'East Godavari'] },
    'shadnagar': { canonical: 'Shadnagar', nearby: ['Shadnagar', 'Hyderabad', 'Telangana'] },
    'yadagirigutta': { canonical: 'Yadagirigutta', nearby: ['Yadagirigutta', 'Hyderabad', 'Telangana'] },
    'vikarabad': { canonical: 'Vikarabad', nearby: ['Vikarabad', 'Hyderabad', 'Telangana'] },
    'patancheru': { canonical: 'Patancheru', nearby: ['Patancheru', 'Hyderabad', 'Telangana'] },
    'amalapuram': { canonical: 'Amalapuram', nearby: ['Amalapuram', 'East Godavari'] },
    'nuzvid': { canonical: 'Nuzvid', nearby: ['Nuzvid', 'Vijayawada'] }
};

// Natural language query parser
function parseUserQuery(message) {
    const lower = message.toLowerCase().trim();

    // 1. Detect Intent: Affordable vs Luxury
    const isAffordable = /\b(offardable|affordable|cheap|cheapest|low\s*price|low\s*cost|budget|economy|pocket\s*friendly|reasonable)\b/i.test(lower);
    const isLuxury = /\b(luxury|luxurious|premium|expensive|high\s*end|prime|exclusive)\b/i.test(lower);

    // 2. Detect Land Type
    let landType = null;
    if (/\b(agri|agricultural|farm|farmland|farming|crop|paddy|orchard|cotton)\b/i.test(lower)) {
        landType = 'Agricultural';
    } else if (/\b(residential|plot|plots|layout|house|home|villa|gated)\b/i.test(lower)) {
        landType = 'Residential';
    } else if (/\b(commercial|business|shop|office|highway|road\s*facing)\b/i.test(lower)) {
        landType = 'Commercial';
    } else if (/\b(industrial|warehouse|factory)\b/i.test(lower)) {
        landType = 'Industrial';
    }

    // 3. Detect Proximity / "Near" Intent
    const isNear = /\b(near|around|nearby|close\s*to|beside|by)\b/i.test(lower);

    // 4. Detect Location and Regional Clusters
    let targetLocation = null;
    let nearbyAreas = [];

    // Search known location aliases
    for (const [alias, data] of Object.entries(LOCATION_MAP)) {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        if (regex.test(lower)) {
            targetLocation = data.canonical;
            nearbyAreas = data.nearby;
            break;
        }
    }

    // If no direct alias found, parse prepositional phrase skipping filler words (like "the", "a", "an")
    if (!targetLocation) {
        const prepMatch = lower.match(/\b(in|at|near|around|close\s*to|by)\s+(?:the\s+|a\s+|an\s+|city\s+of\s+|town\s+of\s+)?([a-zA-Z]{3,})/i);
        if (prepMatch && prepMatch[2]) {
            const rawLoc = prepMatch[2].toLowerCase();
            if (LOCATION_MAP[rawLoc]) {
                targetLocation = LOCATION_MAP[rawLoc].canonical;
                nearbyAreas = LOCATION_MAP[rawLoc].nearby;
            } else {
                targetLocation = rawLoc;
                nearbyAreas = [rawLoc];
            }
        }
    }

    // 5. Detect Budget and Price Numbers
    let maxPrice = null;
    let minPrice = null;
    const priceMatch = lower.match(/(under|below|less\s*than|upto|within|max|budget|above|over|more\s*than|min)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|m|lakh|lakhs|lac|lacs|cr|crore|crores)?/i);
    if (priceMatch) {
        const operator = priceMatch[1].toLowerCase();
        let val = parseFloat(priceMatch[2].replace(/,/g, ''));
        const unit = priceMatch[3] ? priceMatch[3].toLowerCase() : '';
        if (unit === 'k') val *= 1000;
        else if (unit === 'm') val *= 1000000;
        else if (unit.includes('lakh') || unit.includes('lac')) val *= 100000;
        else if (unit.includes('cr') || unit.includes('crore')) val *= 10000000;

        if (['above', 'over', 'more than', 'min'].includes(operator)) {
            minPrice = val;
        } else {
            maxPrice = val;
        }
    }

    return {
        isAffordable,
        isLuxury,
        landType,
        isNear,
        targetLocation,
        nearbyAreas,
        maxPrice,
        minPrice,
        originalMessage: message
    };
}

// Find matching properties based on parsed semantic query
async function executeSemanticSearch(parsed) {
    const mongoQuery = { status: 'available' };

    // Apply land type if specified
    if (parsed.landType) {
        mongoQuery.land_type = parsed.landType;
    }

    // Apply budget / price constraints
    if (parsed.maxPrice || parsed.minPrice) {
        mongoQuery.price = {};
        if (parsed.maxPrice) mongoQuery.price.$lte = parsed.maxPrice;
        if (parsed.minPrice) mongoQuery.price.$gte = parsed.minPrice;
    }

    // Apply location filtering
    if (parsed.targetLocation) {
        const searchTerms = (parsed.isNear && parsed.nearbyAreas && parsed.nearbyAreas.length > 0)
            ? parsed.nearbyAreas
            : [parsed.targetLocation, ...(parsed.nearbyAreas || [])];

        const regexes = searchTerms.map(term => new RegExp(term, 'i'));
        mongoQuery.$or = [
            { city: { $in: regexes } },
            { location: { $in: regexes } },
            { state: { $in: regexes } }
        ];
    }

    // Determine sort order
    let sort = { createdAt: -1 };
    if (parsed.isAffordable) {
        sort = { price: 1 }; // Lowest price first
    } else if (parsed.isLuxury) {
        sort = { price: -1 }; // Highest price first
    }

    let properties = await Property.find(mongoQuery).sort(sort).limit(6);

    // If specific search yielded no results, try relaxing land_type or price
    if (properties.length === 0 && (parsed.landType || parsed.maxPrice)) {
        const relaxedQuery = { status: 'available' };
        if (mongoQuery.$or) relaxedQuery.$or = mongoQuery.$or;
        properties = await Property.find(relaxedQuery).sort(sort).limit(6);
    }

    // Final fallback to latest available properties
    if (properties.length === 0) {
        properties = await Property.find({ status: 'available' }).sort(sort).limit(5);
    }

    return properties;
}

// Helper to format currency in Indian style
function formatINR(num) {
    if (!num) return '₹0';
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
}

// @desc    Process chat message and return recommendations
// @route   POST /api/ai
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    const lowerMsg = message.toLowerCase().trim();

    // 1. RULE-BASED GREETING INTENT
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'yo', 'namaste'];
    if (greetings.includes(lowerMsg) || (lowerMsg.length < 10 && greetings.some(g => lowerMsg.startsWith(g)))) {
        return res.json({
            response: "Hello! 👋 I'm your AI Real Estate Assistant. I can help you find properties, analyze trends, or answer questions about land investment.\n\nTry asking:\n• 'Give me an affordable land near Hyderabad'\n• 'Agricultural plots under ₹50 Lakh'\n• 'Commercial land in Vijayawada'",
            properties: []
        });
    }

    // 2. PARSE USER QUERY INTENT
    const parsed = parseUserQuery(message);

    // Retrieve matching candidates from database
    const suggestedProperties = await executeSemanticSearch(parsed);

    // 3. TRY GEMINI LLM IF CONFIGURED AND WORKING
    const apiKey = process.env.GEMINI_API_KEY;
    const isGeminiAvailable = apiKey && !apiKey.includes('YOUR_GEMINI') && apiKey.length > 20;

    if (isGeminiAvailable) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Use current models: gemini-1.5-flash or gemini-2.0-flash
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const contextString = suggestedProperties.map((p, i) =>
                `${i + 1}. "${p.title}" (${p.land_type}) at ${p.location}. Price: ₹${p.price.toLocaleString('en-IN')}. Size: ${p.size} ${p.size_unit || 'acres'}. ${p.description ? p.description.substring(0, 100) : ''}`
            ).join('\n');

            const prompt = `
You are a friendly, highly knowledgeable AI Real Estate Advisor for 'LandChat Connect'.

USER QUERY: "${message}"

CANDIDATE PROPERTIES FROM DATABASE:
${contextString || "No matching properties found in current inventory."}

INSTRUCTIONS:
1. Address the user's inquiry naturally and directly in 2-3 concise paragraphs.
2. If properties are provided above, highlight the most relevant ones with their exact title, location, and price.
3. If the user asked for affordable or budget options, specifically highlight the lowest-priced opportunities.
4. If no exact match exists, recommend the closest alternative areas or properties from the list.
5. Provide actionable advice for buyers (e.g. verifying land title, road access, and investment potential).

Return ONLY valid JSON with this format:
{
  "response": "Your natural language response here"
}
`;

            const result = await model.generateContent(prompt);
            const text = (await result.response).text();
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedJson = JSON.parse(cleanJson);

            if (parsedJson && parsedJson.response) {
                return res.json({
                    response: parsedJson.response,
                    properties: suggestedProperties
                });
            }
        } catch (geminiError) {
            console.log("Gemini AI unavailable or rate-limited. Serving intelligent semantic response:", geminiError.message);
            // Fall through to semantic response generator
        }
    }

    // 4. INTELLIGENT SEMANTIC RESPONSE GENERATOR (Zero Downtime Fallback)
    let responseText = "";

    if (parsed.targetLocation) {
        const areaDesc = parsed.isNear ? `in and around ${parsed.targetLocation}` : `in ${parsed.targetLocation}`;
        if (parsed.isAffordable) {
            responseText = `Here are the most affordable land listings ${areaDesc}, sorted from lowest to highest price:`;
        } else if (parsed.isLuxury) {
            responseText = `Here are the premium land investments available ${areaDesc}:`;
        } else if (parsed.landType) {
            responseText = `Found these ${parsed.landType.toLowerCase()} properties ${areaDesc}:`;
        } else {
            responseText = `Here are available properties ${areaDesc}:`;
        }
    } else if (parsed.isAffordable) {
        responseText = "Here are the most budget-friendly properties currently available:";
    } else if (parsed.landType) {
        responseText = `Here are our top ${parsed.landType.toLowerCase()} listings:`;
    } else {
        responseText = "Here are recommended land properties matching your inquiry:";
    }

    if (suggestedProperties.length === 0) {
        responseText = "I couldn't find exact properties matching all your criteria right now, but please check out these latest featured listings:";
    }

    return res.json({
        response: responseText,
        properties: suggestedProperties
    });
});

module.exports = { chatWithAI };
