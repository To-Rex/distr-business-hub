import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents as initialAgents } from "@/lib/mock-data";
import { useSettings } from "@/lib/settings";
import { Crosshair, MapPin, Plus, Minus, Layers } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cachedTileLayer } from "@/lib/cached-tile-layer";

export const Route = createFileRoute("/_app/live-map")({ component: LiveMapPage });

type Agent = (typeof initialAgents)[number];

type MapStyleKey = "standard" | "dark" | "satellite" | "hybrid" | "topo";

const MAP_STYLES: Record<MapStyleKey, { url: string; attr: string; maxZoom: number; subdomains?: string }> = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 18,
  },
  hybrid: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
  },
};

const STYLE_LABELS: Record<MapStyleKey, string> = {
  standard: "Standart",
  dark: "Tungi",
  satellite: "Sputnik",
  hybrid: "Gibrid",
  topo: "Topografik",
};

const pulseIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.3;animation:_locPulse 2s ease-out infinite;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LiveMapPage() {
  const { t, theme } = useSettings();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const selectedRef = useRef<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("standard");
  const [styleOpen, setStyleOpen] = useState(false);

  const resolveColor = useCallback((color: string) => {
    if (color.startsWith("var(")) {
      const prop = color.slice(4, -1);
      return getComputedStyle(document.documentElement).getPropertyValue(prop).trim() || "#3b82f6";
    }
    return color;
  }, []);

  useEffect(() => {
    setMapStyle((prev) => (prev === "standard" || prev === "dark") ? (theme === "dark" ? "dark" : "standard") : prev);
  }, [theme]);

  const applyTileLayer = useCallback((styleKey: MapStyleKey) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) tileLayerRef.current.remove();
    if (labelLayerRef.current) { labelLayerRef.current.remove(); labelLayerRef.current = null; }

    const cfg = MAP_STYLES[styleKey];
    const tile = cachedTileLayer(cfg.url, {
      attribution: cfg.attr,
      maxZoom: cfg.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tile;

    if (styleKey === "hybrid") {
      labelLayerRef.current = cachedTileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, attribution: "" },
      ).addTo(map);
    }
  }, []);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    const existingMap = L.DomUtil.get(el);
    if (existingMap && (existingMap as unknown as { _leaflet_id: number })._leaflet_id) {
      (existingMap as unknown as L.Map).remove();
    }

    const map = L.map(el, {
      center: [41.0, 68.0],
      zoom: 6,
      minZoom: 3,
      zoomControl: false,
      zoomAnimation: true,
      zoomSnap: 0.5,
      wheelPxPerZoomLevel: 120,
      inertia: true,
      inertiaDeceleration: 3400,
      worldCopyJump: true,
      fadeAnimation: true,
    });

    mapInstanceRef.current = map;
    applyTileLayer(mapStyle);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          userAccuracyRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.08,
            weight: 1.5,
          }).addTo(map);

          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: pulseIcon,
            zIndexOffset: 1000,
          }).addTo(map);

          map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTileLayer(mapStyle);
  }, [mapStyle, applyTileLayer]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    agents.forEach((a) => {
      const existing = markersRef.current.get(a.id);
      const color = resolveColor(a.color);

      if (existing) {
        existing.setLatLng([a.lat, a.lng]);
      } else {
        const marker = L.circleMarker([a.lat, a.lng], {
          radius: 10,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
          className: "animate-[markerPop_0.4s_ease-out]",
        }).addTo(map);

        marker.bindTooltip(a.name, {
          permanent: false,
          direction: "top",
          offset: [0, -10],
        });

        marker.on("click", () => {
          selectedRef.current = a.id;
          setSelected(a.id);
        });

        markersRef.current.set(a.id, marker);
      }
    });
  }, [agents, resolveColor]);

  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          lat: a.lat + (Math.random() - 0.5) * 0.01,
          lng: a.lng + (Math.random() - 0.5) * 0.01,
        })),
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedRef.current) {
      const marker = markersRef.current.get(selectedRef.current);
      if (marker) {
        mapInstanceRef.current?.flyTo(marker.getLatLng(), 13, {
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (styleOpen && !(e.target as HTMLElement).closest("[data-style-picker]")) {
        setStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [styleOpen]);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) { setLocating(false); return; }

        if (userAccuracyRef.current) userAccuracyRef.current.remove();
        if (userMarkerRef.current) userMarkerRef.current.remove();

        userAccuracyRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          weight: 1.5,
          className: "animate-[fadeIn_0.6s_ease-out]",
        }).addTo(map);

        userMarkerRef.current = L.marker([latitude, longitude], {
          icon: pulseIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        map.flyTo([latitude, longitude], 15, {
          animate: true,
          duration: 1.2,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [locating]);

  return (
    <div>
      <style>{`
        @keyframes _locPulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes markerPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .leaflet-popup-content-wrapper,
        .leaflet-tooltip {
          animation: markerPop 0.3s ease-out;
        }
        .leaflet-tile {
          transition: opacity 0.3s ease-in-out;
        }
        .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
      <PageHeader title={t("liveMap")} description={t("liveMapDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="relative">
            <div ref={mapRef} className="w-full aspect-[16/10] rounded-lg" />
            <div className="absolute top-4 right-4 z-[1000]" data-style-picker>
              <button
                onClick={() => setStyleOpen((v) => !v)}
                className={`h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90 ${styleOpen ? "bg-accent" : ""}`}
              >
                <Layers className="h-5 w-5" />
              </button>
              {styleOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 rounded-lg bg-card border shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
                  {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setMapStyle(key); setStyleOpen(false); }}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${mapStyle === key ? "bg-accent font-medium" : ""}`}
                    >
                      <span className={`h-3 w-3 rounded-full border-2 ${mapStyle === key ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                      {STYLE_LABELS[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => mapInstanceRef.current?.zoomIn(1, { animate: true })}
                className="h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={() => mapInstanceRef.current?.zoomOut(1, { animate: true })}
                className="h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                onClick={locateMe}
                disabled={locating}
                className="h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 active:scale-90"
              >
                <Crosshair className={`h-5 w-5 ${locating ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("activeAgents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((a) => (
              <button
                key={a.id}
                className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-1 -m-1 cursor-pointer"
                onClick={() => {
                  selectedRef.current = a.id;
                  setSelected(a.id);
                }}
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: resolveColor(a.color) }}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
