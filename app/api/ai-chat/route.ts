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
    *   **Answer based only on the context:** Your knowledge is limited to the provided Markdown document. If the answer is not in the context, say "I'm sorry, but I don't have information about that in my current knowledge base." in the user's language.
    *   **Be conversational and engaging:** Imagine you are talking to a curious friend. Use a friendly and enthusiastic tone.
    *   **Keep it concise but informative:** Provide a clear and concise answer to the user's question, but don't be afraid to add interesting details from the context that are relevant to the question.
    *   **Don't use complex formatting:** Avoid using Markdown. Just provide a clear and easy-to-read text response.
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

        const filePath = path.join(process.cwd(), "app/api/docs", fileName);
        const context = fs.readFileSync(filePath, "utf-8");

        if (!context) {
            return NextResponse.json(
                { error: "Could not read the context file" },
                { status: 500 }
            );
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
