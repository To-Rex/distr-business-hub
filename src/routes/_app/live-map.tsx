import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";
import {
  Crosshair,
  MapPin,
  Plus,
  Minus,
  Layers,
  Users,
  User,
  Truck,
  Gauge,
  Clock,
  Route as RouteIcon,
  X,
  Store,
  Maximize2,
  Minimize2,
  Search,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cachedTileLayer } from "@/lib/cached-tile-layer";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/live-map")({ component: LiveMapPage });

type WsUser = {
  id: number;
  first_name: string;
  last_name: string;
  role: "SUPERVISOR" | "AGENT" | "DELIVERER";
  user_1c_id: number;
  status: "online" | "offline";
  speed: number;
  last_location: {
    latitude: number;
    longitude: number;
    timestamp: string | null;
  };
};

type WsMessage =
  | { action: "all_admvs"; users: WsUser[] }
  | { action: "status_update"; user_id: number; status: "online" | "offline" }
  | {
      action: "update_location";
      user: {
        id: number;
        first_name: string;
        last_name: string;
        role: "SUPERVISOR" | "AGENT" | "DELIVERER";
        user_1c_id: number;
        phone_number: string;
      };
      role: "SUPERVISOR" | "AGENT" | "DELIVERER";
      location: {
        latitude: number;
        longitude: number;
        device_name: string;
      };
      speed: number;
      bearing: number;
      accuracy: number;
      altitude: number;
      timestamp: string;
    };

type MapStyleKey = "standard" | "dark" | "satellite" | "hybrid" | "topo";

type ClientLocation = {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  comment: string;
  agent: string;
  visit: number;
};

const ROLE_COLORS: Record<WsUser["role"], string> = {
  SUPERVISOR: "#8b5cf6",
  AGENT: "#22c55e",
  DELIVERER: "#f59e0b",
};

const ROLE_ICONS: Record<WsUser["role"], string> = {
  SUPERVISOR:
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  AGENT:
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  DELIVERER:
    '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
};

const CLIENT_COLOR = "#ef4444";

const MAP_STYLES: Record<
  MapStyleKey,
  { url: string; attr: string; maxZoom: number; subdomains?: string }
> = {
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

function createUserIcon(
  firstName: string,
  lastName: string,
  role: WsUser["role"],
  isOnline: boolean,
  isSelected: boolean,
  isDarkTheme: boolean,
) {
  const color = ROLE_COLORS[role] || "#3b82f6";
  const icon = ROLE_ICONS[role] || ROLE_ICONS.AGENT;
  const size = isSelected ? 44 : 38;
  const inner = size - 10;
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  const shadow = isSelected ? 12 : 8;
  const glowSize = size + 16;
  const badgeTop = -2;
  const statusSize = isSelected ? 14 : 12;
  const statusOffset = isSelected ? 6 : 4;
  const labelBackground = isDarkTheme ? "rgba(15,23,42,0.9)" : "#ffffff";
  const labelTextColor = isDarkTheme ? "#fff" : "#0f172a";
  const labelBorder = isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(15,23,42,0.12)";

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;transition:transform 0.2s ease;">
      ${isOnline ? `<div style="position:absolute;top:${badgeTop - 4}px;left:50%;transform:translateX(-50%);width:${glowSize}px;height:${glowSize}px;border-radius:50%;background:${color};opacity:0.15;animation:_locPulse 2s ease-out infinite;"></div>` : ""}
      <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg, ${color}, ${color}dd);border:3px solid #fff;box-shadow:0 ${shadow}px ${shadow + 4}px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;overflow:hidden;${isSelected ? "transform:scale(1.1);" : ""}">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%);border-radius:50%;"></div>
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          ${icon}
        </div>
        <div style="position:absolute;bottom:${statusOffset}px;right:${statusOffset}px;width:${statusSize}px;height:${statusSize}px;border-radius:50%;border:2px solid #fff;${isOnline ? "background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,0.5);" : "background:#9ca3af;"}"></div>
      </div>
      <div style="margin-top:4px;white-space:nowrap;background:${labelBackground};backdrop-filter:blur(8px);color:${labelTextColor};padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;font-family:system-ui,sans-serif;max-width:140px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:${labelBorder};">
        ${fullName}
      </div>
      ${isSelected ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:${glowSize + 8}px;height:${glowSize + 8}px;border-radius:50%;border:2px solid ${color};opacity:0.3;animation:_locPulse 1.5s ease-out infinite;"></div>` : ""}
    </div>`,
    iconSize: [size + 8, size + 32],
    iconAnchor: [(size + 8) / 2, size / 2 + 2],
    tooltipAnchor: [0, -(size / 2 + 32)],
  });
}

const CLIENT_COLOR_DEFAULT = "#eab308";
const CLIENT_COLOR_VISITED = "#22c55e";

function createClientIcon(name: string, visit: number, isDarkTheme: boolean) {
  const size = 22;
  const color = visit > 0 ? CLIENT_COLOR_VISITED : CLIENT_COLOR_DEFAULT;
  const labelBackground = isDarkTheme ? "rgba(15,23,42,0.9)" : "#ffffff";
  const labelTextColor = isDarkTheme ? "#fff" : "#0f172a";
  const labelBorder = isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(15,23,42,0.12)";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg, ${color}, ${color}dd);border:1.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><rect width="18" height="7" x="3" y="7" rx="1"/></svg>
      </div>
      <div style="margin-top:2px;white-space:nowrap;background:${labelBackground};backdrop-filter:blur(8px);color:${labelTextColor};padding:1px 6px;border-radius:6px;font-size:9px;font-weight:600;font-family:system-ui,sans-serif;max-width:90px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:${labelBorder};">
        ${name}
      </div>
    </div>`,
    iconSize: [size + 6, size + 20],
    iconAnchor: [(size + 6) / 2, size / 2 + 2],
    tooltipAnchor: [0, -(size / 2 + 20)],
  });
}

function LiveMapPage() {
  const { t, theme } = useSettings();
  const { accessToken, user } = useAuth();
  const [users, setUsers] = useState<WsUser[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">(
    "disconnected",
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const selectedRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [workSession, setWorkSession] = useState<{ session: string; device_name: string } | null>(
    null,
  );
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyRef = useRef<L.Circle | null>(null);
  const currentLocationRef = useRef<{ latitude: number; longitude: number; accuracy: number } | null>(
    null,
  );
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("standard");
  const [styleOpen, setStyleOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"ALL" | WsUser["role"]>("ALL");
  const [updatedIds, setUpdatedIds] = useState<Set<number>>(new Set());
  const historyLayerRef = useRef<L.LayerGroup | null>(null);
  const historyPolylineRef = useRef<L.Polyline | null>(null);
  const clientMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const [clients, setClients] = useState<ClientLocation[]>([]);
  const [showClients, setShowClients] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapContainerKey, setMapContainerKey] = useState(0);
  const pendingViewRef = useRef<{ center: L.LatLngExpression; zoom: number } | null>(null);
  const initialLocationDoneRef = useRef(false);
  const fullscreenControlsRight = "calc(320px + 1.25rem)";
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [navSearchTarget, setNavSearchTarget] = useState<"user" | "client">("user");
  const [liveMapSuggestion, setLiveMapSuggestion] = useState("");

  const normalizedNavSearch = navSearchQuery.trim().toLowerCase();
  const roleFilteredUsers = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);
  const userSearchMatches =
    navSearchTarget === "user" && normalizedNavSearch
      ? roleFilteredUsers.filter((u) =>
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(normalizedNavSearch),
        )
      : [];
  const clientSearchMatches =
    navSearchTarget === "client" && normalizedNavSearch
      ? clients.filter((c) => c.name.toLowerCase().includes(normalizedNavSearch))
      : [];
  const prioritizedUsers =
    userSearchMatches.length > 0
      ? [...roleFilteredUsers].sort((a, b) => {
          const aMatched = `${a.first_name} ${a.last_name}`
            .toLowerCase()
            .includes(normalizedNavSearch);
          const bMatched = `${b.first_name} ${b.last_name}`
            .toLowerCase()
            .includes(normalizedNavSearch);
          if (aMatched === bMatched) return 0;
          return aMatched ? -1 : 1;
        })
      : roleFilteredUsers;

  const refreshMapSize = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize({ animate: false });
    tileLayerRef.current?.redraw();
    labelLayerRef.current?.redraw();
  }, []);

  const renderCurrentLocation = useCallback(
    (latitude: number, longitude: number, accuracy: number) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (userAccuracyRef.current) userAccuracyRef.current.remove();
      if (userMarkerRef.current) userMarkerRef.current.remove();

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
    },
    [],
  );

  useEffect(() => {
    setMapStyle((prev) =>
      prev === "standard" || prev === "dark" ? (theme === "dark" ? "dark" : "standard") : prev,
    );
  }, [theme]);

  const applyTileLayer = useCallback(
    (styleKey: MapStyleKey) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (tileLayerRef.current) tileLayerRef.current.remove();
      if (labelLayerRef.current) {
        labelLayerRef.current.remove();
        labelLayerRef.current = null;
      }

      const cfg = MAP_STYLES[styleKey];
      const layerFactory = isFullscreen ? L.tileLayer : cachedTileLayer;
      const tileOptions: L.TileLayerOptions = {
        attribution: cfg.attr,
        maxZoom: cfg.maxZoom,
      };
      if (cfg.subdomains) {
        tileOptions.subdomains = cfg.subdomains;
      }

      const tile = layerFactory(cfg.url, tileOptions).addTo(map);
      tileLayerRef.current = tile;

      if (styleKey === "hybrid") {
        labelLayerRef.current = layerFactory(
          "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
          { maxZoom: 19, attribution: "" },
        ).addTo(map);
      }
    },
    [isFullscreen],
  );

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    // Ba'zi holatlarda container'da eski leaflet id qolib ketadi.
    if ((el as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (el as unknown as { _leaflet_id?: number })._leaflet_id;
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
    markersRef.current.clear();
    clientMarkersRef.current.clear();
    if (pendingViewRef.current) {
      map.setView(pendingViewRef.current.center, pendingViewRef.current.zoom, { animate: false });
      pendingViewRef.current = null;
    }
    applyTileLayer(mapStyle);
    if (currentLocationRef.current) {
      const { latitude, longitude, accuracy } = currentLocationRef.current;
      renderCurrentLocation(latitude, longitude, accuracy);
    }

    return () => {
      markersRef.current.clear();
      clientMarkersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerKey, applyTileLayer, mapStyle, renderCurrentLocation]);

  const locateMe = useCallback(
    (timeout = 10000, maximumAge = 0) => {
      if (!navigator.geolocation || locating) return;
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const map = mapInstanceRef.current;
          if (!map) {
            setLocating(false);
            return;
          }

          currentLocationRef.current = { latitude, longitude, accuracy };
          renderCurrentLocation(latitude, longitude, accuracy);

          map.flyTo([latitude, longitude], 15, {
            animate: true,
            duration: 1.2,
          });
          setLocating(false);
        },
        () => setLocating(false),
        { enableHighAccuracy: true, timeout, maximumAge },
      );
    },
    [locating, renderCurrentLocation],
  );

  useEffect(() => {
    if (initialLocationDoneRef.current) return;
    if (!mapInstanceRef.current || !navigator.geolocation) return;

    const timer = window.setTimeout(() => {
      if (initialLocationDoneRef.current) return;
      if (!mapInstanceRef.current || !navigator.geolocation) return;
      initialLocationDoneRef.current = true;
      locateMe(15000, 30000);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [mapContainerKey, locateMe]);

  useEffect(() => {
    applyTileLayer(mapStyle);
  }, [mapStyle, applyTileLayer]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const filteredIds = new Set<number>(roleFilteredUsers.map((u) => u.id));

    users.forEach((u) => {
      const { latitude, longitude } = u.last_location;
      if (latitude === 0 && longitude === 0) return;

      if (!filteredIds.has(u.id)) {
        const existing = markersRef.current.get(u.id);
        if (existing) {
          existing.remove();
          markersRef.current.delete(u.id);
        }
        return;
      }

      const isOnline = u.status === "online";
      const isSel = selectedRef.current === u.id;
      const icon = createUserIcon(
        u.first_name,
        u.last_name,
        u.role,
        isOnline,
        isSel,
        theme === "dark",
      );
      const existing = markersRef.current.get(u.id);

      if (existing) {
        existing.setLatLng([latitude, longitude]);
        existing.setIcon(icon);
        existing.setTooltipContent(`${u.first_name} ${u.last_name}`);
      } else {
        const marker = L.marker([latitude, longitude], {
          icon,
          zIndexOffset: isSel ? 1000 : isOnline ? 500 : 0,
        }).addTo(map);

        marker.bindTooltip(
          `<div style="font-weight:600;font-size:13px;">${u.first_name} ${u.last_name}</div><div style="font-size:11px;opacity:0.7;">${roleLabel(u.role)}</div>`,
          {
            permanent: false,
            direction: "top",
            offset: [0, 0],
            className: "",
          },
        );

        marker.on("click", () => {
          const newId = selectedRef.current === u.id ? null : u.id;
          selectedRef.current = newId;
          setSelected(newId);
        });

        markersRef.current.set(u.id, marker);
      }
    });

    for (const [id, marker] of markersRef.current) {
      if (!filteredIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [users, roleFilteredUsers, selected, mapContainerKey, theme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showClients) {
      for (const [, marker] of clientMarkersRef.current) {
        marker.remove();
      }
      clientMarkersRef.current.clear();
      return;
    }

    const existingIds = new Set<number>();

    clients.forEach((c) => {
      if (c.latitude === 0 && c.longitude === 0) return;
      existingIds.add(c.id);

      const icon = createClientIcon(c.name, c.visit, theme === "dark");
      const existing = clientMarkersRef.current.get(c.id);

      if (existing) {
        existing.setLatLng([c.latitude, c.longitude]);
        existing.setIcon(icon);
        existing.setTooltipContent(
          `<div style="font-weight:600;font-size:13px;">${c.name}</div><div style="font-size:11px;opacity:0.7;">${c.agent ? "Agent: " + c.agent : ""}</div>${c.comment ? `<div style="font-size:11px;opacity:0.7;">${c.comment}</div>` : ""}`,
        );
      } else {
        const marker = L.marker([c.latitude, c.longitude], {
          icon,
          zIndexOffset: -100,
        }).addTo(map);

        marker.bindTooltip(
          `<div style="font-weight:600;font-size:13px;">${c.name}</div><div style="font-size:11px;opacity:0.7;">${c.agent ? "Agent: " + c.agent : ""}</div>${c.comment ? `<div style="font-size:11px;opacity:0.7;">${c.comment}</div>` : ""}`,
          {
            permanent: false,
            direction: "top",
            offset: [0, 0],
            className: "",
          },
        );

        clientMarkersRef.current.set(c.id, marker);
      }
    });

    for (const [id, marker] of clientMarkersRef.current) {
      if (!existingIds.has(id)) {
        marker.remove();
        clientMarkersRef.current.delete(id);
      }
    }
  }, [clients, showClients, mapContainerKey, theme]);

  useEffect(() => {
    const onNavSearchChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string; target?: "user" | "client" }>;
      setNavSearchQuery(customEvent.detail?.query ?? "");
      setNavSearchTarget(customEvent.detail?.target ?? "user");
    };

    window.addEventListener("live-map-search-change", onNavSearchChange as EventListener);
    return () =>
      window.removeEventListener("live-map-search-change", onNavSearchChange as EventListener);
  }, []);

  useEffect(() => {
    const onSuggestion = (event: Event) => {
      const customEvent = event as CustomEvent<{ suggestion?: string }>;
      setLiveMapSuggestion(customEvent.detail?.suggestion ?? "");
    };
    window.addEventListener("live-map-search-suggestion", onSuggestion as EventListener);
    return () =>
      window.removeEventListener("live-map-search-suggestion", onSuggestion as EventListener);
  }, []);

  useEffect(() => {
    const hasQuery = normalizedNavSearch.length > 0;
    const suggestion = hasQuery
      ? navSearchTarget === "user"
        ? userSearchMatches[0]
          ? `${userSearchMatches[0].first_name} ${userSearchMatches[0].last_name}`
          : ""
        : clientSearchMatches[0]?.name ?? ""
      : "";

    window.dispatchEvent(
      new CustomEvent("live-map-search-suggestion", {
        detail: { suggestion },
      }),
    );
  }, [normalizedNavSearch, navSearchTarget, userSearchMatches, clientSearchMatches]);

  useEffect(() => {
    if (navSearchTarget !== "client" || !normalizedNavSearch) return;
    const targetClient = clientSearchMatches[0];
    if (!targetClient) return;
    if (targetClient.latitude === 0 && targetClient.longitude === 0) return;

    mapInstanceRef.current?.flyTo([targetClient.latitude, targetClient.longitude], 15, {
      animate: true,
      duration: 0.8,
    });
  }, [navSearchTarget, normalizedNavSearch, clientSearchMatches]);

  useEffect(() => {
    if (navSearchTarget !== "user" || !normalizedNavSearch) return;
    const targetUser = userSearchMatches[0];
    if (!targetUser) return;
    if (targetUser.last_location.latitude === 0 && targetUser.last_location.longitude === 0) return;

    mapInstanceRef.current?.flyTo(
      [targetUser.last_location.latitude, targetUser.last_location.longitude],
      15,
      {
        animate: true,
        duration: 0.8,
      },
    );
  }, [navSearchTarget, normalizedNavSearch, userSearchMatches]);

  useEffect(() => {
    if (!isFullscreen) return;
    window.dispatchEvent(
      new CustomEvent("live-map-search-change", {
        detail: { query: navSearchQuery, target: navSearchTarget },
      }),
    );
  }, [isFullscreen, navSearchQuery, navSearchTarget]);

  useEffect(() => {
    const onSelectUserFromSearch = (event: Event) => {
      const customEvent = event as CustomEvent<{ fullName?: string }>;
      const fullName = customEvent.detail?.fullName?.trim().toLowerCase();
      if (!fullName) return;

      const matchedUser = users.find(
        (u) => `${u.first_name} ${u.last_name}`.trim().toLowerCase() === fullName,
      );
      if (!matchedUser) return;

      selectedRef.current = matchedUser.id;
      setSelected(matchedUser.id);
    };

    window.addEventListener("live-map-search-select-user", onSelectUserFromSearch as EventListener);
    return () =>
      window.removeEventListener(
        "live-map-search-select-user",
        onSelectUserFromSearch as EventListener,
      );
  }, [users]);

  useEffect(() => {
    const onSelectClientFromSearch = (event: Event) => {
      const customEvent = event as CustomEvent<{ name?: string }>;
      const name = customEvent.detail?.name?.trim().toLowerCase();
      if (!name) return;

      const matchedClient = clients.find((c) => c.name.trim().toLowerCase() === name);
      if (!matchedClient) return;
      if (matchedClient.latitude === 0 && matchedClient.longitude === 0) return;

      mapInstanceRef.current?.flyTo([matchedClient.latitude, matchedClient.longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    };

    window.addEventListener(
      "live-map-search-select-client",
      onSelectClientFromSearch as EventListener,
    );
    return () =>
      window.removeEventListener(
        "live-map-search-select-client",
        onSelectClientFromSearch as EventListener,
      );
  }, [clients]);

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
  }, [selected, mapContainerKey]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !accessToken) return;

    if (historyLayerRef.current) {
      historyLayerRef.current.clearLayers();
      historyLayerRef.current.remove();
      historyLayerRef.current = null;
    }
    historyPolylineRef.current = null;

    if (selected === null) return;

    const userId = selected;
    const user = users.find((u) => u.id === userId);
    const color = user ? ROLE_COLORS[user.role] || "#3b82f6" : "#3b82f6";

    fetch(API.userHistory(userId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(
        async (
          points: { id: number; latitude: number; longitude: number; created_at: string }[],
        ) => {
          if (!mapInstanceRef.current || selectedRef.current !== userId) return;

          const filtered = points.filter((p) => p.latitude !== 0 || p.longitude !== 0);
          if (filtered.length < 2) return;

          const map = mapInstanceRef.current;
          const group = L.layerGroup().addTo(map);
          historyLayerRef.current = group;

          filtered.forEach((p, i) => {
            const isLast = i === filtered.length - 1;
            L.circleMarker([p.latitude, p.longitude], {
              radius: isLast ? 6 : 4,
              color: isLast ? "#6d28d9" : color,
              fillColor: isLast ? "#6d28d9" : color,
              fillOpacity: isLast ? 1 : 0.7,
              weight: 2,
            }).addTo(group);
          });

          const deduped: { latitude: number; longitude: number }[] = [filtered[0]];
          for (let i = 1; i < filtered.length; i++) {
            const prev = deduped[deduped.length - 1];
            const dLat = filtered[i].latitude - prev.latitude;
            const dLng = filtered[i].longitude - prev.longitude;
            if (dLat * dLat + dLng * dLng > 0.000001) {
              deduped.push(filtered[i]);
            }
          }

          if (deduped.length < 2) {
            const fallback = filtered.map((p) => L.latLng(p.latitude, p.longitude));
            const pl = L.polyline(fallback, {
              color,
              weight: 4,
              opacity: 0.8,
              smoothFactor: 1,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(group);
            historyPolylineRef.current = pl;
            return;
          }

          const coordsStr = deduped.map((p) => `${p.longitude},${p.latitude}`).join(";");
          let routeCoords: L.LatLngExpression[] | null = null;

          try {
            const matchRes = await fetch(
              `https://router.project-osrm.org/match/v1/driving/${coordsStr}?overview=full&geometries=geojson`,
            );
            if (matchRes.ok) {
              const matchData = await matchRes.json();
              if (selectedRef.current !== userId) return;
              if (matchData.matchings && matchData.matchings.length > 0) {
                routeCoords = matchData.matchings[0].geometry.coordinates.map(
                  (c: [number, number]) => L.latLng(c[1], c[0]),
                );
              }
            }
          } catch {}

          if (!routeCoords && selectedRef.current === userId) {
            try {
              const routeRes = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&alternatives=false`,
              );
              if (routeRes.ok) {
                const routeData = await routeRes.json();
                if (selectedRef.current !== userId) return;
                if (routeData.routes && routeData.routes.length > 0) {
                  routeCoords = routeData.routes[0].geometry.coordinates.map(
                    (c: [number, number]) => L.latLng(c[1], c[0]),
                  );
                }
              }
            } catch {}
          }

          if (selectedRef.current !== userId) return;

          if (!routeCoords) {
            routeCoords = filtered.map((p) => L.latLng(p.latitude, p.longitude));
          }

          const polyline = L.polyline(routeCoords, {
            color: "#3b82f6",
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(group);
          historyPolylineRef.current = polyline;
        },
      )
      .catch(() => {});
  }, [selected, accessToken, users, mapContainerKey]);

  useEffect(() => {
    if (!accessToken || selected === null) {
      setWorkSession(null);
      return;
    }

    const userId = selected;

    fetch(API.workingSession(userId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (selectedRef.current !== userId) return;
        const session = Array.isArray(data) ? data[0] : data;
        if (session && typeof session === "object" && "session" in session) {
          setWorkSession(session as { session: string; device_name: string });
        } else {
          setWorkSession(null);
        }
      })
      .catch(() => {
        if (selectedRef.current === userId) setWorkSession(null);
      });
  }, [selected, accessToken]);

  useEffect(() => {
    if (selected === null || !accessToken) {
      setDistanceKm(null);
      return;
    }

    const userId = selected;

    fetch(API.userHistory(userId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(
        async (
          points: { id: number; latitude: number; longitude: number; created_at: string }[],
        ) => {
          if (selectedRef.current !== userId) return;

          const filtered = points.filter((p) => p.latitude !== 0 || p.longitude !== 0);
          if (filtered.length < 2) {
            setDistanceKm(0);
            return;
          }

          const deduped: { latitude: number; longitude: number }[] = [filtered[0]];
          for (let i = 1; i < filtered.length; i++) {
            const prev = deduped[deduped.length - 1];
            const dLat = filtered[i].latitude - prev.latitude;
            const dLng = filtered[i].longitude - prev.longitude;
            if (dLat * dLat + dLng * dLng > 0.000001) {
              deduped.push(filtered[i]);
            }
          }

          if (deduped.length < 2) {
            setDistanceKm(0);
            return;
          }

          const coordsStr = deduped.map((p) => `${p.longitude},${p.latitude}`).join(";");

          try {
            const matchRes = await fetch(
              `https://router.project-osrm.org/match/v1/driving/${coordsStr}?overview=full&geometries=geojson`,
            );
            if (matchRes.ok) {
              const matchData = await matchRes.json();
              if (selectedRef.current !== userId) return;
              if (matchData.matchings && matchData.matchings.length > 0) {
                const dist = matchData.matchings.reduce(
                  (sum: number, m: { distance: number }) => sum + m.distance,
                  0,
                );
                setDistanceKm(Math.round(dist) / 1000);
                return;
              }
            }
          } catch {}

          if (selectedRef.current !== userId) return;

          try {
            const routeRes = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&alternatives=false`,
            );
            if (routeRes.ok) {
              const routeData = await routeRes.json();
              if (selectedRef.current !== userId) return;
              if (routeData.routes && routeData.routes.length > 0) {
                const dist = routeData.routes[0].distance;
                setDistanceKm(Math.round(dist) / 1000);
                return;
              }
            }
          } catch {}

          if (selectedRef.current === userId) setDistanceKm(null);
        },
      )
      .catch(() => {
        if (selectedRef.current === userId) setDistanceKm(null);
      });
  }, [selected, accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const wsUrl = API.wsLocations(accessToken);
    setWsStatus("connecting");
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: WsMessage = JSON.parse(event.data);
        if (data.action === "all_admvs" && data.users) {
          setUsers(data.users.map((u) => ({ ...u, speed: 0 })));
        } else if (data.action === "status_update") {
          setUsers((prev) =>
            prev.map((u) => (u.id === data.user_id ? { ...u, status: data.status } : u)),
          );
          setUpdatedIds((prev) => {
            const next = new Set(prev);
            next.add(data.user_id);
            return next;
          });
          setTimeout(() => {
            setUpdatedIds((prev) => {
              const next = new Set(prev);
              next.delete(data.user_id);
              return next;
            });
          }, 1500);
        } else if (data.action === "update_location") {
          setUsers((prev) => {
            const idx = prev.findIndex((u) => u.id === data.user.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                first_name: data.user.first_name,
                last_name: data.user.last_name,
                role: data.user.role,
                speed: data.speed,
                last_location: {
                  latitude: data.location.latitude,
                  longitude: data.location.longitude,
                  timestamp: data.timestamp,
                },
              };
              return updated;
            }
            return [
              ...prev,
              {
                id: data.user.id,
                first_name: data.user.first_name,
                last_name: data.user.last_name,
                role: data.user.role,
                user_1c_id: data.user.user_1c_id,
                status: "online",
                speed: data.speed,
                last_location: {
                  latitude: data.location.latitude,
                  longitude: data.location.longitude,
                  timestamp: data.timestamp,
                },
              },
            ];
          });
          setUpdatedIds((prev) => {
            const next = new Set(prev);
            next.add(data.user.id);
            return next;
          });
          setTimeout(() => {
            setUpdatedIds((prev) => {
              const next = new Set(prev);
              next.delete(data.user.id);
              return next;
            });
          }, 1500);
        }
      } catch {
        // ignore invalid messages
      }
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
    };

    ws.onerror = () => {
      setWsStatus("disconnected");
    };

    return () => {
      ws.close();
      setWsStatus("disconnected");
      setUsers([]);
      setUpdatedIds(new Set());
      const currentMarkers = markersRef.current;
      for (const [, marker] of currentMarkers) {
        marker.remove();
      }
      currentMarkers.clear();
      if (historyLayerRef.current) {
        historyLayerRef.current.clearLayers();
        historyLayerRef.current.remove();
        historyLayerRef.current = null;
      }
      historyPolylineRef.current = null;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) return;

    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);

    fetch(API.clientLocations(baseUrl), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data: { results: ClientLocation[] }) => {
        setClients(data.results ?? []);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (styleOpen && !(e.target as HTMLElement).closest("[data-style-picker]")) {
        setStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [styleOpen]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();

    // Fullscreen toggle paytida container o'lchami bosqichma-bosqich o'zgaradi.
    const reflowAndRestore = () => {
      refreshMapSize();
      // Tile layer ayrim browserlarda fullscreen almashganda oq bo'lib qolmasligi uchun qayta ulanadi.
      applyTileLayer(mapStyle);
      map.setView(center, zoom, { animate: false });
      refreshMapSize();
    };

    const t1 = window.setTimeout(reflowAndRestore, 0);
    const t2 = window.setTimeout(reflowAndRestore, 160);
    const t3 = window.setTimeout(reflowAndRestore, 360);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [isFullscreen, refreshMapSize, applyTileLayer, mapStyle]);

  useEffect(() => {
    const onResize = () => refreshMapSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [refreshMapSize]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const map = mapInstanceRef.current;
        if (map) {
          pendingViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
        }
        setIsFullscreen(false);
        setMapContainerKey((k) => k + 1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map) {
      pendingViewRef.current = { center: map.getCenter(), zoom: map.getZoom() };
    }
    setIsFullscreen((v) => !v);
    setMapContainerKey((k) => k + 1);
  }, []);

  const roleLabel = (role: "SUPERVISOR" | "AGENT" | "DELIVERER") => {
    switch (role) {
      case "SUPERVISOR":
        return t("supervisor");
      case "DELIVERER":
        return t("deliverer");
      case "AGENT":
        return "Agent";
    }
  };

  const RoleIcon = ({ role }: { role: WsUser["role"] }) => {
    switch (role) {
      case "SUPERVISOR":
        return <Users className="h-4 w-4 text-white" />;
      case "AGENT":
        return <User className="h-4 w-4 text-white" />;
      case "DELIVERER":
        return <Truck className="h-4 w-4 text-white" />;
      default:
        return <MapPin className="h-4 w-4 text-white" />;
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-[9999]" : ""}>
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
        @keyframes _agentFlashAnim {
          0% { background-color: transparent; }
          20% { background-color: rgba(59,130,246,0.12); }
          100% { background-color: transparent; }
        }
        ._agentFlash {
          animation: _agentFlashAnim 1.5s ease-out;
          border-radius: 0.5rem;
        }
        .leaflet-popup-content-wrapper,
        .leaflet-tooltip {
          animation: markerPop 0.3s ease-out;
          background: rgba(15, 23, 42, 0.92) !important;
          backdrop-filter: blur(12px) !important;
          color: #fff !important;
          border-radius: 10px !important;
          padding: 8px 14px !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
          font-family: system-ui, sans-serif !important;
        }
        .leaflet-tooltip-top::before {
          border-top-color: rgba(15, 23, 42, 0.92) !important;
        }
        .leaflet-tile {
          transition: opacity 0.3s ease-in-out;
        }
        .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .leaflet-container {
          z-index: 0 !important;
        }
      `}</style>
      {!isFullscreen && <PageHeader title={t("liveMap")} description={t("liveMapDesc")} />}
      <div
        className={
          isFullscreen
            ? "absolute top-3 left-3 z-[1001] bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-2.5 flex items-center gap-3 flex-wrap"
            : "flex items-center gap-3 mb-3 flex-wrap"
        }
      >
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${wsStatus === "connected" ? "bg-green-500 animate-pulse" : wsStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-xs text-muted-foreground">
            {wsStatus === "connected"
              ? t("online")
              : wsStatus === "connecting"
                ? "..."
                : t("offline")}
          </span>
        </span>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              {
                key: "ALL" as const,
                label: t("allRoles"),
                Icon: MapPin,
                color: "#6b7280",
              },
              {
                key: "AGENT" as const,
                label: t("agents"),
                Icon: User,
                color: ROLE_COLORS.AGENT,
              },
              {
                key: "SUPERVISOR" as const,
                label: t("supervisors"),
                Icon: Users,
                color: ROLE_COLORS.SUPERVISOR,
              },
              {
                key: "DELIVERER" as const,
                label: t("deliverers"),
                Icon: Truck,
                color: ROLE_COLORS.DELIVERER,
              },
            ] as const
          ).map(({ key, label, Icon, color }) => {
            const count = key === "ALL" ? users.length : users.filter((u) => u.role === key).length;
            const active = roleFilter === key;
            return (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                  active
                    ? "text-white shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
                style={active ? { backgroundColor: color, borderColor: color } : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                    active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {clients.length > 0 && (
          <>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={() => setShowClients((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${
                showClients
                  ? "text-white shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
              style={
                showClients
                  ? { backgroundColor: CLIENT_COLOR_DEFAULT, borderColor: CLIENT_COLOR_DEFAULT }
                  : undefined
              }
            >
              <Store className="h-3.5 w-3.5" />
              <span>{t("clientsOnMap")}</span>
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                  showClients ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {clients.length}
              </span>
            </button>
          </>
        )}
      </div>
      <div
        className={
          isFullscreen
            ? "h-full w-full relative"
            : "grid grid-cols-1 lg:grid-cols-4 gap-4"
        }
      >
        <Card
          className={
            isFullscreen
              ? "absolute inset-0 z-0 rounded-none border-0 shadow-none overflow-hidden"
              : "lg:col-span-3 overflow-hidden relative z-0 h-[70vh] min-h-[520px] max-h-[760px]"
          }
        >
          <div className={isFullscreen ? "absolute inset-0 z-0" : "relative z-0 h-full"}>
            <div
              key={mapContainerKey}
              ref={mapRef}
              className={isFullscreen ? "absolute inset-0" : "h-full w-full"}
              style={!isFullscreen ? { position: "relative", zIndex: 0 } : undefined}
            />
            <div
              className={isFullscreen ? "absolute top-4 right-4 z-[1002]" : "absolute top-4 right-4 z-[1000]"}
              data-style-picker
              style={isFullscreen ? { right: fullscreenControlsRight } : undefined}
            >
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
                      onClick={() => {
                        setMapStyle(key);
                        setStyleOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${mapStyle === key ? "bg-accent font-medium" : ""}`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full border-2 ${mapStyle === key ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
                      />
                      {STYLE_LABELS[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              className={
                isFullscreen
                  ? "absolute bottom-4 right-4 z-[1002] flex flex-col gap-2"
                  : "absolute bottom-4 right-4 z-[1000] flex flex-col gap-2"
              }
              style={isFullscreen ? { right: fullscreenControlsRight } : undefined}
            >
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
                onClick={() => locateMe()}
                disabled={locating}
                className="h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 active:scale-90"
              >
                <Crosshair className={`h-5 w-5 ${locating ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </Card>
        <Card
          className={
            isFullscreen
              ? "absolute right-3 top-3 bottom-3 w-[320px] z-[1001] bg-card/95 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden"
              : "flex flex-col h-[70vh] min-h-[520px] max-h-[760px]"
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("activeAgents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col min-h-0">
            {isFullscreen && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search")}
                  className="pl-9 pr-20 bg-secondary border-transparent focus-visible:bg-card h-9"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setNavSearchTarget((prev) => (prev === "user" ? "client" : "user"))}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 rounded-md border bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {navSearchTarget === "user" ? "User" : "Client"}
                </button>
                {navSearchQuery.trim().length > 0 && liveMapSuggestion && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50 overflow-hidden">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => {
                        setNavSearchQuery(liveMapSuggestion);
                        if (navSearchTarget === "user") {
                          window.dispatchEvent(
                            new CustomEvent("live-map-search-select-user", {
                              detail: { fullName: liveMapSuggestion },
                            }),
                          );
                        } else {
                          window.dispatchEvent(
                            new CustomEvent("live-map-search-select-client", {
                              detail: { name: liveMapSuggestion },
                            }),
                          );
                        }
                      }}
                    >
                      {liveMapSuggestion}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div
              className={`overflow-y-auto space-y-3 ${selected !== null ? "flex-1 min-h-0" : "flex-1"}`}
            >
              {prioritizedUsers.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {wsStatus === "connected" ? "..." : t("offline")}
                </div>
              )}
              {prioritizedUsers.map((u) => {
                const color = ROLE_COLORS[u.role] || "#3b82f6";
                const hasLocation =
                  u.last_location.latitude !== 0 || u.last_location.longitude !== 0;
                const isUpdated = updatedIds.has(u.id);
                return (
                  <button
                    key={u.id}
                    className={`flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-1.5 cursor-pointer transition-colors border-2 ${selected === u.id ? "bg-muted/70 border-primary/40" : "border-transparent"} ${isUpdated ? "_agentFlash" : ""}`}
                    onClick={() => {
                      if (!hasLocation) return;
                      const newId = selectedRef.current === u.id ? null : u.id;
                      selectedRef.current = newId;
                      setSelected(newId);
                      if (newId === null) {
                        setWorkSession(null);
                        setDistanceKm(null);
                      }
                    }}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: color,
                        opacity: u.status === "online" ? 1 : 0.5,
                      }}
                    >
                      <RoleIcon role={u.role} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {roleLabel(u.role)}
                        {hasLocation && (
                          <span className="ml-1">
                            {" "}
                            · {u.last_location.latitude.toFixed(4)},{" "}
                            {u.last_location.longitude.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        u.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {selected !== null &&
              (() => {
                const selUser = users.find((u) => u.id === selected);
                if (!selUser) return null;
                const color = ROLE_COLORS[selUser.role] || "#3b82f6";
                const speedMs = selUser.speed || 0;
                const speedKmh = Math.round(speedMs * 3.6 * 10) / 10;

                let sessionTime: string | null = null;
                if (workSession?.session) {
                  try {
                    const d = new Date(workSession.session);
                    sessionTime = d.toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  } catch {
                    sessionTime = null;
                  }
                }

                return (
                  <div className="border-t pt-3 mt-1 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          <RoleIcon role={selUser.role} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold leading-tight">
                            {selUser.first_name} {selUser.last_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {roleLabel(selUser.role)}
                          </div>
                        </div>
                      </div>
                      <button
                        className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                        onClick={() => {
                          selectedRef.current = null;
                          setSelected(null);
                          setWorkSession(null);
                          setDistanceKm(null);
                        }}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                        <Gauge className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <div className="text-[11px] text-muted-foreground mb-0.5">{t("speed")}</div>
                        <div className="text-sm font-bold leading-tight">
                          {speedKmh > 0 ? speedKmh : "0"}
                          <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                            {t("kmh")}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                        <Clock className="h-4 w-4 mx-auto mb-1 text-green-500" />
                        <div className="text-[11px] text-muted-foreground mb-0.5">
                          {t("workStartTime")}
                        </div>
                        <div className="text-sm font-bold leading-tight">
                          {sessionTime ?? (
                            <span className="text-muted-foreground text-xs font-normal">—</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                        <RouteIcon className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                        <div className="text-[11px] text-muted-foreground mb-0.5">
                          {t("distanceTraveled")}
                        </div>
                        <div className="text-sm font-bold leading-tight">
                          {distanceKm !== null ? (
                            <>
                              {distanceKm}
                              <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                                {t("km")}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs font-normal">...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
