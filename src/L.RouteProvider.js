L.RouteProvider = L.Class.extend({
    options: {

    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints) {
        return waypoints;
    },
});

L.routeProvider = function (options) {
	return new L.RouteProvider(options);
};
