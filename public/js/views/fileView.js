import * as controller from '../controllers/controller.js';

document.getElementById("open-file-input").addEventListener("change", function(event) {
    controller.handleFileInputChange(event);
});
