import { Connection } from "./Connection.js";
import { ModelType } from "../constants/ModelType.js";
import { onnxNodeTypes, tensorflowNodeTypes } from "../constants/nodeTypes.js";
import { onnxNodeAttributes, tensorflowNodeAttributes } from "../constants/nodeAttributes.js";
import { getArrayShape, recursivelySliceArray } from "../utils/utils.js";
import { showMessage } from "../utils/uiUtils.js";

export class NeuralNetworkModel {
    constructor(nodes, connections, type, raw, fileName) {
      this.nodes = nodes;
      this.connections = connections;
      this.type = type;
      this.raw = raw;
      this.fileName = fileName;
    }

    addNode(node) {
        this.nodes.push(node);
        node.inputs.forEach((inputId) => {
            const inputNode = this.getNodeById(inputId);
            const newConnection = new Connection(`${inputNode.id}_${node.id}`, inputNode, node);
            this.addConnection(newConnection);
        });
        node.outputs.forEach((outputId) => {
            const outputNode = this.getNodeById(outputId);
            const newConnection = new Connection(`${node.id}_${outputNode.id}`, node, outputNode);
            this.addConnection(newConnection);
        });
    }
    
    removeNode(nodeId) {
        this.nodes = this.nodes.filter(node => node.id !== nodeId);
        for (let i = this.connections.length - 1; i >= 0; i--) {
            const connection = this.connections[i];
            const fromNodeId = connection.fromNode.getId();
            const toNodeId = connection.toNode.getId();
    
            if (fromNodeId === nodeId || toNodeId === nodeId) {
                this.removeConnection(connection.id);
            }
        }
    }

    updateNode(nodeId, updatedNode) {
        this.removeNode(nodeId);
        this.addNode(updatedNode);
    }
    
    updateNodeProperties(nodeId, properties) {
        const node = this.nodes.find(node => node.id === nodeId);
        if (node) {
          node.updateNodeProperties(properties);
        }
    }
    
    addConnection(connection) {
        const existingConnection = this.connections.find(c => c.isEqual(connection));
        if (!existingConnection) {
            this.connections.push(connection);

            const fromNodeId = connection.fromNode.getId();
            const toNodeId = connection.toNode.getId();

            const outputNode = this.getNodeById(fromNodeId);
            if (!outputNode.outputs.includes(toNodeId)) {
                outputNode.outputs.push(toNodeId);
            }

            const inputNode = this.getNodeById(toNodeId);
            if (!inputNode.inputs.includes(fromNodeId)) {
                inputNode.inputs.push(fromNodeId);
            }
        }
    }
    
    removeConnection(connectionId) {
        const removedConnection = this.connections.find(connection => connection.id === connectionId);
        if (removedConnection) {
            console.log(removedConnection);
            const fromNodeId = removedConnection.fromNode.getId();
            const toNodeId = removedConnection.toNode.getId();

            const fromNode = removedConnection.fromNode;
            fromNode.outputs = fromNode.outputs.filter(output => output !== toNodeId);

            const toNode = removedConnection.toNode;
            toNode.inputs = toNode.inputs.filter(input => input !== fromNodeId);

            this.connections = this.connections.filter(connection => connection.id !== connectionId);
        }
    }

    updateConnectionProperties(connectionId, properties) {
        const connection = this.connections.find(connection => connection.id === connectionId);
        if (connection) {
            connection.updateConnectionProperties(properties);
        }
    }

    getNodeTypes() {
        switch (this.type) {
            case ModelType.ONNX:
              return Object.values(onnxNodeTypes);
            case ModelType.TENSORFLOW:
              return Object.values(tensorflowNodeTypes);
            default:
              return [];
        }
    }

    getNodeAttributes(nodeType) {
        switch (this.type) {
          case ModelType.ONNX:
            return onnxNodeAttributes[nodeType] || null;
          case ModelType.TENSORFLOW:
            return tensorflowNodeAttributes[nodeType] || null;
        default:
            return null;
        }
    }

    getType() {
        return this.type;
    }

    getRaw() {
        return this.raw;
    }

    getFileName() {
        return this.fileName;
    }

    getNodes() {
        return this.nodes;
    }

    getNodesIds() {
        return this.nodes.map(node => { return node.id });
    }
    
    getConnections() {
        return this.connections;
    }

    getNodeById(nodeId) {
        return this.nodes.find(node => node.getId() === nodeId);
    }

    getNodeContentById(nodeId) {
        const node = this.nodes.find(node => node.getId() === nodeId);
        const attributes = node ? node.getAttributes() : undefined;
        const content = attributes?.content || attributes?.value?.content || undefined;

        if (content && content.length) {
            const limit = 100;
            const shape = getArrayShape(content);
            const isShapeTooBig = shape.some(axis => axis > limit);
        
            if (isShapeTooBig) {
                showMessage(`Content is too big, showing cropped to ${limit} on all axes!`, 'warning')
                const preview = recursivelySliceArray(content, limit);
                return preview;
            }
        }
        
        return content;
    }

    setNodeContentById(nodeId, content) {
        const node = this.nodes.find(node => node.getId() === nodeId);
        node.setContent(content);
    }
    
    getConnectionById(connectionId) {
        return this.connections.find(connection => connection.getId() === connectionId);
    }

    getTotalNodeCount() {
        return this.nodes.length;
    }

    getTotalConnectionCount() {
        return this.connections.length;
    }

    getInputNode() {
        const inputConnectionIds = this.connections.map(connection => connection.getFromNode().getId());
        const inputNodeId = this.nodes.find(node => !inputConnectionIds.includes(node.getId()));
        return this.getNodeById(inputNodeId);
    }

    getOutputNode() {
        const outputConnectionIds = this.connections.map(connection => connection.getToNode().getId());
        const outputNodeId = this.nodes.find(node => !outputConnectionIds.includes(node.getId()));
        return this.getNodeById(outputNodeId);
    }
}
