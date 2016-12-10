var Leaflet = L;
Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize: function (startLatLng, endLatLng, duration, map, options) {
        var _this = this;
        if (duration === void 0) { duration = 1000; }
        if (options === void 0) { options = { timingFunction: function (t) { return t; } }; }
        this.startedAt = Date.now();
        this.startLatLng = L.latLng(startLatLng);
        this.endLatLng = L.latLng(endLatLng);
        this.duration = duration;
        this.timingFunction = options.timingFunction;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.isZooming = false;
        this.start(); // TODO: option to not auto start
        map.addEventListener('zoomstart', function () {
            _this.isZooming = true;
        });
        map.addEventListener('zoomend', function () {
            _this.isZooming = false;
        });
    },
    start: function () {
        if (!this.startLatLng.equals(this.endLatLng)) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
    },
    setCurrentLatLng: function () {
        var now = Date.now();
        var end = this.startedAt + this.duration;
        // Schedule the next tick
        if (now < end) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
        else {
            this.setLatLng(this.endLatLng);
            return;
        }
        if (this.isZooming) {
            return;
        }
        var t = this.timingFunction(now - this.startedAt);
        var lat = this.startLatLng.lat + ((this.endLatLng.lat - this.startLatLng.lat) / this.duration * t);
        var lng = this.startLatLng.lng + ((this.endLatLng.lng - this.startLatLng.lng) / this.duration * t);
        this.setLatLng({ lat: lat, lng: lng });
    }
});
Leaflet.movingMarker = function (startLatLng, endLatLng, duration, map, options) {
    if (duration === void 0) { duration = 1000; }
    if (options === void 0) { options = { timingFunction: function (t) { return t; } }; }
    return new Leaflet.MovingMarker(startLatLng, endLatLng, duration, map, options);
};
//# sourceMappingURL=index.js.map