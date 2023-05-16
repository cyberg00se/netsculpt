import { loadProtoDefinition, stringifyArray } from '../utils/utils.js';

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

            const rawModel = model.getRaw();

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
        value = TensorflowDataType[value];
    } 

    switch (typeof value) {
        case "number":
            if (key === 'dtype' || key === 'T') {
                attribute = { type: value };
            } else if (Number.isInteger(value)) { //missing props from attr value in simple attrs?...
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
                    //////TENSOR PROTO, there are many additional props
                    dtype: TensorflowDataType[value.dtype],
                    tensorShape: { dim: value.shape.map((dim) => ({ size: dim })) },
                    tensorContent: value.content ? [] : [], ////////// fix tensor content
                };
                attribute = { tensor: tensorValue };
            } else if (key === "_class") {
                const listValue = serializeTensorflowAttributeValue("list", stringifyArray(value.list), AttrValue);
                attribute = { list: listValue };
            }
            break;
    }

    return AttrValue.create(attribute);
}

const TensorflowDataType = {
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

export { serializeTensorFlowModel };
