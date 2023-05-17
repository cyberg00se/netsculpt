# NetSculpt

NetSculpt app.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Setup

To set up the NetSculpt project, follow these steps:

1. Clone the Git repository using the following command:
```
git clone https://github.com/cyberg00se/netsculpt.git
```

2. Change into the project directory:
```
cd netsculpt
```
3. Make sure you have the NeutralinoJS CLI installed. If you don't have it installed, you can install it using the following command:
```
npm install -g @neutralinojs/neu
```

4. Start the application:
```
neu run
```
5. Open your web browser and navigate to http://localhost:3000 to access the NetSculpt application (default mode).

## Configuration

To configure the Neutralino project, follow these steps:

1. Set the environment variable `NL_MODE` or `defaultMode` variable in [config file](neutralino.config.json) to `window` or `browser`.

2. Set any other configuration options as required.

## Sample model files

* **ONNX**: [squeezenet](https://media.githubusercontent.com/media/onnx/models/main/vision/classification/squeezenet/model/squeezenet1.0-3.onnx)
* **TensorFlow**: [chessbot](https://raw.githubusercontent.com/srom/chessbot/master/model/chessbot.pb)

## Formats support

This application supports the following model types:

- **ONNX**
- **TensorFlow**

### ONNX Support

**Node Types**

The application supports the following ONNX node types:

- Input
- Output
- Conv
- Relu
- MaxPool
- Concat
- Dropout
- GlobalAveragePool
- Softmax

Please refer to the ONNX documentation for more information on these node types.

**Data Types**

The application supports the following ONNX data types:

- undefined
- float
- uint8
- int8
- uint16
- int16
- int32
- int64
- string
- bool
- float16
- double
- uint32
- uint64
- complex64
- complex128
- bfloat16

Please refer to the ONNX documentation for more information on these data types.

**Attributes**

The application supports different attributes for each ONNX node type. Here is a list of attributes for each node type:

- Input
  - elemType
  - shape
  - content
- Output
  - elemType
  - shape
- Conv
  - strides
  - pads
  - kernel_shape
- Relu
  (No specific attributes)
- MaxPool
  - strides
  - pads
  - kernel_shape
- Concat
  - axis
- Dropout
  - ratio
  - is_test
- GlobalAveragePool
  (No specific attributes)
- Softmax
  (No specific attributes)

Please refer to the ONNX documentation for more information on these attributes.

### TensorFlow Support

**Node Types**

The application supports the following TensorFlow node types:

- Placeholder
- Identity
- Const
- BiasAdd
- MatMul
- Elu

Please refer to the TensorFlow documentation for more information on these node types.

**Data Types**

The application supports the following TensorFlow data types:

- DT_FLOAT
- DT_DOUBLE
- DT_INT32
- DT_UINT8
- DT_INT16
- DT_INT8
- DT_STRING
- DT_COMPLEX64
- DT_INT64
- DT_BOOL
- DT_QINT8
- DT_QUINT8
- DT_QINT32
- DT_BFLOAT16
- DT_QINT16
- DT_QUINT16
- DT_UINT16
- DT_COMPLEX128
- DT_HALF
- DT_RESOURCE
- DT_VARIANT
- DT_UINT32
- DT_UINT64
- DT_FLOAT8_E5M2
- DT_FLOAT8_E4M3FN

Please refer to the TensorFlow documentation for more information on these data types.

**Attributes**

The application supports different attributes for each TensorFlow node type. Here is a list of attributes for each node type:

- Placeholder
  - dtype
  - shape
- Identity
  - T
  - _class
    - list
- Const
  - dtype
  - value
    - content
    - shape
    - dtype
- BiasAdd
  - data_format
  - T
- MatMul
  - transpose_a
  - transpose_b
  - T
- Elu
  - T

Please refer to the TensorFlow documentation for more information on these attributes.

