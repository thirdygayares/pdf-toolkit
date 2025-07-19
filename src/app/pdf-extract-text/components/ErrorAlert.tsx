import { AlertCircle } from "lucide-react";

export const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{message}</span>
        </div>
    </div>
);
