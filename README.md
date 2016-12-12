# Leaflet Moving Marker

### Usage

##### Installation
```
npm install --save leaflet-moving-marker
```

##### API
Provide an array of `destinations` and marker will walk through each destination until array of destinations is drained.

```ts
interface MovingMarkerDestination {
    latLng: L.LatLng;
    /** Time to travel to latLng point from previous latLng*/
    duration: number;
}

interface MovingMarkerOptions {
    onMoveCompleted?: () => void;
    destinations?: Array<MovingMarkerDestination>;
}
Leaflet.movingMarker(latLng: L.LatLng, options: MovingMarkerOptions);
```

##### Example
```js
ar marker = L.movingMarker([37.809185, -122.477351], {
    destinations: [
        {
            latLng: [37.825766, -122.479218],
            duration: 2000,
        },
        {
            latLng: [37.831420, -122.479936],
            duration: 3000
        },
        {
            latLng: [37.832200, -122.480644],
            duration: 1000
        }
    ],
    onMoveCompleted: function() {
        console.log('done');
    },
});

marker.addTo(map);
```

### Development

`npm install` and `npm start` to watch for changes and see the results in browser.

### License
MIT