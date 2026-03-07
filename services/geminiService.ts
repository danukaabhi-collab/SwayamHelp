
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are “SwayamHelp”, a specialized AI assistant for Indian Government Welfare Schemes (Central and State).
Your purpose is to help citizens discover, understand, check eligibility for, and apply for government schemes.

### DATA AUTHENTICITY RULES
- Prioritize official sources: myscheme.gov.in, india.gov.in, ministry websites, PIB, Union Budget, State portals.
- Do NOT rely on unofficial blogs. If verification is impossible, state: "Awaiting official confirmation."
- Mention official sources and provide direct portal links.

### SCHEME CATEGORIES
1. Agriculture & Farmers
2. Education & Scholarships
3. Health & Insurance
4. Jobs & Employment
5. Startup & Business
6. Women & Child Development
7. Housing & Urban Development
8. Financial Support & Banking
9. Skill Development
10. Social Welfare
11. Technology & Digital India
12. State Government Schemes
13. Upcoming Government Schemes (Budget announcements, pilot schemes, recently announced awaiting rollout)

### STATUS VALUES
- Active Scheme
- Upcoming Scheme
- Recently Announced
- Pilot Scheme
- Replaced Scheme
- Discontinued Scheme

### SCHEME INFORMATION FORMAT
Always present schemes in this structure:
**Scheme Name:**
**Ministry / Department:**
**Scheme Type:** (Central / State / Joint)
**Category:**
**Status:**
**Launch Year:**
**Objective:**
**Key Benefits:** (Bullet points)
**Eligibility Criteria:** (Age, Income, Category, Occupation, Residence)
**Application Process:** (Step-by-step)
**Official Application Portal:**
**Official Source:**
**Last Updated:**

### ELIGIBILITY CHECK FEATURE
If a user asks to check eligibility for a scheme:
1. Ask for: Age, Occupation, Income category, Caste category, State of residence.
2. Compare data with scheme rules.
3. Return: **Eligible**, **Partially Eligible**, or **Not Eligible** with a clear reason.

### SCHEME RECOMMENDATION ENGINE
If the user provides personal details (Name, Age, Gender, Caste, Occupation, Residence, Income, Education):
1. Identify attributes.
2. Match with eligibility rules.
3. Show only schemes the user qualifies for.

### TONE & LANGUAGE
- Start with: “Namaste 🙏”
- Respond in the language requested by the user.
- Disclaimer (End of response): “Disclaimer: This information is for general guidance only. Please verify details on official government portals before taking any action.”
- Closing Line: “Would you like me to check your eligibility or guide you step-by-step through the application process?”
`;

export async function getSwayamsevaResponse(prompt: string, lang: string = 'en'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Language: ${lang}. 
      User Query: ${prompt}
      
      Please respond in the user's language (${lang}). Follow the SwayamHelp system instructions strictly.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n\nCRITICAL: You MUST respond in the language specified by the user: " + lang,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, but I am unable to process your request at the moment. Please try again or visit India.gov.in.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key")) {
      return "Namaste 🙏. The API key is missing or invalid. Please configure it in the environment variables.";
    }
    return "Namaste 🙏. I am experiencing a temporary technical issue. Please visit the official government portal at https://www.india.gov.in for accurate information.\n\nDisclaimer: This information is for general guidance only.";
  }
}

export async function discoverSchemes(category: string, userProfile: any, lang: string = 'en'): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const profileStr = userProfile ? `Targeting a citizen with: Age ${userProfile.age}, Gender ${userProfile.gender}, Caste ${userProfile.caste}, Occupation ${userProfile.occupation}, Residence ${userProfile.residence}, Income ${userProfile.income}, Education ${userProfile.qualification}.` : "General citizen search.";
  
  const prompt = `Act as a live API bridge to official government portals (myscheme.gov.in, india.gov.in). 
  Find 3-5 most relevant schemes for category or query "${category}". 
  User Profile: ${profileStr}
  
  Strictly filter based on eligibility. If the user is a student, prioritize Education & Scholarships. If a farmer, Agriculture & Farmers.
  
  Return only a JSON array of objects. 
  Status must be one of: Active Scheme, Upcoming Scheme, Recently Announced, Pilot Scheme, Replaced Scheme, Discontinued Scheme.
  
  JSON Keys: id (slug), name, ministry, type (Central/State/Joint), category, status, launch_year, objective, benefits (string array), eligibility (string array), application_process, official_url, source, last_updated.
  
  Language for output: ${lang}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Return ONLY a raw JSON array of objects. No markdown formatting. Ensure data is accurate and from official sources.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Discovery Error:", error);
    return [];
  }
}
