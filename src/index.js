import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import App from './App';

// store the Mapbox access token as global variable
window.mapboxAccessToken =
  'pk.eyJ1IjoicmVpY2hhcmR0IiwiYSI6ImNqbHMwbGNndDBhY3MzcXM2OHNteHVrbWQifQ.Mjt-IIXRAhS_ae-5vLBwiQ';

// overwrite the geolocation methode to put the geo marker always in the same
// position, regardless of browser permissions or physical location
// this is for demonstrativ purposes only and will change in the future
navigator.geolocation.getCurrentPosition = function(success, failure) {
  success({
    coords: {
      accuracy: 20,
      latitude: 52.516332,
      longitude: 13.378367,
    },
  });
};

// set a custom primary color and make the web app display like an mobile app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2979FF',
    },
  },
  config: {
    displayAsApp: true,
    // displayAsApp: false,
  },
});

function Root() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
