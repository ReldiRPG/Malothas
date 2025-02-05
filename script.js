// Initialize the map
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 7
});

// Define map bounds and add the overlay image
const mapBounds = [[0, 0], [2160, 3240]]; // Adjust to your map dimensions
const imageUrl = 'Malosthas_Map.svg'; // Replace with your map image
L.imageOverlay(imageUrl, mapBounds).addTo(map);
map.fitBounds(mapBounds);
map.fire('zoomend');

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
      // Use the POI-defined icon size or a default size if not specified
      const size = poi.iconSize || [32, 32];

      // Optionally, adjust the iconAnchor based on the icon size. 
      // For instance, [size[0] / 2, size[1]] will center the icon horizontally 
      // and position the bottom at the point.
      const icon = L.icon({
        iconUrl: poi.icon,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]]
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
// Show hide layers on move
map.on('moveend', () => {
  map.fire('zoomend');
});


// Show or hide layers based on zoom level
map.on('zoomend', () => {
  const zoomLevel = Math.round(map.getZoom());
  console.log("Current zoom level:", zoomLevel);

  // Handle Regions (low zoom levels)
  if (zoomLevel <= 1) {
    if (!map.hasLayer(regionLayer)) map.addLayer(regionLayer);
  } else {
    if (map.hasLayer(regionLayer)) map.removeLayer(regionLayer);
  }

  // Handle Cities (medium zoom levels)
  if (zoomLevel >= 3 && zoomLevel <= 5) {
    if (!map.hasLayer(cityLayer)) map.addLayer(cityLayer);
  } else {
    if (map.hasLayer(cityLayer)) map.removeLayer(cityLayer);
  }

  // Handle Dungeons (high zoom levels)
  if (zoomLevel >= 5) {
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
