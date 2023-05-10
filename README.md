# NetSculpt

NetSculpt app.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Icon credits

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

1. Set the environment variable `NL_MODE` or `defaultMode` variable in [config file](neutralino.config.js) to `window` or `browser`.

2. Set any other configuration options as required.

## Sample model files

* **ONNX**: [squeezenet](https://media.githubusercontent.com/media/onnx/models/main/vision/classification/squeezenet/model/squeezenet1.0-3.onnx)
* **TensorFlow**: [chessbot](https://raw.githubusercontent.com/srom/chessbot/master/model/chessbot.pb)

