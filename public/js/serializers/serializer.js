import { ModelType } from '../models/NeuralNetworkModel.js';
import * as onnxSerializer from './onnxSerializer.js';
import * as tensorflowSerializer from './tensorflowSerializer.js';

async function serializeModel(model) {
    if (model.type === ModelType.ONNX) {
        //return await onnxSerializer.serializeONNXModel(model);
        return;
    } else if (model.type === ModelType.TENSORFLOW) {
        return await tensorflowSerializer.serializeTensorFlowModel(model);
    } else {
        return Promise.reject("Unsupported model type: " + model.type);
    }
}

export { serializeModel };