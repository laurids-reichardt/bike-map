import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { convertBikeArrayToFeatures } from './utility/helper';
import localMapboxStyle from './assets/mapbox-style.json';
import bykeIcon from './assets/bykeIcon.svg';
import mobikeIcon from './assets/mobikeIcon.svg';
import donkeyIcon from './assets/donkeyIcon.svg';
import nextbikeIcon from './assets/nextbikeIcon.svg';

// if web app is deployed to production, use official Mapbox style
// if not, use local map data and style
const mapboxStyle = () =>
  process.env.NODE_ENV !== 'production'
    ? localMapboxStyle
    : 'mapbox://styles/mapbox/streets-v10';

const styles = theme => ({
  container: {
    flexGrow: 1,
    display: 'flex',
  },
  map: {
    flexGrow: 1,
  },
});

function addGeolocationAndNavigationControls(map, geolocation, onGeolocate) {
  // create a DOM element for the default geolocation marker
  const locationMarkerElement = document.createElement('div');
  locationMarkerElement.className =
    'mapboxgl-user-location-dot mapboxgl-marker mapboxgl-marker-anchor-center';

  // add geolocation marker to map
  const defaultGeolocationMarker = new mapboxgl.Marker(locationMarkerElement)
    .setLngLat([geolocation.lng, geolocation.lat])
    .addTo(map);

  // initialize geolocation control
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
  });

  // if the geolocation control is successfully used, remove default geolocation marker
  geolocateControl.on('geolocate', position => {
    defaultGeolocationMarker.remove();
  });

  // if user denies geolocation permission, set map center to default geolocation
  geolocateControl.on('error', () =>
    map.flyTo({ center: [geolocation.lng, geolocation.lat], zoom: 16 })
  );

  // add geolocation control to map
  map.addControl(geolocateControl, 'bottom-right');

  // add navigation control to map
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
}

function addGeocoderSearchInput(map, onDestinationSelected, onSearchCleared) {
  // initialize geocoder search input
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    flyTo: false,
    proximity: { latitude: 52.516332, longitude: 13.378367 },
    country: 'de',
    language: 'de',
    placeholder: 'Look up your destination',
  });

  geocoder.on('clear', () => onSearchCleared());

  geocoder.on('result', result => onDestinationSelected(result));

  // add geocoder to map
  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
}

function addBikeProviderIconsToMap(map) {
  // add mobike icon to map
  const mobikeImg = new Image(256, 368);
  mobikeImg.src = mobikeIcon;
  mobikeImg.onload = () => map.addImage('MoBikeIcon', mobikeImg);

  // add byke icon to map
  const bykeImg = new Image(256, 368);
  bykeImg.src = bykeIcon;
  bykeImg.onload = () => map.addImage('BykeIcon', bykeImg);

  // add donkey icon to map
  const donkeyImg = new Image(256, 368);
  donkeyImg.src = donkeyIcon;
  donkeyImg.onload = () => map.addImage('DonkeyIcon', donkeyImg);

  // add nextbike icon to map
  const nextbikeImg = new Image(256, 368);
  nextbikeImg.src = nextbikeIcon;
  nextbikeImg.onload = () => map.addImage('NextbikeIcon', nextbikeImg);
}

function addBikeSourceAndLayer(map) {
  // add bike source to map
  map.addSource('bikes_source', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // load bike share provider icons to map memory
  addBikeProviderIconsToMap(map);

  // add bike layer to map
  map.addLayer({
    id: 'bikes_layer',
    source: 'bikes_source',
    type: 'symbol',
    minzoom: 14,
    layout: {
      'icon-image': '{icon}',
      'icon-size': 0.125,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
    },
  });

  // When a click event occurs on a feature in the bikes_layer, open popup
  map.on('click', 'bikes_layer', e => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.description;

    new mapboxgl.Popup({ closeButton: false, offset: 48, anchor: 'bottom' })
      .setLngLat(coordinates)
      .setText(description)
      .addTo(map);
  });
}

function addRouteSourceAndLayer(map) {
  // add route source to map
  map.addSource('route_source', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    },
  });

  // the outline casing for the route line
  map.addLayer({
    id: 'route_layer_casing',
    type: 'line',
    source: 'route_source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#0D47A1',
      'line-width': 8,
    },
  });

  // the inner line for the route line
  map.addLayer({
    id: 'route_layer',
    type: 'line',
    source: 'route_source',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#42A5F5',
      'line-width': 6,
    },
  });
}

class MapContainer extends React.Component {
  componentDidMount() {
    // initialize map setting center to geolocation
    mapboxgl.accessToken = window.mapboxAccessToken;
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapboxStyle(),
      center: [this.props.geolocation.lng, this.props.geolocation.lat],
      zoom: 15,
      attributionControl: false,
    });

    // every time the map moves, update the map center and zoom state
    this.map.on('move', () => {
      this.props.onMapMove({
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
      });
    });

    // on map move end, call onMapMoveEnd of the parent component
    this.map.on('moveend', () => {
      this.props.onMapMoveEnd();
    });

    // once the map finished loading, add all map features to map
    this.map.on('load', () => {
      // add default geolocation marker and navigation controls
      addGeolocationAndNavigationControls(this.map, this.props.geolocation);

      // add geocoder search field to map
      addGeocoderSearchInput(
        this.map,
        this.props.onDestinationSelected,
        this.props.onSearchCleared
      );

      // add bike layer
      addBikeSourceAndLayer(this.map);

      // add route layer
      addRouteSourceAndLayer(this.map);

      // tell parent component map finished loading
      this.props.onMapLoaded(this.map);
    });
  }

  componentDidUpdate(prevProps) {
    // check if bikes changed
    if (this.props.bikes !== prevProps.bikes) {
      // if bikes changed, update bike source data
      // this will display the new bikes on the map
      this.map
        .getSource('bikes_source')
        .setData(
          turf.featureCollection([
            ...convertBikeArrayToFeatures(this.props.bikes),
          ])
        );
    }

    // check if directions/route changed
    if (this.props.directions !== prevProps.directions) {
      if (this.props.directions === undefined) {
        // if directions are undefined, remove route data from map
        this.map.getSource('route_source').setData({
          type: 'Feature',
          properties: {},
        });

        // and remove destination marker from map
        this.destinationMarker.remove();
      } else {
        // get GEOJson geometry of directions route
        const geometry = this.props.directions.body.routes[0].geometry;

        // update route layer with directions geometry
        this.map.getSource('route_source').setData({
          type: 'Feature',
          properties: {},
          geometry: geometry,
        });

        // add a destination marker by looking for the last coordinate
        // of the route object
        this.destinationMarker = new mapboxgl.Marker({ color: '#F44336' })
          .setLngLat(...geometry.coordinates.slice(-1))
          .addTo(this.map);

        // zoom and pan map to get whole route into view
        this.map.fitBounds(turf.bbox(geometry), { padding: 64 });
      }
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {/* DOM element the Mapbox Gl JS map will attach to */}
        <div className={classes.map} ref={el => (this.mapContainer = el)} />
      </div>
    );
  }
}

export default withStyles(styles)(MapContainer);
