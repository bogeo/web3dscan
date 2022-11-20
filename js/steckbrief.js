const div = document.getElementById("steckbrief");
console.log("div: " + div);

function fetchProfile() {
  console.log("Steckbriefe");
  // fetch-Aufruf mit Pfad zur XML-Datei
  fetch("./steckbriefe/steckbrief.xml")
    .then(function (response) {
      // Antwort kommt als Text-String
      return response.text();
    })
    .then(function (data) {
      console.log(data); // schnell mal in der Konsole checken

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
