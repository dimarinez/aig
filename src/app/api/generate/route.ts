// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req) {
  const { name, purpose, inputs, output, model, apiKey } = await req.json();

  // Sanitize the name for npm compatibility
  const sanitizedName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // 1. Create a temporary directory in Downloads
  const downloadsDir = path.join(os.homedir(), "Downloads");
  const tempDir = path.join(downloadsDir, "aimpact-temp", sanitizedName);
  fs.mkdirSync(tempDir, { recursive: true });

  // 2. Initialize a basic Next.js app (non-interactive)
  try {
    execSync(
      `npx create-next-app@latest ${sanitizedName} --use-npm --typescript --tailwind --eslint --app --src-dir --no-install --yes`,
      {
        cwd: path.join(downloadsDir, "aimpact-temp"),
        stdio: "inherit",
      }
    );
  } catch (error) {
    console.error("Error creating Next.js app:", error);
    return NextResponse.json({ error: "Failed to create project. Please try a simpler name." }, { status: 500 });
  }

  // 3. Install Vercel AI SDK
  execSync(`cd ${tempDir} && npm install ai`, { stdio: "inherit" });

  // 4. Generate dynamic styles based on purpose
  const inputsArray = inputs.split(",").map((i) => i.trim());
  
  // Simple hash function to generate a color from purpose
  const hash = purpose.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % 6; // 6 color options
  const colors = [
    "from-blue-500 via-indigo-500 to-purple-500", // Cool tones
    "from-green-500 via-teal-500 to-cyan-500",   // Fresh tones
    "from-red-500 via-pink-500 to-rose-500",     // Warm tones
    "from-yellow-500 via-orange-500 to-amber-500", // Bright tones
    "from-purple-500 via-violet-500 to-fuchsia-500", // Vibrant tones
    "from-gray-500 via-slate-500 to-zinc-500"     // Neutral tones
  ];
  const gradient = colors[colorIndex];

  // Modern, open-ended design
  const containerStyle = `min-h-screen bg-gradient-to-br ${gradient} p-8 flex items-center justify-center`;
  const cardStyle = "max-w-lg w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8";
  const headerStyle = "text-3xl font-bold text-gray-900 mb-2";
  const subheaderStyle = "text-lg text-gray-600 mb-6 italic";
  const inputStyle = "w-full p-3 mb-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-opacity-50 focus:ring-[${gradient.split(" ")[0].replace("from-", "")}]";
  const buttonStyle = "w-full py-3 px-6 bg-gradient-to-r from-gray-900 to-black text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition duration-200";

  // 5. Generate a styled page with AI integration
  const pageContent = `
"use client";
import { useState } from "react";
import { generateText } from "ai";
import { ${model.split("/")[0]} } from "@ai-sdk/${model.split("/")[0]}";

export default function Home() {
  const [inputs, setInputs] = useState({ ${inputsArray.map((i) => `${i}: ""`).join(", ")} });
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    const { text } = await generateText({
      model: ${model.split("/")[0]}("${model.split("/")[1]}"),
      prompt: "${purpose}: " + ${inputsArray.map((i) => `inputs.${i}`).join(" + ', ' + ")},
    });
    setResult(text);
  };

  return (
    <div className="${containerStyle}">
      <div className="${cardStyle}">
        <h1 className="${headerStyle}">${name}</h1>
        <p className="${subheaderStyle}">${purpose}</p>
        ${inputsArray
          .map(
            (i) => `
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium capitalize">${i}</label>
          <input
            type="text"
            value={inputs.${i}}
            onChange={(e) => setInputs({ ...inputs, ${i}: e.target.value })}
            className="${inputStyle}"
          />
        </div>`
          )
          .join("\n")}
        <button
          onClick={handleGenerate}
          className="${buttonStyle}"
        >
          Generate
        </button>
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-800 whitespace-pre-wrap shadow-inner">
            <p className="font-medium">Result:</p>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
  `;
  fs.writeFileSync(path.join(tempDir, "src/app/page.tsx"), pageContent);

  // 6. Add .env.local with user's API key
  const envContent = `${model.split("/")[0].toUpperCase()}_API_KEY=${apiKey}`;
  fs.writeFileSync(path.join(tempDir, ".env.local"), envContent);

  // 7. Zip the project
  execSync(`cd ${tempDir} && zip -r ../${sanitizedName}.zip .`, { stdio: "inherit" });

  // 8. Handle file serving based on environment
  const zipPath = path.join(downloadsDir, "aimpact-temp", `${sanitizedName}.zip`);
  const isVercel = process.env.VERCEL === "1";

  let downloadUrl;
  if (isVercel) {
    try {
      const { url } = await put(`${sanitizedName}.zip`, fs.readFileSync(zipPath), {
        access: "public",
      });
      downloadUrl = url;
    } catch (error) {
      console.error("Vercel Blob upload failed:", error);
      return NextResponse.json({ error: "Failed to upload to Blob storage." }, { status: 500 });
    }
  } else {
    const finalZipPath = path.join(downloadsDir, `${sanitizedName}.zip`);
    fs.renameSync(zipPath, finalZipPath);
    const publicDir = path.join(process.cwd(), "public", "temp");
    fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(finalZipPath, path.join(publicDir, `${sanitizedName}.zip`));
    downloadUrl = `/temp/${sanitizedName}.zip`;
  }

  // 9. Clean up temp directory
  fs.rmSync(path.join(downloadsDir, "aimpact-temp"), { recursive: true, force: true });

  return NextResponse.json({ downloadUrl, sanitizedName });
}