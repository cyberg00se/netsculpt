import { Node } from "../models/Node.js";
import { Connection } from "../models/Connection.js"; 
import { NeuralNetworkModel } from "../models/NeuralNetworkModel.js";
import { loadProtoDefinition, getFirstNonEmptyProperty } from '../utils/utils.js';
import { ModelType } from "../constants/ModelType.js";
import { onnxDataTypesReverse } from "../constants/dataTypes.js";
import { reshapeData } from "../utils/utils.js";
import { showMessage } from "../utils/uiUtils.js";

async function parseONNXModelFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                showMessage(`Parsing ONNX model: ${file.name}`, 'info');
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

                    const tensorData = rawModel.graph.initializer.find(elem => elem.name === node.name)?.rawData;
                    const buffer = tensorData ? new Uint8Array(tensorData) : new Uint8Array();
                    const elemType = onnxDataTypesReverse[node.type.tensorType.elemType];
                    const shape = node.type.tensorType.shape.dim.map(dim => dim.dimValue);
                    let data;
                    switch (elemType) {
                        case 'float':
                            data = new Float32Array(buffer.buffer);
                            break;
                        case 'int32':
                            data = new Int32Array(buffer.buffer);
                            break;
                    }
                    const reshapedData = reshapeData(data, shape);
                    const attributes = {
                        elemType,
                        shape,
                        content: reshapedData
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
                        elemType: onnxDataTypesReverse[node.type.tensorType.elemType],
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
                            const connection = new Connection(`${node.id}_${outputNode.id}`, node, outputNode, output);
                            connections.push(connection);
                        });
                    });
                });
                nodes.forEach((node) => {
                    if(node.type !== 'Input' && node.type !== 'Output') {
                        node.inputs = connections.filter(conn => conn.target === node.id).map(conn => conn.source);
                        node.outputs = connections.filter(conn => conn.source === node.id).map(conn => conn.target);
                    }
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
  
export { parseONNXModelFromFile };
