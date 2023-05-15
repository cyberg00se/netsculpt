import store from '../store.js';
import * as render from '../render.js';

export function handleFileInputChange(event) {
    try {
        const file = event.target.files[0];
        store.dispatch('loadModelFromFile', file).then(model => {
            render.renderNeuralNetworkModel(model);
        }).catch(error => {
            console.error(error);
        });
    } catch (error) {
        console.error(error);
    }
}

export function handleAddNodeButtonClick() {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
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
    render.renderNeuralNetworkModel(store.getters.getModel);
}

export function handleTypeChange(responseEvent, nodeType, nodeId = undefined) {
    const currentModel = store.getters.getModel;
    if (!currentModel) {
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
        attributesNames
    };
    document.dispatchEvent(new CustomEvent(responseEvent, { detail: eventData }));
}