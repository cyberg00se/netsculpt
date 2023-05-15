import * as render from './render.js';
import * as uiUtils from './utils/uiUtils.js';
import * as utils from './utils/utils.js';
import store from './store.js';

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", uiUtils.onTrayMenuItemClicked);
Neutralino.events.on("windowClose", uiUtils.onWindowClose);

if(NL_OS != "Darwin") {
    uiUtils.setTray();
}

uiUtils.showInfo();

document.getElementById("open-file-input").addEventListener("change", function(event) {
    try {
        const file = event.target.files[0];
        store.dispatch('loadModelFromFile', file).then(model => {
            render.renderNeuralNetworkModel(model);
        })
    } catch(error) {
        console.error(error);
    }
});

document.getElementById("add-node-btn").addEventListener("click", function(event) {
    const currentModel = store.getters.getModel;
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
    var attributesContainer = document.getElementById("add-node-node-attributes");
    
    uiUtils.appendOptions(possibleTypes, typeSelect);
    uiUtils.appendOptions(possibleInputs, inputSelect);
    uiUtils.appendOptions(possibleOutputs, outputSelect);

    modal.style.display = "block";

    close.addEventListener("click", function() {
        modal.style.display = "none";
        uiUtils.removeOptions(typeSelect);
        uiUtils.removeOptions(inputSelect);
        uiUtils.removeOptions(outputSelect);
        attributesContainer.innerHTML = "";
    });

    typeSelect.addEventListener("change", function() {
        const nodeType = typeSelect.value;
        const attributes = currentModel.getNodeAttributes(nodeType);
        const attributesNames = Object.keys(attributes);

        attributesContainer.innerHTML = "";
        for (const attrName of attributesNames) {
            const attrValue = attributes[attrName];
            const attrInput = uiUtils.createInputForAttribute(attrName, attrValue);
            attributesContainer.appendChild(attrInput);
            attributesContainer.appendChild(document.createElement("hr"));
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

        const attributes = uiUtils.gatherInputs(attributesContainer);

        store.commit('addNode', {
            nodeId: nodeName, 
            nodeType, 
            nodeName, 
            inputs, 
            outputs, 
            attributes
        });
                
        close.click();

        render.renderNeuralNetworkModel(store.getters.getModel);
    });
});

document.getElementById("delete-node-btn").addEventListener("click", function(event) {
    const currentModel = store.getters.getModel;
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
        store.commit('deleteNode', id);
                
        close.click();
        render.renderNeuralNetworkModel(store.getters.getModel);
    });
});

document.getElementById("edit-node-btn").addEventListener("click", function(event) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        return;
    }

    const possibleIds = currentModel.getNodesIds();
    const possibleInputs = currentModel.getNodesIds();
    const possibleOutputs = currentModel.getNodesIds();
    const possibleTypes = currentModel.getNodeTypes();

    var modal = document.getElementById("edit-node-modal");
    var btn = document.getElementById("edit-node");
    var close = document.getElementById("edit-node-close");

    var idSelect = document.getElementById("edit-node-node-id");
    var typeSelect = document.getElementById("edit-node-node-type");
    var inputSelect = document.getElementById("edit-node-node-input");
    var outputSelect = document.getElementById("edit-node-node-output");
    var attributesContainer = document.getElementById("edit-node-node-attributes");
    var nameInput = document.getElementById("edit-node-node-name");

    uiUtils.appendOptions(possibleIds, idSelect);
    uiUtils.appendOptions(possibleTypes, typeSelect);
    uiUtils.appendOptions(possibleInputs, inputSelect);
    uiUtils.appendOptions(possibleOutputs, outputSelect);

    modal.style.display = "block";

    idSelect.addEventListener("change", function() {
        const nodeId = idSelect.value;
        const node = currentModel.getNodeById(nodeId);

        const nodeName = node.getName();
        const nodeType = node.getType();
        const nodeInputs = node.getInputs();
        const nodeOutputs = node.getOutputs();

        nameInput.value = nodeName;
        typeSelect.value = nodeType;
        typeSelect.dispatchEvent(new Event('change'));
        uiUtils.setSelectValues(inputSelect, nodeInputs);
        uiUtils.setSelectValues(outputSelect, nodeOutputs);   
    });

    typeSelect.addEventListener("change", function() {
        const nodeType = typeSelect.value;
        const nodeId = idSelect.value;
        const node = currentModel.getNodeById(nodeId);
        
        const protoAttributes = currentModel.getNodeAttributes(nodeType);
        let realAttributes;

        if(nodeId && nodeType === node.getType()) {
            realAttributes = node.getAttributes();
        } else {
            realAttributes = protoAttributes;
        }
        const attributesNames = Object.keys(protoAttributes);

        attributesContainer.innerHTML = "";
        for (const attrName of attributesNames) {
            const attrValue = realAttributes[attrName];
            let attrInput;
            if (nodeId && nodeType === node.getType()) {
                const protoValue = protoAttributes[attrName];
                attrInput = uiUtils.createInputForAttribute(attrName, attrValue, protoValue);
            } else {
                attrInput = uiUtils.createInputForAttribute(attrName, attrValue); 
            }
            attributesContainer.appendChild(attrInput);
            attributesContainer.appendChild(document.createElement("hr"));
        }
    });

    close.addEventListener("click", function() {
        modal.style.display = "none";
        nameInput.value = "";
        uiUtils.removeOptions(idSelect);
        uiUtils.removeOptions(typeSelect);
        uiUtils.removeOptions(inputSelect);
        uiUtils.removeOptions(outputSelect);
        attributesContainer.innerHTML = "";
    });

    btn.addEventListener("click", function() {
        const id = idSelect.value;
        const nodeName = nameInput.value;
        const nodeType = typeSelect.value;
        const inputs = [];
        for (const option of inputSelect.selectedOptions) {
            inputs.push(option.value);
        }
        const outputs = [];
        for (const option of outputSelect.selectedOptions) {
            outputs.push(option.value);
        }

        const attributes = uiUtils.gatherInputs(attributesContainer);

        store.commit('editNode', {
            nodeId: id, 
            nodeType, 
            nodeName, 
            inputs, 
            outputs, 
            attributes
        });
                
        close.click();

        render.renderNeuralNetworkModel(store.getters.getModel);
    });
});
