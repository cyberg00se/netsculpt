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

export { showInfo, setTray, onTrayMenuItemClicked, onWindowClose };
