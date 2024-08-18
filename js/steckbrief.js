//alte Implementierung

/*function fetchProfile() {
  console.log("Steckbriefe");
  // fetch-Aufruf mit Pfad zur XML-Datei
  fetch("./steckbriefe/steckbrief.xml")
    .then(function (response) {
      // Antwort kommt als Text-String
      return response.text();
    })
    .then(function (data) {
      console.log(data); // schnell mal in der Konsole checken

      // jetzt HTML Element holen
      const div = document.getElementById("steckbrief");
      console.log("div: " + div);

      // String in ein XML-DOM-Objekt umwandeln
      let parser = new DOMParser(),
        xmlDoc = parser.parseFromString(data, "text/xml");

      //und noch ein paar Test-Ausgaben in die Konsole
      console.log(xmlDoc.getElementsByTagName("item"));
      //console.log ("item "  + xmlDoc.getElementsByTagName ('item')[1].children[0].textContent);
      console.log(xmlDoc);
      //alert(div);
      div.innerHTML = data;
    })
    .catch(function (error) {
      console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });
}

function fetchProfile(steckbriefName) {
  console.log("Steckbriefe(" + steckbriefName + ")");
  // fetch-Aufruf mit Pfad zur XML-Datei
  fetch(steckbriefName)
    .then(function (response) {
      // Antwort kommt als Text-String
      return response.text();
    })
    .then(function (data) {
//      console.log(data); // schnell mal in der Konsole checken

      // jetzt HTML Element holen
      const div = document.getElementById("steckbrief");
      console.log("div: " + div);

      // String in ein XML-DOM-Objekt umwandeln
      let parser = new DOMParser(),
        xmlDoc = parser.parseFromString(data, "text/xml");

      //und noch ein paar Test-Ausgaben in die Konsole
//      console.log(xmlDoc.getElementsByTagName("item"));
      //console.log ("item "  + xmlDoc.getElementsByTagName ('item')[1].children[0].textContent);
//      console.log(xmlDoc);
      //alert(div);
      div.innerHTML = data;
    })
    .catch(function (error) {
      console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });
}

//Methode mit der der Steckbrief als Tabelle in das jeweilige fenster geschrieben wird. Die Daten sind die Daten die der WFS uns zurück gibt.
function fetchProfileTable(obj) {
  let tableString = "<h3 style='padding-left: 40px;'>Steckbrief</h3><table>";
  if (obj === 0) document.getElementById("steckbrief").innerHTML = "<div>Kein Handstück ausgewählt</div>";
  else {
    for (let oneObj in obj["properties"]){
      if (obj["properties"][oneObj] !== "")
      {
        tableString = tableString + "<tr><td style='background-color: lightgray'>"+oneObj+"</td><td>"+obj["properties"][oneObj]+"</td></tr>";
      }
    }
    tableString = tableString + "</table>";
    document.getElementById("steckbrief").innerHTML = tableString;
  }
}*/


// neue Implementierung
function fetchProfile(steckbriefName) {
  const div = document.getElementById("steckbrief");

  if (!steckbriefName) {
    div.innerHTML = "<div>Kein Handstück ausgewählt</div>";
    return;
  }

  fetch(steckbriefName, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) throw new Error("Kein Steckbrief vorhanden");
      return fetch(steckbriefName).then(res => res.text());
    })
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");

      const title = xmlDoc.querySelector("Titel").textContent;
      const bezeichnung = xmlDoc.querySelector("Objekt-Bezeichnung").textContent;
      const sammlungsnummer = xmlDoc.querySelector("HLNUG-Sammlungsnummer").textContent;
      const fundort = xmlDoc.querySelector("Fundort > value").textContent;
      const alter = xmlDoc.querySelector("Alter-GeologischeEinheit > value").textContent;
      const beschreibung = xmlDoc.querySelector("Beschreibung > value").textContent;

      return fetchWFSData().then(wfsData => {
        const korrigierteSammlungsnummer = sammlungsnummer.replace(/_/g, "-").trim();
        const matchingFeature = wfsData.features.find(feature => feature.properties.NR.trim() === korrigierteSammlungsnummer);

        const coordinates = matchingFeature ? matchingFeature.geometry.coordinates.join(", ") : "Nicht verfügbar";
        const art = matchingFeature ? matchingFeature.properties.Art : "Nicht verfügbar";

        div.innerHTML = generateProfileHTML(title, bezeichnung, sammlungsnummer, fundort, coordinates, art, alter, beschreibung);
      });
    })
    .catch(error => {
      console.error("Fehler:", error);
      div.innerHTML = "<div>Kein Steckbrief vorhanden</div>";
    });
}

function generateProfileHTML(title, bezeichnung, sammlungsnummer, fundort, coordinates, art, alter, beschreibung) {
  return `
    <table>
      <tr><td class="header" colspan="2">${title}</td></tr>
      <tr><td class="label">Bezeichnung</td><td class="value">${bezeichnung}</td></tr>
      <tr><td class="label">Sammlungsnummer</td><td class="value">${sammlungsnummer}</td></tr>
      <tr><td class="label">Fundort</td><td class="value">${fundort}</td></tr>
      <tr><td class="label">Koordinaten des Fundortes</td><td class="value">${coordinates}</td></tr>
      <tr><td class="label">Art</td><td class="value">${art}</td></tr>
      <tr><td class="label">Epoche</td><td class="value">${alter}</td></tr>
      <tr><td class="label">Kurzbeschreibung</td><td class="value">${beschreibung}</td></tr>
    </table>
  `;
}

function fetchWFSData() {
  const wfsURL = 'https://kommonitor.fbg-hsbo.de/geoserver/web3d/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=web3d%3Ahandstuecke_ss24&outputFormat=application%2Fjson&srsName=EPSG:4326';

  return fetch(wfsURL)
    .then(response => response.json())
    .catch(error => {
      console.error("Fehler beim Abrufen der WFS-Daten:", error);
      return { features: [] };  // Leeres Array als Fallback
    });
}
