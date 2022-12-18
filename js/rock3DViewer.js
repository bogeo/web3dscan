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
        // transforms point marker to circle object
        pointToLayer: function (feature, latlng) {
          var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff0000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6,
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
        onEachFeature: onEachFeature_asTable,
      }).addTo(map);
      layerControl.addOverlay(
        handstuecke_geoJSON.on("click", markerOnClick),
        "Handst&uuml;cke"
      );
    });
}

async function markerOnClick(layer) {
  // Id of the object that was clicked, the one responding to the small red circle on the map that
  // we have clicked on
  var objectName = layer["layer"]["feature"]["id"];

  // Changing the model-viewers 3d file source with the model named like the id of the red circle.
  // Models correspond to a red circle by its id and their name.
  var modelViewer = document.getElementById("hotspot-camera");
  modelViewer.style.visibility = "visible";
 
  var id = layer["layer"]["feature"].properties.PROBE;
  modelViewer.src = CrossReferencer.scan3d(id);
  console.log("id: " + id + " -> scan3d: " + modelViewer.src);
  console.log("id: " + id + " -> steckbrief: " + CrossReferencer.steckbrief(id));
  fetchProfile(CrossReferencer.steckbrief(id));

  modelViewer.onerror = function () {
    modelViewer.style.visibility = "hidden";
    document.getElementById("hotspot-camera").src = "";
  };

  // Loading the Steckbrief with the right file name (identical to the 3d model loading on click).
  //loadSteckbrief(objectName);

  console.log("Clicked on object: " + objectName);
}

function initModelViewer() {
  modelViewer = document.querySelector("#hotspot-camera");
  checkbox = modelViewer.querySelector("#show-dimensions");
  checkbox.addEventListener("change", () => {
    modelViewer.querySelectorAll("button").forEach((hotspot) => {
      if (checkbox.checked) {
        hotspot.classList.remove("hide");
      } else {
        hotspot.classList.add("hide");
      }
    });
  });
  modelViewer.addEventListener("load", () => {
    const center = modelViewer.getCameraTarget();
    const size = modelViewer.getDimensions();
    const x2 = size.x / 2;
    const y2 = size.y / 2;
    const z2 = size.z / 2;

    modelViewer.updateHotspot({
      name: "hotspot-dot+X-Y+Z",
      position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`,
    });

    modelViewer.updateHotspot({
      name: "hotspot-dim+X-Y",
      position: `${center.x + x2} ${center.y - y2} ${center.z}`,
    });
    modelViewer.querySelector(
      'button[slot="hotspot-dim+X-Y"]'
    ).textContent = `${(size.z * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot+X-Y-Z",
      position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`,
    });

    modelViewer.updateHotspot({
      name: "hotspot-dim+X-Z",
      position: `${center.x + x2} ${center.y} ${center.z - z2}`,
    });
    modelViewer.querySelector(
      'button[slot="hotspot-dim+X-Z"]'
    ).textContent = `${(size.y * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot+X+Y-Z",
      position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`,
    });

    modelViewer.updateHotspot({
      name: "hotspot-dim+Y-Z",
      position: `${center.x} ${center.y + y2} ${center.z - z2}`,
    });
    modelViewer.querySelector(
      'button[slot="hotspot-dim+Y-Z"]'
    ).textContent = `${(size.x * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot-X+Y-Z",
      position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`,
    });

    modelViewer.updateHotspot({
      name: "hotspot-dim-X-Z",
      position: `${center.x - x2} ${center.y} ${center.z - z2}`,
    });
    modelViewer.querySelector(
      'button[slot="hotspot-dim-X-Z"]'
    ).textContent = `${(size.y * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot-X-Y-Z",
      position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`,
    });

    modelViewer.updateHotspot({
      name: "hotspot-dim-X-Y",
      position: `${center.x - x2} ${center.y - y2} ${center.z}`,
    });
    modelViewer.querySelector(
      'button[slot="hotspot-dim-X-Y"]'
    ).textContent = `${(size.z * 100).toFixed(0)} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot-X-Y+Z",
      position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`,
    });
  });
}

