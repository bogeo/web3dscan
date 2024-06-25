let map;
let layerControl;
let modelViewer;
let checkbox;

// object of the last selected feature
let lstPt;

// leaflet id of the current selected feature
let curId;

// initialize map
function initMap() {

  // set minZoom to 6 in order to prevent whole world zoom
  map = L.map("map", {
    minZoom: 6,
    zoomControl: false
  }).setView([50.0348485, 8.2406363], 11);

  // current extent
  map.fitBounds([
    [49.3948229196, 7.7731704009],
    [51.6540496066, 10.2340156149],
  ]);

  // add zoom Control
  L.control.zoom({
    position: 'topright'
  }).addTo(map);
}

function initMapControls() {
  // Layer Control

  var osmTileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  ).addTo(map);

  const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
  });
  const mapDiv = document.getElementById("map");

  resizeObserver.observe(mapDiv);

  // https://www.geoportal.hessen.de/mapbender/php/wms.php?inspire=1&layer_id=37745&withChilds=1&REQUEST=GetCapabilities&SERVICE=WMS
  var hessen_umring_wms = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_vg1000?", {
      layers: "vg1000_lan",
      format: "image/png",
      transparent: true,
      attribution: "Hessisches Landesamt für Bodenmanagement und Geoinformation",
    }
  ).addTo(map); // Die Landesgrenzen von Hessen beim Anwendungsstart darstellen

  var hessen_rbz_wms = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_vg1000?", {
      layers: "vg1000_rbz",
      format: "image/png",
      transparent: true,
      attribution: "Hessisches Landesamt für Bodenmanagement und Geoinformation",
    }
  );

  var wms_dtk = L.tileLayer.wms(
    "https://sgx.geodatenzentrum.de/wms_dtk_klein?", {
      layers: "dtk",
      format: "image/png",
      transparent: true,
      attribution: "Dienstleistungszentrum des Bundes für Geoinformation und Geodäsie",
    }
  );

  // legend URL https://services.bgr.de/wms/geologie/gk1000/?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=0
  var wms_geologie = L.tileLayer.wms(
    "https://services.bgr.de/wms/geologie/gk1000/?", {
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

// create Icons of each point in the map
function pointIcons(classN, imgUrl) {

  // drill core and stone icons displayed larger than fossil icons
  if (classN != 'fossil') {
    size = 35
  } else {
    size = 28
  }

  // create point with url, size and className
  var pointIcon = L.Icon.extend({
    options: {
      iconUrl: imgUrl,
      iconSize: [size, size],
      className: classN //used to distinguish symbols
    }
  });

  return pointIcon;
}

// for each feature, this function will be called
function onEachFeature(feature, layer) {

  // generate Pop Up of the feature
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

    // to display the Popup, uncomment this:
    // layer.bindPopup(html);

  } else {
    layer.bindPopup("No properties found");
  }

  layer.on({

    click: function (e) {

      // current id must be different to the last clicked id
      if (curId != e.target._leaflet_id && curId != null) {

        // Classname of the icon
        var classN_last = lstPt.defaultOptions.icon.options.className;

        // create Icon
        var myIcon = pointIcons(classN_last, 'images/' + classN_last + '.svg')
        var lastIcon = new myIcon()

        // original icon wil be set to the last selected point 
        lstPt.setIcon(lastIcon)
      }

      // last Point = current selected point
      lstPt = e.target

      // current id = unique id of each feature
      curId = e.target._leaflet_id;

      // current Classname
      var classN_cur = e.target.defaultOptions.icon.options.className;

      // create icon for the original point
      var myIcon2 = pointIcons(classN_cur, 'images/' + classN_cur + '_active.svg')
      var curIcon = new myIcon2()

      // set created icon
      e.target.setIcon(curIcon);
    }
  });
}

// readout WFS and add features to map
function fetchHandstuecke() {
  // URL is
  // https://kommonitor.fbg-hsbo.de/geoserver/web3d/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=web3d%3AHandstuecke_Auswahl&outputFormat=application%2Fjson&CRS=4326
  // if the CRS is not 4326 then we must make sure that returned GeoJSON uses EPSG:4326 as Leaflet requires coordinates in WPSG:4326

  // servec by GeoServer the dataset can be downloaded as GeoJSON. This is non-WFS-standardized dataformat and hence not available for all WFS services
  fetch(
      "https://kommonitor.fbg-hsbo.de/geoserver/web3d/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=web3d%3AHandstuecke_Auswahl&outputFormat=application%2Fjson&CRS=4326"
    )
    .then((response) => response.json())
    .then((data) => {

      // integrate WFS GeoJSON data into Leaflet app
      var handstuecke_geoJSON = L.geoJSON(data, {

        // add features to map
        pointToLayer: function (feature, latlng) {

          /* *OLD IMPLEMENTATION*
          // TODO temporarily to display diffenrent icons, the right attribute must be added to the WFS
          // value = last character in WFS attribute "PROBE"
          // 0-2 = stone; 3-6 = fossil; 7-9 = drill core
          var val = parseInt(feature.properties.PROBE.slice(-1));

          // switch case to symbolize the features with the right icon
          switch (true) {
            case (val < 3):
              imgUrl = 'images/stone.svg'
              clsName = 'stone'
              break;

            case (val > 2 && val < 7):
              imgUrl = 'images/fossil.svg'
              clsName = 'fossil'
              break;

            case (val > 6):
              imgUrl = 'images/drill_core.svg'
              clsName = 'drill_core'
              break;

            default:
              console.log(val)
              imgUrl = 'images/stone.svg';
              clsName = 'stone'
          }
          */

          // type of feature (Gestein, Fossil, Bohrkern, unbekannt (by default Gestein))
          var type = feature.properties.Art;
          
          // switch case to symbolize the features with the right icon
          switch (true) {
            case (type === 'Gestein'):
              imgUrl = 'images/stone.svg'
              clsName = 'stone'
              break;

            case (type === 'Fossil'):
              imgUrl = 'images/fossil.svg'
              clsName = 'fossil'
              break;

            case (type === 'Bohrkern'):
              imgUrl = 'images/drill_core.svg'
              clsName = 'drill_core'
              break;

            default:
              console.log(type)
              imgUrl = 'images/stone.svg';
              clsName = 'stone'
          }
          
          // call function to get the icon
          var icon = pointIcons(clsName, imgUrl)
          var myIcon = new icon()

          // return marker with coordinates and icon
          return L.marker(latlng, {
            icon: myIcon
          });
        },

        // //   // does this feature have a property named popupContent?
        // //   if (feature.properties && feature.properties.RWID) {
        // //     let url_3d_scene = "...";
        // //     layer.bindPopup("<b>RWID</b>: " + feature.properties.RWID + "<br><b>Link zur 3D Szene</b>: " + url_3d_scene);
        // //   }
        
        // on each feature fuction "onEachFeature" will be called
        onEachFeature: onEachFeature,

        // all events added to the map
      }).addTo(map);

      layerControl.addOverlay(
        handstuecke_geoJSON.on("click", markerOnClick),
        "Handst&uuml;cke",
      );
    });
}
