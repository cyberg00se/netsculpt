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
export const onnxDataTypes = {
    'undefined': 0,
    'float': 1,
    'uint8': 2,
    'int8': 3,
    'uint16': 4,
    'int16': 5,
    'int32': 6,
    'int64': 7,
    'string': 8,
    'bool': 9,
    'float16': 10,
    'double': 11,
    'uint32': 12,
    'uint64': 13,
    'complex64': 14,
    'complex128': 15,
    'bfloat16': 16
};
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

const onnxNodeAttributes = {
    Input: {
        elemType: Object.keys(onnxDataTypes),
        shape: [],
        content: ""       
    },
    Output: {
        elemType: Object.keys(onnxDataTypes),
        shape: []          
    },
    Conv: {
        strides: [],
        pads: [],
        kernel_shape: []
    },
    Relu: {},
    MaxPool: {
        strides: [],
        pads: [],
        kernel_shape: []   
    },
    Concat: {
        axis: 0
    },
    Dropout: {
        ratio: 0,
        is_test: false
    },
    GlobalAveragePool: {},
    Softmax: {}
};

const tensorflowNodeAttributes = {
    Placeholder: {
        dtype: Object.keys(tensorflowDataTypes),
        shape: []
    },
    Identity: {
        T: Object.keys(tensorflowDataTypes),
        _class: {
            list: []
        }
    },
    Const: {
        dtype: Object.keys(tensorflowDataTypes),
        value: {
            content: "",
            shape: [],
            dtype: Object.keys(tensorflowDataTypes)
        }
    },
    BiasAdd: {
        data_format: ['NHWC', 'NCHW'],
        T: Object.keys(tensorflowDataTypes)
    },
    MatMul: {
        transpose_a: false,
        transpose_b: false,
        T: Object.keys(tensorflowDataTypes)
    },
    Elu: {
        T: Object.keys(tensorflowDataTypes)
    }
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
