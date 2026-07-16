// File này chưa Toast Provỉder và useToast

import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import ToastItem from "~/components/Toast/index.jsx";

const ToastContext = createContext(null);
let idCounter = 0;
export function ToastProvider({children}) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        if(timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    }, []);

    const showToast = useCallback(({title, type = "info", duration = 4000})=> {
        const id = ++idCounter;
        setToasts((prev) => [...prev, {id, title, type}]);

        if(duration > 0) {
            timers.current[id] = setTimeout(() => dismissToast(id), duration);
        }
        return id;
    }, [dismissToast]);

    useEffect(() => {
        return () => {
            Object.values(timers.current).forEach(clearTimeout);
            timers.current = {};
        }
    }, []);

    const value = useMemo(() => ({showToast, dismissToast}), [showToast, dismissToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
             <style>{`
                @keyframes toast-in {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div
                style={{
                position: "fixed",
                bottom: 16,
                left: 16,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column-reverse",
                gap: 8,
                pointerEvents: "none",
                }}
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
} 

export function useToast() {
    const context = useContext(ToastContext);
    if(!context) {
        throw new Error("useToast phải được dùng bên trong ToastProvider");
    }
    return context;
}