export const onnxNodeTypes = {
    INPUT: 'Input',
    OUTPUT: 'Output',
    CONV: 'Conv',
    RELU: 'Relu',
    MAX_POOL: 'MaxPool',
    CONCAT: 'Concat',
    DROPOUT: 'Dropout',
    GLOBAL_AVERAGE_POOL: 'GlobalAveragePool',
    SOFTMAX: 'Softmax'
};

export const tensorflowNodeTypes = {
    PLACEHOLDER: 'Placeholder',
    IDENTITY: 'Identity',
    CONST: 'Const',
    BIAS_ADD: 'BiasAdd',
    MAT_MUL: 'MatMul',
    ELU: 'Elu'
};
