

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

/**Methode mit der der Steckbrief als Tabelle in das jeweilige fenster geschrieben wird. Die Daten sind die Daten die der WFS uns zurück gibt.**/
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
}
