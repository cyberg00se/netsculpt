import { Node } from "../models/Node.js";
import { Connection } from "../models/Connection.js"; 
import { NeuralNetworkModel, ModelType } from "../models/NeuralNetworkModel.js";
import { loadProtoDefinition, getFirstNonEmptyProperty } from '../utils.js';

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

                const nodes = rawModel.graph.node.map((node) => {
                    const id = node.name || `${node.input[0]}_${node.output[0]}`;
                    const type = node.opType;
                    const name = node.name;
                    const inputs = node.input;
                    const outputs = node.output;

                    const attributes = node.attribute.reduce((acc, attr) => {
                        acc[attr.name] = getFirstNonEmptyProperty(attr, ['type', 'name']).value;
                        return acc;
                    }, {});

                    //not used yet
                    const input = rawModel.graph.input.find((input) => input.name === node.input[0]);
                    const output = rawModel.graph.output.find((output) => output.name === node.output[0]);
                    const inputShape = input ? input.type.tensorType.shape.dim.map(dim => dim.dimValue) : null;
                    const outputShape = output ? output.type.tensorType.shape.dim.map(dim => dim.dimValue) : null;

                    return new Node(id, type, name, inputs, outputs, attributes);
                });

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
                        if (nodeMap.has(output)) {
                            const outputNodes = nodeMap.get(output);
                            outputNodes.forEach((outputNode) => {
                                const connection = new Connection(`${node.id}_${outputNode.id}`, node, outputNode);
                                connections.push(connection);
                            });
                        }
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
