L.RouteProvider.Mapbox = L.Class.extend({
    options: {
        profile: 'cycling',
        token: 'TOKEN',
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        L.RouteProvider.prototype._getRoute.call(this, waypoints, callback);
    },

    _getRequestURL: function (waypoints) {
        return `https://api.mapbox.com/directions/v5/mapbox/${this.options.profile}/`
            + waypoints.map(wpt => `${wpt.lng},${wpt.lat}`).join(';')
            + `?geometries=geojson&access_token=${this.options.token}`;
    },

    _parseResponse: function (response) {
        let data = JSON.parse(response);
        return data['routes'][0]['geometry']['coordinates'].map(wpt => L.latLng(wpt[1], wpt[0], wpt[2]));
    },
});

L.routeProvider.mapbox = function (options) {
	return new L.RouteProvider.Mapbox(options);
};
