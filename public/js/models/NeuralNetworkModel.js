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
        this.connections.push(connection);
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
