L.RouteProvider.GraphHopper = L.Class.extend({
    options: {
        domain: 'graphhopper.com',
        profile: 'bike',
        token: false,
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        L.RouteProvider.prototype._getRoute.call(this, waypoints, callback);
    },

    _getRequestURL: function (waypoints) {
        return `https://${this.options.domain}/api/1/route?`
            + waypoints.map(wpt => `point=${wpt.lat},${wpt.lng}`).join('&')
            + `&profile=${this.options.profile}&elevation=true&points_encoded=false`
            + (this.options.token ? `&key=${this.options.token}` : '');
    },

    _parseResponse: function (response) {
        let data = JSON.parse(response);
        return data['paths'][0]['points']['coordinates'].map(wpt => L.latLng(wpt[1], wpt[0], wpt[2]));
    },
});

L.routeProvider.graphHopper = function (options) {
	return new L.RouteProvider.GraphHopper(options);
};
