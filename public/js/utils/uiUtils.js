function showInfo() {
    document.getElementById('server-port').textContent = NL_PORT;
    document.getElementById('os-info').textContent = NL_OS;
    document.getElementById('app-id').textContent = NL_APPID;
    document.getElementById('server-version').textContent = NL_VERSION;
    document.getElementById('client-version').textContent = NL_CVERSION;
}

function setTray() {
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {id: "VERSION", text: "Get version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };
    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch(event.detail.id) {
        case "VERSION":
            Neutralino.os.showMessageBox("Version information",
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
    Neutralino.app.exit();
}

function appendOptions(values, element) {
    values.forEach(item => {
      const option = document.createElement("option");
      option.text = item;
      option.value = item;
      element.append(option);
    });
}

function removeOptions(element) {
    const lastIndex = element.multiple ? 0 : 1;
    for (let i = element.childNodes.length - 1; i > lastIndex; i--) {
        const child = element.childNodes[i];
        element.removeChild(child);
    }
}

export { showInfo, setTray, onTrayMenuItemClicked, onWindowClose, appendOptions, removeOptions };
