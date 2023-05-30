import * as uiUtils from '../utils/uiUtils.js';
import * as controller from '../controllers/controller.js';

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
    uiUtils.showMessage('Saving...', 'info');
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
    const attributes = uiUtils.gatherInputs(document.getElementById("edit-node-node-attributes"), nodeId);

    controller.handleEditNode({
        nodeId, 
        nodeType, 
        nodeName, 
        inputs, 
        outputs, 
        attributes
    });
});
