// const crypto = require('crypto');

// function generateKeys() {
//     return crypto.generateKeyPairSync('rsa', {
//         modulusLength: 2048,
//         publicKeyEncoding: {
//             type: 'pkcs1',
//             format: 'pem'
//         },
//         privateKeyEncoding: {
//             type: 'pkcs1',
//             format: 'pem'
//         }
//     });
// }

// function encryptData(publicKey, data) {
//     return crypto.publicEncrypt(
//         {
//             key: publicKey,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
//         },
//         Buffer.from(data)
//     );
// }

// function decryptData(privateKey, encryptedData) {
//     return crypto.privateDecrypt(
//         {
//             key: privateKey,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
//         },
//         encryptedData
//     ).toString();
// }

// module.exports = {
//     generateKeys,
//     encryptData,
//     decryptData
// };