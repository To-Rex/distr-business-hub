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

    const url = this.getTileUrl(coords);

    (async () => {
      const cache = await getCache();

      if (cache) {
        try {
          const cached = await cache.match(url);
          if (cached) {
            const blob = await cached.blob();
            tile.src = URL.createObjectURL(blob);
            done(null, tile);
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

        tile.src = URL.createObjectURL(blob);
        done(null, tile);
      } catch {
        tile.src = url;
        done(null, tile);
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
