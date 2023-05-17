import { onnxDataTypes, tensorflowDataTypes } from "./dataTypes.js";

export const onnxNodeAttributes = {
    Input: {
        elemType: Object.keys(onnxDataTypes),
        shape: [],
        content: []       
    },
    Output: {
        elemType: Object.keys(onnxDataTypes),
        shape: []          
    },
    Conv: {
        strides: [],
        pads: [],
        kernel_shape: []
    },
    Relu: {},
    MaxPool: {
        strides: [],
        pads: [],
        kernel_shape: []   
    },
    Concat: {
        axis: 0
    },
    Dropout: {
        ratio: 0,
        is_test: false
    },
    GlobalAveragePool: {},
    Softmax: {}
};

export const tensorflowNodeAttributes = {
    Placeholder: {
        dtype: Object.keys(tensorflowDataTypes),
        shape: []
    },
    Identity: {
        T: Object.keys(tensorflowDataTypes),
        _class: {
            list: []
        }
    },
    Const: {
        dtype: Object.keys(tensorflowDataTypes),
        value: {
            content: [],
            shape: [],
            dtype: Object.keys(tensorflowDataTypes)
        }
    },
    BiasAdd: {
        data_format: ['NHWC', 'NCHW'],
        T: Object.keys(tensorflowDataTypes)
    },
    MatMul: {
        transpose_a: false,
        transpose_b: false,
        T: Object.keys(tensorflowDataTypes)
    },
    Elu: {
        T: Object.keys(tensorflowDataTypes)
    }
};
