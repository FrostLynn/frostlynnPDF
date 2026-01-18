import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface NeoCardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
}

const NeoCard = forwardRef<HTMLDivElement, NeoCardProps>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-white border-2 border-neo-black p-6 shadow-neo-lg",
                    className
                )}
                {...props}
            >
                {title && (
                    <h2 className="mb-4 text-2xl font-bold uppercase tracking-tight border-b-2 border-neo-black pb-2">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        );
    }
);

NeoCard.displayName = "NeoCard";

export { NeoCard };
