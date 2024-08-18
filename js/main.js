function main() {
    initMap();
    initMapControls();
    fetchHandstuecke();
    initModelViewer();
    // fetchProfile();
    /**es wird ein "leerer" steckbrief geladen der darüber informiert dass ein steckbrief angezeigt wird sobald ein handstück ausgewählt wird**/
    fetchProfile(0);
}

//call the main function
main();
