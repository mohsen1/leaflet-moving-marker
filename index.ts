const Leaflet = L as any;

const noop = () => {};;

interface MovingMarkerDestination {
    latLng: L.LatLng;
    duration: number;
}

interface MovingMarkerOptions {
    destinations?: Array<MovingMarkerDestination>;
}

interface MovingMarker extends L.Marker, MovingMarkerOptions {
    isZooming: boolean;
    isPaused: boolean;
    defaultDuration: number;
    currentIndex: number;
    map: L.Map;
    animationPrefix: string;
    styleElement: HTMLStyleElement;
    zoomStartedAt: number;
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions): void;
    start(): void;
    step(): void;
    requestAnimationFrameSetLatLng(): void;
    setCurrentLatLng(): void;
    getElement(): HTMLElement;
    pause(): void;
}

Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize(this: MovingMarker, startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
        this.currentIndex = 0;
        this.isZooming = false;
        this.isPaused = false;
        this.defaultDuration = 1000;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.animationPrefix = 'leaflet-marker-animation-' + Math.random().toString(36).slice(2, 10);
        this.styleElement = document.createElement('style');
        document.head.appendChild(this.styleElement);
        this.fire('destination', startLatLng);

        if (!options.destinations || !options.destinations.length) {
            this.fire('destinationsdrained');
            return;
        }

        this.destinations = options.destinations;
    },

    onAdd(this: MovingMarker, map: L.Map) {
        this.map = map;
        Leaflet.Marker.prototype.onAdd.call(this, map);
        this.start();
        map.addEventListener('zoomstart', () => {
            this.isZooming = true;
            this.zoomStartedAt = Date.now();
            this.pause();
            this.getElement().style.animation = 'none';
            this.setLatLng(this.destinations[this.currentIndex].latLng);
        });
        map.addEventListener('zoomend', () => {
            this.isZooming = false;
            const element = this.getElement();
            if (element) {
                element.style.animationPlayState = 'running';
            }
            this.setLatLng(this.destinations[this.currentIndex].latLng);
        });
    },

    step(this: MovingMarker) {
        const currentDestination = this.destinations[this.currentIndex];
        const nextDestination = this.destinations[this.currentIndex + 1]
        this.fire('destination', nextDestination);
        const duration = nextDestination!.duration || this.defaultDuration;
        const currentPoint: any = this.map.latLngToLayerPoint(currentDestination.latLng);
        const nextPoint: any = this.map.latLngToLayerPoint(nextDestination.latLng);
        const animationName = `${this.animationPrefix}-from-${this.currentIndex}-to-${this.currentIndex + 1}`;
        const animation = `
            @keyframes ${animationName} {
                from {
                    transform: translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0);
                }
                to {
                    transform: translate3d(${nextPoint.x}px, ${nextPoint.y}px, 0);
                }
            }
        `;
        const element = this.getElement();
        this.styleElement.textContent = animation;
        element.style.animation = `${animationName} ${duration}ms 1 linear`;
        setTimeout(() => {
            element.style.animation = 'none';
            this.setLatLng(nextDestination.latLng);
            this.currentIndex++;
            if (this.currentIndex < (this.destinations.length - 2)) {
                this.step();
            }
        }, duration);
    },

    start(this: MovingMarker) {
        this.isPaused = false;
        this.fire('start');
        this.step()
    },

    pause(this: MovingMarker) {
        this.fire('paused');
        this.isPaused = true;
        const element = this.getElement();
        if (element) {
            element.style.animationPlayState = 'paused';
        }
    },
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
    return new Leaflet.MovingMarker(startLatLng, options);
}
