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
                        acc[attr.name] = getFirstNonEmptyProperty(attr, ['type', 'name']).value;
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
                        elemType: node.type.tensorType.elemType,
                        shape: node.type.tensorType.shape.dim.map(dim => dim.dimValue),
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
                        elemType: node.type.tensorType.elemType,
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

                const parsedModel = new NeuralNetworkModel(nodes, connections, ModelType.ONNX, rawModel);

                resolve(parsedModel);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}
  
export { parseONNXModelFromFile };
