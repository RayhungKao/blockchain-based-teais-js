const crypto = require('crypto');
require('dotenv').config();

function generateAndStoreKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return { publicKey, privateKey };
}

function getKeys() {
    const publicKey = process.env.RSA_PUBLIC_KEY;
    const privateKey = process.env.RSA_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        return generateAndStoreKeys();
    }

    return { publicKey, privateKey };
}

function encryptList(publicKey, dataList) {
    return dataList.map(data => {
        const buffer = Buffer.from(String(data));
        return crypto.publicEncrypt(publicKey, buffer);
    });
}

function decryptList(privateKey, encryptedList) {
    return encryptedList.map(encryptedData => {
        return crypto.privateDecrypt(privateKey, encryptedData).toString();
    });
}

function serializeEncryptedList(encryptedList) {
    return JSON.stringify(encryptedList.map(encrypted => encrypted.toString('base64')));
}

function deserializeEncryptedList(serializedList) {
    const parsed = JSON.parse(serializedList);
    return parsed.map(base64Str => Buffer.from(base64Str, 'base64'));
}

module.exports = {
    generateAndStoreKeys,
    getKeys,
    encryptList,
    decryptList,
    serializeEncryptedList,
    deserializeEncryptedList
};