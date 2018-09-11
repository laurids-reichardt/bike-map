import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  geocoder: {
    position: 'absolute',
    top: '56px',
    width: '100%',
    padding: '10px',
  },
});

// the geocoder initialized in the Map component will attach to this DOM element
function Geocoder({ classes }) {
  return <div id="geocoder" className={classes.geocoder} />;
}

export default withStyles(styles)(Geocoder);
