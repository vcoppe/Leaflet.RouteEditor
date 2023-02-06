L.RouteProvider = L.Class.extend({
    options: {

    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        callback(waypoints);
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
