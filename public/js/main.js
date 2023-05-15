import * as uiUtils from './utils/uiUtils.js';
import * as controller from './controllers/controller.js';

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
    controller.handleEditNodeButtonClick();
});
document.addEventListener("showEditNodeModal", function(event) {
    const { possibleIds, possibleTypes, possibleInputs, possibleOutputs } = event.detail;

    const selectMap = new Map([
        ["edit-node-node-id", possibleIds],
        ["edit-node-node-type", possibleTypes],
        ["edit-node-node-input", possibleInputs],
        ["edit-node-node-output", possibleOutputs],
    ]);

    uiUtils.setupModal(
        "edit-node-modal", 
        "edit-node-close",
        selectMap, 
        ["edit-node-node-name"], 
        ["edit-node-node-attributes"]
    );

    uiUtils.setupIdChangeHandler(
        "edit-id-change-event",
        "edit-node-node-id",
        "edit-node-node-name", 
        "edit-node-node-type", 
        "edit-node-node-input", 
        "edit-node-node-output"
    );  

    uiUtils.setupTypeChangeHandler(
        "edit-type-change-event", 
        "edit-node-node-type", 
        "edit-node-node-attributes", 
        "edit-node-node-id"
    );  
});
document.getElementById("edit-node").addEventListener("click", function() {
    const nodeId = document.getElementById("edit-node-node-id").value;
    const nodeName = document.getElementById("edit-node-node-name").value;
    const nodeType = document.getElementById("edit-node-node-type").value;
    const inputs = [];
    for (const option of document.getElementById("edit-node-node-input").selectedOptions) {
        inputs.push(option.value);
    }
    const outputs = [];
    for (const option of document.getElementById("edit-node-node-output").selectedOptions) {
        outputs.push(option.value);
    }
    const attributes = uiUtils.gatherInputs(document.getElementById("edit-node-node-attributes"));

    controller.handleEditNode({
        nodeId, 
        nodeType, 
        nodeName, 
        inputs, 
        outputs, 
        attributes
    });
});
