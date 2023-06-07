const crypto = require('crypto');

function generateRandomBuffer(length) {
    return crypto.randomBytes(length);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const length = binaryString.length;
    const buffer = new ArrayBuffer(length);
    const array = new Uint8Array(buffer);

    for (let i = 0; i < length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}

function convertArrayBufferToPEM(arrayBuffer, type) {
    const base64 = arrayBufferToBase64(arrayBuffer);
    const pemHeader = `-----BEGIN ${type}-----\n`;
    const pemFooter = `\n-----END ${type}-----\n`;

    return pemHeader + base64 + pemFooter;
}

function arrayBufferToBase64(arrayBuffer) {
    const binary = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    return window.btoa(binary);
}

module.exports = {
    generateRandomBuffer,
    base64ToArrayBuffer,
    convertArrayBufferToPEM,
    arrayBufferToBase64,
};
