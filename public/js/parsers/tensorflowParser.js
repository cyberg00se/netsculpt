import { Node } from "../models/Node.js";
import { Connection } from "../models/Connection.js"; 
import { NeuralNetworkModel } from "../models/NeuralNetworkModel.js";
import { loadProtoDefinition, getFirstNonEmptyProperty } from '../utils/utils.js';
import { ModelType } from "../constants/ModelType.js";
import { tensorflowDataTypesReverse } from "../constants/dataTypes.js";

async function parseTensorFlowModelFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                console.log('Parsing TensorFlow model:', file.name);
                const modelData = new Uint8Array(event.target.result);

                const tfProto = await loadProtoDefinition("js/lib/tensorflow/framework/graph.proto");
                const root = protobuf.Root.fromJSON(tfProto);

                const rawModel = root.lookupType("tensorflow.GraphDef").decode(modelData);
                console.log(rawModel);

                const nodes = rawModel.node.map((node) => {
                    const id = node.name;
                    const type = node.op;
                    const name = node.name;
                    const inputs = node.input;
                    const outputs = [];
                    for (const otherNode of rawModel.node) {
                      if (otherNode.input.includes(id)) {
                        outputs.push(otherNode.name);
                      }
                    }

                    const attributes = {};
                    for(const key of Object.keys(node.attr)) {
                      const attrValueObjectKey = Object.keys(node.attr[key])[0];
                      const attrValueObject = node.attr[key][attrValueObjectKey];
                      
                      attributes[key] = parseTensorflowAttributeValue(attrValueObjectKey, attrValueObject);
                    }

                    return new Node(id, type, name, inputs, outputs, attributes);
                });
                const connections = nodes.reduce((acc, node) => {
                    node.inputs.forEach((input) => {
                      const fromNode = nodes.find((n) => n.name === input);
                      if (fromNode) {
                        const connection = new Connection(`${fromNode.name}_${node.name}`, fromNode, node);
                        acc.push(connection);
                      }
                    });
                  
                    return acc;
                  }, []).filter((connection, index, self) => {
                    return self.findIndex(c => c.isEqual(connection)) === index
                  });

                const parsedModel = new NeuralNetworkModel(nodes, connections, ModelType.TENSORFLOW, rawModel, file.name);

                resolve(parsedModel);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

function parseTensorflowAttributeValue(key, value) {
  const decoder = new TextDecoder('utf-8');

  switch (key) {
    case 'f' || 'i':
      return value;
    case 'b':
      return value === 1;
    case 's':
      return decoder.decode(value);
    case 'type':
      return tensorflowDataTypesReverse[value];
    case 'shape':
      return value.dim.map(dim => dim.size);
    case 'tensor':
      return {
        dtype: tensorflowDataTypesReverse[value.dtype],
        shape: value.tensorShape.dim.map(dim => dim.size),
        //tensorContent is HUGE
        content: value.tensorContent.length > 0 ? '...' : []
      }
    case 'list':
      const complexObj = {};

      const listKey = getFirstNonEmptyProperty(value).key;
      const nestedValue = listKey === 's' ? value[listKey].map(listEntry => { return decoder.decode(listEntry) }) : value.listKey;
      complexObj[key] = nestedValue;

      return complexObj;
    default:
      return null;
  }
}

export { parseTensorFlowModelFromFile };
