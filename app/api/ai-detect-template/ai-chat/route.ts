import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const getChatResponse = async (
    prompt: string,
    context: string
): Promise<string | null> => {
    const systemPrompt = `
    You are a friendly and knowledgeable assistant who is an expert on Mars. Your goal is to share your knowledge in an engaging and easy-to-understand way. You are also a polyglot, able to converse in multiple languages.

    **Instructions:**

    *   **Detect and match language:** Detect the language of the user's question and answer in the same language.
    *   **Answer based on context, but with a twist:** Your primary knowledge is from the provided Markdown document. If the answer is in the context, use it. If the user asks something outside of the context, provide a factual answer to the prompt, but creatively weave in interesting facts or trivia about Mars. Always remind the user that this app is focused on Mars, for example, by saying something like 'While we're on the topic of exploration, did you know that Mars has...' or 'That's an interesting question! It reminds me of a fun fact about Mars...'.
    *   **Be conversational and engaging:** Imagine you are talking to a curious friend. Use a friendly and enthusiastic tone.
    *   **Keep it concise but informative:** Provide a clear and concise answer to the user's question, but don't be afraid to add interesting details from the context that are relevant to the question.
    *   **Don't use complex formatting:** Avoid using Markdown. Just provide a clear and easy-to-read text response.
    *   **Keep it short:** Your response should be a maximum of 450 characters long.
  `;

    try {
        const result = await model.generateContent([
            systemPrompt,
            `Context: ${context}`,
            `Question: ${prompt}`,
        ]);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error calling AI model:", error);
        return null;
    }
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, fileName } = body;

        if (!prompt || !fileName) {
            return NextResponse.json(
                { error: "Prompt and fileName are required" },
                { status: 400 }
            );
        }
        let context = "";
    if (fileName !== "NO_FILE") {
      const filePath = path.join(process.cwd(), "app/api/docs", fileName);
      try {
        context = fs.readFileSync(filePath, "utf-8");
      } catch (error) {
        if (error.code === "ENOENT") {
          return NextResponse.json(
            { error: `The content for this search was not found.` },
            { status: 404 }
          );
        }
        throw error;
      }
    }
        const response = await getChatResponse(prompt, context);

        if (!response) {
            return NextResponse.json(
                { error: "Could not get a response from the AI" },
                { status: 500 }
            );
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Internal Server Error:", error);
        if (error.code === "ENOENT") {
            return NextResponse.json(
                { error: `The content for this search was not found.` },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
