export class Node {
    constructor(id, type, name, inputs, outputs, attributes) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.inputs = inputs;
      this.outputs = outputs;
      this.attributes = attributes;
    }
  
    updateNodeProperties(properties) {
        Object.assign(this, properties);
    }

    getId() {
        return this.id;
    }
    
    getType() {
        return this.type;
    }

    getName() {
        return this.name;
    }

    getInputs() {
        return this.inputs;
    }

    getOutputs() {
        return this.outputs;
    }

    getAttributes() {
        return this.attributes;
    }

    setType(type) {
        this.type = type;
    }

    setName(name) {
        this.name = name;
    }

    setInputs(inputs) {
        this.inputs = inputs;
    }

    setOutputs(outputs) {
        this.outputs = outputs;
    }

    setAttributes(attributes) {
        this.attributes = attributes;
    }
}

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
