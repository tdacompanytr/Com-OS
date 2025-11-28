import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async function* (message: string) {
  const ai = getAiClient();
  if (!ai) {
    yield "Hata: API Anahtarı bulunamadı. Lütfen process.env.API_KEY ayarını kontrol edin.";
    return;
  }

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "Sen Com AI'sın, Com OS işletim sistemine entegre edilmiş yardımsever, esprili ve zeki bir asistansın. Cevaplarını Türkçe, kısa ve öz tut.",
      },
    });
  }

  try {
    const streamResult = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of streamResult) {
       const c = chunk as GenerateContentResponse;
       if (c.text) {
         yield c.text;
       }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    yield `Hata: ${error.message || "Bir şeyler ters gitti."}`;
  }
};