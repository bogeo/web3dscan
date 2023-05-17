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
    ).textContent = `${(size.z.toFixed(0))} cm`;

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
    ).textContent = `${(size.y.toFixed(0))} cm`;

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
    ).textContent = `${(size.x.toFixed(0))} cm`;

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
    ).textContent = `${(size.y.toFixed(0))} cm`;

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
    ).textContent = `${(size.z.toFixed(0))} cm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot-X-Y+Z",
      position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`,
    });
  });
}

