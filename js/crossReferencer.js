class CrossReferencer 
{
    static steckbrief(probe) {
      switch (probe) {
        case '921':  return CrossReferencer.docPath('steckbrief');
        case '5761': return CrossReferencer.docPath('steckbrief2');
        default: return CrossReferencer.docPath('steckbrief'); 
      }
    }

    static docPath(modelname) {
        return "./steckbriefe/" + modelname + ".xml"; 
    }
  
    static scan3d(probe) {
        switch (probe) {
          case '921':  return CrossReferencer.docPathScan3d('Handstueck_CS3_3D');
          case '5761': return CrossReferencer.docPathScan3d('Astronaut');
          default: return CrossReferencer.docPathScan3d('Handstueck_CS3_3D');  
        }
    }
  
    static docPathScan3d(modelname) {
        //console.log(modelname);
        return "./models/" + modelname + ".glb";
    }
}