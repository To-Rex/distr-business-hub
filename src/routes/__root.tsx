import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";
import { AppSettingsProvider } from "@/lib/settings";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import appCss from "../styles.css?url";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Distr — Biznes Boshqaruv Tizimi" },
      { name: "description", content: "Distr — yagona biznes boshqaruv platformasi." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFoundPage,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function FloatingOrb({ delay, duration, size, x, y }: {
  delay: number; duration: number; size: number; x: string; y: string;
}) {
  return (
    <div
      className="absolute rounded-full opacity-20 dark:opacity-10 blur-3xl"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: "var(--color-primary)",
        animation: `float-orb ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function ParticleField() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function NotFoundPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="not-found-page min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <FloatingOrb delay={0} duration={8} size={400} x="10%" y="20%" />
      <FloatingOrb delay={2} duration={10} size={300} x="60%" y="10%" />
      <FloatingOrb delay={4} duration={12} size={350} x="70%" y="60%" />
      <FloatingOrb delay={1} duration={9} size={250} x="20%" y="70%" />
      <FloatingOrb delay={3} duration={11} size={200} x="40%" y="40%" />
      <ParticleField />

      <div className="grid absolute inset-0 opacity-[0.03]" style={{
        backgroundImage:
          "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className={`relative z-10 text-center px-6 transition-all duration-1000 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <div className="relative inline-block mb-8">
          <div
            className="text-[8rem] sm:text-[12rem] md:text-[16rem] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 4s ease-in-out infinite",
            }}
          >
            404
          </div>
          <div className="absolute inset-0 blur-3xl opacity-20" style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            animation: "gradient-shift 4s ease-in-out infinite",
            backgroundSize: "200% 200%",
          }} />
        </div>

        <div className={`transition-all duration-700 delay-300 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Compass className="h-5 w-5 text-muted-foreground" style={{ animation: "spin-slow 3s linear infinite" }} />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Sahifa topilmadi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Yo&apos;l adashib qoldingizmi?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-base leading-relaxed">
            Qidirgan sahifangiz mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin. Bosh sahifaga qaytib, kerakli bo&apos;limni qayta topishingiz mumkin.
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-500 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Bosh sahifa
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
        </div>

        <div className={`mt-16 transition-all duration-700 delay-700 ease-out ${
          mounted ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex items-center justify-center gap-1.5">
            <img src="/logo.png" alt="Distr" className="h-5 w-5 rounded object-contain opacity-50" />
            <span className="text-xs text-muted-foreground/50 font-medium">Distr Business Hub</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(15px, 35px) scale(1.02); }
        }
        @keyframes particle-drift {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          25% { opacity: 1; }
          50% { opacity: 0.5; transform: translate(20px, -30px); }
          75% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
