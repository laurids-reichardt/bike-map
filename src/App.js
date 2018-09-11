import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';

import { toLngLat } from './utility/helper';
import Provider from './provider/Provider';
import Map from './Map';
import AppBar from './components/AppBar';
import DebugInfo from './components/DebugInfo';
import Geocoder from './components/Geocoder';

// check if theme is set to display website as mobile app
const mobileStyle = theme =>
  theme.config.displayAsApp
    ? { width: '47vh', height: '75vh', borderRadius: '4px 4px 4px 4px' }
    : {};

const styles = theme => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: mobileStyle(theme),
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // displayDebugInfo: true,
      displayDebugInfo: false,
      mapCenter: { lat: 0, lng: 0, zoom: 0 },
      geolocation: { lat: 52.516332, lng: 13.378367 },
      // closest bike to geolocation is hard coded for now
      closestBike: { pos: { lat: 52.516293, lng: 13.379651 } },
    };

    // provides the bike positions for a given geolocation
    this.provider = new Provider();

    // provides a client for the Mapbox directions api
    this.directionsClient = MapboxDirections({
      accessToken: window.mapboxAccessToken,
    });
  }

  ////////////////////////////////////////////////////////////
  // Event handler functions
  ////////////////////////////////////////////////////////////

  // once the map is fully loaded, set initial state and display bikes
  onMapLoaded = map => {
    this.onMapMove({ center: map.getCenter(), zoom: map.getZoom() });
    this.fetchBikes(this.state.geolocation);
  };

  // if the user pans the map, update map center and zoom values
  onMapMove = mapProps => {
    this.setState({
      mapCenter: {
        lat: Math.round(mapProps.center.lat * 1000) / 1000,
        lng: Math.round(mapProps.center.lng * 1000) / 1000,
        zoom: Math.round(mapProps.zoom * 100) / 100,
      },
    });
  };

  // once the map stops moving, fetch bikes for map center location
  onMapMoveEnd = () => {
    this.fetchBikes(this.state.mapCenter);
  };

  // once the user selects a destination from the geocoder, display route on map
  onDestinationSelected = async response => {
    // origin point of route is always the closest bike
    const origin = toLngLat(this.state.closestBike.pos);

    // destination point of route is the geocoder result location
    const destination = response.result.center;

    // make api call to the Mapbox directions api
    const directions = await this.directionsClient
      .getDirections({
        waypoints: [{ coordinates: origin }, { coordinates: destination }],
        geometries: 'geojson',
      })
      .send();

    // the Mapbox directions route snaps to the closest road and does not
    // contain the original origin and destination points

    // add coordinate for start point
    directions.body.routes[0].geometry.coordinates.unshift(origin);

    // add coordinate for end point
    directions.body.routes[0].geometry.coordinates.push(destination);

    // add directions object to state, map component will update with route
    this.setState({ directions: directions });
  };

  // once the user clears the search input, remove the route from map display
  onSearchCleared = () => {
    this.setState({ directions: undefined });
  };

  fetchBikes = location => {
    const bikes = this.provider.getBicyclesByLatLng(location, 1);
    this.setState({ bikes: bikes });
  };

  ////////////////////////////////////////////////////////////
  // Debug functions
  ////////////////////////////////////////////////////////////
  onFetch = () => this.fetchBikes(this.state.mapCenter);
  onClear = () => this.setState({ bikes: [] });

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar />

        <Geocoder />

        {this.state.displayDebugInfo && (
          <DebugInfo
            onFetch={this.onFetch}
            onClear={this.onClear}
            mapCenter={this.state.mapCenter}
          />
        )}

        <Map
          geolocation={this.state.geolocation}
          bikes={this.state.bikes}
          directions={this.state.directions}
          // event handler
          onMapLoaded={this.onMapLoaded}
          onMapMove={this.onMapMove}
          onMapMoveEnd={this.onMapMoveEnd}
          onDestinationSelected={this.onDestinationSelected}
          onSearchCleared={this.onSearchCleared}
        />
      </div>
    );
  }
}

export default withStyles(styles)(App);
