# Leaflet.RouteEditor

Minimalist Leaflet plugin to edit GPS traces.

Check the [demo](https://vcoppe.github.io/Leaflet.RouteEditor/)!

## Requirements

Developed with Leaflet 1.9.3 but so simple it probably works with other versions too.

## Usage

Simply add the single file from the `dist` folder to your project like below:

```html
<script src="https://unpkg.com/leaflet-route-editor@0.0.0/dist/L.Control.RouteEditor.min.js"></script>
```

Then, add an instance of `L.Control.RouteEditor` to the map: `L.control.routeEditor().addTo(map)`.
See the [Reference](#reference) below to learn how to customize the plugin to your needs.

## Reference

### L.Control.RouteEditor

The route editor in itself, adding an instance of it to the map enables plotting a route, and loading and downloading GPS routes.

Option | Type | Default | Description
--- | --- | --- | ---
`position` | `String` | `'topright'` | *Inherited from L.Control.* The position of the control (one of the map corners). Possible values are `'topleft'`, `'topright'`, `'bottomleft'` or `'bottomright`.'
`load` | `String` \| `boolean` | `'load'` | HTML code for the load button. Use `false` to hide the button.
`download` | `String` \| `boolean` | `'download'` | HTML code for the download button. Use `false` to hide the button.
`clear` | `String` \| `boolean` | `'clear'` | HTML code for the clear button. Use `false` to hide the button.
`filename` | `String` | `'file'` | Default name for the exported files.
`format` | `String` | `'gpx'` | File format given to the exported files, currently only supports `'gpx'`.
`polylineOptions` | `Object` | `{ weight: 5 }` | Styling options for the displayed line, see [Leaflet doc](https://leafletjs.com/reference.html#polyline-option).
`anchorIconOptions` | `Object` | `{ iconUrl: 'img/marker.svg', iconSize: [12, 12] }` | Styling options for the displayed anchor points, see [Leaflet doc](https://leafletjs.com/reference.html#icon-option).
`routeProvider` | instance of `L.RouteProvider` | `L.routeProvider.straightLine()` | Specify the route provider to use.
`elevationProvider` | instance of `L.ElevationProvider` | `L.elevationProvider()` | Specify the elevation provider to use.
`onUpdate` | `function` | `function () {}` | Callback function called after each route update.

### L.RouteProvider

The simplest route provider, connecting the anchor points in straight line.
Extend this class to create a new route provider by providing your own implementation of `getRoute`.

### L.RouteProvider.StraightLine

Another simple route provider connecting the anchor points in straight line but adding intermediate GPS points between the anchor points.

Option | Type | Default | Description
--- | --- | --- | ---
`step` | `Number` | `10` | A parameter that controls the distance between the GPS points created on straight lines.

### L.RouteProvider.BRouter

Route provider for a [BRouter](https://github.com/abrensch/brouter) instance.

Option | Type | Default | Description
--- | --- | --- | ---
`domain` | `String` | no default value | The domain name of the BRouter server used.
`profile` | `String` | no default value | The routing profile used.

### L.RouteProvider.GraphHopper

Route provider for a [GraphHopper](https://www.graphhopper.com/) instance or [Routing API](https://docs.graphhopper.com/#tag/Routing-API).

Option | Type | Default | Description
--- | --- | --- | ---
`domain` | `String` | `'graphhopper.com'` | The domain name of the BRouter server used.
`profile` | `String` | `'bike'` | The routing profile used.
`token` | `String` \| `'boolean'` | `false` | Your GraphHopper access token or `false` if you host your own instance.

### L.RouteProvider.Mapbox

Route provider for the [Mapbox](https://www.mapbox.com/) [Directions API](https://docs.mapbox.com/api/navigation/directions/).

Option | Type | Default | Description
--- | --- | --- | ---
`profile` | `String` | `'cycling'` | The routing profile used.
`token` | `String` | no default value | Your Mapbox access token.

### L.RouteProvider.OSRM

Route provider for a [OSRM](https://project-osrm.org/) instance.

Option | Type | Default | Description
--- | --- | --- | ---
`domain` | `String` | no default value | The domain name of the OSRM server used.
`profile` | `String` | `'cycling'` | The routing profile used.

### L.ElevationProvider

Extend this class to create a new elevation provider by providing your own implementation of `setElevation`.

## Example

The example below adds a `RouteEditor` control with icons from [Font Awesome](https://fontawesome.com/) and routing provided by a [BRouter](https://github.com/abrensch/brouter) instance.
```javascript
let map = L.map('map').setView([50.85, 4.34], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.control.routeEditor({
    load: '<i class="fa-solid fa-upload"></i>',
    download: '<i class="fa-solid fa-download"></i>',
    clear: '<i class="fa-solid fa-trash"></i>',
    routeProvider: L.routeProvider.bRouter({
        domain: 'routing.gpx.studio',
        profile: 'all',
    })
}).addTo(map);
```
This code is used in the [demo](https://vcoppe.github.io/Leaflet.RouteEditor/).

## Styling

The buttons can be styled by adding CSS rules to the following classes:
- `leaflet-control-route-editor` for the buttons container
- `leaflet-control-route-editor-load` for the load button
- `leaflet-control-route-editor-download` for the download button
- `leaflet-control-route-editor-clear` for the clear button

On top of that, the line and the markers can be customized (see [Reference](#reference)).

## Contributing

Implementations of `L.RouteProvider` and `L.ElevationProvider` for well-known APIs are very welcome.
