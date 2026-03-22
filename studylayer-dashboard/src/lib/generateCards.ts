/**
 * generateCards.ts
 * AI card generation — primary: GPT-4.1 nano, fallback: Gemini 2.0 Flash.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface GeneratedCard {
    front: string;
    back: string;
}

export interface GeneratedDeck {
    title: string;
    cards: GeneratedCard[];
}

// ─────────────────────────────────────────────
// Core parsers — same for both providers
// ─────────────────────────────────────────────

function parseCards(raw: string): GeneratedCard[] {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed
            .filter((c: any) => c.front && c.back)
            .map((c: any) => ({ front: String(c.front).trim(), back: String(c.back).trim() }));
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────
// Provider: GPT-4.1 nano (primary)
// ─────────────────────────────────────────────

async function callGPT(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4.1-nano',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 4096,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`OpenAI error: ${(err as any)?.error?.message ?? res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
}

// ─────────────────────────────────────────────
// Provider: Gemini 2.0 Flash (fallback)
// ─────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini error: ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─────────────────────────────────────────────
// Core: Try GPT first, fall back to Gemini
// ─────────────────────────────────────────────

async function generate(systemPrompt: string, userPrompt: string): Promise<GeneratedDeck> {
    const fullSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Return a JSON object with at least two fields: "title" (a suggested name for this deck based on the content) and "cards" (the array of flashcards).`;
    
    // ① Try GPT-4.1 nano
    try {
        const raw = await callGPT(fullSystemPrompt, userPrompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const cards = (parsed.cards || []).slice(0, 150);
            if (cards.length > 0) return { title: parsed.title || 'Untitled Deck', cards };
        }
        throw new Error('GPT returned invalid format');
    } catch (gptErr) {
        console.warn('[Flashcard Gen] GPT failed, falling back to Gemini:', gptErr);
    }

    // ② Fallback: Gemini 2.0 Flash
    const raw = await callGemini(`${fullSystemPrompt}\n\n${userPrompt}`);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            const cards = (parsed.cards || []).slice(0, 150);
            return { title: parsed.title || 'Untitled Deck', cards };
        } catch { /* fallback to primitive parse */ }
    }
    
    // Last resort primitive parse
    const cards = parseCards(raw).slice(0, 150);
    return { title: 'Untitled Deck', cards };
}

// ─────────────────────────────────────────────
// Shared system prompt
// ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert study tutor and flashcard creator. Your task is to generate high-quality, concise flashcards from the given content.

RULES:
- Return ONLY a valid JSON object, no extra text or markdown wrapping
- The object must have: 
  1. "title": A short, professional title for the study deck (e.g., "Intro to Quantum Mechanics", "Chapter 5: Cell Biology")
  2. "cards": An array of objects where each has "front" (question/term) and "back" (answer/definition)
- Generate between 10 and 150 cards depending on content depth
- The results must NEVER exceed 150 cards total.
- Focus on key facts, definitions, formulas, and concepts
- Make questions specific — not vague
- Keep answers concise but complete

Example output format:
{
  "title": "Photosynthesis Basics",
  "cards": [{"front": "What is photosynthesis?", "back": "The process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen."}]
}`;

// ─────────────────────────────────────────────
// Method: From plain text / notes
// ─────────────────────────────────────────────

export async function generateFromText(text: string): Promise<GeneratedDeck> {
    return generate(
        SYSTEM_PROMPT,
        `Generate a title and flashcards from the following content:\n\n${text.slice(0, 12000)}`
    );
}

export async function generateFromSubject(subject: string): Promise<GeneratedDeck> {
    return generate(
        SYSTEM_PROMPT,
        `Generate a professional title and 15-40 comprehensive flashcards for the subject: "${subject}"`
    );
}

// ─────────────────────────────────────────────
// Method: From URL (proxy fetch + strip HTML)
// ─────────────────────────────────────────────

export async function generateFromURL(url: string): Promise<GeneratedDeck> {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Could not reach the URL. Try pasting the article text directly.');

    const { contents } = await res.json();

    const text = contents
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000);

    if (!text || text.length < 150) throw new Error('Not enough readable text found at that URL. Try a different page.');

    return generate(SYSTEM_PROMPT, `Generate a title and cards from this article content:\n\n${text}`);
}

// ─────────────────────────────────────────────
// Method: From YouTube URL
// (Gemini natively understands YouTube URLs; GPT gets descriptive prompt)
// ─────────────────────────────────────────────

export async function generateFromYouTube(youtubeUrl: string): Promise<GeneratedDeck> {
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) throw new Error('Invalid YouTube URL. Please use a full youtube.com or youtu.be link.');

    const videoId = videoIdMatch[1];

    // Try GPT first (text-based)
    try {
        const deck = await generate(
            SYSTEM_PROMPT,
            `Generate a professional study title and 15-40 high-quality flashcards from the content of this YouTube video: ${youtubeUrl} (Video ID: ${videoId}). Focus on the key educational concepts.`
        );
        if (deck.cards.length > 0) return deck;
    } catch { /* fall through to Gemini */ }

    // Gemini understands YouTube natively
    const prompt = `${SYSTEM_PROMPT}

Analyze the YouTube video at ${youtubeUrl} and generate a professional title and 15-40 comprehensive flashcards.`;
    const raw = await callGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
         try {
             const parsed = JSON.parse(jsonMatch[0]);
             return { title: parsed.title || 'YouTube Study Deck', cards: (parsed.cards || []).slice(0, 150) };
         } catch { }
    }
    
    return { title: 'YouTube Video Deck', cards: parseCards(raw).slice(0, 150) };
}

// ─────────────────────────────────────────────
// Method: From uploaded file content (text-readable)
// ─────────────────────────────────────────────

export async function generateFromFileText(text: string): Promise<GeneratedDeck> {
    return generate(
        SYSTEM_PROMPT,
        `Generate a professional title and cards from this document:\n\n${text.slice(0, 12000)}`
    );
}

// ─────────────────────────────────────────────
// Method: CSV Import (no AI needed)
// ─────────────────────────────────────────────

export function parseCSV(csvText: string): GeneratedCard[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    const cards: GeneratedCard[] = [];

    for (const line of lines) {
        // Handle quoted fields and both comma/tab separators
        const sep = line.includes('\t') ? '\t' : ',';
        const parts = line
            .split(new RegExp(`${sep}(?=(?:[^"]*"[^"]*")*[^"]*$)`))
            .map(p => p.replace(/^"|"$/g, '').trim());

        if (parts.length >= 2 && parts[0] && parts[1]) {
            cards.push({ front: parts[0], back: parts[1] });
        }
    }

    return cards;
}

// ─────────────────────────────────────────────
// Method: Quizlet URL
// ─────────────────────────────────────────────

export async function generateFromQuizlet(quizletUrl: string): Promise<GeneratedDeck> {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(quizletUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Failed to access Quizlet. Make sure the set is public.');

    const { contents } = await res.json();

    // Try to extract Quizlet's embedded JSON data
    const dataMatch =
        contents.match(/"studiableItem":\s*(\{[\s\S]*?\})\s*,\s*"setTitle"/)?.[1] ??
        contents.match(/window\.__STORE__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/)?.[1];

    if (dataMatch) {
        try {
            const data = JSON.parse(dataMatch);
            const terms = data?.studyableItem?.studyable?.studiableItems ?? [];
            const cards: GeneratedCard[] = terms
                .slice(0, 60)
                .map((t: any) => ({
                    front: t?.cardSides?.[0]?.media?.[0]?.plainText ?? '',
                    back:  t?.cardSides?.[1]?.media?.[0]?.plainText ?? '',
                }))
                .filter((c: any) => c.front && c.back);

            if (cards.length > 0) return { title: 'Quizlet Deck', cards };
        } catch { /* fall through */ }
    }

    // Fallback: scrape the page text and generate with AI
    return generateFromURL(quizletUrl);
}

// ─────────────────────────────────────────────
// Method: From lecture audio transcript
// ─────────────────────────────────────────────

export async function generateFromTranscript(transcript: string): Promise<GeneratedDeck> {
    return generate(
        SYSTEM_PROMPT,
        `Generate a professional title and 15-40 comprehensive flashcards from this lecture transcript. Focus on key concepts: \n\n${transcript.slice(0, 10000)}`
    );
}
