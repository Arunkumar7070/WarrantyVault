import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { useToastStore } from "@/store/toastStore";
import { cn } from "@/utils/cn";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg",
              t.variant === "destructive" && "border-destructive/40",
              t.variant === "success" && "border-success/40",
            )}
          >
            {t.variant === "success" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />}
            {t.variant === "destructive" && <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
