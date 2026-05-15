import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { a as useSettings, u as useAuth, A as API, P as PageHeader, C as Card, o as CardHeader, p as CardTitle, g as CardContent, I as Input } from "./router-CTVAwSR8.js";
import { MapPin, User, Users, Truck, Store, Layers, Plus, Minus, Crosshair, Minimize2, Maximize2, Search, X, Gauge, Clock, Route, ChevronRight, ChevronLeft, ShoppingCart, Camera, CameraOff, Wallet } from "lucide-react";
import L from "leaflet";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
const CACHE_NAME = "osm-tiles-v1";
const TILE_CACHE_MAX = 3e3;
async function getCache() {
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}
const CachedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = document.createElement("img");
    tile.crossOrigin = "anonymous";
    tile.alt = "";
    tile.referrerPolicy = "no-referrer";
    const url = this.getTileUrl(coords);
    let finished = false;
    const finish = (err) => {
      if (finished) return;
      finished = true;
      done(err, tile);
    };
    const setTileSrc = (src, objectUrlToRevoke) => {
      tile.onload = () => {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        finish(null);
      };
      tile.onerror = () => {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        finish(new Error("Tile load failed"));
      };
      tile.src = src;
    };
    (async () => {
      const cache = await getCache();
      if (cache) {
        try {
          const cached = await cache.match(url);
          if (cached) {
            const blob = await cached.blob();
            const objectUrl = URL.createObjectURL(blob);
            setTileSrc(objectUrl, objectUrl);
            return;
          }
        } catch {
        }
      }
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        if (cache) {
          try {
            await cache.put(url, new Response(blob));
            const keys = await cache.keys();
            if (keys.length > TILE_CACHE_MAX) {
              await cache.delete(keys[0]);
            }
          } catch {
          }
        }
        const objectUrl = URL.createObjectURL(blob);
        setTileSrc(objectUrl, objectUrl);
      } catch {
        setTileSrc(url);
      }
    })();
    return tile;
  }
});
function cachedTileLayer(urlTemplate, options) {
  return new CachedTileLayer(urlTemplate, options);
}
function getProxiedImageUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    const path = `${parsed.pathname}${parsed.search}`;
    return `/proxy-1c?target=${encodeURIComponent(parsed.origin)}&path=${encodeURIComponent(path)}`;
  } catch {
    return rawUrl;
  }
}
function formatServerDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const ROLE_COLORS = {
  SUPERVISOR: "#8b5cf6",
  AGENT: "#22c55e",
  DELIVERER: "#f59e0b"
};
const ROLE_ICONS = {
  SUPERVISOR: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  AGENT: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  DELIVERER: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>'
};
const MAP_STYLES = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 18
  },
  hybrid: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  },
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17
  }
};
const STYLE_LABELS = {
  standard: "Standart",
  dark: "Tungi",
  satellite: "Sputnik",
  hybrid: "Gibrid",
  topo: "Topografik"
};
const pulseIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.3;animation:_locPulse 2s ease-out infinite;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});
function createUserIcon(firstName, lastName, role, isOnline, isSelected, isDarkTheme) {
  const color = ROLE_COLORS[role] || "#3b82f6";
  const icon = ROLE_ICONS[role] || ROLE_ICONS.AGENT;
  const size = isSelected ? 44 : 38;
  const fullName = `${firstName} ${lastName}`;
  `${firstName.charAt(0)}${lastName.charAt(0)}`;
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
    tooltipAnchor: [0, -(size / 2 + 32)]
  });
}
const CLIENT_COLOR_DEFAULT = "#eab308";
const CLIENT_COLOR_VISITED = "#22c55e";
function createClientIcon(name, visit, isDarkTheme, isSelected = false) {
  const size = 19;
  const color = visit > 0 ? CLIENT_COLOR_VISITED : CLIENT_COLOR_DEFAULT;
  const labelBackground = isDarkTheme ? "rgba(15,23,42,0.9)" : "#ffffff";
  const labelTextColor = isDarkTheme ? "#fff" : "#0f172a";
  const labelBorder = isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(15,23,42,0.12)";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      ${isSelected ? `<div style="position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:${size + 10}px;height:${size + 10}px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:_locPulse 1.4s ease-out infinite;"></div>` : ""}
      <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg, ${color}, ${color}dd);border:1.5px solid #fff;box-shadow:${isSelected ? "0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px " + color + "88, 0 4px 12px rgba(0,0,0,0.35)" : "0 2px 6px rgba(0,0,0,0.25)"};display:flex;align-items:center;justify-content:center;${isSelected ? "transform:scale(1.08);" : ""}">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><rect width="18" height="7" x="3" y="7" rx="1"/></svg>
      </div>
      <div style="margin-top:2px;white-space:nowrap;background:${labelBackground};backdrop-filter:blur(8px);color:${labelTextColor};padding:1px 6px;border-radius:6px;font-size:9px;font-weight:600;font-family:system-ui,sans-serif;max-width:90px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:${labelBorder};">
        ${name}
      </div>
    </div>`,
    iconSize: [size + 6, size + 20],
    iconAnchor: [(size + 6) / 2, size / 2 + 2],
    tooltipAnchor: [0, -29.5]
  });
}
function LiveMapPage() {
  const {
    t,
    theme
  } = useSettings();
  const {
    accessToken,
    user
  } = useAuth();
  const [users, setUsers] = useState([]);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const markersRef = useRef(/* @__PURE__ */ new Map());
  const selectedRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [clientInfoLoading, setClientInfoLoading] = useState(false);
  const [clientVisitData, setClientVisitData] = useState(null);
  const [clientVisitDataLoading, setClientVisitDataLoading] = useState(false);
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  const [clientVisitDetailOpen, setClientVisitDetailOpen] = useState(false);
  const [clientVisitDetailType, setClientVisitDetailType] = useState("orders");
  const [clientImageIndex, setClientImageIndex] = useState(0);
  const [locating, setLocating] = useState(false);
  const [workSession, setWorkSession] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const userMarkerRef = useRef(null);
  const userAccuracyRef = useRef(null);
  const currentLocationRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("standard");
  const [styleOpen, setStyleOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatedIds, setUpdatedIds] = useState(/* @__PURE__ */ new Set());
  const historyLayerRef = useRef(null);
  const historyPolylineRef = useRef(null);
  const clientMarkersRef = useRef(/* @__PURE__ */ new Map());
  const [clients, setClients] = useState([]);
  const [showClients, setShowClients] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapContainerKey, setMapContainerKey] = useState(0);
  const pendingViewRef = useRef(null);
  const initialLocationDoneRef = useRef(false);
  const fullscreenControlsRight = "calc(320px + 1.25rem)";
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [navSearchTarget, setNavSearchTarget] = useState("user");
  const [liveMapSuggestion, setLiveMapSuggestion] = useState("");
  const suppressedSuggestionQueryRef = useRef(null);
  const normalizedNavSearch = navSearchQuery.trim().toLowerCase();
  const roleFilteredUsers = roleFilter === "ALL" ? users : users.filter((u) => u.role === roleFilter);
  const userSearchMatches = navSearchTarget === "user" && normalizedNavSearch ? roleFilteredUsers.filter((u) => `${u.first_name} ${u.last_name}`.toLowerCase().includes(normalizedNavSearch)) : [];
  const clientSearchMatches = navSearchTarget === "client" && normalizedNavSearch ? clients.filter((c) => c.name.toLowerCase().includes(normalizedNavSearch)) : [];
  const prioritizedUsers = userSearchMatches.length > 0 ? [...roleFilteredUsers].sort((a, b) => {
    const aMatched = `${a.first_name} ${a.last_name}`.toLowerCase().includes(normalizedNavSearch);
    const bMatched = `${b.first_name} ${b.last_name}`.toLowerCase().includes(normalizedNavSearch);
    if (aMatched === bMatched) return 0;
    return aMatched ? -1 : 1;
  }) : roleFilteredUsers;
  const activeListTarget = navSearchTarget;
  const shouldShowClientList = activeListTarget === "client";
  const prioritizedClients = activeListTarget === "client" && normalizedNavSearch ? [...clients].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aExact = aName === normalizedNavSearch;
    const bExact = bName === normalizedNavSearch;
    if (aExact !== bExact) return aExact ? -1 : 1;
    const aStarts = aName.startsWith(normalizedNavSearch);
    const bStarts = bName.startsWith(normalizedNavSearch);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    const aIncludes = aName.includes(normalizedNavSearch);
    const bIncludes = bName.includes(normalizedNavSearch);
    if (aIncludes !== bIncludes) return aIncludes ? -1 : 1;
    return aName.localeCompare(bName);
  }) : clients;
  const refreshMapSize = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize({
      animate: false
    });
    tileLayerRef.current?.redraw();
    labelLayerRef.current?.redraw();
  }, []);
  const renderCurrentLocation = useCallback((latitude, longitude, accuracy) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userAccuracyRef.current) userAccuracyRef.current.remove();
    if (userMarkerRef.current) userMarkerRef.current.remove();
    userAccuracyRef.current = L.circle([latitude, longitude], {
      radius: accuracy,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      weight: 1.5
    }).addTo(map);
    userMarkerRef.current = L.marker([latitude, longitude], {
      icon: pulseIcon,
      zIndexOffset: 1e3
    }).addTo(map);
  }, []);
  useEffect(() => {
    setMapStyle((prev) => prev === "standard" || prev === "dark" ? theme === "dark" ? "dark" : "standard" : prev);
  }, [theme]);
  const applyTileLayer = useCallback((styleKey) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    if (labelLayerRef.current) {
      labelLayerRef.current.remove();
      labelLayerRef.current = null;
    }
    const cfg = MAP_STYLES[styleKey];
    const layerFactory = isFullscreen ? L.tileLayer : cachedTileLayer;
    const tileOptions = {
      attribution: cfg.attr,
      maxZoom: cfg.maxZoom
    };
    if (cfg.subdomains) {
      tileOptions.subdomains = cfg.subdomains;
    }
    const tile = layerFactory(cfg.url, tileOptions).addTo(map);
    tileLayerRef.current = tile;
    if (styleKey === "hybrid") {
      labelLayerRef.current = layerFactory("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: ""
      }).addTo(map);
    }
  }, [isFullscreen]);
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (el._leaflet_id) {
      delete el._leaflet_id;
    }
    const map = L.map(el, {
      center: [41, 68],
      zoom: 6,
      minZoom: 3,
      zoomControl: false,
      zoomAnimation: true,
      zoomSnap: 0.5,
      wheelPxPerZoomLevel: 120,
      inertia: true,
      inertiaDeceleration: 3400,
      worldCopyJump: true,
      fadeAnimation: true
    });
    mapInstanceRef.current = map;
    markersRef.current.clear();
    clientMarkersRef.current.clear();
    if (pendingViewRef.current) {
      map.setView(pendingViewRef.current.center, pendingViewRef.current.zoom, {
        animate: false
      });
      pendingViewRef.current = null;
    }
    applyTileLayer(mapStyle);
    if (currentLocationRef.current) {
      const {
        latitude,
        longitude,
        accuracy
      } = currentLocationRef.current;
      renderCurrentLocation(latitude, longitude, accuracy);
    }
    return () => {
      markersRef.current.clear();
      clientMarkersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapContainerKey, applyTileLayer, mapStyle, renderCurrentLocation]);
  const locateMe = useCallback((timeout = 1e4, maximumAge = 0) => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const {
        latitude,
        longitude,
        accuracy
      } = pos.coords;
      const map = mapInstanceRef.current;
      if (!map) {
        setLocating(false);
        return;
      }
      currentLocationRef.current = {
        latitude,
        longitude,
        accuracy
      };
      renderCurrentLocation(latitude, longitude, accuracy);
      map.flyTo([latitude, longitude], 15, {
        animate: true,
        duration: 1.2
      });
      setLocating(false);
    }, () => setLocating(false), {
      enableHighAccuracy: true,
      timeout,
      maximumAge
    });
  }, [locating, renderCurrentLocation]);
  useEffect(() => {
    if (initialLocationDoneRef.current) return;
    if (!mapInstanceRef.current || !navigator.geolocation) return;
    const timer = window.setTimeout(() => {
      if (initialLocationDoneRef.current) return;
      if (!mapInstanceRef.current || !navigator.geolocation) return;
      initialLocationDoneRef.current = true;
      locateMe(15e3, 3e4);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [mapContainerKey, locateMe]);
  useEffect(() => {
    applyTileLayer(mapStyle);
  }, [mapStyle, applyTileLayer]);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const filteredIds = new Set(roleFilteredUsers.map((u) => u.id));
    users.forEach((u) => {
      const {
        latitude,
        longitude
      } = u.last_location;
      if (latitude === 0 && longitude === 0) return;
      if (!filteredIds.has(u.id)) {
        const existing2 = markersRef.current.get(u.id);
        if (existing2) {
          existing2.remove();
          markersRef.current.delete(u.id);
        }
        return;
      }
      const isOnline = u.status === "online";
      const isSel = selectedRef.current === u.id;
      const icon = createUserIcon(u.first_name, u.last_name, u.role, isOnline, isSel, theme === "dark");
      const existing = markersRef.current.get(u.id);
      if (existing) {
        existing.setLatLng([latitude, longitude]);
        existing.setIcon(icon);
        existing.setTooltipContent(`${u.first_name} ${u.last_name}`);
      } else {
        const marker = L.marker([latitude, longitude], {
          icon,
          zIndexOffset: isSel ? 1e3 : isOnline ? 500 : 0
        }).addTo(map);
        marker.bindTooltip(`<div style="font-weight:600;font-size:13px;">${u.first_name} ${u.last_name}</div><div style="font-size:11px;opacity:0.7;">${roleLabel(u.role)}</div>`, {
          permanent: false,
          direction: "top",
          offset: [0, 0],
          className: ""
        });
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
    const existingIds = /* @__PURE__ */ new Set();
    clients.forEach((c) => {
      if (c.latitude === 0 && c.longitude === 0) return;
      existingIds.add(c.id);
      const isClientSelected = selectedClient === c.id;
      const icon = createClientIcon(c.name, c.visit, theme === "dark", isClientSelected);
      const existing = clientMarkersRef.current.get(c.id);
      if (existing) {
        existing.setLatLng([c.latitude, c.longitude]);
        existing.setIcon(icon);
        existing.setZIndexOffset(isClientSelected ? 2200 : -100);
        existing.setTooltipContent(`<div style="font-weight:600;font-size:13px;">${c.name}</div><div style="font-size:11px;opacity:0.7;">${c.agent ? "Agent: " + c.agent : ""}</div>${c.comment ? `<div style="font-size:11px;opacity:0.7;">${c.comment}</div>` : ""}`);
      } else {
        const marker = L.marker([c.latitude, c.longitude], {
          icon,
          zIndexOffset: isClientSelected ? 2200 : -100
        }).addTo(map);
        marker.bindTooltip(`<div style="font-weight:600;font-size:13px;">${c.name}</div><div style="font-size:11px;opacity:0.7;">${c.agent ? "Agent: " + c.agent : ""}</div>${c.comment ? `<div style="font-size:11px;opacity:0.7;">${c.comment}</div>` : ""}`, {
          permanent: false,
          direction: "top",
          offset: [0, 0],
          className: ""
        });
        marker.on("click", () => {
          selectedRef.current = null;
          setSelected(null);
          setWorkSession(null);
          setDistanceKm(null);
          setSelectedClient((prev) => prev === c.id ? null : c.id);
          setClientInfoOpen(false);
          setClientVisitDetailOpen(false);
          setNavSearchTarget("client");
        });
        clientMarkersRef.current.set(c.id, marker);
      }
    });
    for (const [id, marker] of clientMarkersRef.current) {
      if (!existingIds.has(id)) {
        marker.remove();
        clientMarkersRef.current.delete(id);
      }
    }
  }, [clients, showClients, mapContainerKey, theme, selectedClient]);
  useEffect(() => {
    const onNavSearchChange = (event) => {
      const customEvent = event;
      setNavSearchQuery(customEvent.detail?.query ?? "");
      setNavSearchTarget(customEvent.detail?.target ?? "user");
    };
    window.addEventListener("live-map-search-change", onNavSearchChange);
    return () => window.removeEventListener("live-map-search-change", onNavSearchChange);
  }, []);
  useEffect(() => {
    const onSuggestion = (event) => {
      const customEvent = event;
      setLiveMapSuggestion(customEvent.detail?.suggestion ?? "");
    };
    window.addEventListener("live-map-search-suggestion", onSuggestion);
    return () => window.removeEventListener("live-map-search-suggestion", onSuggestion);
  }, []);
  useEffect(() => {
    if (suppressedSuggestionQueryRef.current && suppressedSuggestionQueryRef.current !== normalizedNavSearch) {
      suppressedSuggestionQueryRef.current = null;
    }
  }, [normalizedNavSearch]);
  useEffect(() => {
    const hasQuery = normalizedNavSearch.length > 0;
    const suggestionSuppressedForCurrentQuery = hasQuery && suppressedSuggestionQueryRef.current === normalizedNavSearch;
    const suggestion = hasQuery ? suggestionSuppressedForCurrentQuery ? "" : navSearchTarget === "user" ? userSearchMatches[0] ? `${userSearchMatches[0].first_name} ${userSearchMatches[0].last_name}` : "" : clientSearchMatches[0]?.name ?? "" : "";
    window.dispatchEvent(new CustomEvent("live-map-search-suggestion", {
      detail: {
        suggestion
      }
    }));
  }, [normalizedNavSearch, navSearchTarget, userSearchMatches, clientSearchMatches]);
  useEffect(() => {
    if (navSearchTarget !== "client" || !normalizedNavSearch) return;
    const targetClient = clientSearchMatches[0];
    if (!targetClient) return;
    if (targetClient.latitude === 0 && targetClient.longitude === 0) return;
    mapInstanceRef.current?.flyTo([targetClient.latitude, targetClient.longitude], 15, {
      animate: true,
      duration: 0.8
    });
  }, [navSearchTarget, normalizedNavSearch, clientSearchMatches]);
  useEffect(() => {
    if (navSearchTarget !== "user" || !normalizedNavSearch) return;
    const targetUser = userSearchMatches[0];
    if (!targetUser) return;
    if (targetUser.last_location.latitude === 0 && targetUser.last_location.longitude === 0) return;
    mapInstanceRef.current?.flyTo([targetUser.last_location.latitude, targetUser.last_location.longitude], 15, {
      animate: true,
      duration: 0.8
    });
  }, [navSearchTarget, normalizedNavSearch, userSearchMatches]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("live-map-search-change", {
      detail: {
        query: navSearchQuery,
        target: navSearchTarget
      }
    }));
  }, [navSearchQuery, navSearchTarget]);
  useEffect(() => {
    const onSelectUserFromSearch = (event) => {
      const customEvent = event;
      const fullName = customEvent.detail?.fullName?.trim().toLowerCase();
      if (!fullName) return;
      const matchedUser = users.find((u) => `${u.first_name} ${u.last_name}`.trim().toLowerCase() === fullName);
      if (!matchedUser) return;
      suppressedSuggestionQueryRef.current = fullName;
      setLiveMapSuggestion("");
      selectedRef.current = matchedUser.id;
      setSelected(matchedUser.id);
      setSelectedClient(null);
      setClientInfoOpen(false);
    };
    window.addEventListener("live-map-search-select-user", onSelectUserFromSearch);
    return () => window.removeEventListener("live-map-search-select-user", onSelectUserFromSearch);
  }, [users]);
  useEffect(() => {
    const onSelectClientFromSearch = (event) => {
      const customEvent = event;
      const name = customEvent.detail?.name?.trim().toLowerCase();
      if (!name) return;
      const matchedClient = clients.find((c) => c.name.trim().toLowerCase() === name);
      if (!matchedClient) return;
      if (matchedClient.latitude === 0 && matchedClient.longitude === 0) return;
      suppressedSuggestionQueryRef.current = name;
      setLiveMapSuggestion("");
      selectedRef.current = null;
      setSelected(null);
      setWorkSession(null);
      setDistanceKm(null);
      setSelectedClient(matchedClient.id);
      setClientInfoOpen(false);
      setClientVisitDetailOpen(false);
      mapInstanceRef.current?.flyTo([matchedClient.latitude, matchedClient.longitude], 15, {
        animate: true,
        duration: 0.8
      });
    };
    window.addEventListener("live-map-search-select-client", onSelectClientFromSearch);
    return () => window.removeEventListener("live-map-search-select-client", onSelectClientFromSearch);
  }, [clients]);
  useEffect(() => {
    if (!selectedClient || !user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setClientInfo(null);
      setClientInfoLoading(false);
      setClientVisitData(null);
      setClientVisitDataLoading(false);
      return;
    }
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    setClientInfoLoading(true);
    fetch(API.clientInfo(user.company_rel.base_url, selectedClient), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }).then((data) => {
      const normalizedImages = Array.isArray(data.img) ? data.img.map((item) => {
        const sourceUrl = (item.URL || item.url || "").trim();
        if (!sourceUrl) return null;
        return {
          URL: sourceUrl,
          proxyURL: getProxiedImageUrl(sourceUrl),
          alt: item.alt
        };
      }).filter(Boolean) : [];
      setClientInfo({
        ...data,
        img: normalizedImages
      });
    }).catch(() => {
      setClientInfo(null);
    }).finally(() => {
      setClientInfoLoading(false);
    });
    setClientVisitDataLoading(true);
    fetch(API.clientVisitData(user.company_rel.base_url, selectedClient), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }).then((data) => {
      const normalizedPhotoReports = Array.isArray(data?.photo_reports) ? data.photo_reports.map((item) => ({
        ...item,
        url: item.url || "",
        proxyURL: item.url ? getProxiedImageUrl(item.url) : ""
      })) : [];
      const normalizedOrders = Array.isArray(data?.orders) ? data.orders.map((order) => ({
        ...order,
        products: Array.isArray(order.products) ? order.products.map((product) => ({
          ...product,
          URL: product.URL || product.url || product.image || product.image_url || "",
          proxyURL: product.URL || product.url || product.image || product.image_url ? getProxiedImageUrl(product.URL || product.url || product.image || product.image_url || "") : ""
        })) : []
      })) : [];
      const normalizedPayments = Array.isArray(data?.payments) ? data.payments.map((item) => ({
        ...item,
        click_proto_url: item.click_proto_url ? getProxiedImageUrl(item.click_proto_url) : item.click_proto_url
      })) : [];
      setClientVisitData({
        ...data,
        orders: normalizedOrders,
        photo_reports: normalizedPhotoReports,
        payments: normalizedPayments
      });
    }).catch(() => {
      setClientVisitData(null);
    }).finally(() => {
      setClientVisitDataLoading(false);
    });
  }, [selectedClient, user]);
  useEffect(() => {
    setClientImageIndex(0);
  }, [selectedClient, clientInfo?.img?.length]);
  useEffect(() => {
    if (selectedRef.current) {
      const marker = markersRef.current.get(selectedRef.current);
      if (marker) {
        mapInstanceRef.current?.flyTo(marker.getLatLng(), 13, {
          animate: true,
          duration: 0.8
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
    const user2 = users.find((u) => u.id === userId);
    const color = user2 ? ROLE_COLORS[user2.role] || "#3b82f6" : "#3b82f6";
    fetch(API.userHistory(userId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }).then(async (points) => {
      if (!mapInstanceRef.current || selectedRef.current !== userId) return;
      const filtered = points.filter((p) => p.latitude !== 0 || p.longitude !== 0);
      if (filtered.length < 2) return;
      const map2 = mapInstanceRef.current;
      const group = L.layerGroup().addTo(map2);
      historyLayerRef.current = group;
      filtered.forEach((p, i) => {
        const isLast = i === filtered.length - 1;
        L.circleMarker([p.latitude, p.longitude], {
          radius: isLast ? 6 : 4,
          color: isLast ? "#6d28d9" : color,
          fillColor: isLast ? "#6d28d9" : color,
          fillOpacity: isLast ? 1 : 0.7,
          weight: 2
        }).addTo(group);
      });
      const deduped = [filtered[0]];
      for (let i = 1; i < filtered.length; i++) {
        const prev = deduped[deduped.length - 1];
        const dLat = filtered[i].latitude - prev.latitude;
        const dLng = filtered[i].longitude - prev.longitude;
        if (dLat * dLat + dLng * dLng > 1e-6) {
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
          lineJoin: "round"
        }).addTo(group);
        historyPolylineRef.current = pl;
        return;
      }
      const coordsStr = deduped.map((p) => `${p.longitude},${p.latitude}`).join(";");
      let routeCoords = null;
      try {
        const matchRes = await fetch(`https://router.project-osrm.org/match/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          if (selectedRef.current !== userId) return;
          if (matchData.matchings && matchData.matchings.length > 0) {
            routeCoords = matchData.matchings[0].geometry.coordinates.map((c) => L.latLng(c[1], c[0]));
          }
        }
      } catch {
      }
      if (!routeCoords && selectedRef.current === userId) {
        try {
          const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&alternatives=false`);
          if (routeRes.ok) {
            const routeData = await routeRes.json();
            if (selectedRef.current !== userId) return;
            if (routeData.routes && routeData.routes.length > 0) {
              routeCoords = routeData.routes[0].geometry.coordinates.map((c) => L.latLng(c[1], c[0]));
            }
          }
        } catch {
        }
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
        lineJoin: "round"
      }).addTo(group);
      historyPolylineRef.current = polyline;
    }).catch(() => {
    });
  }, [selected, accessToken, users, mapContainerKey]);
  useEffect(() => {
    if (!accessToken || selected === null) {
      setWorkSession(null);
      return;
    }
    const userId = selected;
    const selUser = users.find((u) => u.id === userId);
    fetch(API.workingSession(userId, selUser?.role), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      return res.json();
    }).then((data) => {
      if (selectedRef.current !== userId) return;
      const session = Array.isArray(data) ? data[0] : data;
      if (session && typeof session === "object" && "session" in session) {
        setWorkSession(session);
      } else {
        setWorkSession(null);
      }
    }).catch(() => {
      if (selectedRef.current === userId) setWorkSession(null);
    });
  }, [selected, accessToken, users]);
  useEffect(() => {
    if (selected === null || !accessToken) {
      setDistanceKm(null);
      return;
    }
    const userId = selected;
    fetch(API.userHistory(userId), {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }).then(async (points) => {
      if (selectedRef.current !== userId) return;
      const filtered = points.filter((p) => p.latitude !== 0 || p.longitude !== 0);
      if (filtered.length < 2) {
        setDistanceKm(0);
        return;
      }
      const deduped = [filtered[0]];
      for (let i = 1; i < filtered.length; i++) {
        const prev = deduped[deduped.length - 1];
        const dLat = filtered[i].latitude - prev.latitude;
        const dLng = filtered[i].longitude - prev.longitude;
        if (dLat * dLat + dLng * dLng > 1e-6) {
          deduped.push(filtered[i]);
        }
      }
      if (deduped.length < 2) {
        setDistanceKm(0);
        return;
      }
      const coordsStr = deduped.map((p) => `${p.longitude},${p.latitude}`).join(";");
      try {
        const matchRes = await fetch(`https://router.project-osrm.org/match/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          if (selectedRef.current !== userId) return;
          if (matchData.matchings && matchData.matchings.length > 0) {
            const dist = matchData.matchings.reduce((sum, m) => sum + m.distance, 0);
            setDistanceKm(Math.round(dist) / 1e3);
            return;
          }
        }
      } catch {
      }
      if (selectedRef.current !== userId) return;
      try {
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&alternatives=false`);
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          if (selectedRef.current !== userId) return;
          if (routeData.routes && routeData.routes.length > 0) {
            const dist = routeData.routes[0].distance;
            setDistanceKm(Math.round(dist) / 1e3);
            return;
          }
        }
      } catch {
      }
      if (selectedRef.current === userId) setDistanceKm(null);
    }).catch(() => {
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
        const data = JSON.parse(event.data);
        if (data.action === "all_admvs" && data.users) {
          setUsers(data.users.map((u) => ({
            ...u,
            speed: 0
          })));
        } else if (data.action === "status_update") {
          setUsers((prev) => prev.map((u) => u.id === data.user_id ? {
            ...u,
            status: data.status
          } : u));
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
                  timestamp: data.timestamp
                }
              };
              return updated;
            }
            return [...prev, {
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
                timestamp: data.timestamp
              }
            }];
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
      setUpdatedIds(/* @__PURE__ */ new Set());
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
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }).then((data) => {
      setClients(data.results ?? []);
    }).catch(() => {
    });
  }, [user]);
  useEffect(() => {
    const handler = (e) => {
      if (styleOpen && !e.target.closest("[data-style-picker]")) {
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
    const reflowAndRestore = () => {
      refreshMapSize();
      applyTileLayer(mapStyle);
      map.setView(center, zoom, {
        animate: false
      });
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
    const handler = (e) => {
      if (e.key === "Escape") {
        const map = mapInstanceRef.current;
        if (map) {
          pendingViewRef.current = {
            center: map.getCenter(),
            zoom: map.getZoom()
          };
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
      pendingViewRef.current = {
        center: map.getCenter(),
        zoom: map.getZoom()
      };
    }
    setIsFullscreen((v) => !v);
    setMapContainerKey((k) => k + 1);
  }, []);
  const roleLabel = (role) => {
    switch (role) {
      case "SUPERVISOR":
        return t("supervisor");
      case "DELIVERER":
        return t("deliverer");
      case "AGENT":
        return "Agent";
    }
  };
  const RoleIcon = ({
    role
  }) => {
    switch (role) {
      case "SUPERVISOR":
        return /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-white" });
      case "AGENT":
        return /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-white" });
      case "DELIVERER":
        return /* @__PURE__ */ jsx(Truck, { className: "h-4 w-4 text-white" });
      default:
        return /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-white" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "fixed inset-0 z-[9999]" : "", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    !isFullscreen && /* @__PURE__ */ jsx(PageHeader, { title: t("liveMap"), description: t("liveMapDesc") }),
    /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "absolute top-3 left-3 z-[1001] bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-2.5 flex items-center gap-3 flex-wrap" : "flex items-center gap-3 mb-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full ${wsStatus === "connected" ? "bg-green-500 animate-pulse" : wsStatus === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}` }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: wsStatus === "connected" ? t("online") : wsStatus === "connecting" ? "..." : t("offline") })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: [{
        key: "ALL",
        label: t("allRoles"),
        Icon: MapPin,
        color: "#6b7280"
      }, {
        key: "AGENT",
        label: t("agents"),
        Icon: User,
        color: ROLE_COLORS.AGENT
      }, {
        key: "SUPERVISOR",
        label: t("supervisors"),
        Icon: Users,
        color: ROLE_COLORS.SUPERVISOR
      }, {
        key: "DELIVERER",
        label: t("deliverers"),
        Icon: Truck,
        color: ROLE_COLORS.DELIVERER
      }].map(({
        key,
        label,
        Icon,
        color
      }) => {
        const count = key === "ALL" ? users.length : users.filter((u) => u.role === key).length;
        const active = roleFilter === key;
        return /* @__PURE__ */ jsxs("button", { onClick: () => setRoleFilter(key), className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${active ? "text-white shadow-sm" : "bg-card text-muted-foreground hover:text-foreground"}`, style: active ? {
          backgroundColor: color,
          borderColor: color
        } : void 0, children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { children: label }),
          /* @__PURE__ */ jsx("span", { className: `ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"}`, children: count })
        ] }, key);
      }) }),
      clients.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "h-4 w-px bg-border" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowClients((v) => !v), className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border ${showClients ? "text-white shadow-sm" : "bg-card text-muted-foreground hover:text-foreground"}`, style: showClients ? {
          backgroundColor: CLIENT_COLOR_DEFAULT,
          borderColor: CLIENT_COLOR_DEFAULT
        } : void 0, children: [
          /* @__PURE__ */ jsx(Store, { className: "h-3.5 w-3.5" }),
          /* @__PURE__ */ jsx("span", { children: t("clientsOnMap") }),
          /* @__PURE__ */ jsx("span", { className: `ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${showClients ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"}`, children: clients.length })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "h-full w-full relative" : "grid grid-cols-1 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: isFullscreen ? "absolute inset-0 z-0 rounded-none border-0 shadow-none overflow-hidden" : "lg:col-span-3 overflow-hidden relative z-0 h-[70vh] min-h-[520px] max-h-[760px]", children: /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "absolute inset-0 z-0" : "relative z-0 h-full", children: [
        /* @__PURE__ */ jsx("div", { ref: mapRef, className: isFullscreen ? "absolute inset-0" : "h-full w-full", style: !isFullscreen ? {
          position: "relative",
          zIndex: 0
        } : void 0 }, mapContainerKey),
        /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "absolute top-4 right-4 z-[1002]" : "absolute top-4 right-4 z-[1000]", "data-style-picker": true, style: isFullscreen ? {
          right: fullscreenControlsRight
        } : void 0, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setStyleOpen((v) => !v), className: `h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90 ${styleOpen ? "bg-accent" : ""}`, children: /* @__PURE__ */ jsx(Layers, { className: "h-5 w-5" }) }),
          styleOpen && /* @__PURE__ */ jsx("div", { className: "absolute top-full right-0 mt-2 w-44 rounded-lg bg-card border shadow-lg overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150", children: Object.keys(MAP_STYLES).map((key) => /* @__PURE__ */ jsxs("button", { onClick: () => {
            setMapStyle(key);
            setStyleOpen(false);
          }, className: `w-full px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${mapStyle === key ? "bg-accent font-medium" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { className: `h-3 w-3 rounded-full border-2 ${mapStyle === key ? "border-primary bg-primary" : "border-muted-foreground/40"}` }),
            STYLE_LABELS[key]
          ] }, key)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: isFullscreen ? "absolute bottom-4 right-4 z-[1002] flex flex-col gap-2" : "absolute bottom-4 right-4 z-[1000] flex flex-col gap-2", style: isFullscreen ? {
          right: fullscreenControlsRight
        } : void 0, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => mapInstanceRef.current?.zoomIn(1, {
            animate: true
          }), className: "h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90", children: /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => mapInstanceRef.current?.zoomOut(1, {
            animate: true
          }), className: "h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90", children: /* @__PURE__ */ jsx(Minus, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => locateMe(), disabled: locating, className: "h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 active:scale-90", children: /* @__PURE__ */ jsx(Crosshair, { className: `h-5 w-5 ${locating ? "animate-spin" : ""}` }) }),
          /* @__PURE__ */ jsx("button", { onClick: toggleFullscreen, className: "h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-accent transition-colors active:scale-90", children: isFullscreen ? /* @__PURE__ */ jsx(Minimize2, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Maximize2, { className: "h-5 w-5" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(Card, { className: isFullscreen ? "absolute top-3 bottom-3 w-[320px] z-[1001] bg-card/95 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden" : "flex flex-col h-[70vh] min-h-[520px] max-h-[760px] relative overflow-hidden", style: isFullscreen ? {
        position: "absolute",
        right: "0.75rem",
        left: "unset",
        marginLeft: "auto"
      } : void 0, children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3 flex flex-row items-center justify-between space-y-0", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: shouldShowClientList ? "Klientlar" : "Hodimlar" }),
          !isFullscreen && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setNavSearchTarget((prev) => prev === "user" ? "client" : "user"), className: "h-7 rounded-md border bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors", children: navSearchTarget === "user" ? "User" : "Client" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 flex-1 flex flex-col min-h-0 p-3", children: [
          isFullscreen && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { placeholder: t("search"), className: "pl-9 pr-20 bg-secondary border-transparent focus-visible:bg-card h-9", value: navSearchQuery, onChange: (e) => setNavSearchQuery(e.target.value) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setNavSearchTarget((prev) => prev === "user" ? "client" : "user"), className: "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 rounded-md border bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors", children: navSearchTarget === "user" ? "User" : "Client" }),
            navSearchQuery.trim().length > 0 && liveMapSuggestion && /* @__PURE__ */ jsx("div", { className: "absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50 overflow-hidden", children: /* @__PURE__ */ jsx("button", { type: "button", className: "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors", onClick: () => {
              setNavSearchQuery(liveMapSuggestion);
              if (navSearchTarget === "user") {
                window.dispatchEvent(new CustomEvent("live-map-search-select-user", {
                  detail: {
                    fullName: liveMapSuggestion
                  }
                }));
              } else {
                window.dispatchEvent(new CustomEvent("live-map-search-select-client", {
                  detail: {
                    name: liveMapSuggestion
                  }
                }));
              }
            }, children: liveMapSuggestion }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `overflow-y-auto space-y-3 ${selected !== null || selectedClient !== null ? "flex-1 min-h-0" : "flex-1"}`, children: shouldShowClientList ? /* @__PURE__ */ jsxs(Fragment, { children: [
            prioritizedClients.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: t("notFound") }),
            prioritizedClients.map((c) => {
              const hasLocation = c.latitude !== 0 || c.longitude !== 0;
              return /* @__PURE__ */ jsxs("button", { className: `flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-1.5 cursor-pointer transition-colors border-2 ${selectedClient === c.id ? "bg-muted/70 border-primary/40" : "border-transparent"}`, onClick: () => {
                if (!hasLocation) return;
                const newId = selectedClient === c.id ? null : c.id;
                selectedRef.current = null;
                setSelected(null);
                setWorkSession(null);
                setDistanceKm(null);
                setSelectedClient(newId);
                setClientInfoOpen(false);
                if (newId === null) return;
                mapInstanceRef.current?.flyTo([c.latitude, c.longitude], 15, {
                  animate: true,
                  duration: 0.8
                });
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white", style: {
                  backgroundColor: c.visit > 0 ? CLIENT_COLOR_VISITED : CLIENT_COLOR_DEFAULT
                }, children: /* @__PURE__ */ jsx(Store, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: c.name }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: c.agent })
                ] })
              ] }, c.id);
            })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            prioritizedUsers.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: wsStatus === "connected" ? "..." : t("offline") }),
            prioritizedUsers.map((u) => {
              const color = ROLE_COLORS[u.role] || "#3b82f6";
              const hasLocation = u.last_location.latitude !== 0 || u.last_location.longitude !== 0;
              const isUpdated = updatedIds.has(u.id);
              return /* @__PURE__ */ jsxs("button", { className: `flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-lg p-1.5 cursor-pointer transition-colors border-2 ${selected === u.id ? "bg-muted/70 border-primary/40" : "border-transparent"} ${isUpdated ? "_agentFlash" : ""}`, onClick: () => {
                if (!hasLocation) return;
                const newId = selectedRef.current === u.id ? null : u.id;
                selectedRef.current = newId;
                setSelected(newId);
                setSelectedClient(null);
                setClientInfoOpen(false);
                if (newId === null) {
                  setWorkSession(null);
                  setDistanceKm(null);
                }
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full flex items-center justify-center shrink-0", style: {
                  backgroundColor: color,
                  opacity: u.status === "online" ? 1 : 0.5
                }, children: /* @__PURE__ */ jsx(RoleIcon, { role: u.role }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium truncate", children: [
                    u.first_name,
                    " ",
                    u.last_name
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: roleLabel(u.role) })
                ] }),
                /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full shrink-0 ${u.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-400"}` })
              ] }, u.id);
            })
          ] }) }),
          selected !== null && selectedClient === null && (() => {
            const selUser = users.find((u) => u.id === selected);
            if (!selUser) return null;
            const color = ROLE_COLORS[selUser.role] || "#3b82f6";
            const speedMs = selUser.speed || 0;
            const speedKmh = Math.round(speedMs * 3.6 * 10) / 10;
            let sessionTime = null;
            if (workSession?.session) {
              try {
                const d = new Date(workSession.session);
                sessionTime = d.toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit"
                });
              } catch {
                sessionTime = null;
              }
            }
            return /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-2.5 rounded-xl border bg-card/80 p-2.5 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-7 w-7 rounded-full flex items-center justify-center shrink-0", style: {
                    backgroundColor: color
                  }, children: /* @__PURE__ */ jsx(RoleIcon, { role: selUser.role }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-sm font-semibold leading-tight", children: [
                      selUser.first_name,
                      " ",
                      selUser.last_name
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: roleLabel(selUser.role) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("button", { className: "h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors", onClick: () => {
                  selectedRef.current = null;
                  setSelected(null);
                  setWorkSession(null);
                  setDistanceKm(null);
                }, children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5 text-center", children: [
                  /* @__PURE__ */ jsx(Gauge, { className: "h-4 w-4 mx-auto mb-1 text-blue-500" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: t("speed") }),
                  /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold leading-tight", children: [
                    speedKmh > 0 ? speedKmh : "0",
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-normal text-muted-foreground ml-0.5", children: t("kmh") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5 text-center", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 mx-auto mb-1 text-green-500" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: t("workStartTime") }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold leading-tight", children: sessionTime ?? /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-normal", children: "—" }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5 text-center", children: [
                  /* @__PURE__ */ jsx(Route, { className: "h-4 w-4 mx-auto mb-1 text-amber-500" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: t("distanceTraveled") }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold leading-tight", children: distanceKm !== null ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    (() => {
                      const roundedDistanceKm = Math.round(distanceKm * 10) / 10;
                      return Number.isInteger(roundedDistanceKm) ? `${roundedDistanceKm}` : roundedDistanceKm.toFixed(1);
                    })(),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-normal text-muted-foreground ml-0.5", children: t("km") })
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-normal", children: "..." }) })
                ] })
              ] })
            ] });
          })(),
          selectedClient !== null && (() => {
            const selClient = clients.find((c) => c.id === selectedClient);
            if (!selClient) return null;
            const selectedClientComment = selClient.comment?.trim() || clientInfo?.commentary?.trim() || "";
            return /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-2.5 rounded-xl border bg-card/80 p-2.5 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", className: "h-7 w-7 rounded-full flex items-center justify-center shrink-0", style: {
                    backgroundColor: selClient.visit > 0 ? CLIENT_COLOR_VISITED : CLIENT_COLOR_DEFAULT
                  }, onClick: () => setClientInfoOpen((v) => !v), children: /* @__PURE__ */ jsx(Store, { className: "h-4 w-4 text-white" }) }),
                  /* @__PURE__ */ jsxs("button", { type: "button", className: "text-left rounded-md px-1 py-0.5 hover:bg-muted/60 transition-colors cursor-pointer", onClick: () => setClientInfoOpen((v) => !v), children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold leading-tight", children: selClient.name }),
                    /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground inline-flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx("span", { children: t("clientOpenProfile") }),
                      /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("button", { className: "h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors", onClick: () => {
                  setSelectedClient(null);
                  setClientInfoOpen(false);
                }, children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5 text-center", children: [
                  /* @__PURE__ */ jsx(User, { className: "h-4 w-4 mx-auto mb-1 text-blue-500" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: t("agent") }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold leading-tight truncate", children: selClient.agent || "—" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5 text-center", children: [
                  /* @__PURE__ */ jsx(Store, { className: "h-4 w-4 mx-auto mb-1 text-green-500" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-0.5", children: t("visit") }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold leading-tight", children: selClient.visit })
                ] })
              ] }),
              selectedClientComment && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-muted/50 p-2.5", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mb-1", children: t("comment") }),
                /* @__PURE__ */ jsx("div", { className: "text-xs leading-relaxed", children: selectedClientComment })
              ] })
            ] });
          })()
        ] }),
        selectedClient !== null && /* @__PURE__ */ jsx("div", { className: `absolute inset-y-0 right-0 z-20 w-full border-l bg-card shadow-2xl transition-transform duration-300 ease-out ${clientInfoOpen ? "translate-x-0" : "translate-x-full"}`, children: /* @__PURE__ */ jsxs("div", { className: "h-full p-3 overflow-y-auto space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setClientInfoOpen(false), className: "h-7 px-2 rounded-md border bg-card text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" }),
              t("back")
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: t("clientProfile") }),
            /* @__PURE__ */ jsx("button", { className: "h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors", onClick: () => setClientInfoOpen(false), children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
          ] }),
          clientInfoLoading ? /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: t("loading") }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            !!clientInfo?.img?.length && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-muted/30 p-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-md bg-card", children: [
                /* @__PURE__ */ jsx("a", { href: clientInfo.img[clientImageIndex]?.URL, target: "_blank", rel: "noreferrer", className: "block", children: /* @__PURE__ */ jsx("img", { src: clientInfo.img[clientImageIndex]?.URL, alt: clientInfo.img[clientImageIndex]?.alt?.trim() || `Rasm ${clientImageIndex + 1}`, loading: "lazy", onError: (e) => {
                  const target = e.currentTarget;
                  const fallback = clientInfo.img?.[clientImageIndex]?.proxyURL;
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  }
                }, className: "h-44 w-full object-cover" }) }),
                clientInfo.img.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("button", { type: "button", className: "absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/45 text-white hover:bg-black/60 flex items-center justify-center transition-colors", onClick: () => setClientImageIndex((prev) => prev === 0 ? clientInfo.img.length - 1 : prev - 1), children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/45 text-white hover:bg-black/60 flex items-center justify-center transition-colors", onClick: () => setClientImageIndex((prev) => prev === clientInfo.img.length - 1 ? 0 : prev + 1), children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: clientInfo.img[clientImageIndex]?.alt?.trim() || `Rasm ${clientImageIndex + 1}` }),
                /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                  clientImageIndex + 1,
                  " / ",
                  clientInfo.img.length
                ] })
              ] }),
              clientInfo.img.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex gap-1.5", children: clientInfo.img.map((item, idx) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setClientImageIndex(idx), className: `h-1.5 rounded-full transition-all ${idx === clientImageIndex ? "w-5 bg-primary" : "w-2.5 bg-muted-foreground/40"}` }, `${item.URL}-dot-${idx}`)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setClientVisitDetailType("orders");
                setClientVisitDetailOpen(true);
              }, className: "rounded-lg border bg-muted/40 p-2.5 text-left hover:bg-muted/60 transition-colors", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(ShoppingCart, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { children: t("orders") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-semibold leading-none", children: clientVisitDataLoading ? "..." : clientVisitData?.orders?.length ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setClientVisitDetailType("photo_reports");
                setClientVisitDetailOpen(true);
              }, className: "rounded-lg border bg-muted/40 p-2.5 text-left hover:bg-muted/60 transition-colors", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Camera, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { children: t("photoReports") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-semibold leading-none", children: clientVisitDataLoading ? "..." : clientVisitData?.photo_reports?.length ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setClientVisitDetailType("photo_rejects");
                setClientVisitDetailOpen(true);
              }, className: "rounded-lg border bg-muted/40 p-2.5 text-left hover:bg-muted/60 transition-colors", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(CameraOff, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { children: t("rejectedPhotos") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-semibold leading-none", children: clientVisitDataLoading ? "..." : clientVisitData?.photo_rejects?.length ?? 0 })
              ] }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => {
                setClientVisitDetailType("payments");
                setClientVisitDetailOpen(true);
              }, className: "rounded-lg border bg-muted/40 p-2.5 text-left hover:bg-muted/60 transition-colors", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Wallet, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { children: t("payments") })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-lg font-semibold leading-none", children: clientVisitDataLoading ? "..." : clientVisitData?.payments?.length ?? 0 })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("filial") }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.filial_name || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("status") }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.status_name || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: "INN" }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.INN || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("category") }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.category || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("contact") }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.contactName || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("phone") }),
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.Phone || "—" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: t("agent") }),
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo?.agent?.agent_name || "—" })
            ] }),
            !!clientInfo?.activities?.length && /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mb-1", children: t("activities") }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: clientInfo.activities.map((a, idx) => /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded bg-card border", children: a.activity_name }, `${a.activity_name}-${idx}`)) })
            ] }),
            clientInfo?.commentary?.trim() && /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-2 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mb-1", children: t("comment") }),
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: clientInfo.commentary })
            ] })
          ] })
        ] }) }),
        selectedClient !== null && /* @__PURE__ */ jsx("div", { className: `absolute inset-y-0 right-0 z-30 w-full border-l bg-card shadow-2xl transition-transform duration-300 ease-out ${clientVisitDetailOpen ? "translate-x-0" : "translate-x-full"}`, children: /* @__PURE__ */ jsxs("div", { className: "h-full p-3 overflow-y-auto space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setClientVisitDetailOpen(false), className: "h-7 px-2 rounded-md border bg-card text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" }),
              "Orqaga"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: clientVisitDetailType === "orders" ? "Buyurtmalar" : clientVisitDetailType === "photo_reports" ? "Foto hisobotlar" : clientVisitDetailType === "photo_rejects" ? "Rad etilgan rasmlar" : "To'lovlar" }),
            /* @__PURE__ */ jsx("button", { className: "h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors", onClick: () => setClientVisitDetailOpen(false), children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 text-muted-foreground" }) })
          ] }),
          clientVisitDataLoading ? /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: t("loading") }) : clientVisitDetailType === "orders" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            (clientVisitData?.orders ?? []).map((order) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                  "#",
                  order.order_id
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: order.order_data })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-xs", children: [
                order.qty,
                " ta · ",
                order.amount,
                " ",
                order.cry
              ] }),
              !!order.products?.length && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1", children: order.products.map((p) => /* @__PURE__ */ jsx("div", { className: "rounded bg-card p-1.5 text-[11px]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                (p.proxyURL || p.URL) && /* @__PURE__ */ jsx("a", { href: p.proxyURL || p.URL || "#", target: "_blank", rel: "noreferrer", className: "block h-12 w-12 shrink-0 overflow-hidden rounded border bg-muted", children: /* @__PURE__ */ jsx("img", { src: p.proxyURL || p.URL || "", alt: p.product_name, className: "h-full w-full object-cover", onError: (e) => {
                  const target = e.currentTarget;
                  if (p.URL && target.src !== p.URL) {
                    target.src = p.URL;
                  }
                } }) }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate", children: p.product_name }),
                  /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
                    p.qty_order,
                    " x ",
                    p.price,
                    " = ",
                    p.sum_order
                  ] })
                ] })
              ] }) }, p.product_id)) })
            ] }, order.order_id)),
            (clientVisitData?.orders?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: t("noData") })
          ] }) : clientVisitDetailType === "photo_reports" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            (clientVisitData?.photo_reports ?? []).map((report, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card/80 shadow-sm overflow-hidden", children: [
              report.url && /* @__PURE__ */ jsx("a", { href: report.url, target: "_blank", rel: "noreferrer", className: "block", children: /* @__PURE__ */ jsx("img", { src: report.url, alt: report.info || `Foto ${idx + 1}`, className: "h-40 w-full object-cover", onError: (e) => {
                const target = e.currentTarget;
                if (report.proxyURL && target.src !== report.proxyURL) {
                  target.src = report.proxyURL;
                }
              } }) }),
              /* @__PURE__ */ jsxs("div", { className: "p-2.5 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: report.info || `${t("photoReport")} #${idx + 1}` }),
                report.date && /* @__PURE__ */ jsx("div", { className: "mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground", children: formatServerDate(report.date) })
              ] }),
              report.url && /* @__PURE__ */ jsx("div", { className: "px-2.5 pb-2.5", children: /* @__PURE__ */ jsx("a", { href: report.url, target: "_blank", rel: "noreferrer", className: "inline-flex h-7 items-center rounded-md border px-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors", children: t("viewFull") }) })
            ] }, `${report.url}-${idx}`)),
            (clientVisitData?.photo_reports?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: t("noData") })
          ] }) : clientVisitDetailType === "photo_rejects" ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            (clientVisitData?.photo_rejects ?? []).map((reject, idx) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-2 text-xs", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: reject.reason || t("reasonNotSpecified") }),
              reject.date && /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mt-0.5", children: formatServerDate(reject.date) }),
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground mt-1", children: reject.comment || t("noComment") })
            ] }, `${reject.reason}-${idx}`)),
            (clientVisitData?.photo_rejects?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: t("noData") })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            (clientVisitData?.payments ?? []).map((payment) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card/80 shadow-sm overflow-hidden", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-2.5 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                    t("payment"),
                    " #",
                    payment.id
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground", children: payment.date })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-3 gap-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-1.5 text-center", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("cash") }),
                    /* @__PURE__ */ jsx("div", { className: "font-semibold leading-tight", children: payment.cash })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-1.5 text-center", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("card") }),
                    /* @__PURE__ */ jsx("div", { className: "font-semibold leading-tight", children: payment.card })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-muted/40 p-1.5 text-center", children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: "Click" }),
                    /* @__PURE__ */ jsx("div", { className: "font-semibold leading-tight", children: payment.click })
                  ] })
                ] })
              ] }),
              payment.Comment && /* @__PURE__ */ jsx("div", { className: "px-2.5 pb-2.5 text-xs text-muted-foreground", children: payment.Comment })
            ] }, payment.id)),
            (clientVisitData?.payments?.length ?? 0) === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground text-center py-4", children: t("noData") })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  LiveMapPage as component
};
