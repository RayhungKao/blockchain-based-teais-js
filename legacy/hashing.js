const crypto = require('crypto');

function generateHashes(data, columnsToHash) {
    return data.map(row => {
        const concatenatedValues = columnsToHash
            .map(col => String(row[col]))
            .join('');
        return crypto
            .createHash('sha256')
            .update(concatenatedValues)
            .digest('hex');
    });
}

module.exports = { generateHashes };