"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface MegaDropzoneProps {
    onFilesSelected: (files: File[]) => void;
}

export function MegaDropzone({ onFilesSelected }: MegaDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            onFilesSelected(acceptedFiles);
        },
        [onFilesSelected]
    );

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        onDropAccepted: () => setIsDragActive(false),
        onDropRejected: () => setIsDragActive(false),
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative flex flex-col items-center justify-center p-12 transition-all duration-300 cursor-pointer",
                "border-4 border-dashed border-black bg-white",
                "min-h-[300px] w-full",
                isDragActive ? "bg-neo-purple/20 border-neo-purple scale-[1.02]" : "hover:bg-gray-50",
                "shadow-neo hover:shadow-neo-lg"
            )}
        >
            <input {...getInputProps()} />
            <Upload className="w-24 h-24 mb-6 text-black stroke-[1.5]" />
            <h3 className="text-3xl font-bold uppercase tracking-tighter text-black mb-2">
                {isDragActive ? "DROP IT LIKE IT'S HOT" : "DROP PDF HERE"}
            </h3>
            <p className="text-lg font-medium text-gray-500">
                or click to browse
            </p>
        </div>
    );
}
