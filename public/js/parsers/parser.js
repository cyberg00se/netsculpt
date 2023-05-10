import * as onnxParser from './onnxParser.js';
import * as tensorflowParser from './tensorflowParser.js';

function parseModelFromFile(file) {
    if (file.type === "application/onnx" || file.name.endsWith(".onnx")) {
        return onnxParser.parseONNXModelFromFile(file);
    } else if (file.type === "application/tf" || file.name.endsWith(".pb")) {
        return tensorflowParser.parseTensorFlowModelFromFile(file);
    } else {
        return Promise.reject("Unsupported file type: " + file.type);
    }
}

export { parseModelFromFile };
