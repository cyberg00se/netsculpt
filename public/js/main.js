import * as render from './render.js';
import * as parser from './parsers/parser.js';
import * as uiUtils from './utils/uiUtils.js';
import { Node, onnxNodeTypes, tensorflowNodeTypes } from "./models/Node.js";
import { ModelType } from './models/NeuralNetworkModel.js';

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
        for (let i = inputSelect.childNodes.length - 1; i > 0; i--) {
            const child = inputSelect.childNodes[i];
            inputSelect.removeChild(child);
        }
        for (let i = outputSelect.childNodes.length - 1; i > 0; i--) {
            const child = outputSelect.childNodes[i];
            outputSelect.removeChild(child);
        }
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
        const id = idSelect.value;
        
        console.log(`Stub for edit node ${id}`);
                
        close.click();

        console.log(currentModel);
        render.renderNeuralNetworkModel(currentModel);
    });
});
