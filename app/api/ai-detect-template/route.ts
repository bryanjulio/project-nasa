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

const getFileNamesFromAI = async (prompt: string): Promise<string[] | null> => {
  const docsPath = path.join(process.cwd(), "app", "api", "docs");
  const docFiles = fs.readdirSync(docsPath);

  const availableDocs = docFiles.map((file) => `- ${file}`).join("\n");

  const systemPrompt = `
    You are an expert at determining which document to use based on a user's query.
    You will be given a list of available documents and the user's prompt.
    Your task is to return a JSON array of the most relevant document names.

    Available documents:
    ${availableDocs}

    For example:
    - "what is the diameter of Mars?" -> ["mars-facts.md"]
    - "tell me about Olympus Mons" -> ["olympus-mons.md"]
    - "what is the difference between mars and olympus mons?" -> ["mars-facts.md", "olympus-mons.md"]

    Only return the raw JSON string, with no other text, explanations, or markdown formatting.
  `;

  try {
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = result.response;
    const text = response.text();

    const jsonString = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonString);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Error calling AI model:", error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const fileNames = await getFileNamesFromAI(prompt);

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    if (!fileNames || fileNames.length === 0) {
      const response = await fetch(
        `${baseUrl}/api/ai-detect-template/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, fileName: "NO_FILE" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get a response from the AI"
        );
      }

      const data = await response.json();
      return NextResponse.json({ response: data.response });
    }

    const responses = await Promise.all(
      fileNames.map(async (fileName) => {
        const response = await fetch(
          `${baseUrl}/api/ai-detect-template/ai-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, fileName }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to get a response from the AI"
          );
        }

        const data = await response.json();
        return data.response;
      })
    );

    const finalResponse = responses.join("\n\n");

    return NextResponse.json({ response: finalResponse });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
