const Leaflet = L as any;

const noop = () => {};;

interface MovingMarkerDestination {
    latLng: L.LatLng;
    duration: number;
}

interface MovingMarkerOptions {
    onMoveCompleted?: () => void;
    destinations: Array<MovingMarkerDestination>;
}

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
        this.startedAt = Date.now();
        this.startLatLng = L.latLng(startLatLng);
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);

        if (!options.destinations || !options.destinations.length) {
            return;
        }

        this.onMoveCompleted = options.onMoveCompleted || noop;

        this.destinations = options.destinations;
        const nextDestination = this.destinations.shift();

        this.nextLatLng = L.latLng(nextDestination.latLng);
        this.duration = nextDestination.duration || 1000;
        this.isZooming = false;
    },

    onAdd(map) {
        L.Marker.prototype.onAdd.call(this, map);
        this.start();
        map.addEventListener('zoomstart', () => { this.isZooming = true; });
        map.addEventListener('zoomend', () => { this.isZooming = false; });
    },

    start() {
        if (!this.startLatLng.equals(this.endLatLng)) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
    },

    setCurrentLatLng() {
        const now = Date.now();
        const end = this.startedAt + this.duration;


        // Schedule the next tick
        if (now < end) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        } else {
            this.setLatLng(this.endLatLng);
            return this.onMoveCompleted();
        }

        if (!this.isZooming) {
            const t = now - this.startedAt;
            const lat = this.startLatLng.lat + ((this.endLatLng.lat - this.startLatLng.lat) / this.duration * t);
            const lng = this.startLatLng.lng + ((this.endLatLng.lng - this.startLatLng.lng) / this.duration * t);
            this.setLatLng({lat, lng});
        }

        return;
    }
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
    return new Leaflet.MovingMarker(startLatLng, options);
}