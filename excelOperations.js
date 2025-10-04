const XLSX = require('xlsx');

function readExcelFile(fileName, sheetName) {
    console.log(`Reading Excel file: ${fileName}, Sheet: ${sheetName}`);

    try {
        const workbook = XLSX.readFile(fileName);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate that the required columns exist
        const requiredColumns = [
            '#', 'seller', 'buyer', 'date', 'quantity', 'unit', 
            'unit-price', 'amount', 'item-description', 'pk_sender', 
            'pk_recipient', 'hashed-AT-info', 'HE_pk_sender(amount)', 
            'HE_pk_recipient(amount)', 'homomorphic_original_sum', 
            'homomorphic_total_sum', 'decrypted_original_sum_hash', 
            'decrypted_total_sum_hash'
        ];

        if (data.length > 0) {
            const missingColumns = requiredColumns.filter(col => 
                !Object.keys(data[0]).includes(col));
            
            if (missingColumns.length > 0) {
                console.warn('Warning: Missing columns:', missingColumns);
            }
        }

        return data;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        throw error;
    }
}

function writeToExcel(data, fileName, sheetName) {
    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('Error writing to Excel file:', error);
        throw error;
    }
}

function generateAndAddHashes(data, columnsToHash, hashedColumnName, generateHashes) {
    // Check if data is empty or undefined
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("No data provided or data is empty");
        return [];
    }

    // Check if all required columns exist
    if (columnsToHash.every(col => data[0].hasOwnProperty(col))) {
        const hashes = generateHashes(data, columnsToHash);
        data.forEach((row, index) => {
            row[hashedColumnName] = hashes[index];
        });
        console.log("Data with hashes:", data);
    } else {
        console.log("One or more specified columns are missing in the data. Available columns:", Object.keys(data[0]));
    }
    return data;
}

function updateColumn(data, columnName, newData) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.log("No data provided or data is empty");
        return [];
    }
    return data.map((row, index) => ({
        ...row,
        [columnName]: newData[index]
    }));
}

function encryptAmounts(data, paillier) {
    console.log('Encrypting amounts...');
    const encryptedData = data.map(row => ({
        ...row,
        'HE_pk_sender(amount)': paillier.encrypt(BigInt(row.amount)).toString(),
        'HE_pk_recipient(amount)': paillier.encrypt(BigInt(row.amount)).toString()
    }));
    console.log('Encryption complete. Encrypted items:', encryptedData.length);
    return encryptedData;
}

function calculateHomomorphicSum(data, paillier) {
    console.log('Calculating homomorphic sum...');
    const encryptedAmounts = data.map(row => BigInt(row['HE_pk_sender(amount)']));
    console.log('Encrypted amounts:', encryptedAmounts);
    if (encryptedAmounts.length === 0) {
        console.log('No encrypted amounts found. Returning 0.');
        return BigInt(0);
    }
    return encryptedAmounts.reduce((sum, curr) => paillier.add(sum, curr));
}

module.exports = {
    readExcelFile,
    writeToExcel,
    generateAndAddHashes,
    updateColumn,
    encryptAmounts,
    calculateHomomorphicSum
};