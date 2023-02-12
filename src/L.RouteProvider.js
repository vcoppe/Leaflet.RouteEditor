L.RouteProvider = L.Class.extend({
    options: {

    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        let latlngs = [];

        for (let k = 0; k < waypoints.length - 1; k++) {
            let start = L.Projection.SphericalMercator.project(waypoints[k]);
            let end = L.Projection.SphericalMercator.project(waypoints[k + 1]);
            let delta = end.subtract(start).divideBy(2);

            let middle = L.Projection.SphericalMercator.unproject(start.add(delta));

            latlngs.push(waypoints[k]);
            latlngs.push(middle);
        }

        if (waypoints.length > 0) {
            latlngs.push(waypoints[waypoints.length - 1]);
        }

        callback(latlngs);
    },

    _getRoute: function(waypoints, callback) {
        let url = this._getRequestURL(waypoints);
        let request = new XMLHttpRequest();
        L.DomEvent.on(request, 'readystatechange', e => {
            if (request.readyState == 4 && request.status == 200) {
                callback(this._parseResponse(request.response));
            }
        });
        request.open('GET', decodeURIComponent(url));
        request.send();
    },

    _getRequestURL: function (waypoints) {
        // TO IMPLEMENT
    },

    _parseResponse: function (response) {
        // TO IMPLEMENT
    },
});

L.routeProvider = function (options) {
	return new L.RouteProvider(options);
};
