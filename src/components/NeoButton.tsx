
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "accent" | "danger" | "success";
}

const NeoButton = forwardRef<HTMLButtonElement, NeoButtonProps>(
    ({ className, variant = "primary", children, ...props }, ref) => {
        const variants = {
            primary: "bg-white hover:bg-gray-50 text-black",
            secondary: "bg-gray-200 hover:bg-gray-300 text-black",
            accent: "bg-neo-purple hover:bg-neo-purple/90 text-white",
            danger: "bg-neo-pink hover:bg-neo-pink/90 text-white",
            success: "bg-neo-green hover:bg-neo-green/90 text-black",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center px-6 py-3 font-bold transition-all duration-200 ease-in-out",
                    "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

NeoButton.displayName = "NeoButton";

export { NeoButton };
