// Initialize the map
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: 0,
  maxZoom: 7
});

// Define map bounds and add the overlay image
const mapBounds = [[0, 0], [1200, 1800]]; // Adjust to your map dimensions
const imageUrl = 'Malosthas_Map.svg'; // Replace with your map image
L.imageOverlay(imageUrl, mapBounds).addTo(map);
map.fitBounds(mapBounds);

// Layer groups for different POI categories
const regionLayer = L.layerGroup();
const cityLayer = L.layerGroup();
const dungeonLayer = L.layerGroup();

// Fetch POIs from the JSON file
fetch('pois.json')
  .then(response => response.json())
  .then(data => {
    data.pois.forEach(poi => {
      console.log('Loading icon:', poi.icon);
      const icon = L.icon({
        iconUrl: poi.icon,
        iconSize: [64, 64],
        iconAnchor: [32, 64]
      });

      // Build the popup content dynamically
      let popupContent = `<strong>${poi.name}</strong><br>${poi.description}`;
      if (poi.link) {
        popupContent += `<br><a href="${poi.link}?zoom=${map.getZoom()}&x=${poi.coordinates[0]}&y=${poi.coordinates[1]}">Learn More</a>`;
      }

      const marker = L.marker(poi.coordinates, { icon })
        .bindPopup(popupContent);

      // Add marker to the appropriate layer based on its type
      if (poi.type === 'region') {
        regionLayer.addLayer(marker);
      } else if (poi.type === 'city') {
        cityLayer.addLayer(marker);
      } else if (poi.type === 'dungeon') {
        dungeonLayer.addLayer(marker);
      }
    });
  })
  .catch(error => console.error('Error loading POI data:', error));
// Add layers to the map
regionLayer.addTo(map);

// Show or hide layers based on zoom level
map.on('zoomend', () => {
  const zoomLevel = map.getZoom();

  // Handle Regions (low zoom levels)
  if (zoomLevel >= 0 && zoomLevel <= 3) {
    if (!map.hasLayer(regionLayer)) map.addLayer(regionLayer);
  } else {
    if (map.hasLayer(regionLayer)) map.removeLayer(regionLayer);
  }

  // Handle Cities (medium zoom levels)
  if (zoomLevel >= 4 && zoomLevel <= 6) {
    if (!map.hasLayer(cityLayer)) map.addLayer(cityLayer);
  } else {
    if (map.hasLayer(cityLayer)) map.removeLayer(cityLayer);
  }

  // Handle Dungeons (high zoom levels)
  if (zoomLevel >= 7) {
    if (!map.hasLayer(dungeonLayer)) map.addLayer(dungeonLayer);
  } else {
    if (map.hasLayer(dungeonLayer)) map.removeLayer(dungeonLayer);
  }
});

// Check for zoom and coordinate parameters in the URL
const params = new URLSearchParams(window.location.search);
const zoom = params.get('zoom');
const x = params.get('x');
const y = params.get('y');

if (zoom && x && y) {
  map.setView([x, y], parseInt(zoom)); // Move to the specific location
}
