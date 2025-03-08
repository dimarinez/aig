// src/components/GeneratorForm.tsx
"use client";
import { useState } from "react";

export default function GeneratorForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    purpose: "",
    inputs: "",
    output: "text",
    model: "openai/gpt-4",
    apiKey: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create Your AI Generator</h2>
      <div className="mb-4">
        <label className="block mb-1">Generator Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., ListingGenix"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Purpose</label>
        <input
          type="text"
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          placeholder="e.g., Generate real estate listings"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Inputs (comma-separated)</label>
        <input
          type="text"
          value={form.inputs}
          onChange={(e) => setForm({ ...form, inputs: e.target.value })}
          placeholder="e.g., address, price, bedrooms"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Output Type</label>
        <select
          value={form.output}
          onChange={(e) => setForm({ ...form, output: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">AI Model</label>
        <select
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value, apiKey: "" })}
          className="w-full p-2 border rounded"
        >
          <option value="openai/gpt-4">OpenAI GPT-4</option>
          <option value="xai/grok">Grok (xAI)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">
          {form.model.startsWith("openai") ? "OpenAI API Key" : "xAI API Key"}
        </label>
        <input
          type="password" // Hide key for security in UI
          value={form.apiKey}
          onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
          placeholder={`Enter your ${form.model.split("/")[0]} API key`}
          className="w-full p-2 border rounded"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Get your key from{" "}
          {form.model.startsWith("openai") ? (
            <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600">
              OpenAI
            </a>
          ) : (
            <a href="https://x.ai" target="_blank" className="text-blue-600">
              xAI
            </a>
          )}
        </p>
      </div>
      <button type="submit" className="bg-amber-500 text-white p-3 rounded hover:bg-amber-600">
        Generate My AI App
      </button>
    </form>
  );
}