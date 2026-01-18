"use client";

import { MegaDropzone } from "@/components/MegaDropzone";
import { ToolGrid } from "@/components/ToolGrid";
import { MergeTool } from "@/components/MergeTool";
import { SplitTool } from "@/components/SplitTool";
import { CompressTool } from "@/components/CompressTool";
import dynamic from 'next/dynamic';

const SignTool = dynamic(() => import('@/components/SignTool').then(mod => mod.SignTool), { ssr: false });
import { useState } from "react";
import { NeoButton } from "@/components/NeoButton";
import { Trash2 } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<"merge" | "split" | "sign" | "compress" | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleClearFiles = () => {
    setFiles([]);
    setActiveTool(null);
  };

  const handleToolSelect = (tool: "merge" | "split" | "sign" | "compress") => {
    if (files.length === 0) {
      alert("⚠️ YO! DROP SOME FILES FIRST!");
      return;
    }
    setActiveTool(tool);
  };

  return (
    <div className="min-h-screen bg-neo-bg p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between border-b-4 border-black pb-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black">
            Frostlynn<span className="text-neo-purple">PDF</span>
          </h1>
          <div className="text-lg font-bold border-2 border-black px-4 py-2 bg-white shadow-neo-sm">
            v1.1.0
          </div>
        </header>

        <main className="space-y-12 pb-20">
          {activeTool ? (
            // Active Tool View
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTool === "merge" && <MergeTool files={files} onBack={() => setActiveTool(null)} />}
              {activeTool === "split" && <SplitTool files={files} onBack={() => setActiveTool(null)} />}
              {activeTool === "sign" && <SignTool files={files} onBack={() => setActiveTool(null)} />}
              {activeTool === "compress" && <CompressTool files={files} onBack={() => setActiveTool(null)} />}
            </div>
          ) : (
            // Dashboard View
            <>
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-2xl font-bold uppercase border-l-4 border-neo-pink pl-4">
                    Step 1: Upload Files
                  </h2>
                  {files.length > 0 && (
                    <NeoButton variant="secondary" onClick={handleClearFiles} className="text-sm px-3 py-1">
                      CLEAR ALL <Trash2 className="ml-2 w-4 h-4" />
                    </NeoButton>
                  )}
                </div>

                {files.length === 0 ? (
                  <MegaDropzone onFilesSelected={handleFilesSelected} />
                ) : (
                  <div className="grid gap-4">
                    <div className="bg-white border-2 border-black p-4 shadow-neo-sm">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold uppercase">Ready for action ({files.length} files)</p>
                        <NeoButton variant="secondary" onClick={() => setFiles([])} className="text-xs py-1">Reset</NeoButton>
                      </div>
                      <ul className="space-y-2">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center justify-between bg-gray-50 p-2 border border-black">
                            <span className="font-mono text-sm truncate">{f.name}</span>
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                              {(f.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <MegaDropzone onFilesSelected={handleFilesSelected} />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className={files.length === 0 ? "opacity-50 pointer-events-none grayscale" : ""}>
                <h2 className="text-2xl font-bold uppercase mb-4 border-l-4 border-neo-green pl-4">
                  Step 2: Choose Weapon
                </h2>
                <ToolGrid onToolSelect={handleToolSelect} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
