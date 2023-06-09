import store from '../store.js';
import * as render from '../render.js';
import { downloadBlob } from '../utils/uiUtils.js';
import { showMessage } from '../utils/uiUtils.js';

export function handleFileInputChange(event) {
    try {
        const file = event.target.files[0];
        if(file) {
            store.dispatch('loadModelFromFile', file).then(model => {
                setTimeout(() => {
                    render.renderNeuralNetworkModel(model);
                }, 0);
            }).catch(error => {
                showMessage(error, 'error');
            });
        }
    } catch (error) {
        showMessage(error, 'error');
    }
}

export async function handleExportButtonClick(event) {
    try {
        const currentModel = store.getters.getModel;
        if (!currentModel) {
            return;
        }
        const rawModelBuffer = await store.getters.getSerializedModel;
        const blob = new Blob([rawModelBuffer], { type: 'application/octet-stream' });

        downloadBlob(blob, currentModel.getFileName());
    } catch (error) {
        showMessage(error, 'error');
    }
}

export function handleAddNodeButtonClick() {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
  
    const possibleInputs = currentModel.getNodesIds();
    const possibleOutputs = currentModel.getNodesIds();
    const possibleTypes = currentModel.getNodeTypes();

    const eventData = {
        possibleTypes,
        possibleInputs,
        possibleOutputs
    };
    document.dispatchEvent(new CustomEvent('showAddNodeModal', { detail: eventData }));
}

export function handleAddNode(nodeData) {
    store.commit('addNode', nodeData);
            
    document.getElementById("add-node-close").click();
    setTimeout(() => {
        render.renderNeuralNetworkModel(store.getters.getModel);
    }, 0);
}

export function handleDeleteNodeButtonClick() {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
  
    const possibleIds = currentModel.getNodesIds();

    const eventData = {
        possibleIds
    };
    document.dispatchEvent(new CustomEvent('showDeleteNodeModal', { detail: eventData }));
}

export function handleDeleteNode(nodeId) {
    store.commit('deleteNode', nodeId);
            
    document.getElementById("delete-node-close").click();
    setTimeout(() => {
        render.renderNeuralNetworkModel(store.getters.getModel);
    }, 0);
}

export function handleEditNodeButtonClick() {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
  
    const possibleIds = currentModel.getNodesIds();
    const possibleInputs = currentModel.getNodesIds();
    const possibleOutputs = currentModel.getNodesIds();
    const possibleTypes = currentModel.getNodeTypes();

    const eventData = {
        possibleIds,
        possibleTypes,
        possibleInputs,
        possibleOutputs
    };
    document.dispatchEvent(new CustomEvent('showEditNodeModal', { detail: eventData }));
}

export function handleEditNode(nodeData) {
    store.commit('editNode', nodeData);
            
    document.getElementById("edit-node-close").click();
    setTimeout(() => {
        render.renderNeuralNetworkModel(store.getters.getModel);
    }, 0);
}

export function handleTypeChange(responseEvent, nodeType, nodeId = undefined) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
    const node = nodeId ? currentModel.getNodeById(nodeId) : undefined;
    const needsProto = nodeId && nodeType === node.getType();
  
    const protoAttributes = currentModel.getNodeAttributes(nodeType);
    let realAttributes;
    if (needsProto) {
      realAttributes = node.getAttributes();
    } else {
      realAttributes = protoAttributes;
    }
    const attributesNames = Object.keys(protoAttributes);

    const eventData = {
        needsProto,
        protoAttributes,
        realAttributes,
        attributesNames,
        nodeId
    };
    document.dispatchEvent(new CustomEvent(responseEvent, { detail: eventData }));
}

export function handleIdChange(responseEvent, nodeId) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
    const node = currentModel.getNodeById(nodeId);

    const nodeName = node.getName();
    const nodeType = node.getType();
    const nodeInputs = node.getInputs();
    const nodeOutputs = node.getOutputs();

    const eventData = {
        nodeName,
        nodeType,
        nodeInputs,
        nodeOutputs
    };
    document.dispatchEvent(new CustomEvent(responseEvent, { detail: eventData }));
}

export function getNodeContentById(responseEvent, nodeId) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
    const content = currentModel.getNodeContentById(nodeId);

    const eventData = {
        content
    };
    document.dispatchEvent(new CustomEvent(responseEvent, { detail: eventData }));
    return content;
}

export function updateNodeContentById(nodeId, content) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
        showMessage('Model is not set', 'error');
        return;
    }
    currentModel.setNodeContentById(nodeId, content);
}
