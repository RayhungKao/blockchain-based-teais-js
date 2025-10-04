const { PaillierEncryption } = require('./paillierEncryption');
const { readExcelFile, writeToExcel, encryptAmounts, calculateHomomorphicSum } = require('./excelOperations');

async function processAccounting(data) {
    console.log('Starting processAccounting...');
    
    // Initialize Paillier cryptosystem
    console.log('Initializing Paillier encryption...');
    
    // For normal mode
    const paillier = new PaillierEncryption(2048);
    // For test mode
    // const paillier = new PaillierEncryption(true);

    console.log('Paillier encryption initialized.');

    // Encrypt transaction amounts
    console.log('Encrypting data...');
    const encryptedData = encryptAmounts(data, paillier);
    console.log(`Encrypted ${data.length} items.`);
    console.log('Encrypted data:', encryptedData);
    
    // Calculate homomorphic sum
    console.log('Calculating homomorphic sum...');
    const totalSum = calculateHomomorphicSum(encryptedData, paillier);
    console.log('Homomorphic sum calculated.');

    // Decrypt and verify
    console.log('Decrypting and verifying sums...');
    const decryptedSum = paillier.decrypt(totalSum);
    console.log('Decrypted sum:', BigInt(decryptedSum));

    const actualSum = data.reduce((sum, row) => sum + Number(row.amount), 0);
    console.log('Actual sum:', BigInt(actualSum));

    console.log('Verification:', BigInt(actualSum) === decryptedSum);

    console.log('Process complete.');
    return encryptedData;
}

// In the main function, add more logging:
async function main() {
    try {
        console.log('Starting main function...');
        const data = readExcelFile('example.xlsx', 'Sheet1');
        console.log('Excel file read successfully.');

        console.log('Processing accounting data...');
        const processedData = await processAccounting(data);
        console.log('Processing completed.');

        console.log('Writing results to Excel...');
        writeToExcel(processedData, 'output.xlsx', 'Sheet1');
        console.log('Results written to output.xlsx');

        console.log('Processing completed successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the main function
console.log('Executing main function...');
main().then(() => {
    console.log('Execution completed.');
});