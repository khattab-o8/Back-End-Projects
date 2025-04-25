/* eslint-disable */

//-------------Here-------------//
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2hhdHRhYi1tYXAtbzgiLCJhIjoiY204ajZiaGFxMGdyZjJscXJ4NG9rczFjcyJ9.JOjy-sRWMLGH4CGtXQRJfw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 7,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Create and Add Popup
    new mapboxgl.Popup({
      offset: 35
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
