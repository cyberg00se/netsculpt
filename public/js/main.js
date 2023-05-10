import * as render from './render.js';
import * as parser from './parsers/parser.js';
import { Node, onnxNodeTypes, tensorflowNodeTypes } from "./models/Node.js";
import { ModelType } from './models/NeuralNetworkModel.js';

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

let currentModel;

document.getElementById("open-file-input").addEventListener("change", function(event) {
    const file = event.target.files[0];

    parser.parseModelFromFile(file)
        .then(result => {
            currentModel = result;
            render.renderNeuralNetworkModel(currentModel);
        })
        .catch(error => {
            console.error(error);
        });
});

document.getElementById("add-node-btn").addEventListener("click", function(event) {
    if (!currentModel) {
        return;
    }

    const possibleInputs = currentModel.getNodesIds();
    const possibleOutputs = currentModel.getNodesIds();
    let possibleTypes = [];
    switch (currentModel.type) {
        case ModelType.ONNX:
          possibleTypes = onnxNodeTypes;
          break;
        case ModelType.TENSORFLOW:
          possibleTypes = tensorflowNodeTypes;
          break;
        default:
          possibleTypes = [];
          break;
      }

    var modal = document.getElementById("add-node-modal");
    var btn = document.getElementById("add-node");
    var close = document.getElementById("add-node-close");

    var typeSelect = document.getElementById("add-node-node-type");
    var inputSelect = document.getElementById("add-node-node-input");
    var outputSelect = document.getElementById("add-node-node-output");

    for(const type of possibleTypes){
        var option = document.createElement("option");
        option.text = type;
        option.value = type;
        typeSelect.append(option);
    }
    for(const input of possibleInputs){
        var option = document.createElement("option");
        option.text = input;
        option.value = input;
        inputSelect.append(option);
    }
    for(const output of possibleOutputs){
        var option = document.createElement("option");
        option.text = output;
        option.value = output;
        outputSelect.append(option);
    }

    modal.style.display = "block";
    close.addEventListener("click", function() {
        modal.style.display = "none";
        for (let i = typeSelect.childNodes.length - 1; i > 1; i--) {
            const child = typeSelect.childNodes[i];
            typeSelect.removeChild(child);
        }
        for (let i = inputSelect.childNodes.length - 1; i > 1; i--) {
            const child = inputSelect.childNodes[i];
            inputSelect.removeChild(child);
        }
        for (let i = outputSelect.childNodes.length - 1; i > 1; i--) {
            const child = outputSelect.childNodes[i];
            outputSelect.removeChild(child);
        }
    });

    btn.addEventListener("click", function() {
        const nodeName = document.getElementById("add-node-node-name").value;
        const nodeType = typeSelect.value;
        const inputs = [];
        inputs.push(inputSelect.value);
        const outputs = [];
        outputs.push(outputSelect.value);
        const attributes = [];
        
        const newNode = new Node(
            nodeName, 
            nodeType, 
            nodeName, 
            inputs.filter(x => x !== ""), 
            outputs.filter(x => x !== ""), 
            attributes
        );
        currentModel.addNode(newNode);
                
        close.click();

        console.log(currentModel);
        render.renderNeuralNetworkModel(currentModel);
    });
});

document.getElementById("delete-node-btn").addEventListener("click", function(event) {
    if (!currentModel) {
        return;
    }

    const possibleIds = currentModel.getNodesIds();

    var modal = document.getElementById("delete-node-modal");
    var btn = document.getElementById("delete-node");
    var close = document.getElementById("delete-node-close");

    var idSelect = document.getElementById("delete-node-node-id");

    for(const id of possibleIds){
        var option = document.createElement("option");
        option.text = id;
        option.value = id;
        idSelect.append(option);
    }

    modal.style.display = "block";
    close.addEventListener("click", function() {
        modal.style.display = "none";
        for (let i = idSelect.childNodes.length - 1; i > 1; i--) {
            const child = idSelect.childNodes[i];
            idSelect.removeChild(child);
        }
    });

    btn.addEventListener("click", function() {
        const id = this.idSelect.value;
        
        currentModel.removeNode(id);
                
        close.click();

        console.log(currentModel);
        render.renderNeuralNetworkModel(currentModel);
    });
});

document.getElementById("edit-node-btn").addEventListener("click", function(event) {
    
});
