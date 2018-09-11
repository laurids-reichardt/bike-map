import * as turf from '@turf/turf';

export function toLngLat(location) {
  return [location.lng, location.lat];
}

export function getClosestBike(bikes, location) {
  return bikes.reduce(
    (first, second) =>
      turf.distance(toLngLat(first.pos), toLngLat(location)) <
      turf.distance(toLngLat(second.pos), toLngLat(location))
        ? first
        : second
  );
}

export function convertBikeArrayToFeatures(bikes) {
  return bikes.map(bike =>
    turf.point([bike.pos.lng, bike.pos.lat], {
      name: bike.id,
      provider: bike.provider,
      icon: bike.provider + 'Icon',
      description: `${bike.provider}: ${bike.id}`,
    })
  );
}
