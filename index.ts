const Leaflet = L as any;

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(startLatLng: L.LatLng, endLatLng: L.LatLng, duration: number = 1000, options: {timingFunction?: (t: number) => number} = {timingFunction: (t: number) => t}) {
        this.startedAt = Date.now();
        this.startLatLng = L.latLng(startLatLng);
        this.endLatLng = L.latLng(endLatLng);
        this.duration = duration;
        this.timingFunction = options.timingFunction;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.start(); // TODO: option to not auto start
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

        const t = this.timingFunction(now - this.startedAt);
        const lat = this.startLatLng.lat + ((this.endLatLng.lat - this.startLatLng.lat) / this.duration * t);
        const lng = this.startLatLng.lng + ((this.endLatLng.lng - this.startLatLng.lng) / this.duration * t);
        this.setLatLng({lat, lng});
    }
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, endLatLng: L.LatLng, duration: number = 1000, options: {timingFunction?: (t: number) => number} = {timingFunction: (t: number) => t}) {
    return new Leaflet.MovingMarker(startLatLng, endLatLng, duration, options);
}