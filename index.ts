const Leaflet = L as any;

const noop = () => {};;

interface MovingMarkerDestination {
    latLng: L.LatLng;
    duration: number;
}

interface MovingMarkerOptions {
    destinations?: Array<MovingMarkerDestination>;
    iconElement?: HTMLElement;
}

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
        this.startLatLng = L.latLng(startLatLng);
        this.isZooming = false;
        this.isPaused = false;
        this.defaultDuration = 1000;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.fire('destination', startLatLng);

        if (!options.destinations || !options.destinations.length) {
            return this.fire('destinationsdrained');
        }

        this.destinations = options.destinations;
        this.step();
    },

    onAdd(map) {
        Leaflet.Marker.prototype.onAdd.call(this, map);
        this.start();
        this.map = map;
        map.addEventListener('zoomstart', () => { this.isZooming = true; });
        map.addEventListener('zoomend', () => { this.isZooming = false; });
    },

    step() {
        const nextDestination = this.destinations.shift();
        this.fire('destination', nextDestination);
        this.nextLatLng = L.latLng(nextDestination.latLng);
        this.duration = nextDestination.duration || this.defaultDuration;
    },

    start() {
        this.startedAt = Date.now();
        this.isPaused = false;
        this.fire('start');
        this.requestAnimationFrameSetLatLng()
    },

    pause() {
        this.fire('paused');
        this.isPaused = true;
    },

    requestAnimationFrameSetLatLng() {
        if (!this.isPaused) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
    },

    setCurrentLatLng() {
        const now = Date.now();
        const end = this.startedAt + this.duration;

        // Schedule the next tick
        if (now < end) {
            this.requestAnimationFrameSetLatLng()
        } else {
            if (this.destinations.length) {
                // step to next destination
                this.startedAt = Date.now();
                this.startLatLng = this.nextLatLng;
                this.step();
                this.requestAnimationFrameSetLatLng()
            } else {
                this.setLatLng(this.nextLatLng);
                return this.fire('destinationsdrained');
            }
        }

        if (!this.isZooming) {
            const t = now - this.startedAt;
            const lat = this.startLatLng.lat + ((this.nextLatLng.lat - this.startLatLng.lat) / this.duration * t);
            const lng = this.startLatLng.lng + ((this.nextLatLng.lng - this.startLatLng.lng) / this.duration * t);
            this.setLatLng({lat, lng});
            const rawPoint = this.map.project({lat,lng});
            const point = rawPoint._subtract(this.map.getPixelOrigin());
            L.DomUtil.setPosition(this.getElement(), point);
        }

        return;
    }
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
    return new Leaflet.MovingMarker(startLatLng, options);
}