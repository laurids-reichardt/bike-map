import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import grey from '@material-ui/core/colors/grey';

const styles = theme => ({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundImage: 'linear-gradient(to right, #2979FF 10%, #00B8D4 90%)',
    minHeight: '56px',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: grey[100],
  },
  icon: {
    color: grey[100],
  },
});

function CustomAppBar(props) {
  const { classes } = props;
  return (
    <AppBar position="relative" color="default" className={classes.appbar}>
      <Toolbar className={classes.toolbar}>
        <Typography variant="headline" className={classes.title}>
          Bike Share Map
        </Typography>

        <IconButton>
          <AccountCircle className={classes.icon} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default withStyles(styles)(CustomAppBar);
