import { Connection } from "./Connection.js";

export const ModelType = {
    ONNX: "ONNX",
    TENSORFLOW: "TensorFlow"
};

export const onnxNodeTypes = [
    'Input',
    'Output',
    'Conv',
    'Relu',
    'MaxPool',
    'Concat',
    'Dropout',
    'GlobalAveragePool',
    'Softmax'
];
export const tensorflowNodeTypes = [
    'Placeholder', 
    'Identity',
    'Const',
    'BiasAdd',
    'MatMul',
    'Elu'
];
export const tensorflowDataTypes = {
    'DT_FLOAT': 1,
    'DT_DOUBLE': 2,
    'DT_INT32': 3,
    'DT_UINT8': 4,
    'DT_INT16': 5,
    'DT_INT8': 6,
    'DT_STRING': 7,
    'DT_COMPLEX64': 8,
    'DT_INT64': 9,
    'DT_BOOL': 10,
    'DT_QINT8': 11,
    'DT_QUINT8': 12,
    'DT_QINT32': 13,
    'DT_BFLOAT16': 14,
    'DT_QINT16': 15,
    'DT_QUINT16': 16,
    'DT_UINT16': 17,
    'DT_COMPLEX128': 18,
    'DT_HALF': 19,
    'DT_RESOURCE': 20,
    'DT_VARIANT': 21,
    'DT_UINT32': 22,
    'DT_UINT64': 23,
    'DT_FLOAT8_E5M2': 24,
    'DT_FLOAT8_E4M3FN': 25
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

    getNodeTypes() {
        switch (this.type) {
            case ModelType.ONNX:
              return onnxNodeTypes;
            case ModelType.TENSORFLOW:
              return tensorflowNodeTypes;
            default:
              return [];
        }
    }

    getNodeAttributes(nodeType) {
        switch (this.type) {
          case ModelType.ONNX:
            // TODO: implement this for ONNX
            return null;
          case ModelType.TENSORFLOW:
            const dataTypes = Object.keys(tensorflowDataTypes);
            switch (nodeType) {
              case 'Placeholder':
                return {
                  'dtype': dataTypes,
                  'shape': [],
                };
              case 'Identity':
                return {
                  'T': dataTypes,
                  '_class': {
                      'list': []
                  }
                };
            case 'Const':
                return {
                  'dtype': dataTypes,
                  'value': {
                      'content': "",
                      'shape': [],
                      'dtype': dataTypes
                  },
                };
            case 'BiasAdd':
                return {
                  'data_format': ['NHWC', 'NCHW'],
                  'T': dataTypes,
                };
            case 'MatMul':
                return {
                  'transpose_a': false,
                  'transpose_b': false,
                  'T': dataTypes,
                };
            case 'Elu':
                return {
                  'T': dataTypes,
                };
            default:
                return null;
          }
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
