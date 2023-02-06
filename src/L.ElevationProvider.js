L.ElevationProvider = L.Class.extend({
    options: {

    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    setElevation: function (latlngs, callback) {
        callback();
    },
});

L.elevationProvider = function (options) {
	return new L.ElevationProvider(options);
};
