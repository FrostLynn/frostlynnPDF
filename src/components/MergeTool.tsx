"use client";

import { NeoButton } from "@/components/NeoButton";
import { PDFDocument } from "pdf-lib";
import { useState, useEffect } from "react";
import { Download, Merge, GripVertical, Trash2 } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface MergeToolProps {
    files: File[];
    onBack: () => void;
}

interface FileItem {
    id: string;
    file: File;
}

function SortableItem({ id, file, onRemove }: { id: string; file: File; onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between bg-white border-2 border-black p-3 shadow-neo-sm mb-2 touch-none"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-neo-purple">
                    <GripVertical className="w-5 h-5" />
                </div>
                <span className="truncate font-mono font-bold">{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-none">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button onClick={() => onRemove(id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function MergeTool({ files: initialFiles, onBack }: MergeToolProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

    const [fileItems, setFileItems] = useState<FileItem[]>(initialFiles.map((f, i) => ({ id: `${f.name}-${i}-${Date.now()}`, file: f })));

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFileItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleRemove = (id: string) => {
        setFileItems(items => items.filter(i => i.id !== id));
    };

    const handleMerge = async () => {
        if (fileItems.length === 0) return;
        setIsProcessing(true);

        try {
            const mergedPdf = await PDFDocument.create();
            for (const item of fileItems) {
                const fileBytes = await item.file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
        } catch (error) {
            console.error("Error merging PDFs:", error);
            alert("Failed to merge PDFs. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold uppercase">Merge Mode</h3>
                <NeoButton onClick={onBack} variant="secondary">
                    BACK
                </NeoButton>
            </div>

            <div className="flex gap-4 items-start flex-col md:flex-row">
                <div className="flex-1 w-full bg-white border-4 border-neo-purple p-6 shadow-neo-lg">
                    <h4 className="text-xl font-bold uppercase border-b-2 border-neo-purple pb-2 mb-4">
                        File Order ({fileItems.length})
                    </h4>
                    <p className="mb-4 text-sm text-gray-500">Drag items to reorder them.</p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fileItems.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {fileItems.map((item) => (
                                    <SortableItem key={item.id} id={item.id} file={item.file} onRemove={handleRemove} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {fileItems.length === 0 && (
                        <div className="text-center py-8 text-gray-400 font-bold border-2 border-dashed border-gray-300">
                            NO FILES? BRUH.
                        </div>
                    )}
                </div>

                <div className="w-full md:w-64 space-y-4">
                    <div className="bg-white border-2 border-black p-4 shadow-neo-sm">
                        <p className="font-bold mb-2">Ready to Merge?</p>
                        <NeoButton
                            onClick={handleMerge}
                            disabled={isProcessing || fileItems.length === 0}
                            variant="accent"
                            className="w-full"
                        >
                            {isProcessing ? "MERGING..." : "MERGE NOW"}
                            <Merge className="ml-2 w-5 h-5" />
                        </NeoButton>
                    </div>

                    {mergedPdfUrl && (
                        <div className="bg-neo-green p-4 border-2 border-black shadow-neo-sm animate-in fade-in zoom-in duration-300">
                            <h4 className="font-black mb-2 uppercase">Complete!</h4>
                            <a href={mergedPdfUrl} download="merged.pdf">
                                <NeoButton variant="primary" className="w-full text-xs">
                                    DOWNLOAD PDF
                                    <Download className="ml-2 w-4 h-4" />
                                </NeoButton>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
