import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastType } from '../components/toast';

interface ToastContextType {
    toast: (message: string, type?: ToastType, options?: { className?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [activeToast, setActiveToast] = useState<{ id: number; message: string; type: ToastType; className?: string } | null>(null);

    const toast = useCallback((message: string, type: ToastType = 'success', options?: { className?: string }) => {
        const id = Date.now();
        setActiveToast({ id, message, type, className: options?.className });

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setActiveToast(current => {
                if (current?.id === id) {
                    return null;
                }
                return current;
            });
        }, 2200); // Sigo tu preferencia de que sea más rápido si quieres, pero mantengo 2.2s
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {activeToast && (
                <Toast
                    key={activeToast.id}
                    message={activeToast.message}
                    type={activeToast.type}
                    className={activeToast.className}
                    onClose={() => setActiveToast(null)}
                />
            )}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
