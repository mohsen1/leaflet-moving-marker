var locations = [
    {
        "lat": 37.774763,
        "recorded_at_ms": 1481571873000,
        "lng": -122.392041,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.77475,
        "recorded_at_ms": 1481571874000,
        "lng": -122.392024,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.774729,
        "recorded_at_ms": 1481571876000,
        "lng": -122.391997,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.774699,
        "recorded_at_ms": 1481571878000,
        "lng": -122.391961,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.77467,
        "recorded_at_ms": 1481571879000,
        "lng": -122.391925,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.7746,
        "recorded_at_ms": 1481571881000,
        "lng": -122.391838,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.774564,
        "recorded_at_ms": 1481571882000,
        "lng": -122.391794,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.774516,
        "recorded_at_ms": 1481571883000,
        "lng": -122.391736,
        "bearing": 135.5958557129
    },
    {
        "lat": 37.774342,
        "recorded_at_ms": 1481571885000,
        "lng": -122.391601,
        "bearing": 167.0756378174
    },
    {
        "lat": 37.774187,
        "recorded_at_ms": 1481571887000,
        "lng": -122.391556,
        "bearing": 167.0756378174
    },
];
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 20, attribution: osmAttrib});
var map = L.map('map', {
    center: [locations[0].lat, locations[0].lng],
    zoom: 18
});
map.addLayer(osm);

var Icon = L.DivIcon.extend({
    createIcon: function() {
        // outerDiv.style.transform is updated by Leaflet
        var outerDiv = document.createElement('div');
        this.div = document.createElement('div');
        this.div.classList.add('ferrari');
        const img = document.createElement('img');
        img.src = './Ferrari.png';
        img.width = '30';
        this.div.appendChild(img);
        outerDiv.appendChild(this.div);
        return outerDiv;
    },
    rotate(deg) {
        this.div.style.transform = 'translate3d(-15px, -35px, 0) rotate(' + deg + 'deg)';
    },
    iconSize: [30, 70],
})

var icon = new Icon();
var marker = L.movingMarker([locations[0].lat, locations[0].lng], {
    destinations: locations.map(function(item, index, array) {
        var duration = index === 0 ? 1000 : item.recorded_at_ms - array[index - 1].recorded_at_ms;
        return {
            latLng: [item.lat, item.lng],
            duration: duration,
            bearing: item.bearing,
        };
    }),
    icon: icon,
});

marker.on('destinationsdrained', function() {
    console.log('done');
});

marker.on('start', function() {
    icon.rotate(locations[0].bearing);
});
marker.on('destination', function(destination) {
    if (destination.bearing !== undefined) {
        icon.rotate(destination.bearing);
    }
});

marker.addTo(map);


// Controls
var MoveControl = L.Control.extend({
    options: {position: 'topright'},
    onAdd(map) {
        var pauseBtn = document.createElement('button');
        pauseBtn.innerText = '⏸';
        pauseBtn.onclick = function() {
            marker.pause();
        };
        var playBtn = document.createElement('button');
        playBtn.innerText = '▶️';
        playBtn.onclick = function() {
            marker.start();
        };
        var div = document.createElement('div');
        div.appendChild(pauseBtn);
        div.appendChild(playBtn);
        return div;
    },
});
map.addControl(new MoveControl());