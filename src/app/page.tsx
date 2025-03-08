// src/app/page.tsx
"use client";
import { useState } from "react";
import GeneratorForm from "../components/GeneratorForm";

export default function Home() {
  const [downloadUrl, setDownloadUrl] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [sanitizedName, setSanitizedName] = useState("");
  const [vercelToken, setVercelToken] = useState("");

  const handleGenerate = async (form) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const { downloadUrl, sanitizedName } = await res.json();
    setDownloadUrl(downloadUrl);
    setSanitizedName(sanitizedName);

    if (vercelToken) {
      const deployRes = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadUrl, vercelToken }),
      });
      const { deployedUrl } = await deployRes.json();
      setDeployedUrl(deployedUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">AImpact: Build Your AI Generator</h1>
      <GeneratorForm onSubmit={handleGenerate} />
      <div className="max-w-lg mx-auto mt-6">
        <label className="block mb-1">Vercel API Token (optional for deployment)</label>
        <input
          type="password"
          value={vercelToken}
          onChange={(e) => setVercelToken(e.target.value)}
          placeholder="Enter your Vercel token"
          className="w-full p-2 border rounded mb-4"
        />
        <p className="text-sm text-gray-500">
          Get your token from{" "}
          <a href="https://vercel.com/account/tokens" target="_blank" className="text-blue-600">
            Vercel
          </a>
        </p>
      </div>
      {downloadUrl && (
        <p className="mt-4 text-center">
          Download your app: <a href={downloadUrl} className="text-blue-600 underline">Here</a>
        </p>
      )}
      {sanitizedName && (
        <p className="mt-4 text-center">
          Your app’s project name: <span className="font-semibold">{sanitizedName}</span>
        </p>
      )}
      {deployedUrl && (
        <p className="mt-4 text-center">
          Your app is live: <a href={deployedUrl} className="text-blue-600 underline">{deployedUrl}</a>
        </p>
      )}
    </div>
  );
}