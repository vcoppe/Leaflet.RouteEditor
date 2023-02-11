L.RouteProvider.StraightLine = L.Class.extend({
    options: {
        step: 10,
    },

    initialize: function (options) {
        L.setOptions(this, options);
    },

    getRoute: function (waypoints, callback) {
        let origin = L.point(0, 0);
        let step = L.point(0, this.options.step);

        let latlngs = [];

        for (let k = 0; k < waypoints.length - 1; k++) {
            let start = L.Projection.SphericalMercator.project(waypoints[k]);
            let end = L.Projection.SphericalMercator.project(waypoints[k + 1]);

            let delta = end.subtract(start);

            delta = delta.divideBy(Math.max(2, delta.distanceTo(origin) / step.distanceTo(origin)));

            for (let i = 0; start.distanceTo(start.add(delta.multiplyBy(i))) < start.distanceTo(end); i++) {
                let latlng = L.Projection.SphericalMercator.unproject(start.add(delta.multiplyBy(i)));

                latlngs.push(latlng);
            }
        }

        if (waypoints.length > 0) {
            latlngs.push(waypoints[waypoints.length - 1]);
        }

        callback(latlngs);
    },
});

L.routeProvider.straightLine = function (options) {
	return new L.RouteProvider.StraightLine(options);
};
