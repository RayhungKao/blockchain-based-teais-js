const { DualEncryptionProcessor } = require('./dualEncryption');
const { YearEndVerificationSystem } = require('./yearEndVerification');

async function fullSystemDemo() {
  console.log("🎯 COMPLETE BLOCKCHAIN-BASED MULTI-PARTY ACCOUNTING SYSTEM DEMO");
  console.log("=" .repeat(100));
  console.log("Demonstrating the complete system as envisioned:");
  console.log("• Each company has its own signing key for identity");
  console.log("• Each company has Paillier key for encryption");
  console.log("• Transaction amounts encrypted with both sender AND recipient keys");
  console.log("• Public bulletin board with encrypted amounts");
  console.log("• Year-end verification where actual sums are revealed and verified");
  console.log("=" .repeat(100));

  // Step 1: Initialize the system
  console.log("\n📋 STEP 1: SYSTEM INITIALIZATION");
  console.log("-" .repeat(80));
  const processor = new DualEncryptionProcessor();
  const verificationSystem = new YearEndVerificationSystem();
  
  console.log("✅ Multi-party cryptographic system initialized");
  console.log("🔑 Each company assigned unique Paillier keypairs");
  console.log("🔐 RSA signing keys generated for identity verification");

  // Step 2: Create sample transactions for a fiscal year
  console.log("\n📈 STEP 2: FISCAL YEAR TRANSACTION PROCESSING");
  console.log("-" .repeat(80));
  
  const fiscalYearTransactions = [
    // Q1 Transactions
    { "#": 1, seller: "TechCorp Solutions", buyer: "Global Manufacturing Inc", amount: 15000.00, sender_id: "TC001", recipient_id: "GM002", quarter: "Q1" },
    { "#": 2, seller: "Global Manufacturing Inc", buyer: "Supply Chain Logistics", amount: 8500.50, sender_id: "GM002", recipient_id: "SC003", quarter: "Q1" },
    { "#": 3, seller: "Supply Chain Logistics", buyer: "Digital Services Ltd", amount: 12750.25, sender_id: "SC003", recipient_id: "DS004", quarter: "Q1" },
    
    // Q2 Transactions
    { "#": 4, seller: "Digital Services Ltd", buyer: "Advanced Materials Co", amount: 22000.75, sender_id: "DS004", recipient_id: "AM005", quarter: "Q2" },
    { "#": 5, seller: "Advanced Materials Co", buyer: "Retail Distribution Network", amount: 5000.00, sender_id: "AM005", recipient_id: "RD006", quarter: "Q2" },
    { "#": 6, seller: "Retail Distribution Network", buyer: "Financial Services Group", amount: 18900.30, sender_id: "RD006", recipient_id: "FS007", quarter: "Q2" },
    
    // Q3 Transactions
    { "#": 7, seller: "Financial Services Group", buyer: "Transportation Systems", amount: 11200.80, sender_id: "FS007", recipient_id: "TS008", quarter: "Q3" },
    { "#": 8, seller: "Transportation Systems", buyer: "TechCorp Solutions", amount: 9500.45, sender_id: "TS008", recipient_id: "TC001", quarter: "Q3" },
    { "#": 9, seller: "TechCorp Solutions", buyer: "Advanced Materials Co", amount: 7800.90, sender_id: "TC001", recipient_id: "AM005", quarter: "Q3" },
    
    // Q4 Transactions
    { "#": 10, seller: "Advanced Materials Co", buyer: "Global Manufacturing Inc", amount: 13400.60, sender_id: "AM005", recipient_id: "GM002", quarter: "Q4" },
    { "#": 11, seller: "Global Manufacturing Inc", buyer: "Digital Services Ltd", amount: 16500.75, sender_id: "GM002", recipient_id: "DS004", quarter: "Q4" },
    { "#": 12, seller: "Digital Services Ltd", buyer: "Supply Chain Logistics", amount: 9900.25, sender_id: "DS004", recipient_id: "SC003", quarter: "Q4" }
  ];

  const totalVolume = fiscalYearTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  console.log(`📊 Processing ${fiscalYearTransactions.length} transactions for fiscal year`);
  console.log(`💰 Total transaction volume: $${totalVolume.toLocaleString()}`);
  console.log(`🔄 Quarterly breakdown:`);
  
  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
    const quarterTxs = fiscalYearTransactions.filter(tx => tx.quarter === quarter);
    const quarterVolume = quarterTxs.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`   ${quarter}: ${quarterTxs.length} transactions, $${quarterVolume.toLocaleString()}`);
  });

  // Step 3: Apply dual encryption to all transactions
  console.log("\n🔐 STEP 3: DUAL ENCRYPTION PROCESSING");
  console.log("-" .repeat(80));
  console.log("Applying dual encryption: each amount encrypted with BOTH sender and recipient keys...");
  
  const encryptedTransactions = processor.processDualEncryption(fiscalYearTransactions);
  const successfulEncryptions = encryptedTransactions.filter(tx => tx.dual_encrypted);
  
  console.log(`✅ Successfully encrypted: ${successfulEncryptions.length}/${fiscalYearTransactions.length} transactions`);
  console.log("🛡️ Privacy model: Only transaction parties can decrypt their respective amounts");
  console.log("📊 Public visibility: Encrypted amounts visible on bulletin board");

  // Step 4: Demonstrate ongoing privacy during the year
  console.log("\n🔍 STEP 4: ONGOING TRANSACTION VERIFICATION");
  console.log("-" .repeat(80));
  console.log("Demonstrating that during the year, companies can verify their own transactions...");
  
  // Test a few random transactions
  const sampleTransactions = successfulEncryptions.slice(0, 3);
  sampleTransactions.forEach((tx, index) => {
    console.log(`\nTransaction ${index + 1}: ${tx.seller} → ${tx.buyer} ($${tx.amount})`);
    
    const senderVerification = processor.verifyDualEncryption(tx, tx.sender_id);
    const recipientVerification = processor.verifyDualEncryption(tx, tx.recipient_id);
    
    console.log(`   📤 Sender can decrypt: ${senderVerification.canDecrypt ? '✅' : '❌'} | Verified: ${senderVerification.verified ? '✅' : '❌'}`);
    console.log(`   📥 Recipient can decrypt: ${recipientVerification.canDecrypt ? '✅' : '❌'} | Verified: ${recipientVerification.verified ? '✅' : '❌'}`);
    
    // Show that third parties cannot decrypt
    const companies = processor.getAllCompanies();
    const thirdParty = companies.find(c => c.id !== tx.sender_id && c.id !== tx.recipient_id);
    const thirdPartyVerification = processor.verifyDualEncryption(tx, thirdParty.id);
    console.log(`   🚫 Third-party (${thirdPartyVerification.companyName}): ${!thirdPartyVerification.canDecrypt ? '✅ Cannot decrypt (privacy preserved)' : '❌ Security breach!'}`);
  });

  // Step 5: Year-end verification
  console.log("\n🏛️ STEP 5: YEAR-END VERIFICATION");
  console.log("-" .repeat(80));
  console.log("At year-end, companies reveal their actual sums for public verification...");
  
  const yearEndResults = verificationSystem.performYearEndVerification(successfulEncryptions);

  // Step 6: Public bulletin board and audit
  console.log("\n📋 STEP 6: PUBLIC AUDIT TRAIL");
  console.log("-" .repeat(80));
  console.log("The system provides complete transparency while preserving privacy:");
  
  console.log("\n🔍 Audit Capabilities:");
  console.log("✅ Public can verify that declared sums match homomorphic calculations");
  console.log("✅ Network integrity verified (total sent = total received)");
  console.log("✅ Individual company financial positions are transparent");
  console.log("✅ Transaction amounts remained private during the year");
  console.log("✅ Cryptographic proof prevents falsification");
  
  console.log("\n📊 System Integrity Check:");
  console.log(`   Companies verified: ${yearEndResults.verificationResults.filter(c => c.verified).length}/${yearEndResults.totalCompanies}`);
  console.log(`   Network balanced: ${yearEndResults.networkIntegrity.networkBalanced ? '✅ YES' : '❌ NO'}`);
  console.log(`   Transaction consistency: ${yearEndResults.networkIntegrity.transactionConsistency ? '✅ VERIFIED' : '❌ FAILED'}`);
  console.log(`   System integrity: ${yearEndResults.networkIntegrity.allCompaniesVerified && yearEndResults.networkIntegrity.networkBalanced ? '✅ VERIFIED' : '❌ FAILED'}`);

  // Step 7: Export comprehensive report
  console.log("\n💾 STEP 7: REPORT GENERATION");
  console.log("-" .repeat(80));
  const reportFile = verificationSystem.exportYearEndReport(yearEndResults, "complete_system_demo_report.xlsx");
  
  console.log("\n🎯 SYSTEM DEMONSTRATION COMPLETE");
  console.log("=" .repeat(100));
  console.log("The complete multi-party blockchain-based accounting system has been demonstrated:");
  console.log("✅ Multi-party cryptographic infrastructure established");
  console.log("✅ Dual encryption ensures privacy during transaction period");  
  console.log("✅ Homomorphic properties enable sum calculations without decryption");
  console.log("✅ Year-end verification provides public transparency");
  console.log("✅ Cryptographic integrity prevents fraud and manipulation");
  console.log("✅ Complete audit trail maintained with privacy preservation");
  
  console.log(`\n📋 Complete documentation and verification data saved to: ${reportFile}`);
  
  return {
    encryptedTransactions: successfulEncryptions,
    yearEndResults: yearEndResults,
    reportFile: reportFile,
    systemMetrics: {
      totalTransactions: successfulEncryptions.length,
      totalVolume: totalVolume,
      encryptionSuccessRate: (successfulEncryptions.length / fiscalYearTransactions.length) * 100,
      verificationSuccessRate: (yearEndResults.verificationResults.filter(c => c.verified).length / yearEndResults.totalCompanies) * 100,
      systemIntegrity: yearEndResults.networkIntegrity.allCompaniesVerified && yearEndResults.networkIntegrity.networkBalanced
    }
  };
}

if (require.main === module) {
  fullSystemDemo().catch(console.error);
}

module.exports = { fullSystemDemo };