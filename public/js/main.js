import * as render from './render.js';
import * as parser from './parsers/parser.js';
import * as uiUtils from './utils/uiUtils.js';
import { Node } from "./models/Node.js";

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", uiUtils.onTrayMenuItemClicked);
Neutralino.events.on("windowClose", uiUtils.onWindowClose);

if(NL_OS != "Darwin") {
    uiUtils.setTray();
}

uiUtils.showInfo();

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
    const possibleTypes = currentModel.getNodeTypes();

    var modal = document.getElementById("add-node-modal");
    var btn = document.getElementById("add-node");
    var close = document.getElementById("add-node-close");

    var typeSelect = document.getElementById("add-node-node-type");
    var inputSelect = document.getElementById("add-node-node-input");
    var outputSelect = document.getElementById("add-node-node-output");
    
    uiUtils.appendOptions(possibleTypes, typeSelect);
    uiUtils.appendOptions(possibleInputs, inputSelect);
    uiUtils.appendOptions(possibleOutputs, outputSelect);

    modal.style.display = "block";

    close.addEventListener("click", function() {
        modal.style.display = "none";
        uiUtils.removeOptions(typeSelect);
        uiUtils.removeOptions(inputSelect);
        uiUtils.removeOptions(outputSelect);
    });

    btn.addEventListener("click", function() {
        const nodeName = document.getElementById("add-node-node-name").value;
        const nodeType = typeSelect.value;
        const inputs = [];
        for (const option of inputSelect.selectedOptions) {
            inputs.push(option.value);
        }
        const outputs = [];
        for (const option of outputSelect.selectedOptions) {
            outputs.push(option.value);
        }
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

    uiUtils.appendOptions(possibleIds, idSelect);

    modal.style.display = "block";

    close.addEventListener("click", function() {
        modal.style.display = "none";
        uiUtils.removeOptions(idSelect);
    });

    btn.addEventListener("click", function() {
        const id = idSelect.value;
        
        currentModel.removeNode(id);
                
        close.click();

        console.log(currentModel);
        render.renderNeuralNetworkModel(currentModel);
    });
});

document.getElementById("edit-node-btn").addEventListener("click", function(event) {
    if (!currentModel) {
        return;
    }

    const possibleIds = currentModel.getNodesIds();

    var modal = document.getElementById("edit-node-modal");
    var btn = document.getElementById("edit-node");
    var close = document.getElementById("edit-node-close");

    var idSelect = document.getElementById("edit-node-node-id");

    uiUtils.appendOptions(possibleIds, idSelect);

    modal.style.display = "block";
    
    close.addEventListener("click", function() {
        modal.style.display = "none";
        uiUtils.removeOptions(idSelect);
    });

    btn.addEventListener("click", function() {
        const id = idSelect.value;
        
        console.log(`Stub for edit node ${id}`);
                
        close.click();

        console.log(currentModel);
        render.renderNeuralNetworkModel(currentModel);
    });
});
