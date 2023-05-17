import { loadProtoDefinition } from '../utils/utils.js';
import { tensorflowDataTypes } from "../constants/dataTypes.js";

async function serializeTensorFlowModel(model) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Serializing TensorFlow model:');
            const tfGraphProto = await loadProtoDefinition("js/lib/tensorflow/framework/graph.proto");
            const rootGraph = protobuf.Root.fromJSON(tfGraphProto);
            const GraphDef = rootGraph.lookupType("tensorflow.GraphDef");

            const attrValueProto = await loadProtoDefinition("js/lib/tensorflow/framework/attr_value.proto");
            const rootAttr = protobuf.Root.fromJSON(attrValueProto);
            const AttrValue = rootAttr.lookupType("tensorflow.AttrValue");

            const rawModel = JSON.parse(JSON.stringify(model.getRaw()));

            const updatedGraph = {
                ...rawModel,
                node: model.nodes.map((node) => {
                    const serializedNode = {
                        name: node.name,
                        op: node.type,
                        input: node.inputs,
                        attr: {},
                    };
                
                    for (const [key, value] of Object.entries(node.attributes)) {
                        serializedNode.attr[key] = serializeTensorflowAttributeValue(key, value, AttrValue);
                    }
                
                    return serializedNode;
                }),
            };
            console.log(updatedGraph);

            const message = GraphDef.create(updatedGraph);
            const buffer = GraphDef.encode(message).finish();
            const modelData = new Uint8Array(buffer);

            resolve(modelData);
        } catch (error) {
            reject(error);
        }
    });
}

function serializeTensorflowAttributeValue(key, value, AttrValue) {
    const encoder = new TextEncoder('utf-8');
    let attribute = {};

    if (key === 'dtype' || key === 'T') {
        value = tensorflowDataTypes[value];
    } 

    switch (typeof value) {
        case "number":
            if (key === 'dtype' || key === 'T') {
                attribute = { type: value };
            } else if (Number.isInteger(value)) {
                attribute = { i: value };
            } else {
                attribute = { f: value };
            }
            break;
        case "boolean":
            attribute = { b: value };
            break;
        case "string":
            attribute = { s: encoder.encode(value) };
            break;
        case "object":
            if (key === 'shape') {
                attribute = { shape: { dim: value.map((dim) => ({ size: dim })) } };
            } else if (key === 'value') {
                const tensorValue = {
                    dtype: tensorflowDataTypes[value.dtype],
                    tensorShape: { dim: value.shape.map((dim) => ({ size: dim })) },
                    tensorContent: value.content ? [] : [], ////////// fix tensor content
                };
                attribute = { tensor: tensorValue };
            } else if (key === "_class") {
                const listValue = { s: value.list.map(elem => encoder.encode(elem)) };
                attribute = { list: listValue };
            }
            break;
    }

    return AttrValue.create(attribute);
}

export { serializeTensorFlowModel };
