"use client";

import { NeoButton } from "@/components/NeoButton";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { Download, Scissors } from "lucide-react";

interface SplitToolProps {
    files: File[];
    onBack: () => void;
}

export function SplitTool({ files, onBack }: SplitToolProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [splitUrls, setSplitUrls] = useState<string[]>([]);

    const handleSplit = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setSplitUrls([]);

        try {
            const file = files[0];
            const fileBytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBytes);
            const pageCount = pdf.getPageCount();

            const newUrls: string[] = [];

            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                newUrls.push(URL.createObjectURL(blob));
            }
            setSplitUrls(newUrls);
        } catch (error) {
            console.error("Error splitting PDF:", error);
            alert("Failed to split PDF. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold uppercase">Split Mode</h3>
                <NeoButton onClick={onBack} variant="secondary">
                    BACK
                </NeoButton>
            </div>

            <div className="bg-white border-4 border-neo-pink p-6 shadow-neo-lg">
                <p className="mb-4 text-lg">
                    Splitting <span className="font-bold">{files[0]?.name}</span> into individual pages.
                </p>

                <NeoButton
                    onClick={handleSplit}
                    disabled={isProcessing || files.length === 0}
                    variant="danger"
                    className="w-full"
                >
                    {isProcessing ? "SPLITTING..." : "BURST PDF (ALL PAGES)"}
                    <Scissors className="ml-2 w-5 h-5" />
                </NeoButton>
            </div>

            {splitUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {splitUrls.map((url, i) => (
                        <div key={i} className="bg-white border-2 border-black p-4 shadow-neo-sm">
                            <p className="font-bold mb-2">Page {i + 1}</p>
                            <a href={url} download={`${files[0].name.replace(/\.pdf$/i, "")} page-${i + 1}.pdf`}>
                                <NeoButton variant="primary" className="w-full text-xs px-2">
                                    DOWNLOAD
                                    <Download className="ml-1 w-3 h-3" />
                                </NeoButton>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
