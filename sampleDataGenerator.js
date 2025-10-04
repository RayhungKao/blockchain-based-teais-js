const XLSX = require("xlsx");
const crypto = require("crypto");

/**
 * Generate sample accounting data for blockchain-based triple-entry AIS
 * Based on research papers on triple-entry bookkeeping and fraud prevention
 *
 * References:
 * - Ijiri, Y. (1986). A framework for triple-entry bookkeeping. The Accounting Review
 * - Blockchain Technology for Triple-Entry Accounting System (ResearchGate)
 * - Triple-entry bookkeeping with blockchain implementations
 */

// Sample companies and parties for realistic transactions
const companies = [
  { name: "TechCorp Solutions", id: "TC001", type: "vendor" },
  { name: "Global Manufacturing Inc", id: "GM002", type: "customer" },
  { name: "Supply Chain Logistics", id: "SC003", type: "vendor" },
  { name: "Digital Services Ltd", id: "DS004", type: "customer" },
  { name: "Advanced Materials Co", id: "AM005", type: "vendor" },
  { name: "Retail Distribution Network", id: "RD006", type: "customer" },
  { name: "Financial Services Group", id: "FS007", type: "service_provider" },
  { name: "Transportation Systems", id: "TS008", type: "vendor" },
];

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

    // Generate cryptographic keys for both parties
    const pkSender = generateKeyPair();
    const pkRecipient = generateKeyPair();

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
      pk_sender: pkSender,
      pk_recipient: pkRecipient,
      "hashed-AT-info": hashedATInfo,
      "HE_pk_sender(amount)": "", // Will be filled by encryption process
      "HE_pk_recipient(amount)": "", // Will be filled by encryption process
      homomorphic_original_sum: "", // Will be calculated
      homomorphic_total_sum: "", // Will be calculated
      decrypted_original_sum_hash: "", // Will be calculated
      decrypted_total_sum_hash: "", // Will be calculated
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
function createSampleExcelFile(filename = "enhanced_sample.xlsx") {
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
  const mainData = createSampleExcelFile("enhanced_sample.xlsx");

  // Generate test scenarios
  const testData = createTestScenarios();

  console.log("\n📊 Sample data generation completed!");
  console.log("Files created:");
  console.log("- enhanced_sample.xlsx (main sample data)");
  console.log("- fraud_detection_test_scenarios.xlsx (test scenarios)");
  console.log("\nThe data includes realistic accounting transactions with:");
  console.log("✅ Company names and transaction details");
  console.log("✅ Cryptographic public keys for participants");
  console.log("✅ Transaction hashes and blockchain metadata");
  console.log("✅ Fields for homomorphic encryption testing");
  console.log("✅ Various transaction patterns for fraud detection");
}

module.exports = {
  generateSampleTransactions,
  generateBlockchainMetadata,
  createSampleExcelFile,
  createTestScenarios,
};
