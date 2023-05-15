import * as render from './render.js';
import * as uiUtils from './utils/uiUtils.js';
import * as controller from './controllers/controller.js';
import store from './store.js';

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", uiUtils.onTrayMenuItemClicked);
Neutralino.events.on("windowClose", uiUtils.onWindowClose);

if(NL_OS != "Darwin") {
    uiUtils.setTray();
}

uiUtils.showInfo();

document.getElementById("open-file-input").addEventListener("change", function(event) {
    controller.handleFileInputChange(event);
});

document.getElementById("add-node-btn").addEventListener("click", function(event) {
    controller.handleAddNodeButtonClick();
});
document.addEventListener("showAddNodeModal", function(event) {
    const { possibleTypes, possibleInputs, possibleOutputs } = event.detail;
  
    const selectMap = new Map([
      ["add-node-node-type", possibleTypes],
      ["add-node-node-input", possibleInputs],
      ["add-node-node-output", possibleOutputs],
    ]);
  
    uiUtils.setupModal(
        "add-node-modal", 
        "add-node-close",
        selectMap, 
        ["add-node-node-name"], 
        ["add-node-node-attributes"]
    );

    uiUtils.setupTypeChangeHandler("add-type-change-event", "add-node-node-type", "add-node-node-attributes");  
});
document.getElementById("add-node").addEventListener("click", function() {
    const nodeName = document.getElementById("add-node-node-name").value;
    const nodeType = document.getElementById("add-node-node-type").value;
    const inputs = [];
    for (const option of document.getElementById("add-node-node-input").selectedOptions) {
        inputs.push(option.value);
    }
    const outputs = [];
    for (const option of document.getElementById("add-node-node-output").selectedOptions) {
        outputs.push(option.value);
    }
    const attributes = uiUtils.gatherInputs(document.getElementById("add-node-node-attributes"));

    controller.handleAddNode({
        nodeId: nodeName, 
        nodeType, 
        nodeName, 
        inputs, 
        outputs, 
        attributes
    });
});

document.getElementById("delete-node-btn").addEventListener("click", function(event) {
    controller.handleDeleteNodeButtonClick();
});
document.addEventListener("showDeleteNodeModal", function(event) {
    const { possibleIds } = event.detail;

    const selectMap = new Map([
        ["delete-node-node-id", possibleIds]
    ]);

    uiUtils.setupModal(
        "delete-node-modal", 
        "delete-node-close",
        selectMap
    );
});
document.getElementById("delete-node").addEventListener("click", function() {
    const id = document.getElementById("delete-node-node-id").value;

    controller.handleDeleteNode(id);
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

    var btn = document.getElementById("edit-node");
    var close = document.getElementById("edit-node-close");

    var idSelect = document.getElementById("edit-node-node-id");
    var typeSelect = document.getElementById("edit-node-node-type");
    var inputSelect = document.getElementById("edit-node-node-input");
    var outputSelect = document.getElementById("edit-node-node-output");
    var attributesContainer = document.getElementById("edit-node-node-attributes");
    var nameInput = document.getElementById("edit-node-node-name");

    const selectMap = new Map([
        ["edit-node-node-id", possibleIds],
        ["edit-node-node-type", possibleTypes],
        ["edit-node-node-input", possibleInputs],
        ["edit-node-node-output", possibleOutputs],
    ]);
    uiUtils.showModal("edit-node-modal", selectMap);

    close.addEventListener("click", function() {
        uiUtils.hideModal(
            "edit-node-modal", 
            Array.from(selectMap.keys()), 
            ["edit-node-node-name"], 
            ["edit-node-node-attributes"]
        );
    });

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
