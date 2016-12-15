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
    timeout: any;
    stepStartedAt: number;
    initialize(startLatLng: L.LatLng, options: MovingMarkerOptions): void;
    start(): void;
    step(): void;
    requestAnimationFrameSetLatLng(): void;
    setCurrentLatLng(): void;
    getElement(): HTMLElement;
    pause(): void;
    _stepEnd(): void;
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
            this.getElement().style.webkitAnimation = 'none';

            const nextLatLng = L.latLng(this.destinations[this.currentIndex + 1].latLng);
            const startLatLng = L.latLng(this.destinations[this.currentIndex].latLng);
            const duration = this.destinations[this.currentIndex].duration;
            const t = Date.now() - this.stepStartedAt;
            const lat = startLatLng.lat + ((nextLatLng.lat - startLatLng.lat) / duration * t);
            const lng = startLatLng.lng + ((nextLatLng.lng - startLatLng.lng) / duration * t);
            this.setLatLng({lat, lng});
        });

        map.addEventListener('zoomend', () => {
            this.isZooming = false;
            const element = this.getElement();
            if (element) {
                element.style.webkitAnimationPlayState = 'running';
                element.style.animationPlayState = 'running';
            }

            const zoomDuration = Date.now() - this.zoomStartedAt;
            const durationPassed = Date.now() - this.stepStartedAt

            clearTimeout(this.timeout);
            const nextDestination = this.destinations[this.currentIndex + 1];
            const nextLatLng = L.latLng(this.destinations[this.currentIndex + 1].latLng);
            const startLatLng = L.latLng(this.destinations[this.currentIndex].latLng);
            const duration = this.destinations[this.currentIndex].duration - zoomDuration - durationPassed;
            const t = Date.now() - this.stepStartedAt;
            const lat = startLatLng.lat + ((nextLatLng.lat - startLatLng.lat) / duration * t);
            const lng = startLatLng.lng + ((nextLatLng.lng - startLatLng.lng) / duration * t);
            this.setLatLng({lat, lng});
            this.setLatLng(this.destinations[this.currentIndex].latLng);
            const currentPoint: any = this.map.latLngToLayerPoint({lat, lng});
            const nextPoint: any = this.map.latLngToLayerPoint(nextDestination.latLng);
            const animationName = `${this.animationPrefix}-from-${this.currentIndex}-zoomed--to-${this.currentIndex + 1}`;
            const animation = `
                @keyframes ${animationName} {
                    from {
                        transform: translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0);
                    }
                    to {
                        transform: translate3d(${nextPoint.x}px, ${nextPoint.y}px, 0);
                    }
                }
                @-webkit-keyframes ${animationName} {
                    from {
                        -webkit-transform: translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0);
                    }
                    to {
                        -webkit-transform: translate3d(${nextPoint.x}px, ${nextPoint.y}px, 0);
                    }
                }
            `;
            this.styleElement.textContent = animation;
            element.style.animation = `${animationName} ${duration}ms 1 linear`;
            element.style.webkitAnimation = `${animationName} ${duration}ms 1 linear`;

            this.timeout = setTimeout(this._stepEnd.bind(this), duration);
        });
    },

    step(this: MovingMarker) {
        const currentDestination = this.destinations[this.currentIndex];
        const nextDestination = this.destinations[this.currentIndex + 1];
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
            @-webkit-keyframes ${animationName} {
                from {
                    -webkit-transform: translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0);
                }
                to {
                    -webkit-transform: translate3d(${nextPoint.x}px, ${nextPoint.y}px, 0);
                }
            }
        `;
        const element = this.getElement();
        this.styleElement.textContent = animation;
        element.style.animation = `${animationName} ${duration}ms 1 linear`;
        element.style.webkitAnimation = `${animationName} ${duration}ms 1 linear`;

        this.stepStartedAt = Date.now();
        this.timeout = setTimeout(this._stepEnd.bind(this), duration);
    },

    _stepEnd() {
        const nextDestination = this.destinations[this.currentIndex + 1]
        const element = this.getElement();
        element.style.animation = 'none';
        this.setLatLng(nextDestination.latLng);
        this.currentIndex++;
        if (this.currentIndex < (this.destinations.length - 2)) {
            this.step();
        } else {
            this.fire('destinationsdrained');
        }
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
            element.style.webkitAnimationPlayState = 'paused';
        }
    },
});

Leaflet.movingMarker = function(startLatLng: L.LatLng, options: MovingMarkerOptions = {}) {
    return new Leaflet.MovingMarker(startLatLng, options);
}
