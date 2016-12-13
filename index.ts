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

interface MovingMarker extends L.Marker, MovingMarkerOptions {
    isZooming: boolean;
    isPaused: boolean;
    defaultDuration: number;
    startLatLng: L.LatLng;
    nextLatLng: L.LatLng;
    duration: number;
    startedAt: number;
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions): void;
    start(): void;
    step(): void;
    requestAnimationFrameSetLatLng(): void;
    setCurrentLatLng(): void;
}

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(this: MovingMarker, startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
        this.startLatLng = L.latLng(startLatLng);
        this.isZooming = false;
        this.isPaused = false;
        this.defaultDuration = 1000;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.fire('destination', startLatLng);

        if (!options.destinations || !options.destinations.length) {
            this.fire('destinationsdrained');
            return;
        }

        this.destinations = options.destinations;
        this.step();
    },

    onAdd(this: MovingMarker, map: L.Map) {
        Leaflet.Marker.prototype.onAdd.call(this, map);
        this.start();
        map.addEventListener('zoomstart', () => { this.isZooming = true; });
        map.addEventListener('zoomend', () => { this.isZooming = false; });
    },

    step(this: MovingMarker) {
        const nextDestination = this.destinations!.shift();
        this.fire('destination', nextDestination);
        this.nextLatLng = L.latLng(nextDestination!.latLng);
        this.duration = nextDestination!.duration || this.defaultDuration;
    },

    start(this: MovingMarker) {
        this.startedAt = Date.now();
        this.isPaused = false;
        this.fire('start');
        this.requestAnimationFrameSetLatLng()
    },

    pause(this: MovingMarker) {
        this.fire('paused');
        this.isPaused = true;
    },

    requestAnimationFrameSetLatLng(this: MovingMarker) {
        if (!this.isPaused) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
    },

    setCurrentLatLng(this: MovingMarker) {
        const now = Date.now();
        const end = this.startedAt + this.duration;


        // Schedule the next tick
        if (now < end) {
            this.requestAnimationFrameSetLatLng()
        } else {
            if (this.destinations!.length) {
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
        }

        return;
    }
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
    return new Leaflet.MovingMarker(startLatLng, options);
}
