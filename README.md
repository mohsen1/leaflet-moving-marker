# Leaflet Moving Marker

## Usage

### Installation
```
npm install --save leaflet-moving-marker
```

### API
Provide an array of `destinations` and marker will walk through each destination until array of destinations is drained.

```ts
interface MovingMarkerDestination {
    latLng: L.LatLng;
    /** Time to travel to latLng point from previous latLng*/
    duration: number;
}

interface MovingMarkerOptions {
    destinations?: Array<MovingMarkerDestination>;
}
Leaflet.movingMarker(latLng: L.LatLng, options: MovingMarkerOptions);
```

#### `marker.start()`
Starts the marker movement.

#### `marker.pause()`
Pause marker movement.

### Events

#### `'start'`
When marker starts moving.

#### `'destination'`
When marker arrives to a new destination. Called with the destination object.

#### `'destinationsdrained'`
When all destinations are moved to and there is no more destination to go to.

#### `'paused'`
When marker is paused this event is fired.

### Example
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
});

marker.addTo(map);
```

### Rotating the marker
Using provided events and Leaflet `DivIcon` it's possible to rotate the marker on each destination..

First create a `DivIcon` that has a `rotate` method:

```js
var RotatingIcon = L.DivIcon.extend({
    createIcon: function() {
        // outerDiv.style.transform is updated by Leaflet
        var outerDiv = document.createElement('div');
        this.div = document.createElement('div');
        outerDiv.appendChild(this.div);
        return outerDiv;
    },
    rotate(deg) {
        this.div.style.transform = 'rotate(' + deg + 'deg)';
    },
});
```

Use your icon with Moving Marker:

```js
var icon = new RotatingIcon();
var marker = L.movingMarker(startLatLng, {
    destination: myDestinations,
    icon: icon,
});
```

Hook to `start` and `destination` events to rotate your marker:

```js

marker.on('start', function() {
    icon.rotate(startingRotation);
});
marker.on('destination', function(destination) {
    icon.rotate(destination.rotation);
});
```


## Development

`npm install` and `npm start` to watch for changes and see the results in browser.

## License
MIT