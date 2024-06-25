async function markerOnClick(layer) {
  // Id of the object that was clicked, the one responding to the small red circle on the map that
  // we have clicked on
  var objectName = layer["layer"]["feature"]["id"];

  // Changing the model-viewers 3d file source with the model named like the id of the red circle.
  // Models correspond to a red circle by its id and their name.
  var modelViewer = document.getElementById("hotspot-camera");
  modelViewer.style.visibility = "visible";
 
  var id = layer["layer"]["feature"].properties.NR;
  modelViewer.src = CrossReferencer.scan3d(id);
  console.log("id: " + id + " -> scan3d: " + modelViewer.src);
  console.log("id: " + id + " -> steckbrief: " + CrossReferencer.steckbrief(id));
  //fetchProfile(CrossReferencer.steckbrief(id));
  /**es wird der steckbrief geladen zu dem angeklickten feature**/
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
  const modelViewer = document.querySelector("#hotspot-camera");
  const checkboxShowDimensions = modelViewer.querySelector("#show-dimensions");
  //Set "Show Dimensions" initially to flase/unchecked;
  checkboxShowDimensions.checked = false;

  //Function to show/hide the dimension-elements in the model-viewer (used below)
  function setVisibility(element) {
    if (checkboxShowDimensions.checked) {
      //alert("TEST! CHECKED!");
      element.classList.remove('hide');
    } else {
      //alert("TEST! UNCHECKED!");
      element.classList.add('hide');
    }
  }

  //Add the show/hide-Dimensions event to the checkbox
  checkboxShowDimensions.addEventListener("change", () => {
    //<!--BEGIN prepare measuring-lines-->
    setVisibility(modelViewer.querySelector('#dimLines'));
    //<!--END prepare measuring-lines-->
    modelViewer.querySelectorAll('button:not([notHideWithDimensions])').forEach((hotspot) => {
      setVisibility(hotspot);
    });
  });

  //<!--BEGIN prepare measuring-lines-->
  // update svg
  function drawLine(svgLine, dotHotspot1, dotHotspot2, dimensionHotspot) {
    if (dotHotspot1 && dotHotspot2) {
      svgLine.setAttribute('x1', dotHotspot1.canvasPosition.x);
      svgLine.setAttribute('y1', dotHotspot1.canvasPosition.y);
      svgLine.setAttribute('x2', dotHotspot2.canvasPosition.x);
      svgLine.setAttribute('y2', dotHotspot2.canvasPosition.y);

      // use provided optional hotspot to tie visibility of this svg line to
      if (dimensionHotspot && !dimensionHotspot.facingCamera) {
        svgLine.classList.add('hide');
      }
      else {
        svgLine.classList.remove('hide');
      }
    }
  }

  const dimLines = modelViewer.querySelectorAll('line');

  const renderSVG = () => {
    drawLine(dimLines[0], modelViewer.queryHotspot('hotspot-dot+X-Y+Z'), modelViewer.queryHotspot('hotspot-dot+X-Y-Z'), modelViewer.queryHotspot('hotspot-dim+X-Y'));
    drawLine(dimLines[1], modelViewer.queryHotspot('hotspot-dot+X-Y-Z'), modelViewer.queryHotspot('hotspot-dot+X+Y-Z'), modelViewer.queryHotspot('hotspot-dim+X-Z'));
    drawLine(dimLines[2], modelViewer.queryHotspot('hotspot-dot+X+Y-Z'), modelViewer.queryHotspot('hotspot-dot-X+Y-Z'), modelViewer.queryHotspot('hotspot-dim+Y-Z')); // remove last argument to make this line always visible
    drawLine(dimLines[3], modelViewer.queryHotspot('hotspot-dot-X+Y-Z'), modelViewer.queryHotspot('hotspot-dot-X-Y-Z'), modelViewer.queryHotspot('hotspot-dim-X-Z'));
    drawLine(dimLines[4], modelViewer.queryHotspot('hotspot-dot-X-Y-Z'), modelViewer.queryHotspot('hotspot-dot-X-Y+Z'), modelViewer.queryHotspot('hotspot-dim-X-Y'));
  };

  modelViewer.addEventListener('camera-change', renderSVG);
  //<!--END prepare measuring-lines-->

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
    ).textContent = `${(size.z.toFixed(0))} mm`;

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
    ).textContent = `${(size.y.toFixed(0))} mm`;

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
    ).textContent = `${(size.x.toFixed(0))} mm`;

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
    ).textContent = `${(size.y.toFixed(0))} mm`;

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
    ).textContent = `${(size.z.toFixed(0))} mm`;

    modelViewer.updateHotspot({
      name: "hotspot-dot-X-Y+Z",
      position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`,
    });
  
  //Initial call of rendering the measuring-lines
  renderSVG();

  let material = modelViewer.model.materials[0];
  material.pbrMetallicRoughness.setMetallicFactor(1);
  material.pbrMetallicRoughness.setRoughnessFactor(1);

  let metalnessDisplay = document.querySelector("#metalness-value");
  let roughnessDisplay = document.querySelector("#roughness-value");

  metalnessDisplay.textContent = material.pbrMetallicRoughness.metallicFactor;
  roughnessDisplay.textContent = material.pbrMetallicRoughness.roughnessFactor;
 
  document.querySelector('#metalness').addEventListener('input', (event) => {
    material.pbrMetallicRoughness.setMetallicFactor(event.target.value);
    metalnessDisplay.textContent = event.target.value;
  });

  document.querySelector('#roughness').addEventListener('input', (event) => {
    material.pbrMetallicRoughness.setRoughnessFactor(event.target.value);
    roughnessDisplay.textContent = event.target.value;
  });

  // neutrale Beleuchtungsumgebung
  const checkbox = document.querySelector('#neutral');
  
  checkbox.addEventListener('change',() => {
    modelViewer.environmentImage = checkbox.checked ? '' : 'legacy';
  });
  //Textur wechseln
  const createAndApplyTexture = async (channel, event) => {
    if (event.target.value == "mit Textur") {
      // Clears the texture.
      material[channel].setTexture(null);
      material.pbrMetallicRoughness['baseColorTexture'].setTexture(null);
    }else if (event.target.value) {
      
      // Creates a new texture.
      const texture = await modelViewer.createTexture(event.target.value);
      material.pbrMetallicRoughness['baseColorTexture'].setTexture(texture)
   }
  }
    document.querySelector('#normals2').addEventListener('input', (event) => {
     createAndApplyTexture('normalTexture', event);
    });

  //Farbe wechseln
  document.querySelector('#color-controls').addEventListener('click', (event) => {
    const colorString = event.target.dataset.color;
    const [material] = modelViewer.model.materials;
    material.pbrMetallicRoughness.setBaseColorFactor(colorString);
  });
  });
}

