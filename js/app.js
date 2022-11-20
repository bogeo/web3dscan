let map;
let layerControl;
let modelViewer;
let checkbox;

function initMap() {
  // set minZoom to 6 in order to prevent whole world zoom
  map = L.map("map", {
    minZoom: 6,
  }).setView([50.0348485, 8.2406363], 11);

  map.fitBounds([
    [49.3948229196, 7.7731704009],
    [51.6540496066, 10.2340156149],
  ]);
}

function initMapControls() {
  // Layer Control

  var osmTileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  const mapDiv = document.getElementById("map");

  resizeObserver.observe(mapDiv);

  // https://www.geoportal.hessen.de/mapbender/php/wms.php?inspire=1&layer_id=37745&withChilds=1&REQUEST=GetCapabilities&SERVICE=WMS
  var hessen_umring_wms = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_vg1000?",
    {
      layers: "vg1000_lan",
      format: "image/png",
      transparent: true,
      attribution:
        "Hessisches Landesamt für Bodenmanagement und Geoinformation",
    }
  );

  var hessen_rbz_wms = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_vg1000?",
    {
      layers: "vg1000_rbz",
      format: "image/png",
      transparent: true,
      attribution:
        "Hessisches Landesamt für Bodenmanagement und Geoinformation",
    }
  );

  var wms_dtk = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_dtk_klein?",
    {
      layers: "dtk",
      format: "image/png",
      transparent: true,
      attribution:
        "Dienstleistungszentrum des Bundes für Geoinformation und Geodäsie",
    }
  );

  // legend URL https://services.bgr.de/wms/geologie/gk1000/?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=0
  var wms_geologie = L.tileLayer.wms(
    "https://services.bgr.de/wms/geologie/gk1000/?",
    {
      layers: "0",
      format: "image/png",
      transparent: true,
      attribution: "Bundesanstalt für Geowissenschaften und Rohstoffe (BGR)",
    }
  );

  var baseLayers = {
    OpenStreetMap: osmTileLayer,
    "Digitale Topographische Karte": wms_dtk,
  };

  var overlays = {
    "Geologische Karte": wms_geologie,
    "Landesgrenze Hessen": hessen_umring_wms,
    "Regierungsbezirke Hessen": hessen_rbz_wms,
  };

  layerControl = L.control.layers(baseLayers, overlays).addTo(map);

  // Scale Control
  L.control
    .scale({
      maxWidth: 500,
      metric: true,
      imperial: false,
    })
    .addTo(map);

  // static content for attribution control
  let attributionControl = map.attributionControl;
  attributionControl.setPrefix("HLNUG");
}

function onEachFeature_asTable(feature, layer) {
  if (feature.properties) {
    let html =
      "<div class='table-responsive'><table class='table table-striped table-sm'>";

    html += "<thead>";

    html += "<tr>";
    html += "<th><b>Attributname</b></th>";
    html += "<th><b>Wert</b></th>";
    html += "</tr>";

    html += "</thead>";
    html += "<tbody>";

    for (const key in feature.properties) {
      if (Object.hasOwnProperty.call(feature.properties, key)) {
        const element = feature.properties[key];
        html += "<tr>";
        html += "<td>" + key + "</td>";
        html += "<td>" + element + "</td>";
        html += "</tr>";
      }
    }

    html += "</tbody>";
    html += "</table></div>";

    layer.bindPopup(html);
  } else {
    layer.bindPopup("No properties found");
  }
}

// a function where initial stuff can happen AFTER THE DOM WAS LOADED COMPLETELY
function onDomLoaded(event) {
  initMap();

  initMapControls();

  onMapClick();
}

// we should ensure that whole DOM is loaded before we init map container
// otherwise the code might be executed too early and the requird DOM node might not be present at that moment in time
document.addEventListener("DOMContentLoaded", onDomLoaded);
