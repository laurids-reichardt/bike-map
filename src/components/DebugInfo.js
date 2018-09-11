import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import CrossIcon from '@material-ui/icons/Adjust';

const styles = theme => ({
  root: {
    zIndex: 1,
    pointerEvents: 'none',
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    '& *': {
      pointerEvents: 'auto',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerCross: {
    zIndex: 2,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    maxWidth: '90vw',
    margin: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
  },
});

// displays a center cross and map info like map center and zoom state
// as well as buttons for custom events
function DebugInfo(props) {
  const { classes } = props;
  const { lat, lng, zoom } = props.mapCenter;

  return (
    <div className={classes.root}>
      <div className={classes.centerCross}>
        <CrossIcon color="secondary" />
      </div>

      <div className={classes.buttons}>
        <Button
          onClick={props.onFetch}
          id="button"
          variant="contained"
          color="primary"
          className={classes.button}
        >
          Fetch
        </Button>

        <Button
          onClick={props.onClear}
          id="button"
          variant="contained"
          color="secondary"
          className={classes.button}
        >
          Clear
        </Button>
      </div>

      <Chip
        label={`Longitude: ${lng} Latitude: ${lat} zoom: ${zoom}`}
        className={classes.chip}
        color="primary"
      />
    </div>
  );
}

export default withStyles(styles)(DebugInfo);
