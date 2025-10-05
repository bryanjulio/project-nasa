import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // — vidro + borda + sombra para combinar com o Dialog —
        "relative rounded-2xl p-6",
        "bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl",
        "border border-red-300/20 shadow-2xl shadow-red-500/10",
        "flex flex-col gap-6",
        className
      )}
      {...props}
    >
      {/* Glow externo sutil (mesma ideia do DialogContent) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-400/20 blur-sm" />

      {/* conteúdo real acima do glow */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        // divisória inferior no mesmo tom do DialogFooter
        "border-b border-red-300/10 pb-4",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // mesmo gradiente do DialogTitle
        "text-lg leading-none font-bold bg-gradient-to-r from-red-200 via-orange-200 to-red-400 bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-slate-300/90 text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        // mesma borda do DialogFooter
        "border-t border-red-300/10 pt-4 mt-2",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
