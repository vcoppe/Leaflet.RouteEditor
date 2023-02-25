# Leaflet.RouteEditor

Minimalist Leaflet plugin to edit GPS traces.

Check the [demo](https://vcoppe.github.io/Leaflet.RouteEditor/)!

## Requirements

Developed with Leaflet 1.9.3 but so simple it probably works with other versions too.

## Usage

Simply add the single file from the `dist` folder to your project like below.

```html
<script src="https://unpkg.com/leaflet-route-editor@0.0.0/dist/L.Control.RouteEditor.min.js"></script>
```

## Reference

### L.Control.RouteEditor
Option | Type | Default | Description
--- | --- | --- | ---
`position` | `String` | `'topright'` | *Inherited from L.Control.* The position of the control (one of the map corners). Possible values are `'topleft'`, `'topright'`, `'bottomleft'` or `'bottomright`.'
`load` | `String` | `'load'` | HTML code for the load button. Use `undefined` or `null` to hide the button.
`download` | `String` | `'download'` | HTML code for the download button. Use `undefined` or `null` to hide the button.
`clear` | `String` | `'clear'` | HTML code for the clear button. Use `undefined` or `null` to hide the button.
`filename` | `String` | `'file'` | Default name for the exported files.
`format` | `String` | `'gpx'` | File format given to the exported files, currently only supports `'gpx'`.
`polylineOptions` | `Object` | `{ weight: 5 }` | Styling options for the displayed line, see [Leaflet doc](https://leafletjs.com/reference.html#polyline-option).
`anchorIconOptions` | `Object` | `{ iconUrl: 'img/marker.svg', iconSize: [12, 12] }` | Styling options for the displayed anchor points, see [Leaflet doc](https://leafletjs.com/reference.html#icon-option).
`routeProvider` | instance of `L.RouteProvider` | `L.routeProvider.straightLine()` | Specify the route provider to use.
`elevationProvider` | instance of `L.ElevationProvider` | `L.elevationProvider()` | Specify the elevation provider to use.
`onUpdate` | `function` | `function () {}` | Callback function called after each route update.

### L.RouteProvider.StraightLine
Option | Type | Default | Description
--- | --- | --- | ---
`step` | `Number` | `10` | A parameter that controls the distance between the GPS points created on straight lines.

### L.RouteProvider.BRouter
Option | Type | Default | Description
--- | --- | --- | ---
`domain` | `String` | no default value | The domain name of the BRouter server used.
`profile` | `String` | no default value | The routing profile used.

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

On top of that, the line and the markers can be customized (see Reference).
