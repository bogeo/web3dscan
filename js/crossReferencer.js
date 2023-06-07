class CrossReferencer 
{
      //JQuery-independent Method to load a local JSON-file.
      static readJSONFile(file){
        //In case of CORS-errors, read the following:
        //Due to updates on CORS standards/settings, EVERY local file is regarded as opaque and trying to acess it will throw an error.
        //See also: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default.
        //The suggested "easy" solution is to setup a simple Python(>2.7) http.server in the directory, see:
        //https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server,
        //which basically says to simple run "py -m http.server" in the command-line in the local root-folder - and the server is ready.
        //Then file = <filename> or file = <relative filepath from root-folder>
        //will enable the XMLHttpRequest-object to bypass the "CORS"-barrier. Quote from the sources above:
        //"As all files are served from the same scheme and domain (localhost) they all have the same origin, and do not trigger cross-origin errors."
        //
        //Create new request-object
        var rawFile = new XMLHttpRequest();
        //Make it a GET-request and put (local) filepath
        rawFile.open("GET", file, false);
        //send the request
        rawFile.send(null);
        //Get the response-text, parse it to JSON and return the JSON-Object.
        return JSON.parse(rawFile.responseText);
    }

    //Load the local file with the crossReference-Information
    static xRefJSON = CrossReferencer.readJSONFile("xReferencer.json");
    
    //For a given probe(-id) get all entities in the xRef-Source with the same probe(-id).
    //@return: an array with all found entities. Empty, if no such probe(-id).
    static getAllByProbe(probe){
      var items = this.xRefJSON.items;
      //Filter the extracted array by the given probe(-id)
      return items.filter(items => items.probe === probe);
    }
    
    //Get the Steckbrief-path for a given probe(-id)
    //@return: A string that represents the document-path of the Steckbrief.
    static steckbrief(probe) {
      var xRefs = this.getAllByProbe(probe);
      if (xRefs.length > 0){
        return CrossReferencer.docPath(xRefs[0].steckbrief);
      } else {
        return CrossReferencer.docPath('steckbrief');
      }
    }
    
    //Derive the document-path of a Steckbrief for a given modelname.
    //Used in method "steckbrief".
    static docPath(modelname) {
        return "./steckbriefe/" + modelname + ".xml"; 
    }
  
    //Get the 3ddata-path for a given probe(-id).
    //@return: A string that represents the document-path of the 3ddata.
    static scan3d(probe) {
      var xRefs = this.getAllByProbe(probe);
      if (xRefs.length > 0){
        return CrossReferencer.docPathScan3d(xRefs[0].scan3d);
      } else {
        return CrossReferencer.docPathScan3d('Handstueck_CS3_3D');
      }
    }
  
    //Derive the document-path of the 3dfile for a given modelname
    //Used in method "scan3d".
    static docPathScan3d(modelname) {
        //console.log(modelname);
        return "./models/" + modelname + ".glb";
    }
}