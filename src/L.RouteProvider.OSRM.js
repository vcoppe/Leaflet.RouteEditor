L.RouteProvider.OSRM = L.Class.extend({
    options: {
        domain: 'DOMAIN_NAME',
        profile: 'cycling',
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        L.RouteProvider.prototype._getRoute.call(this, waypoints, callback);
    },

    _getRequestURL: function (waypoints) {
        return `https://${this.options.domain}/route/v1/${this.options.profile}/`
            + waypoints.map(wpt => `${wpt.lng},${wpt.lat}`).join(';')
            + `?geometries=geojson`;
    },

    _parseResponse: function (response) {
        let data = JSON.parse(response);
        return data['routes'][0]['geometry']['coordinates'].map(wpt => L.latLng(wpt[1], wpt[0], wpt[2]));
    },
});

L.routeProvider.osrm = function (options) {
	return new L.RouteProvider.OSRM(options);
};
