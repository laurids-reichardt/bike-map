import * as turf from '@turf/turf';
import { toLngLat } from '../utility/helper';
import { mockData } from './mock-data';

// provides bike information to the app
export default class Provider {
  constructor() {
    // load mock data from file
    this.store = mockData;
  }

  // filters through the mock data and returns bikes for a given location and radius
  getBicyclesByLatLng(location, radius) {
    return this.store.filter(
      bike => turf.distance(toLngLat(location), toLngLat(bike.pos)) < radius
    );
  }
}
