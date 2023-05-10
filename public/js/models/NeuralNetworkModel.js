import { Connection } from "./Connection.js";

export const ModelType = {
    ONNX: "ONNX",
    TENSORFLOW: "TensorFlow"
};

export class NeuralNetworkModel {
    constructor(nodes, connections, type, raw) {
      this.nodes = nodes;
      this.connections = connections;
      this.type = type;
      this.raw = raw;
    }

    addNode(node) {
        this.nodes.push(node);
        node.inputs.foreEach((inputId) => {
            const inputNode = this.getNodeById(inputId);
            const newConnection = new Connection(`${inputNode.id}_${node.id}`, inputNode, node);
            this.addConnection(newConnection);
        });
        node.outputs.foreEach((outputId) => {
            const outputNode = this.getNodeById(outputId);
            const newConnection = new Connection(`${node.id}_${outputNode.id}`, node, outputNode);
            this.addConnection(newConnection);
        });
    }
    
    removeNode(nodeId) {
        this.nodes = this.nodes.filter(node => node.id !== nodeId);
        this.connections = this.connections.filter(connection => 
            connection.fromNode.getId() !== nodeId && connection.toNode.getId() !== nodeId
        );
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
        }
    }
    
    removeConnection(connectionId) {
        this.connections = this.connections.filter(connection => connection.id !== connectionId);
    }

    updateConnectionProperties(connectionId, properties) {
        const connection = this.connections.find(connection => connection.id === connectionId);
        if (connection) {
            connection.updateConnectionProperties(properties);
        }
    }

    getType() {
        return this.type;
    }

    getRaw() {
        return this.raw;
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
