import * as uiUtils from '../utils/uiUtils.js';
import * as controller from '../controllers/controller.js';

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
    uiUtils.showMessage('Saving...', 'info');
    const id = document.getElementById("delete-node-node-id").value;

    controller.handleDeleteNode(id);
});
