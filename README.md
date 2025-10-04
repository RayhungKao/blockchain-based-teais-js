# Blockchain-Based Triple-Entry Accounting Information System (TEAIS)

A JavaScript implementation of a blockchain-based verifiable triple-entry accounting information system for financial statement fraud prevention. This system combines traditional triple-entry bookkeeping with homomorphic encryption and blockchain technology to ensure data integrity and enable secure financial verification.

## 🚀 Features

- **Triple-Entry Accounting**: Complete implementation with debit, credit, and blockchain verification entries
- **Homomorphic Encryption**: Paillier cryptosystem for privacy-preserving calculations
- **Blockchain Integration**: Metadata structure for transaction verification and immutability
- **Fraud Detection**: Test scenarios for identifying suspicious transaction patterns
- **Excel Integration**: Import/export functionality for existing accounting workflows

## 📋 Setup Instructions

1. **Install Dependencies**:

   ```sh
   npm install
   ```

2. **Run the Main Script**:
   ```sh
   node index.js
   ```

## 📁 Project Structure

```
├── index.js                    # Main application entry point
├── paillierEncryption.js       # Paillier homomorphic encryption implementation
├── excelOperations.js          # Excel file I/O and data processing
├── hashing.js                  # SHA-256 hashing utilities
├── sampleDataGenerator.js      # Test data generation
├── sample.xlsx                # Sample input data
├── output.xlsx                 # Processed results with encrypted amounts
└── README.md                   # This file
```

## 🔧 Core Components

### Paillier Homomorphic Encryption

- **Key Size**: 1,022,117 (1009 × 1013 primes) for demonstration
- **Features**: Addition operations on encrypted data
- **Security**: Configurable for production use with larger keys

### Triple-Entry Structure

Each transaction includes:

- **Debit Entry**: Traditional debit accounting entry
- **Credit Entry**: Traditional credit accounting entry
- **Blockchain Entry**: Cryptographic hash and metadata for verification

### Blockchain Metadata

- Transaction hashes (SHA-256)
- Merkle tree roots for batch verification
- Nonce values for proof-of-work simulation
- Previous block references for chain integrity

## 🔐 Security Features

- **Homomorphic Encryption**: Enables calculations on encrypted data without decryption
- **Cryptographic Hashing**: SHA-256 for transaction integrity
- **Immutable Records**: Blockchain structure prevents tampering
- **Privacy Preservation**: Sensitive amounts remain encrypted throughout processing

## 📊 Sample Data

The system includes realistic test data:

- **Companies**: 8 diverse business entities
- **Transaction Types**: Software licenses, consulting, hardware, cloud services
- **Amount Range**: $3.23 to $4.7M
- **Time Period**: 6 months of business transactions
- **Fraud Scenarios**: High-value, rapid-sequence, and suspicious patterns

## ✅ Current Status

### Completed Features

- ✅ Sample data generation (30 realistic transactions totaling $16.5M)
- ✅ Complete triple-entry accounting format with blockchain metadata
- ✅ Paillier homomorphic encryption implementation
- ✅ Fraud detection test scenarios
- ✅ Excel integration for data import/export
- ✅ Homomorphic sum verification

## ⚠️ Production Considerations

1. **Key Security**: Current implementation uses demonstration keys - production requires secure key generation and management
2. **Blockchain Integration**: Currently simulated - needs integration with real blockchain networks (Ethereum, Hyperledger)
3. **Performance**: Encryption operations may need optimization for large-scale deployment
4. **Compliance**: Consider regulatory requirements for encrypted financial data

## 🚀 Future Work

**1**:

- Implement secure key management system
- Add comprehensive input validation

**2**:

- Integrate with real blockchain network (Ethereum/Hyperledger Fabric)
- Implement multi-user access controls
- Add REST API for external system integration

**3**:

- Production-ready security implementation (2048+ bit keys)
- Integration with existing ERP/accounting systems
- Advanced fraud detection algorithms
- Compliance reporting features

## 🔗 Technical References

- **Paillier Cryptosystem**: Homomorphic encryption for privacy-preserving computations
- **Triple-Entry Bookkeeping**: Enhanced accounting method for fraud prevention
- **Blockchain Technology**: Distributed ledger for transaction immutability
- **SHA-256 Hashing**: Cryptographic integrity verification

## 📈 Usage Example

```javascript
// Basic usage flow
const paillier = new PaillierEncryption();
const data = await loadExcelData("example.xlsx");
const encryptedData = encryptAmounts(data, paillier);
const blockchainMetadata = generateBlockchainMetadata(encryptedData);
const verified = verifyHomomorphicSum(encryptedData, paillier);
await saveResults("output.xlsx", encryptedData, blockchainMetadata);
```

## 📝 Contributing

This is an original research implementation. For questions or collaboration opportunities, please create an issue or contact the author.

## 📄 License

This project is part of original research into blockchain-based accounting systems. Please contact the author for usage permissions.

---