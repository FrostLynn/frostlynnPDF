import { FileStack, Scissors, PenTool, Minimize2 } from "lucide-react";
import { NeoCard } from "./NeoCard";
import { NeoButton } from "./NeoButton";

interface ToolGridProps {
    onToolSelect: (tool: "merge" | "split" | "sign" | "compress") => void;
}

export function ToolGrid({ onToolSelect }: ToolGridProps) {
    const tools = [
        {
            id: "merge",
            name: "Merge PDF",
            description: "Combine multiple PDFs into one massive file.",
            icon: FileStack,
            color: "text-neo-purple",
            btnVariant: "accent" as const,
        },
        {
            id: "split",
            name: "Split PDF",
            description: "Extract pages or burst a PDF into pieces.",
            icon: Scissors,
            color: "text-neo-pink",
            btnVariant: "danger" as const,
        },
        {
            id: "sign",
            name: "Sign PDF",
            description: "Slap your signature on that document.",
            icon: PenTool,
            color: "text-neo-green",
            // We don't have a green variant in NeoButton yet, using accent or creating one.
            // Let's use primary for now, or update NeoButton.
            btnVariant: "success" as const,
        },
        {
            id: "compress",
            name: "Compress PDF",
            description: "Squeeze those bytes. Garbage collect unused objects.",
            icon: Minimize2,
            color: "text-neo-blue",
            btnVariant: "info" as const,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full mt-12">
            {tools.map((tool) => (
                <NeoCard key={tool.id} title={tool.name} className="flex flex-col h-full bg-white">
                    <div className="flex-grow">
                        <tool.icon className={`w-12 h-12 mb-4 ${tool.color} stroke-2`} />
                        <p className="text-gray-600 font-medium text-lg mb-6">
                            {tool.description}
                        </p>
                    </div>
                    <NeoButton
                        variant={tool.btnVariant}
                        className="w-full"
                        onClick={() => onToolSelect(tool.id as "merge" | "split" | "sign" | "compress")}
                    >
                        SELECT
                    </NeoButton>
                </NeoCard>
            ))}
        </div>
    );
}
