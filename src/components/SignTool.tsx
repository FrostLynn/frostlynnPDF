"use client";

import { NeoButton } from "@/components/NeoButton";
import { PDFDocument } from "pdf-lib";
import { useState, useRef, useEffect } from "react";
import { Download, PenTool, Type, Image as ImageIcon, Check, RotateCcw } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignToolProps {
    files: File[];
    onBack: () => void;
}

type SignatureType = "draw" | "image" | "text";

export function SignTool({ files, onBack }: SignToolProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);

    const [sigType, setSigType] = useState<SignatureType>("draw");
    const [sigText, setSigText] = useState("APPROVED");
    const [sigImage, setSigImage] = useState<string | null>(null);
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

    const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
    const [previewScale, setPreviewScale] = useState(0.5); // Initial scale
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [renderedWidth, setRenderedWidth] = useState<number>(0);

    useEffect(() => {
        if (files.length > 0) {
            const loadPdfInfo = async () => {
                const fileBytes = await files[0].arrayBuffer();
                const pdf = await PDFDocument.load(fileBytes);
                const page = pdf.getPages()[0];
                const { width, height } = page.getSize();
                setPageSize({ width, height });



                const maxWidth = Math.min(window.innerWidth - 64, 600);
                const scale = maxWidth / width;
                setPreviewScale(scale);
                setRenderedWidth(width * scale);
            };
            loadPdfInfo();
        }
    }, [files]);

    const handleClearSignature = () => {
        sigCanvasRef.current?.clear();
        setSignatureDataUrl(null);
        setSigImage(null);
    };

    const handleConfirmSignature = () => {
        if (sigType === "draw") {
            if (sigCanvasRef.current?.isEmpty()) {
                alert("Please sign first!");
                return;
            }
            setSignatureDataUrl(sigCanvasRef.current?.getTrimmedCanvas().toDataURL("image/png") || null);
        } else if (sigType === "image") {
            if (!sigImage) {
                alert("Please upload an image!");
                return;
            }
            setSignatureDataUrl(sigImage);
        } else {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.font = "bold 48px sans-serif";
                const metrics = ctx.measureText(sigText);
                canvas.width = metrics.width + 20;
                canvas.height = 60;
                ctx.font = "bold 48px sans-serif";
                ctx.fillStyle = "red";
                ctx.fillText(sigText, 10, 50);
                setSignatureDataUrl(canvas.toDataURL("image/png"));
            }
        }
    };

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        setPosition({ x: data.x, y: data.y });
    };

    const handleSign = async () => {
        if (!pageSize || !signatureDataUrl) return;
        setIsProcessing(true);

        try {
            const file = files[0];
            const fileBytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBytes);
            const pages = pdf.getPages();
            const firstPage = pages[0];

            const pngImage = await pdf.embedPng(signatureDataUrl);



            const x = position.x / previewScale;
            // Note: React-Draggable Y is from top, PDF is from bottom.
            const sigHeight = pngImage.height * 0.5;
            const sigWidth = pngImage.width * 0.5;

            const y = pageSize.height - (position.y / previewScale) - sigHeight;

            firstPage.drawImage(pngImage, {
                x: x,
                y: y,
                width: sigWidth,
                height: sigHeight,
            });

            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setSignedPdfUrl(url);
        } catch (error) {
            console.error("Error signing PDF:", error);
            alert("Failed to sign PDF. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setSigImage(evt.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold uppercase">Sign Mode</h3>
                <NeoButton onClick={onBack} variant="secondary">
                    BACK
                </NeoButton>
            </div>

            {!signatureDataUrl ? (
                <div className="bg-white border-4 border-neo-green p-6 shadow-neo-lg space-y-6">
                    <h4 className="text-xl font-bold uppercase border-b-2 border-neo-green pb-2">1. Create Signature</h4>

                    <div className="flex gap-4 mb-4">
                        <NeoButton
                            variant={sigType === "draw" ? "primary" : "secondary"}
                            onClick={() => setSigType("draw")}
                            className={sigType === "draw" ? "border-neo-green" : ""}
                        >
                            <PenTool className="w-4 h-4 mr-2" /> DRAW
                        </NeoButton>
                        <NeoButton
                            variant={sigType === "image" ? "primary" : "secondary"}
                            onClick={() => setSigType("image")}
                            className={sigType === "image" ? "border-neo-green" : ""}
                        >
                            <ImageIcon className="w-4 h-4 mr-2" /> IMAGE
                        </NeoButton>
                        <NeoButton
                            variant={sigType === "text" ? "primary" : "secondary"}
                            onClick={() => setSigType("text")}
                            className={sigType === "text" ? "border-neo-green" : ""}
                        >
                            <Type className="w-4 h-4 mr-2" /> TEXT
                        </NeoButton>
                    </div>

                    <div className="border-2 border-dashed border-gray-400 bg-gray-50 min-h-[200px] flex items-center justify-center p-4 relative">
                        {sigType === "draw" && (
                            <div className="w-full h-[200px] bg-white border border-black relative">
                                <SignatureCanvas
                                    ref={sigCanvasRef}
                                    canvasProps={{ className: "w-full h-full" }}
                                    backgroundColor="rgba(0,0,0,0)"
                                />
                                <button onClick={() => sigCanvasRef.current?.clear()} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {sigType === "image" && (
                            <div className="text-center">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
                                {sigImage && <img src={sigImage} alt="Preview" className="max-h-[150px] mx-auto border border-black" />}
                            </div>
                        )}
                        {sigType === "text" && (
                            <input
                                type="text"
                                value={sigText}
                                onChange={(e) => setSigText(e.target.value)}
                                className="text-4xl font-bold p-2 border-b-2 border-black focus:outline-none bg-transparent text-center"
                            />
                        )}
                    </div>

                    <NeoButton onClick={handleConfirmSignature} variant="success" className="w-full">
                        USE THIS SIGNATURE
                    </NeoButton>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white border-4 border-black p-4 shadow-neo-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold uppercase">2. Position Signature</h4>
                            <NeoButton onClick={handleClearSignature} variant="secondary" className="text-xs px-2 py-1">
                                CHANGE SIGNATURE
                            </NeoButton>
                        </div>
                        <p className="text-sm mb-2">Drag the signature to position it.</p>

                        {pageSize && (
                            <div
                                className="relative border-2 border-black mx-auto overflow-hidden bg-gray-100"
                                style={{
                                    width: pageSize.width * previewScale,
                                    height: pageSize.height * previewScale,
                                }}
                                ref={containerRef}
                            >
                                <div className="absolute inset-0 z-0">
                                    <Document file={files[0]}>
                                        <Page
                                            pageNumber={1}
                                            width={pageSize.width * previewScale}
                                            className="!bg-transparent"
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                </div>

                                {/* Overlay Layer for Dragging */}
                                <div className="absolute inset-0 z-10">
                                    <DraggableNode
                                        previewScale={previewScale}
                                        onDrag={handleDrag}
                                        signatureDataUrl={signatureDataUrl}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <NeoButton
                        onClick={handleSign}
                        disabled={isProcessing}
                        variant="accent"
                        className="w-full"
                    >
                        {isProcessing ? "SIGNING..." : "CONFIRM & DOWNLOAD"}
                        <Check className="ml-2 w-5 h-5" />
                    </NeoButton>
                </div>
            )}

            {signedPdfUrl && (
                <div className="bg-neo-green p-6 border-4 border-black shadow-neo-lg animate-in fade-in zoom-in duration-300">
                    <h4 className="text-2xl font-black mb-4 uppercase">Signed!</h4>
                    <a href={signedPdfUrl} download={`${files[0].name.replace(/\.pdf$/i, "")}-signed.pdf`}>
                        <NeoButton variant="primary" className="w-full">
                            DOWNLOAD SIGNED PDF
                            <Download className="ml-2 w-5 h-5" />
                        </NeoButton>
                    </a>
                </div>
            )}
        </div>
    );
}



function DraggableNode({
    previewScale,
    onDrag,
    signatureDataUrl
}: {
    previewScale: number;
    onDrag: (e: DraggableEvent, data: DraggableData) => void;
    signatureDataUrl: string;
}) {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            onDrag={onDrag}
            defaultPosition={{ x: 0, y: 0 }}
        >
            <div ref={nodeRef} className="absolute cursor-move inline-block shadow-lg border border-neo-purple bg-transparent">
                <img
                    src={signatureDataUrl}
                    alt="Signature"
                    style={{
                        width: "auto",
                        height: 50, // Fixed visual height for dragging
                    }}
                    draggable={false}
                />
            </div>
        </Draggable>
    );
}
