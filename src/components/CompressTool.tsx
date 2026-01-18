"use client";

import { NeoButton } from "@/components/NeoButton";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { Download, Minimize2, ArrowRight } from "lucide-react";

interface CompressToolProps {
    files: File[];
    onBack: () => void;
}

interface CompressedResult {
    originalName: string;
    originalSize: number;
    newSize: number;
    url: string;
}

export function CompressTool({ files: initialFiles, onBack }: CompressToolProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<CompressedResult[]>([]);

    const handleCompress = async () => {
        setIsProcessing(true);
        const newResults: CompressedResult[] = [];

        try {
            for (const file of initialFiles) {
                const fileBytes = await file.arrayBuffer();

                // Load the existing PDF
                const srcDoc = await PDFDocument.load(fileBytes);

                // Create a new PDF (this acts as "garbage collection" / repacking)
                const newDoc = await PDFDocument.create();

                // Copy all pages
                const indices = srcDoc.getPageIndices();
                const copiedPages = await newDoc.copyPages(srcDoc, indices);
                copiedPages.forEach((page) => newDoc.addPage(page));

                // Save with compression options included by default in save() typically,
                // but explicit repacking is the main helper here.
                // We can't really control JPEG quality easily with just pdf-lib 
                // without re-encoding images which is heavy for client-side.
                // But creating a fresh document often drops unused objects.
                const pdfBytes = await newDoc.save();

                const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);

                newResults.push({
                    originalName: file.name,
                    originalSize: file.size,
                    newSize: blob.size,
                    url,
                });
            }
            setResults(newResults);
        } catch (error) {
            console.error("Error compressing PDFs:", error);
            alert("Failed to compress one or more files.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    };

    const getSavings = (original: number, current: number) => {
        const diff = original - current;
        if (diff <= 0) return "0%";
        return Math.round((diff / original) * 100) + "%";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold uppercase">Compress Mode</h3>
                <NeoButton onClick={onBack} variant="secondary">
                    BACK
                </NeoButton>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Input Section */}
                <div className="bg-white border-4 border-black p-6 shadow-neo-lg">
                    <h4 className="text-xl font-bold uppercase border-b-2 border-black pb-2 mb-4">
                        Target Files ({initialFiles.length})
                    </h4>
                    <ul className="space-y-2 mb-6">
                        {initialFiles.map((f, i) => (
                            <li key={i} className="flex justify-between items-center text-sm border-b border-gray-200 py-1">
                                <span className="truncate pr-4">{f.name}</span>
                                <span className="font-mono text-gray-500">{formatSize(f.size)}</span>
                            </li>
                        ))}
                    </ul>

                    {!results.length && (
                        <NeoButton
                            onClick={handleCompress}
                            disabled={isProcessing}
                            variant="primary"
                            className="w-full text-lg py-4"
                        >
                            {isProcessing ? "SQUEEZING..." : "COMPRESS NOW"}
                            <Minimize2 className="ml-2 w-5 h-5" />
                        </NeoButton>
                    )}
                </div>

                {/* Results Section */}
                {results.length > 0 && (
                    <div className="bg-neo-blue/20 border-4 border-neo-blue p-6 shadow-neo-lg animate-in slide-in-from-right duration-500">
                        <h4 className="text-xl font-bold uppercase border-b-2 border-neo-blue pb-2 mb-4 text-blue-900">
                            Results
                        </h4>

                        <div className="space-y-4">
                            {results.map((res, i) => (
                                <div key={i} className="bg-white border-2 border-neo-blue p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold truncate w-2/3">{res.originalName}</span>
                                        <span className="text-xs font-mono bg-neo-blue text-white px-2 py-1">
                                            -{getSavings(res.originalSize, res.newSize)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 ml-1">
                                        <span className="line-through">{formatSize(res.originalSize)}</span>
                                        <ArrowRight className="w-4 h-4" />
                                        <span className="font-bold text-black">{formatSize(res.newSize)}</span>
                                    </div>
                                    <a href={res.url} download={`compressed-${res.originalName}`}>
                                        <NeoButton variant="accent" className="w-full text-sm">
                                            DOWNLOAD
                                            <Download className="ml-2 w-4 h-4" />
                                        </NeoButton>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
