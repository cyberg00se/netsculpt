import * as utils from './utils.js';

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

export function createInputForAttribute(attrName, attrValue) {
    const container = document.createElement("div");

    const label = document.createElement("label");
    label.textContent = attrName;
    container.appendChild(label);

    if (Array.isArray(attrValue)) {
        if (attrValue.length === 0) {
            container.appendChild(createTextInputForAttribute(attrName, "[ ]"));
        } else {
            container.appendChild(createSelectForArrayAttribute(attrValue));
        }
    } else if (typeof attrValue === "boolean") {
        container.appendChild(createCheckboxForAttribute(attrValue));
    } else if (typeof attrValue === "string") {
        container.appendChild(createTextInputForAttribute(attrName, attrValue));
    } else if (typeof attrValue === "object" && attrValue !== null) {
        container.appendChild(createInputsForObjectAttribute(attrValue));
    } else if (typeof attrValue === "number") {
        container.appendChild(createNumberInputForAttribute(attrValue));
    } else {
        container.appendChild(createTextInputForAttribute(attrName, ""));
    }

    return container;
}

export function createSelectForArrayAttribute(attrValue) {
    const select = document.createElement("select");
    appendOptions(attrValue, select);
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
    return input;
}

export function createNumberInputForAttribute(attrValue) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = attrValue;
    return input;
}

export function createInputsForObjectAttribute(attrValue) {
    const container = document.createElement("div");
    for (const subAttr in attrValue) {
        const subAttrValue = attrValue[subAttr];
        const subAttrInput = createInputForAttribute(subAttr, subAttrValue);
        container.appendChild(subAttrInput);
    }
    return container;
}

export function gatherInputs(container) {
    const collection = container.children;
    let inputs = {};

    if (!Array.from(collection).some(el => el.tagName === 'LABEL')) {
        for (let i = 0; i < collection.length; i++) {
            if (collection[i].tagName === 'DIV') {
                const subInputs = gatherInputs(collection[i], true);
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
                        inputs[label] = gatherInputs(inputContainer);
                    }
                }
            }
        }
    }
    return inputs;
}
