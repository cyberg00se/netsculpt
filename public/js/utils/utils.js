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

export { loadProtoDefinition, getFirstNonEmptyProperty, parseArrayString };
