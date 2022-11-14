let map;
let layerControl;
let modelViewer;
let checkbox;


function initMap() {

  // set minZoom to 6 in order to prevent whole world zoom
  map = L.map('map', {
    minZoom: 6
  }).setView([50.0348485, 8.2406363], 11);

  map.fitBounds([
    [49.3948229196, 7.7731704009],
    [51.6540496066, 10.2340156149]
  ]);

}

function initMapControls() {
  // Layer Control

  var osmTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  const mapDiv = document.getElementById("map");

  resizeObserver.observe(mapDiv);

  // https://www.geoportal.hessen.de/mapbender/php/wms.php?inspire=1&layer_id=37745&withChilds=1&REQUEST=GetCapabilities&SERVICE=WMS
  var hessen_umring_wms = L.tileLayer.wms("https://sgx.geodatenzentrum.de/wms_vg1000?", {
    layers: 'vg1000_lan',
    format: 'image/png',
    transparent: true,
    attribution: "Hessisches Landesamt für Bodenmanagement und Geoinformation"
  });

  var hessen_rbz_wms = L.tileLayer.wms("https://sgx.geodatenzentrum.de/wms_vg1000?", {
    layers: 'vg1000_rbz',
    format: 'image/png',
    transparent: true,
    attribution: "Hessisches Landesamt für Bodenmanagement und Geoinformation"
  });

  var wms_dtk = L.tileLayer.wms("https://sgx.geodatenzentrum.de/wms_dtk_klein?", {
    layers: 'dtk',
    format: 'image/png',
    transparent: true,
    attribution: "Dienstleistungszentrum des Bundes für Geoinformation und Geodäsie"
  });

  // legend URL https://services.bgr.de/wms/geologie/gk1000/?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=0
  var wms_geologie = L.tileLayer.wms("https://services.bgr.de/wms/geologie/gk1000/?", {
    layers: '0',
    format: 'image/png',
    transparent: true,
    attribution: "Bundesanstalt für Geowissenschaften und Rohstoffe (BGR)"
  });

  var baseLayers = {
    "OpenStreetMap": osmTileLayer,
    "Digitale Topographische Karte": wms_dtk
  };

  var overlays = {
    "Geologische Karte": wms_geologie,
    "Landesgrenze Hessen": hessen_umring_wms,
    "Regierungsbezirke Hessen": hessen_rbz_wms
  };

  layerControl = L.control.layers(baseLayers, overlays).addTo(map);

  // Scale Control
  L.control.scale({
    maxWidth: 500,
    metric: true,
    imperial: false
  }).addTo(map);

  // static content for attribution control
  let attributionControl = map.attributionControl;
  attributionControl.setPrefix("HLNUG");




}

function onEachFeature_asTable(feature, layer) {
  if (feature.properties) {
    let html = "<div class='table-responsive'><table class='table table-striped table-sm'>";

    html += "<thead>"

    html += "<tr>";
    html += "<th><b>Attributname</b></th>"
    html += "<th><b>Wert</b></th>"
    html += "</tr>";

    html += "</thead>"
    html += "<tbody>"

    for (const key in feature.properties) {
      if (Object.hasOwnProperty.call(feature.properties, key)) {
        const element = feature.properties[key];
        html += "<tr>";
        html += "<td>" + key + "</td>"
        html += "<td>" + element + "</td>"
        html += "</tr>";
      }
    }

    html += "</tbody>"
    html += "</table></div>";

    layer.bindPopup(html);
  }
  else {
    layer.bindPopup("No properties found");
  }

}



function fetchHandstuecke() {
  // URL is 
  // https://kommonitor.fbg-hsbo.de/geoserver/web3d/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=web3d%3AHandstuecke_Auswahl&outputFormat=application%2Fjson&CRS=4326
  // if the CRS is not 4326 then we must make sure that returned GeoJSON uses EPSG:4326 as Leaflet requires coordinates in WPSG:4326

  // servec by GeoServer the dataset can be downloaded as GeoJSON. This is non-WFS-standardized dataformat and hence not available for all WFS services
  fetch('https://kommonitor.fbg-hsbo.de/geoserver/web3d/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=web3d%3AHandstuecke_Auswahl&outputFormat=application%2Fjson&CRS=4326')
    .then(response => response.json())
    .then(data => {
      // integrate WFS GeoJSON data into Leaflet app
      var handstuecke_geoJSON = L.geoJSON(data, {
        // transforms point marker to circle object
        pointToLayer: function (feature, latlng) {
          var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff0000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        // onEachFeature: function (feature, layer) {
        //   // does this feature have a property named popupContent?
        //   if (feature.properties && feature.properties.RWID) {
        //     let url_3d_scene = "...";
        //     layer.bindPopup("<b>RWID</b>: " + feature.properties.RWID + "<br><b>Link zur 3D Szene</b>: " + url_3d_scene);

        //   }
        // },
        onEachFeature: onEachFeature_asTable
      }).addTo(map);
      layerControl.addOverlay(handstuecke_geoJSON.on("click", markerOnClick), "Handst&uuml;cke");
    });
}

async function  markerOnClick(layer) {

  // Id of the object that was clicked, the one responding to the small red circle on the map that 
  // we have clicked on
  var objectName = layer["layer"]["feature"]["id"];

  // Changing the model-viewers 3d file source with the model named like the id of the red circle.
  // Models correspond to a red circle by its id and their name.
  var modelViewer = document.getElementById("hotspot-camera")
  modelViewer.style.visibility= "visible";
  modelViewer.src="./models/Astronaut.glb";
  modelViewer.onerror = function(){
    modelViewer.style.visibility= "hidden";
    document.getElementById("hotspot-camera").src="";
  };

  // Loading the Steckbrief with the right file name (identical to the 3d model loading on click).
  loadSteckbrief(objectName);


  console.log("Clicked on object: "+objectName);
}

function initModelViewer() {
  modelViewer = document.querySelector("#hotspot-camera");

  checkbox = modelViewer.querySelector('#show-dimensions');

  checkbox.addEventListener('change', () => {
    modelViewer.querySelectorAll('button').forEach((hotspot) => {
      if (checkbox.checked) {
        hotspot.classList.remove('hide');
      } else {
        hotspot.classList.add('hide');
      }
    });
  });
  modelViewer.addEventListener('load', () => {
    const center = modelViewer.getCameraTarget();
    const size = modelViewer.getDimensions();
    const x2 = size.x / 2;
    const y2 = size.y / 2;
    const z2 = size.z / 2;

    modelViewer.updateHotspot({
      name: 'hotspot-dot+X-Y+Z',
      position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`
    });

    modelViewer.updateHotspot({
      name: 'hotspot-dim+X-Y',
      position: `${center.x + x2} ${center.y - y2} ${center.z}`
    });
    modelViewer.querySelector('button[slot="hotspot-dim+X-Y"]').textContent =
      `${(size.z * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: 'hotspot-dot+X-Y-Z',
      position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`
    });

    modelViewer.updateHotspot({
      name: 'hotspot-dim+X-Z',
      position: `${center.x + x2} ${center.y} ${center.z - z2}`
    });
    modelViewer.querySelector('button[slot="hotspot-dim+X-Z"]').textContent =
      `${(size.y * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: 'hotspot-dot+X+Y-Z',
      position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`
    });

    modelViewer.updateHotspot({
      name: 'hotspot-dim+Y-Z',
      position: `${center.x} ${center.y + y2} ${center.z - z2}`
    });
    modelViewer.querySelector('button[slot="hotspot-dim+Y-Z"]').textContent =
      `${(size.x * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: 'hotspot-dot-X+Y-Z',
      position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`
    });

    modelViewer.updateHotspot({
      name: 'hotspot-dim-X-Z',
      position: `${center.x - x2} ${center.y} ${center.z - z2}`
    });
    modelViewer.querySelector('button[slot="hotspot-dim-X-Z"]').textContent =
      `${(size.y * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: 'hotspot-dot-X-Y-Z',
      position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`
    });

    modelViewer.updateHotspot({
      name: 'hotspot-dim-X-Y',
      position: `${center.x - x2} ${center.y - y2} ${center.z}`
    });
    modelViewer.querySelector('button[slot="hotspot-dim-X-Y"]').textContent =
      `${(size.z * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: 'hotspot-dot-X-Y+Z',
      position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`
    });
  });
}

// a function where initial stuff can happen AFTER THE DOM WAS LOADED COMPLETELY
function onDomLoaded(event) {

  initMap();

  initMapControls();

  fetchHandstuecke();

  initModelViewer();
  
  onMapClick();

}

// we should ensure that whole DOM is loaded before we init map container
// otherwise the code might be executed too early and the requird DOM node might not be present at that moment in time
document.addEventListener("DOMContentLoaded", onDomLoaded);