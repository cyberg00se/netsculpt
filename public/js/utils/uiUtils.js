import * as utils from './utils.js';
import * as controller from '../controllers/controller.js'

export function showInfo() {
    document.getElementById('server-port').textContent = NL_PORT;
    document.getElementById('os-info').textContent = NL_OS;
    document.getElementById('app-id').textContent = NL_APPID;
    document.getElementById('server-version').textContent = NL_VERSION;
    document.getElementById('client-version').textContent = NL_CVERSION;
}

export function setTray() {
    if(NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "../../assets/images/trayIcon.png",
        menuItems: [
            {id: "VERSION", text: "Get version"},
            {id: "SEP", text: "-"},
            {id: "QUIT", text: "Quit"}
        ]
    };
    Neutralino.os.setTray(tray);
}

export function onTrayMenuItemClicked(event) {
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

export function onWindowClose() {
    Neutralino.app.exit();
}

export function appendOptions(values, element) {
    values.forEach(item => {
      const option = document.createElement("option");
      option.text = item;
      option.value = item;
      element.append(option);
    });
}

export function removeOptions(element) {
    const lastIndex = element.multiple ? 0 : 1;
    for (let i = element.childNodes.length - 1; i > lastIndex; i--) {
        const child = element.childNodes[i];
        element.removeChild(child);
    }
}

export function setSelectValues(element, values) {
    for (let option of element.options) {
        option.selected = values.includes(option.value);
    }
}

export function createInputForAttribute(attrName, attrValue, protoValue = undefined, nodeId = undefined) {
    const container = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = attrName;
    container.appendChild(label);

    if(attrName === 'T' || attrName === 'dtype' || attrName === 'elemType' || attrName === 'data_format') {
        if(protoValue) {
            container.appendChild(createSelectForArrayAttribute(protoValue));
            container.lastChild.value = attrValue;
        }
        else {
            container.appendChild(createSelectForArrayAttribute(attrValue));
        }
    } else if (attrName === "content") {
        const button = document.createElement("button");
        button.textContent = "Edit Content";
        button.classList.add('open-big-content');
        button.addEventListener("click", function(event) {
            event.preventDefault();
            createBigContentModal(
                "node-content-modal", 
                "node-content-close", 
                "node-content-textarea", 
                "save-node-content",
                attrValue,
                nodeId
            );
        });
        container.appendChild(button);
    } else if (Array.isArray(attrValue)) {
        container.appendChild(createTextInputForAttribute(attrName, utils.stringifyArray(attrValue)));
    } else if (typeof attrValue === "boolean") {
        container.appendChild(createCheckboxForAttribute(attrValue));
    } else if (typeof attrValue === "string") {
        container.appendChild(createTextInputForAttribute(attrName, attrValue));
    } else if (typeof attrValue === "object" && attrValue !== null) {
        container.appendChild(createInputsForObjectAttribute(attrValue, protoValue, nodeId));
    } else if (typeof attrValue === "number") {
        container.appendChild(createNumberInputForAttribute(attrValue));
    } else {
        container.appendChild(createTextInputForAttribute(attrName, ""));
    }

    return container;
}

export function createBigContentModal(modalId, closeId, textareaId, buttonId, value, nodeId) {
    setupModal(modalId, closeId, [], [], [], [textareaId], [buttonId]);

    const contentTextarea = document.getElementById(textareaId);
    contentTextarea.value = utils.stringifyArray(value);
    contentTextarea.readOnly = false;
    validateArray(contentTextarea);

    const labelElement = document.querySelector(`label[for="${textareaId}"]`);
    labelElement.textContent = nodeId;

    const button = document.getElementById(buttonId);
    button.addEventListener('click', function() {
        const id = labelElement.textContent;
        const content = contentTextarea.value;
    
        controller.updateNodeContentById(id, utils.parseArrayString(content));
        document.getElementById(closeId).click();
    });
    button.disabled = false;
}

export function createSelectForArrayAttribute(attrValue) {
    const select = document.createElement("select");
    if (Array.isArray(attrValue)) {
        appendOptions(attrValue, select);
    } else {
        appendOptions([attrValue], select);
    }
    return select;
}

export function createCheckboxForAttribute(attrValue) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = attrValue;
    return checkbox;
}
  
export function createTextInputForAttribute(attrName, attrValue) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = attrName;
    input.value = attrValue;
    validateArray(input);
    return input;
}

export function createNumberInputForAttribute(attrValue) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = attrValue;
    return input;
}

export function createInputsForObjectAttribute(attrValue, protoValue, nodeId) {
    const container = document.createElement("div");
    for (const subAttr in attrValue) {
        const subAttrValue = attrValue[subAttr];
        const subAtrrProto = protoValue ? protoValue[subAttr] : undefined
        const subAttrInput = createInputForAttribute(subAttr, subAttrValue, subAtrrProto, nodeId);
        container.appendChild(subAttrInput);
    }
    return container;
}

export function gatherInputs(container, nodeId) {
    const collection = container.children;
    let inputs = {};

    if (!Array.from(collection).some(el => el.tagName === 'LABEL')) {
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].tagName === 'DIV') {
                const subInputs = gatherInputs(collection[i], nodeId);
                if (Object.keys(subInputs).length > 0) {
                    Object.assign(inputs, subInputs);
                }
            }
        }
    } else {
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].tagName === 'LABEL') {
                const label = collection[i].textContent;
                const inputContainer = collection[i].nextElementSibling;
                if (inputContainer) {
                    if (inputContainer.tagName === 'INPUT' || inputContainer.tagName === 'SELECT') {
                        if (inputContainer.type === 'checkbox') {
                            inputs[label] = inputContainer.checked;
                        } else if (inputContainer.type === 'number') {
                            inputs[label] = parseFloat(inputContainer.value);
                        } else {
                            inputs[label] = utils.parseArrayString(inputContainer.value);
                        }
                    } else if (inputContainer.tagName === 'DIV') {
                        inputs[label] = gatherInputs(inputContainer, nodeId);
                    } else if(inputContainer.tagName === 'BUTTON' && label === 'content') {
                        const content = controller.getNodeContentById(`resave-${nodeId}-content`, nodeId);
                        inputs[label] = content ? content : [];
                    }
                }
            }
        }
    }
    return inputs;
}

export function showModal(modalId, selectsMap = []) {
    for (const [selectId, possibleValues] of selectsMap) {
        const selectElement = document.getElementById(selectId);
        appendOptions(possibleValues, selectElement);
    }

    const modal = document.getElementById(modalId);
    modal.style.display = "block";
}
  
export function hideModal(modalId, selects = [], inputs = [], containers = [], textareas = [], buttons = []) {
    for (const selectId of selects) {
        const selectElement = document.getElementById(selectId);
        removeOptions(selectElement);
    }
    for (const inputId of inputs) {
        const inputElement = document.getElementById(inputId);
        inputElement.value = "";
    }
    for (const containerId of containers) {
        const containerElement = document.getElementById(containerId);
        containerElement.innerHTML = "";
    }
    for (const textareaId of textareas) {
        const textareaElement = document.getElementById(textareaId);
        textareaElement.value = "";
        textareaElement.readOnly = true;

        const labelElement = document.querySelector(`label[for="${textareaId}"]`);
        labelElement.textContent = "";
    }
    for (const buttonId of buttons) {
        const button = document.getElementById(buttonId);
        button.disabled = true;
    }
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}

export function setupModal(modalId, closeId, selectMap = [], inputs = [], containers = [], textareas = [], buttons = []) {
    const close = document.getElementById(closeId);
  
    showModal(modalId, selectMap);
  
    close.addEventListener("click", function() {
        hideModal(modalId, Array.from(selectMap.keys()), inputs, containers, textareas, buttons);
    });
}

export function setupTypeChangeHandler(responseEvent, typeSelectId, attributesContainerId, nodeIdInputId = undefined) {
    const idInput = nodeIdInputId ? document.getElementById(nodeIdInputId) : undefined;
    const typeSelect = document.getElementById(typeSelectId);
    const attributesContainer = document.getElementById(attributesContainerId);

    typeSelect.addEventListener("change", function() {
      const nodeType = typeSelect.value;
      const nodeId = idInput?.value;
  
      controller.handleTypeChange(responseEvent, nodeType, nodeId);
    });

    document.addEventListener(responseEvent, function(event) {
        const { needsProto, protoAttributes, realAttributes, attributesNames, nodeId } = event.detail;
        attributesContainer.innerHTML = "";

        for (const attrName of attributesNames) {
            const attrValue = realAttributes[attrName];
            let attrInput;
            if (needsProto) {
                const protoValue = protoAttributes[attrName];
                attrInput = createInputForAttribute(attrName, attrValue, protoValue, nodeId);
            } else {
                attrInput = createInputForAttribute(attrName, attrValue, undefined, nodeId);
            }
            attributesContainer.appendChild(attrInput);
            attributesContainer.appendChild(document.createElement("hr"));
        }
    });
}  

export function setupIdChangeHandler(responseEvent, idSelectId, nameInputId, typeSelectId, inputSelectId, outputSelectId) {
    const idSelect = document.getElementById(idSelectId);
    const nameInput = document.getElementById(nameInputId);
    const typeSelect = document.getElementById(typeSelectId);
    const inputSelect = document.getElementById(inputSelectId);
    const outputSelect = document.getElementById(outputSelectId);

    idSelect.addEventListener("change", function() {
      const nodeId = idSelect.value;
      controller.handleIdChange(responseEvent, nodeId);
    });

    document.addEventListener(responseEvent, function(event) {
        const { nodeName, nodeType, nodeInputs, nodeOutputs } = event.detail;

        nameInput.value = nodeName;
        typeSelect.value = nodeType;
        typeSelect.dispatchEvent(new Event('change'));
        setSelectValues(inputSelect, nodeInputs);
        setSelectValues(outputSelect, nodeOutputs);    
    });
}  

export function setupNodeContentTextarea(responseEvent, textareaId, nodeId) {  
    document.addEventListener(responseEvent, function(event) {
        const { content } = event.detail;
        textareaElement.value = utils.stringifyArray(content);
    });

    const textareaElement = document.getElementById(textareaId);
    controller.getNodeContentById(responseEvent, nodeId);

    const labelElement = document.querySelector(`label[for="${textareaId}"]`);
    labelElement.textContent = nodeId;
}

export function downloadBlob(blob, fileName) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    link.click();

    URL.revokeObjectURL(link.href);
}

export function validateArray(element) {
    element.addEventListener('change', function() {
        const pattern = /^\[.*\]$/;
        const inputValue = element.value.trim();
      
        if (!pattern.test(inputValue)) {
            element.classList.add('invalid-input');
        } else {
            element.classList.remove('invalid-input');
        }
    });  
}

export function showMessage(message, messageType) {
    var messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;

    messageContainer.classList.remove(...messageContainer.classList);
    messageContainer.classList.add(messageType);
  
    messageContainer.style.opacity = '1';
    setTimeout(function() {
        messageContainer.style.opacity = '0';
    }, 3000);
}
