import { ModelType } from '../models/NeuralNetworkModel.js';
import * as onnxSerializer from './onnxSerializer.js';
import * as tensorflowSerializer from './tensorflowSerializer.js';

function serializeModel(model) {
    if (model.type === ModelType.ONNX) {
        //return onnxSerializer.serializeONNXModel(model);
        return;
    } else if (model.type === ModelType.TENSORFLOW) {
        return tensorflowSerializer.serializeTensorFlowModel(model);
    } else {
        return Promise.reject("Unsupported model type: " + model.type);
    }
}

export { serializeModel };