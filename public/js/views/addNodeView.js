import * as uiUtils from '../utils/uiUtils.js';
import * as controller from '../controllers/controller.js';

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
