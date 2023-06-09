import { showMessage } from './uiUtils.js';

async function loadProtoDefinition(path) {
    return new Promise((resolve, reject) => {
        protobuf.load(path, (err, root) => {
            if (err) {
                reject(err);
            } else {
                resolve(root);
            }
        });
    });
}

function getFirstNonEmptyProperty(obj, excludeProps = []) {
    for (const prop of Object.keys(obj)) {
        if(!excludeProps.includes(prop)) {
            if (Array.isArray(obj[prop])) {
                if(obj[prop].length > 0) {
                    return { key: prop, value: obj[prop] };
                }
            } else if (obj[prop] !== null && obj[prop] !== undefined) {
                return { key: prop, value: obj[prop] };
            }
        }
    }
    return null;
}

function parseArrayString(str) {
    try {
        const arr = JSON.parse(str);
        if (Array.isArray(arr)) {
            return arr;
        }
    } catch (err) {}
    return str;
}

function stringifyArray(arr) {
    try {
        return JSON.stringify(arr);
    } catch (err) {}
    return arr;
}

function reshapeData(data, shape) {
    const totalSize = shape.reduce((acc, dim) => acc * dim, 1);
    if(data.length === 0) {
        return [];
    }
    if (data.length !== totalSize) {
        showMessage('Data size does not match the specified shape.', 'error');
        throw new Error('Data size does not match the specified shape.');
    }

    const reshapedData = [];
    let dataIndex = 0;

    function traverseShape(arr, shapeIdx) {
        if (shapeIdx === shape.length) {
            arr.push(data[dataIndex]);
            dataIndex++;
        } else {
        const subArr = [];
        for (let i = 0; i < shape[shapeIdx]; i++) {
            traverseShape(subArr, shapeIdx + 1);
        }
        arr.push(subArr);
        }
    }

    traverseShape(reshapedData, 0);
    return reshapedData;
}

function flattenData(data) {
    const flattened = [];
    
    function flatten(arr, result) {
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                flatten(arr[i], result);
            } else {
                result.push(arr[i]);
            }
        }
    }

    flatten(data, flattened);

    return flattened;
}

function getArrayShape(arr) {
    const shape = [];
  
    function traverseArray(currentArr) {
        if (Array.isArray(currentArr)) {
            shape.push(currentArr.length);
            traverseArray(currentArr[0]);
        }
    }
  
    traverseArray(arr);
    return shape;
}

function recursivelySliceArray(arr, num) {
    if (Array.isArray(arr)) {
        const slicedArr = arr.slice(0, num);
        return slicedArr.map((subArr) => recursivelySliceArray(subArr, num));
    }
    return arr;
}

function cleanupObject(obj) {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
            if (Array.isArray(obj[prop])) {
                obj[prop].length = 0;
            } else if (obj[prop] instanceof Uint8Array) {
                obj[prop] = new Uint8Array();
            } else {
                cleanupObject(obj[prop]);
            }
        }
        delete obj[prop];
      }
    }
}

export { 
    loadProtoDefinition, 
    getFirstNonEmptyProperty, 
    parseArrayString, 
    stringifyArray, 
    reshapeData, 
    flattenData, 
    getArrayShape,
    recursivelySliceArray, 
    cleanupObject
};
