import MapView, { UrlTile, Marker, Circle, Polyline } from 'react-native-maps';

// OSM tile cache path — uses React Native's built-in cache dir
// tileCachePath is platform-specific; Android uses internal cache, iOS uses Library/Caches
const TILE_CACHE_PATH = 'osm_tiles';

// Re-export primitives
export { UrlTile, Marker, Circle, Polyline };

// Pre-configured UrlTile with caching for OpenStreetMap
export const CachedUrlTile = (props: any) => (
  <UrlTile
    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
    tileCachePath={TILE_CACHE_PATH}
    tileCacheMaxAge={604800} // 7 days in seconds
    {...props}
  />
);

export default MapView;
