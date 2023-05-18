import { loadProtoDefinition } from '../utils/utils.js';
import { onnxDataTypes } from "../constants/dataTypes.js";
import { flattenData } from "../utils/utils.js";

async function serializeONNXModel(model) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Serializing ONNX model:');
            const onnxProto = await loadProtoDefinition("js/lib/onnx/onnx.proto");
            const root = protobuf.Root.fromJSON(onnxProto);
            
            const ModelProto = root.lookupType("onnx.ModelProto");
            const GraphProto = root.lookupType("onnx.GraphProto");
            const NodeProto = root.lookupType("onnx.NodeProto");
            const ValueInfoProto = root.lookupType("onnx.ValueInfoProto");
            const TensorProto = root.lookupType("onnx.TensorProto");
            const TensorShapeProto = root.lookupType("onnx.TensorShapeProto");
            const AttributeProto = root.lookupType("onnx.AttributeProto");

            const rawModel = JSON.parse(JSON.stringify(model.getRaw()));
            const rawGraph = GraphProto.create();
            rawModel.graph = rawGraph;

            const createAttribute = (key, value) => {
                const rawAttr = AttributeProto.create();
                rawAttr.name = key;
                if (Array.isArray(value)) {
                    if (value.every((val) => Number.isInteger(val))) {
                        rawAttr.ints = value;
                        rawAttr.type = AttributeProto.AttributeType.INTS;
                    } else if (value.every((val) => typeof val === "number")) {
                        rawAttr.floats = value;
                        rawAttr.type = AttributeProto.AttributeType.FLOATS;
                    } else if (value.every((val) => typeof val === "string")) {
                        rawAttr.strings = value;
                        rawAttr.type = AttributeProto.AttributeType.STRINGS;
                    } else if (value.every((val) => typeof val === "boolean")) {
                        rawAttr.ints = value.map((val) => (val ? 1 : 0));
                        rawAttr.type = AttributeProto.AttributeType.INTS;
                    }
                } else {
                    if (typeof value === "boolean") {
                        rawAttr.i = value ? 1 : 0;
                        rawAttr.type = AttributeProto.AttributeType.INT;
                    } else if (Number.isInteger(value)) {
                        rawAttr.i = value;
                        rawAttr.type = AttributeProto.AttributeType.INT;
                    } else if (typeof value === "number") {
                        rawAttr.f = value;
                        rawAttr.type = AttributeProto.AttributeType.FLOAT;
                    } else if (typeof value === "string") {
                        rawAttr.s = value;
                        rawAttr.type = AttributeProto.AttributeType.STRING;
                    }
                }
                return rawAttr;
            }   
            
            const createNode = (node) => {
                const rawNode = NodeProto.create();
          
                rawNode.name = node.name;
                rawNode.opType = node.type;
                rawNode.input = node.inputs.map(input => {
                    const connection = model.connections.find(conn => conn.target === node.id && conn.source === input);
                    return connection.rawName ? connection.rawName : connection.id;
                });
                rawNode.output = node.outputs.map(output => {
                    const connection = model.connections.find(conn => conn.source === node.id && conn.target === output);
                    return connection.rawName ? connection.rawName : connection.id;
                });
                rawNode.attribute = Object.entries(node.attributes).map(([key, value]) =>
                    createAttribute(key, value)
                );
          
                return rawNode;
            };

            rawGraph.node = model.nodes
                .filter((node) => node.type !== "Input" && node.type !== "Output")
                .map(createNode);

            const createValueInfo = (node) => {
                const rawValueInfo = ValueInfoProto.create();
                rawValueInfo.name = node.name;

                const tensorProto = TensorProto.create();
                tensorProto.elemType = onnxDataTypes[node.attributes.elemType];
                tensorProto.shape = TensorShapeProto.create();
                tensorProto.shape.dim = node.attributes.shape.map(value => { return { dimValue: value} });

                if (node.attributes.content) {
                    const initData = new Uint8Array(new Float32Array(flattenData(node.attributes.content)).buffer);
                
                    const initTensor = TensorProto.create();
                    initTensor.dims = node.attributes.shape;
                    initTensor.name = node.name;
                    initTensor.dataType = onnxDataTypes[node.attributes.elemType];
                    initTensor.rawData = initData;
                
                    rawGraph.initializer.push(initTensor);
                }
                
                rawValueInfo.type = { tensorType: tensorProto };
                return rawValueInfo;
            };

            rawGraph.input = model.nodes
                .filter((node) => node.type === "Input")
                .map(createValueInfo);

            rawGraph.output = model.nodes
                .filter((node) => node.type === "Output")
                .map(createValueInfo);

            console.log(rawModel);

            const message = ModelProto.create(rawModel);
            const buffer = ModelProto.encode(message).finish();
            const modelData = new Uint8Array(buffer);

            resolve(modelData);
        } catch (error) {
            reject(error);
        }
    });
}

export { serializeONNXModel };
