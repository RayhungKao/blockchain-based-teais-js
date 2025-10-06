const XLSX = require("xlsx");
const crypto = require("crypto");
const { CompanyPaillierKeyGenerator } = require("./companyKeyGenerator");

/**
 * Generate sample accounting data for blockchain-based triple-entry AIS
 * Based on research papers on triple-entry bookkeeping and fraud prevention
 *
 * Enhanced with real Paillier keypairs for each company
 * Each company can encrypt/decrypt their own transaction amounts
 *
 * References:
 * - JuihungKao: Multi-party Paillier encryption for accounting systems
 * - Blockchain Technology for Triple-Entry Accounting System (ResearchGate)
 * - Triple-entry bookkeeping with blockchain implementations
 */

// Initialize the company key generator
const keyGenerator = new CompanyPaillierKeyGenerator();

// Initialize companies with real Paillier keypairs
function initializeCompaniesWithKeypairs() {
  console.log("🔑 Initializing companies with real Paillier keypairs...");

  const companyTemplates = [
    { name: "TechCorp Solutions", id: "TC001", type: "vendor" },
    { name: "Global Manufacturing Inc", id: "GM002", type: "customer" },
    { name: "Supply Chain Logistics", id: "SC003", type: "vendor" },
    { name: "Digital Services Ltd", id: "DS004", type: "customer" },
    { name: "Advanced Materials Co", id: "AM005", type: "vendor" },
    { name: "Retail Distribution Network", id: "RD006", type: "customer" },
    { name: "Financial Services Group", id: "FS007", type: "service_provider" },
    { name: "Transportation Systems", id: "TS008", type: "vendor" },
  ];

  const companiesWithKeys = companyTemplates.map((company, index) => {
    console.log(`  Generating keys for ${company.name}...`);

    // Generate real Paillier keypair
    const paillierKeypair = keyGenerator.generateCompanyKeypair(index);

    // Generate signing keypair
    const signingKeypair = keyGenerator.generateSigningKeypair();

    // Serialize public key for Excel compatibility
    const publicKeyBase64 = keyGenerator.serializePublicKeyForExcel(
      paillierKeypair.publicKey
    );

    return {
      ...company,
      // Real Paillier keys
      paillierPublicKey: paillierKeypair.publicKey,
      paillierPrivateKey: paillierKeypair.privateKey,

      // Digital signature keys
      signingPublicKey: signingKeypair.publicKey,
      signingPrivateKey: signingKeypair.privateKey,

      // For Excel compatibility (backward compatibility)
      publicKey: publicKeyBase64,

      // Metadata
      keyMetadata: {
        paillierModulus: paillierKeypair.publicKey.n.toString(),
        keySize: paillierKeypair.metadata.keySize,
        companyIndex: index,
      },
    };
  });

  console.log(
    `✅ Initialized ${companiesWithKeys.length} companies with real keypairs`
  );
  return companiesWithKeys;
}

// Generate companies with real keys
const companies = initializeCompaniesWithKeypairs();

// Sample products/services for transactions
const items = [
  {
    description: "Software License Annual Subscription",
    unit: "license",
    basePrice: 2500,
  },
  {
    description: "Cloud Storage Service Monthly",
    unit: "GB-month",
    basePrice: 0.05,
  },
  {
    description: "Professional Consulting Hours",
    unit: "hour",
    basePrice: 150,
  },
  { description: "Hardware Equipment Servers", unit: "unit", basePrice: 5000 },
  { description: "Database Management Service", unit: "month", basePrice: 800 },
  {
    description: "Security Audit and Assessment",
    unit: "project",
    basePrice: 15000,
  },
  {
    description: "Training and Support Package",
    unit: "package",
    basePrice: 3000,
  },
  { description: "Data Analytics Platform", unit: "license", basePrice: 12000 },
  {
    description: "Network Infrastructure Setup",
    unit: "project",
    basePrice: 25000,
  },
  {
    description: "Mobile Application Development",
    unit: "project",
    basePrice: 45000,
  },
  { description: "System Integration Services", unit: "hour", basePrice: 200 },
  {
    description: "Backup and Recovery Solution",
    unit: "month",
    basePrice: 1200,
  },
];

// Generate cryptographic key pairs for demonstration
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // Return shortened public key for demo (first 32 chars of base64)
  const shortPubKey = Buffer.from(publicKey)
    .toString("base64")
    .substring(0, 32);
  return shortPubKey;
}

// Generate realistic transaction dates over the past 6 months
function generateRandomDate() {
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  const end = new Date();

  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

// Generate sample transaction data
function generateSampleTransactions(count = 50) {
  const transactions = [];

  for (let i = 1; i <= count; i++) {
    const seller = companies[Math.floor(Math.random() * companies.length)];
    let buyer;
    do {
      buyer = companies[Math.floor(Math.random() * companies.length)];
    } while (buyer.id === seller.id);

    const item = items[Math.floor(Math.random() * items.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const unitPrice = item.basePrice * (0.8 + Math.random() * 0.4); // ±20% variation
    const amount = quantity * unitPrice;

    // Use the actual public keys from the company records
    const pkSender = seller.publicKey; // Base64 for Excel compatibility
    const pkRecipient = buyer.publicKey; // Base64 for Excel compatibility

    // Store real Paillier public keys for encryption (NEW!)
    const senderPaillierKey = seller.paillierPublicKey;
    const recipientPaillierKey = buyer.paillierPublicKey;

    // Generate hash of transaction info (simplified for demo)
    const transactionInfo = `${seller.id}-${
      buyer.id
    }-${amount}-${generateRandomDate()}`;
    const hashedATInfo = crypto
      .createHash("sha256")
      .update(transactionInfo)
      .digest("hex");

    const transaction = {
      "#": i,
      seller: seller.name,
      buyer: buyer.name,
      date: generateRandomDate(),
      quantity: quantity,
      unit: item.unit,
      "unit-price": parseFloat(unitPrice.toFixed(2)),
      amount: parseFloat(amount.toFixed(2)),
      "item-description": item.description,

      // Company identification keys (Excel compatible)
      pk_sender: pkSender,
      pk_recipient: pkRecipient,

      // Company IDs for lookup
      sender_id: seller.id,
      recipient_id: buyer.id,

      // Real Paillier key metadata (for future dual encryption)
      sender_paillier_n: senderPaillierKey.n.toString(),
      recipient_paillier_n: recipientPaillierKey.n.toString(),
      sender_paillier_g: senderPaillierKey.g.toString(),
      recipient_paillier_g: recipientPaillierKey.g.toString(),

      // Transaction integrity
      "hashed-AT-info": hashedATInfo,

      // Encryption fields (will be filled by dual encryption process)
      "HE_pk_sender(amount)": "", // Encrypted with sender's Paillier key
      "HE_pk_recipient(amount)": "", // Encrypted with recipient's Paillier key

      // Processing fields
      homomorphic_original_sum: "",
      homomorphic_total_sum: "",
      decrypted_original_sum_hash: "",
      decrypted_total_sum_hash: "",
    };

    transactions.push(transaction);
  }

  return transactions;
}

// Generate additional metadata for blockchain integration
function generateBlockchainMetadata(transactions) {
  return transactions.map((tx, index) => ({
    ...tx,
    block_height: Math.floor(index / 10) + 1, // 10 transactions per block
    transaction_hash: crypto
      .createHash("sha256")
      .update(JSON.stringify(tx))
      .digest("hex"),
    previous_hash:
      index > 0
        ? crypto
            .createHash("sha256")
            .update(JSON.stringify(transactions[index - 1]))
            .digest("hex")
        : "0".repeat(64),
    timestamp: Date.now() + index * 1000, // Sequential timestamps
    nonce: Math.floor(Math.random() * 1000000),
    merkle_root: crypto
      .createHash("sha256")
      .update(`merkle_${index}`)
      .digest("hex"),
  }));
}

// Create Excel file with sample data
function createSampleExcelFile(filename = "sample.xlsx") {
  console.log("Generating sample accounting transactions...");

  // Generate base transactions
  const transactions = generateSampleTransactions(30);

  // Add blockchain metadata
  const enhancedTransactions = generateBlockchainMetadata(transactions);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(enhancedTransactions);

  // Set column widths for better readability
  const colWidths = [
    { wch: 5 }, // #
    { wch: 25 }, // seller
    { wch: 25 }, // buyer
    { wch: 12 }, // date
    { wch: 10 }, // quantity
    { wch: 15 }, // unit
    { wch: 12 }, // unit-price
    { wch: 12 }, // amount
    { wch: 35 }, // item-description
    { wch: 35 }, // pk_sender
    { wch: 35 }, // pk_recipient
    { wch: 40 }, // hashed-AT-info
    { wch: 20 }, // HE_pk_sender(amount)
    { wch: 20 }, // HE_pk_recipient(amount)
    { wch: 20 }, // homomorphic_original_sum
    { wch: 20 }, // homomorphic_total_sum
    { wch: 20 }, // decrypted_original_sum_hash
    { wch: 20 }, // decrypted_total_sum_hash
  ];

  ws["!cols"] = colWidths;

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Write the file
  XLSX.writeFile(wb, filename);

  console.log(`Sample data written to ${filename}`);
  console.log(`Generated ${enhancedTransactions.length} transactions`);
  console.log(
    `Total transaction value: $${enhancedTransactions
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toLocaleString()}`
  );

  // Print some sample data for verification
  console.log("\nSample transactions:");
  enhancedTransactions.slice(0, 3).forEach((tx, index) => {
    console.log(
      `${index + 1}. ${tx.seller} → ${tx.buyer}: $${tx.amount} for ${
        tx["item-description"]
      }`
    );
  });

  return enhancedTransactions;
}

// Generate additional test scenarios
function createTestScenarios() {
  console.log("\nCreating additional test scenarios...");

  // Scenario 1: High-value transactions for fraud detection testing
  const highValueTransactions = generateSampleTransactions(10).map((tx) => ({
    ...tx,
    amount: tx.amount * 10, // 10x multiplier for high-value testing
    "item-description": `HIGH-VALUE: ${tx["item-description"]}`,
  }));

  // Scenario 2: Rapid successive transactions (potential money laundering pattern)
  const rapidTransactions = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const tx = generateSampleTransactions(1)[0];
    tx.date = new Date(baseDate.getTime() + i * 60000)
      .toISOString()
      .split("T")[0]; // 1 minute intervals
    tx["item-description"] = `RAPID-SERIES: ${tx["item-description"]}`;
    rapidTransactions.push(tx);
  }

  // Scenario 3: Round number transactions (potential manipulation)
  const roundNumberTransactions = generateSampleTransactions(8).map((tx) => ({
    ...tx,
    amount: Math.round(tx.amount / 1000) * 1000, // Round to nearest thousand
    "item-description": `ROUND-AMOUNT: ${tx["item-description"]}`,
  }));

  // Combine all scenarios
  const allScenarios = [
    ...highValueTransactions,
    ...rapidTransactions,
    ...roundNumberTransactions,
  ];

  // Create separate test file
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(allScenarios);
  XLSX.utils.book_append_sheet(wb, ws, "TestScenarios");
  XLSX.writeFile(wb, "fraud_detection_test_scenarios.xlsx");

  console.log("Test scenarios created in fraud_detection_test_scenarios.xlsx");
  return allScenarios;
}

// Main execution
if (require.main === module) {
  console.log("Blockchain-based Triple-Entry AIS Sample Data Generator");
  console.log("======================================================");
  console.log("References:");
  console.log("- Yuji Ijiri: Triple-entry bookkeeping framework");
  console.log("- Blockchain Technology for Triple-Entry Accounting");
  console.log("- Verifiable Triple-Entry AIS for Fraud Prevention");
  console.log("======================================================\n");

  // Generate main sample data
  const mainData = createSampleExcelFile("sample.xlsx");

  // Generate test scenarios
  const testData = createTestScenarios();

  console.log("\n📊 Sample data generation completed!");
  console.log("Files created:");
  console.log("- sample.xlsx (main sample data)");
  console.log("- fraud_detection_test_scenarios.xlsx (test scenarios)");
  console.log("\nThe data includes realistic accounting transactions with:");
  console.log("✅ Company names and transaction details");
  console.log("✅ Cryptographic public keys for participants");
  console.log("✅ Transaction hashes and blockchain metadata");
  console.log("✅ Fields for homomorphic encryption testing");
  console.log("✅ Various transaction patterns for fraud detection");
  console.log("✅ Real Paillier keypairs for each company (NEW!)");
  console.log("✅ Company-specific encryption capabilities (NEW!)");
}

// Export company keypairs for use by other modules
function getCompanyKeypairs() {
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    type: company.type,
    paillierPublicKey: company.paillierPublicKey,
    paillierPrivateKey: company.paillierPrivateKey,
    signingPublicKey: company.signingPublicKey,
    signingPrivateKey: company.signingPrivateKey,
    keyMetadata: company.keyMetadata,
  }));
}

// Get public keys only (for external verification)
function getCompanyPublicKeys() {
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    type: company.type,
    paillierPublicKey: company.paillierPublicKey,
    signingPublicKey: company.signingPublicKey,
    publicKeyBase64: company.publicKey,
    keyMetadata: company.keyMetadata,
  }));
}

// Find company by ID
function getCompanyById(companyId) {
  return companies.find((company) => company.id === companyId);
}

// Find company by name
function getCompanyByName(companyName) {
  return companies.find((company) => company.name === companyName);
}

module.exports = {
  generateSampleTransactions,
  generateBlockchainMetadata,
  createSampleExcelFile,
  createTestScenarios,
  // NEW: Company keypair functions
  getCompanyKeypairs,
  getCompanyPublicKeys,
  getCompanyById,
  getCompanyByName,
  companies, // Export companies array directly
};
