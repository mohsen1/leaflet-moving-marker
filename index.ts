const Leaflet = L as any;

interface MovingMarkerOptions {
    endLatLng?: L.LatLng;
    duration?: number;
}

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
        this.startedAt = Date.now();
        this.startLatLng = L.latLng(startLatLng);
        this.endLatLng = L.latLng(options.endLatLng || startLatLng);
        this.duration = options.duration || 1000;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, {...options});
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
            return;
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