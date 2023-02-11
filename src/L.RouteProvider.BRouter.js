L.RouteProvider.BRouter = L.Class.extend({
    options: {
        domain: 'DOMAIN_NAME',
        profile: 'ROUTING_PROFILE',
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        L.RouteProvider.prototype._getRoute.call(this, waypoints, callback);
    },

    _getRequestURL: function (waypoints) {
        return `https://${this.options.domain}?lonlats=`
            + waypoints.map(wpt => `${wpt.lng},${wpt.lat}`).join('|')
            + `&profile=${this.options.profile}&alternativeidx=0&format=geojson`;
    },

    _parseResponse: function (response) {
        let data = JSON.parse(response);
        return data['features'][0]['geometry']['coordinates'].map(wpt => L.latLng(wpt[1], wpt[0], wpt[2]));
    },
});

L.routeProvider.bRouter = function (options) {
	return new L.RouteProvider.BRouter(options);
};
