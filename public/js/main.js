import * as onnxParser from './parsers/onnxParser.js';
import * as tensorflowParser from './parsers/tensorflowParser.js';
import * as render from './render.js';

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

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

if(NL_OS != "Darwin") {
    setTray();
}

showInfo();

document.getElementById("open-file-input").addEventListener("change", function(event) {
    var file = event.target.files[0];

    if (file.type === "application/onnx" || file.name.endsWith(".onnx")) {
        onnxParser.parseONNXModelFromFile(file)
            .then(result => {
                render.renderNeuralNetworkModel(result);
            })
            .catch(error => {
                console.error(error);
            });
    } else if (file.type === "application/tf" || file.name.endsWith(".pb")) {
        tensorflowParser.parseTensorFlowModelFromFile(file)
            .then(result => {
                render.renderNeuralNetworkModel(result);
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        console.error("Unsupported file type: " + file.type);
    }
});
