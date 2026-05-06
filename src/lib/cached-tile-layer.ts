import L from "leaflet";

const CACHE_NAME = "osm-tiles-v1";
const TILE_CACHE_MAX = 3000;

async function getCache(): Promise<Cache | null> {
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

const CachedTileLayer = L.TileLayer.extend({
  createTile(coords: L.Coords, done: (err: Error | null, tile: HTMLElement) => void) {
    const tile = document.createElement("img") as HTMLImageElement;
    tile.crossOrigin = "anonymous";
    tile.alt = "";
    tile.referrerPolicy = "no-referrer";

    const url = this.getTileUrl(coords);
    let finished = false;

    const finish = (err: Error | null) => {
      if (finished) return;
      finished = true;
      done(err, tile);
    };

    const setTileSrc = (src: string, objectUrlToRevoke?: string) => {
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
        } catch {}
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
          } catch {}
        }

        const objectUrl = URL.createObjectURL(blob);
        setTileSrc(objectUrl, objectUrl);
      } catch {
        setTileSrc(url);
      }
    })();

    return tile;
  },
});

export function cachedTileLayer(
  urlTemplate: string,
  options?: L.TileLayerOptions,
): L.TileLayer {
  return new CachedTileLayer(urlTemplate, options);
}
