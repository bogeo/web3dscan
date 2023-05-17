let map;
let layerControl;
let modelViewer;
let checkbox;

let lstPt;
let curId;

function initMap() {
  // set minZoom to 6 in order to prevent whole world zoom
  map = L.map("map", {
    minZoom: 6,
    zoomControl:false 
  }).setView([50.0348485, 8.2406363], 11);

  map.fitBounds([
    [49.3948229196, 7.7731704009],
    [51.6540496066, 10.2340156149],
  ]);

  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  // map.on('click', onMapClick);

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

function onEachFeature(feature, layer) {

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

  layer.on({

    // click: clickFeature
    click: function(e){
      // alert("Click!")
      // console.log(e.target)
      
      
      if (curId != layer.feature.properties.RWID && curId != null) {
        // alert("Neuer Punkt!")

        var classN = lstPt.defaultOptions.icon.options.className;

        var myIcon = L.icon({
          iconUrl: 'images/'+ classN +'.svg' 
        })
        lstPt.setIcon(myIcon)
        // console.log(lstPt.feature.properties.RWID)
        // console.log(e.target.feature.properties.RWID)
        
        
      }
      
      lstPt = e.target
      curId = layer.feature.properties.RWID;
      // console.log(curId);
      // console.log(e.target);

      var classN = e.target.defaultOptions.icon.options.className;

      var myIcon = L.icon({
        iconUrl: 'images/'+ classN +'_active.svg' 
      })

      // console.log(e.target);
      
      e.target.setIcon(myIcon);
  }
  });

}

// function onMapClick(){
  // console.log(layer.feature.properties)

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
        // style: function(feature){

        //   return L.marker({ icon: img })
        // },
        
        // transforms point marker to circle object
        pointToLayer: function (feature, latlng) {
          var img;
          var size;
          var clsName;
          var val = feature.properties.BLATTNR
          switch (true){
            case (val < 5000):
              img = 'images/stone.svg'
              size = 35
              clsName = 'stone'
              break;

            case (val > 5000 && val < 6000):
              img = 'images/fossil.svg'
              size = 28
              clsName = 'fossil'
              break;

            case (val > 6000):
              img = 'images/drill_core.svg'
              size = 35
              clsName = 'drill_core'
              break;
            default: 
              img = 'images/stone.svg'; 
              size = 28
              clsName = 'stone'
          }

          var icon = L.icon({
            iconUrl: img,
            iconSize: [size, size],
            className: clsName,
          })
          // var geojsonMarkerOptions = {
            
            // radius: 8,
          //   fillColor: "#ff0000",
          //   color: "#000",
          //   weight: 1,
          //   opacity: 1,
          //   fillOpacity: 0.6,
          // };

          return L.marker(latlng, { icon: icon });//geojsonMarkerOptions);
        },
        // onEachFeature: function (feature, layer) {
        //   var numbr = feature.properties.id
        //   // var objectName = layer["layer"]["feature"]["id"];
        //   // onEachFeature_asTable;
        //   layer.on({

        //   click: function(e){
        //     // alert("Click")

        //     // onEachFeature_asTable
        //   }
        // //   // does this feature have a property named popupContent?
        // //   if (feature.properties && feature.properties.RWID) {
        // //     let url_3d_scene = "...";
        // //     layer.bindPopup("<b>RWID</b>: " + feature.properties.RWID + "<br><b>Link zur 3D Szene</b>: " + url_3d_scene);
        // //   }
        // // alert("Click")
        
        //   });
        //   console.log("Clicked on object: " + numbr);
        // },
        onEachFeature: onEachFeature,
      }).addTo(map);

      layerControl.addOverlay(
        handstuecke_geoJSON.on("click", markerOnClick),
        "Handst&uuml;cke",
      );
    });
}
