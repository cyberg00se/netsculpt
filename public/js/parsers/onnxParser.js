import { Node } from "../models/Node.js";
import { Connection } from "../models/Connection.js"; 
import { NeuralNetworkModel, ModelType } from "../models/NeuralNetworkModel.js";
import { loadProtoDefinition, getFirstNonEmptyProperty } from '../utils/utils.js';

async function parseONNXModelFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                console.log('Parsing ONNX model:', file.name);
                const modelData = new Uint8Array(event.target.result);

                const onnxProto = await loadProtoDefinition("js/lib/onnx/onnx.proto");
                const root = protobuf.Root.fromJSON(onnxProto);

                const rawModel = root.lookupType("onnx.ModelProto").decode(modelData);
                console.log(rawModel);

                const mainNodes = rawModel.graph.node.map((node) => {
                    const id = node.name || `${node.input[0]}_${node.output[0]}`;
                    const type = node.opType;
                    const name = node.name;
                    const inputs = node.input;
                    const outputs = node.output;

                    const attributes = node.attribute.reduce((acc, attr) => {
                        const value = getFirstNonEmptyProperty(attr, ['type', 'name']).value;
                        acc[attr.name] = attr.name.startsWith('is_') ? Boolean(value) : value;
                        return acc;
                    }, {});

                    return new Node(id, type, name, inputs, outputs, attributes);
                });
                const inputNodes = rawModel.graph.input.map((node) => {
                    const id = node.name;
                    const type = 'Input';
                    const name = node.name;
                    const inputs = [];
                    const outputs = mainNodes.filter(mainNode => mainNode.inputs.includes(node.name)).map(mainNode => mainNode.id);

                    //content is a HUGE tensor usually
                    const content = rawModel.graph.initializer.find(elem => elem.name === node.name)?.rawData;
                    const attributes = {
                        elemType: OnnxDataType[node.type.tensorType.elemType],
                        shape: node.type.tensorType.shape.dim.map(dim => dim.dimValue),
                        content: content ? "..." : undefined
                        //content
                    };

                    return new Node(id, type, name, inputs, outputs, attributes);
                });
                const outputNodes = rawModel.graph.output.map((node) => {
                    const id = node.name;
                    const type = 'Output';
                    const name = node.name;
                    const inputs = mainNodes.filter(mainNode => mainNode.outputs.includes(node.name)).map(mainNode => mainNode.id);
                    const outputs = [];

                    const attributes = {
                        elemType: OnnxDataType[node.type.tensorType.elemType],
                        shape: node.type.tensorType.shape.dim.map(dim => dim.dimValue)
                    };

                    return new Node(id, type, name, inputs, outputs, attributes);
                });
                const nodes = [...mainNodes, ...inputNodes, ...outputNodes];

                const nodeMap = new Map();
                nodes.forEach((node) => {
                    node.inputs.forEach((input) => {
                        if (!nodeMap.has(input)) {
                            nodeMap.set(input, []);
                        }
                      nodeMap.get(input).push(node);
                    });
                });

                const connections = [];
                nodes.forEach((node) => {
                    node.outputs.forEach((output) => {
                        let outputNodes;
                        if (nodeMap.has(output)) {
                            outputNodes = nodeMap.get(output);
                        } else {
                            outputNodes = nodes.filter(node => node.id === output);
                        }
                        outputNodes.forEach((outputNode) => {
                            const connection = new Connection(`${node.id}_${outputNode.id}`, node, outputNode);
                            connections.push(connection);
                        });
                    });
                });

                const parsedModel = new NeuralNetworkModel(nodes, connections, ModelType.ONNX, rawModel, file.name);

                resolve(parsedModel);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

const OnnxDataType = {
    0: 'undefined',
    1: 'float',
    2: 'uint8',
    3: 'int8',
    4: 'uint16',
    5: 'int16',
    6: 'int32',
    7: 'int64',
    8: 'string',
    9: 'bool',
    10: 'float16',
    11: 'double',
    12: 'uint32',
    13: 'uint64',
    14: 'complex64',
    15: 'complex128',
    16: 'bfloat16'
};
  
export { parseONNXModelFromFile, OnnxDataType };
