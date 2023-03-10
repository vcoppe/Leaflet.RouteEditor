L.Control.RouteEditor = L.Control.extend({
    options: {
        load: 'load',
        download: 'download',
        clear: 'clear',
        filename: 'file',
        format: 'gpx',
        polylineOptions: {
            weight: 5,
        },
        anchorIconOptions: {
            iconUrl: 'img/marker.svg',
            iconSize: [12, 12],
        },
        routeProvider: L.routeProvider.straightLine(),
        elevationProvider: L.elevationProvider(),
        onUpdate: function () {},
    },

    initialize: function (options) {
        L.setOptions(this, options);

        this._icon = L.icon(this.options.anchorIconOptions);
    },

    onAdd: function (map) {
        L.DomEvent.on(this._map, 'click', e => this._addLatLng(e.latlng));
        L.DomEvent.on(this._map, 'zoomend', this._updateMarkers, this);
        L.DomEvent.on(this._map, 'mousemove', this._updateHoverMarker, this);

        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-route-editor');

        if (this.options.load) {
            this._loadButton = L.DomUtil.create('a', 'leaflet-control-route-editor-load', this._container);
            this._loadButton.innerHTML = this.options.load;

            this._fileInput = L.DomUtil.create('input', 'leaflet-control-route-editor-file-input');
            this._fileInput.type = 'file';
            this._fileInput.accept = '.gpx';
            this._fileInput.style.display = 'none';

            L.DomEvent.on(this._loadButton, 'click', e => this._fileInput.click());
            L.DomEvent.on(this._loadButton, 'click', L.DomEvent.stopPropagation);
            L.DomEvent.on(this._fileInput, 'input', e => {
                this._loadRouteFromFile(this._fileInput.files[0]);
                this._fileInput.value = '';
            }, this);
        }

        if (this.options.download) {
            this._downloadButton = L.DomUtil.create('a', 'leaflet-control-route-editor-download', this._container);
            this._downloadButton.innerHTML = this.options.download;

            L.DomEvent.on(this._downloadButton, 'click', e => this._downloadRouteToFile());
            L.DomEvent.on(this._downloadButton, 'click', L.DomEvent.stopPropagation);
        }

        if (this.options.clear) {
            this._clearButton = L.DomUtil.create('a', 'leaflet-control-route-editor-clear', this._container);
            this._clearButton.innerHTML = this.options.clear;

            L.DomEvent.on(this._clearButton, 'click', e => this.clear());
            L.DomEvent.on(this._clearButton, 'click', L.DomEvent.stopPropagation);
        }

        return this._container;
    },

    onRemove: function (map) {
        L.DomEvent.off(this._map, 'zoomend', this._updateMarkers, this);
        L.DomEvent.off(this._map, 'mousemove', this._updateHoverMarker, this);
    },

    _loadRouteFromFile: function (file) {
        let reader = new FileReader();
        L.DomEvent.on(reader, 'load', e => this._loadRouteFromData(file.name, reader.result), this);
        reader.readAsText(file);
    },

    loadRouteFromURL: function (url) {
        let request = new XMLHttpRequest();
        L.DomEvent.on(request, 'readystatechange', e => {
            if (request.readyState == 4 && request.status == 200) {
                this._loadRouteFromData(url, request.responseText);
            }
        }, this);
        request.open('GET', decodeURIComponent(url));
        request.send();
    },

    _loadRouteFromData: function(path, data) {
        let format = path.split('.').pop().toLowerCase();
        switch (format) {
            case 'gpx':
                this._data = this._readGpx(data);
                break;
            default:
                console.log("file format not supported");
        }
        this._updateData();
        this._map.fitBounds(this._polyline.getBounds());
    },

    _readGpx: function (data) {
        const trkptRegex = /<trkpt\s+lat="(?<lat>-?\d+\.\d+)"\s+lon="(?<lng>-?\d+\.\d+)">[\s\S]*?(<ele>(?<alt>-?\d+\.?\d*)<\/ele>)?[\s\S]*?<\/trkpt>/g;
        let matches = [...data.matchAll(trkptRegex)];
        return matches.map(match => L.latLng(Number(match.groups.lat), Number(match.groups.lng), Number(match.groups.alt)));
    },

    _addLatLng: function (latlng) {
        if (!this._data) {
            this._data = [latlng];
        } else {
            this._data.push(latlng);
        }

        let marker = this._createMarker(latlng);

        if (!this._markers) {
            this._markers = [marker];
        } else {
            this._markers.push(marker);
        }

        marker._latlngIndex = this._data.length - 1;
        marker._markerIndex = this._markers.length - 1;
        latlng._marker = marker;

        if (this._markers.length >= 2) {
            let previousMarker = this._markers[this._markers.length - 2];
            let marker = this._markers[this._markers.length - 1];
            this._updateRouteBetweenMarkers([previousMarker, marker]);
        }
    },

    _updateData: function () {
        if (this._polyline) {
            this._polyline.setLatLngs(this._data);
        } else {
            this._polyline = L.polyline(this._data, this.options.polylineOptions);
            this._polyline.addTo(this._map);
        }

        this._updateMarkers();

        if (this.options.onUpdate) {
            this.options.onUpdate(this._data);
        }
    },

    _updateHoverMarker: function (e) {
        if (this._polyline) {
            let point = this._polyline.closestLayerPoint(e.layerPoint);
            if (point && point.distance < 3) {
                if (this._tmpMarker) {
                    this._tmpMarker.setLatLng(e.latlng);
                } else {
                    this._tmpMarker = this._createMarker(e.latlng);
                    this._tmpMarker.setZIndexOffset(-1000);

                    L.DomEvent.on(this._tmpMarker, 'mousedown', this._insertMarker, this);
                }
            } else if (this._tmpMarker) {
                this._tmpMarker.remove();
                this._tmpMarker = null;
            }
        } else if (this._tmpMarker) {
            this._tmpMarker.remove();
            this._tmpMarker = null;
        }
    },

    _insertMarker: function (e) {
        if (this._tmpMarker) {
            let latlngIndex = -1;
            let minDist = 0;
            for (let i = 0; i < this._data.length - 1; i++) {
                let dist = L.LineUtil.pointToSegmentDistance(
                    e.layerPoint,
                    this._map.latLngToLayerPoint(this._data[i]),
                    this._map.latLngToLayerPoint(this._data[i + 1])
                );
                if (latlngIndex == -1 || dist < minDist) {
                    latlngIndex = i + 1;
                    minDist = dist;
                }
            }

            let markerIndex = -1;
            for (let i = 0; i < this._markers.length; i++) {
                if (this._markers[i]._latlngIndex >= latlngIndex) {
                    if (markerIndex == -1) {
                        markerIndex = i;
                    }
                    this._markers[i]._latlngIndex++;
                    this._markers[i]._markerIndex++;
                }
            }

            let latlng = e.latlng;
            let marker = this._tmpMarker;
            latlng._marker = marker;
            this._data.splice(latlngIndex, 0, latlng);

            marker._latlngIndex = latlngIndex;
            marker._markerIndex = markerIndex;
            marker.setZIndexOffset(0);

            this._markers.splice(markerIndex, 0, marker);
            L.DomEvent.off(marker, 'mousedown', this._insertMarker, this);
            this._tmpMarker = null;
        }
    },

    _updateMarkers: function () {
        let bounds = this._map.getBounds();
        let southWest = bounds.getSouthWest();
        let northEast = bounds.getNorthEast();
        let threshold = Math.pow(Math.min(northEast.lat - southWest.lat, northEast.lng - southWest.lng) / 20, 2);

        let simplified = [];
        let start = -1;
        for (let index = 0; index < this._data.length; index++) {
            this._data[index]._latlngIndex = index;
            if (this._data[index]._routing) {
                if (start != -1) {
                    let points = this._data.slice(start, index);
                    if (points.length <= 2) {
                        simplified.push(...points);
                    } else {
                        let simplifiedPoints = simplify(points, threshold);
                        simplified.push(...simplifiedPoints);
                    }
                    start = -1;
                }
            } else {
                if (start == -1) {
                    start = index;
                }
            } 
        }

        if (start != - 1) {
            let points = this._data.slice(start);
            if (points.length <= 2) {
                simplified.push(...points);
            } else {
                let simplifiedPoints = simplify(points, threshold);
                simplified.push(...simplifiedPoints);
            }
        }

        if (this._markers) {
            this._markers.forEach(marker => {
                marker._latlngIndex = null;
            });
        }

        let newMarkers = simplified.map((latlng, index) => {
            let marker = this._createMarker(latlng);
            marker._markerIndex = index;
            marker._latlngIndex = latlng._latlngIndex;
            return marker;
        });

        if (this._markers) {
            this._markers.forEach(marker => {
                if (marker._latlngIndex === null) {
                    marker._latlng._marker = null;
                    marker.remove();
                }
            });
        }

        this._markers = newMarkers;
    },

    _createMarker: function (latlng) {
        if (latlng._marker) {
            return latlng._marker;
        }

        let marker = L.marker(latlng, {
            icon: this._icon,
            draggable: true,
        });
        marker.addTo(this._map);

        L.DomEvent.on(marker, 'mouseup', this._onMarkerMoved, this);
        L.DomEvent.on(marker, 'click', this._onMarkerClicked, this);
        L.DomEvent.on(marker, 'click', L.DomEvent.stopPropagation);
        L.DomEvent.on(marker, 'contextmenu', this._onMarkerClicked, this);
        L.DomEvent.on(marker, 'contextmenu', L.DomEvent.stopPropagation);

        latlng._marker = marker;

        return marker;
    },

    _onMarkerMoved: function (e) {
        let marker = e.target;
        if (marker.getLatLng().equals(this._data[marker._latlngIndex])) {
            return;
        }
        if (marker._markerIndex > 0 && marker._markerIndex < this._markers.length - 1) {
            let previousMarker = this._markers[marker._markerIndex - 1];
            let nextMarker = this._markers[marker._markerIndex + 1];
            this._updateRouteBetweenMarkers([previousMarker, marker, nextMarker]);
        } else if (marker._markerIndex > 0) {
            let previousMarker = this._markers[marker._markerIndex - 1];
            this._updateRouteBetweenMarkers([previousMarker, marker]);
        } else if (marker._markerIndex < this._markers.length - 1) {
            let nextMarker = this._markers[marker._markerIndex + 1];
            this._updateRouteBetweenMarkers([marker, nextMarker]);
        }
    },

    _onMarkerClicked: function (e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            this._deleteMarker(e.target);
        }
    },

    _deleteMarker: function (marker) {
        if (marker._markerIndex == 0) {
            if (this._markers.length == 1) {
                this.clear();
            } else {
                this._data.splice(0, this._markers[1]._latlngIndex);
                this._updateData();
            }
        } else if (marker._markerIndex == this._markers.length - 1) {
            this._data.splice(this._markers[this._markers.length - 2]._latlngIndex + 1);
            this._updateData();
        } else {
            let previousMarker = this._markers[marker._markerIndex - 1];
            let nextMarker = this._markers[marker._markerIndex + 1];
            this._updateRouteBetweenMarkers([previousMarker, nextMarker]);
        }
    },

    _updateRouteBetweenMarkers: function (markers) {
        let waypoints = markers.map(marker => marker.getLatLng());

        this.options.routeProvider.getRoute(waypoints, route => {
            this.options.elevationProvider.setElevation(route, () => {
                route.forEach(latlng => latlng._routing = true);

                let routeIndices = [];
                routeIndices.push(0);
                if (markers.length == 3) {
                    let minIndex = -1;
                    let minDist = 0;
                    for (let index = 1; index < route.length - 1; index++) {
                        let dist = markers[1].getLatLng().distanceTo(route[index]);
                        if (minIndex == -1 || dist < minDist) {
                            minIndex = index;
                            minDist = dist;
                        }
                    }
                    routeIndices.push(minIndex);
                }
                routeIndices.push(route.length - 1);

                for (let i = markers.length - 2; i >= 0; i--) {
                    let segment = route.slice(routeIndices[i], routeIndices[i + 1] + 1);
                    if (segment.length > 0) {
                        segment[0]._routing = false;
                        segment[segment.length - 1]._routing = false;
                    }
                    this._data.splice(
                        markers[i]._latlngIndex,
                        markers[i + 1]._latlngIndex - markers[i]._latlngIndex + 1,
                        ...segment
                    );
                }

                this._updateData();
            });
        });
    },

    _downloadRouteToFile: function () {
        let data = null;
        switch (this.options.format) {
            case 'gpx':
                data = this.getRouteAsGpx();
                break;
            default:
                console.log("file format not supported");
        }

        if (data != null) {
            let element = L.DomUtil.create('a');
            element.setAttribute('href', 'data:text/octet-stream;charset=utf-8,' + encodeURIComponent(data));
            element.setAttribute('download', `${this.options.filename}.${this.options.format}`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    },

    getRouteAsGpx: function () {
        let output = `<?xml version="1.0" encoding="UTF-8"?>\n`
        + `<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1">\n`
        + `<metadata>\n`
        + `    <name>${this.options.filename}</name>\n`
        + `</metadata>\n`
        + `<trk>\n`
        + `    <name>${this.options.filename}</name>\n`
        + `    <trkseg>\n`;

        for (let latlng of this._data) {
            output += `    <trkpt lat="${latlng.lat}" lon="${latlng.lng}">`;
            if (latlng.alt != null) {
                output += `<ele>${latlng.alt}</ele>`;
            }
            output += `</trkpt>\n`;
        }

        output += `    </trkseg>\n`
        + `</trk>\n`
        + `</gpx>\n`;

        return output;
    },

    clear: function () {
        this._data = [];

        if (this._polyline) {
            this._polyline.remove();
            this._polyline = null;
        }

        if (this._markers) {
            this._markers.forEach(marker => marker.remove());
            this._markers = [];
        }

        if (this.options.onUpdate) {
            this.options.onUpdate(this._data);
        }
    },
});

L.control.routeEditor = function (options) {
	return new L.Control.RouteEditor(options);
};
