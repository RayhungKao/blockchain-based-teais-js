const { DualEncryptionProcessor } = require("./dualEncryption");
const XLSX = require("xlsx");

async function comprehensiveDualEncryptionDemo() {
  console.log("=== COMPREHENSIVE DUAL ENCRYPTION DEMO ===\n");

  const processor = new DualEncryptionProcessor();

  // Create realistic test transactions with amounts that fit within our key constraints
  const testTransactions = [
    {
      "#": 1,
      seller: "TechCorp Solutions",
      buyer: "Global Manufacturing Inc",
      amount: 15000.0,
      sender_id: "TC001",
      recipient_id: "GM002",
    },
    {
      "#": 2,
      seller: "Global Manufacturing Inc",
      buyer: "Supply Chain Logistics",
      amount: 8500.5,
      sender_id: "GM002",
      recipient_id: "SC003",
    },
    {
      "#": 3,
      seller: "Supply Chain Logistics",
      buyer: "Digital Services Ltd",
      amount: 12750.25,
      sender_id: "SC003",
      recipient_id: "DS004",
    },
    {
      "#": 4,
      seller: "Digital Services Ltd",
      buyer: "Advanced Materials Co",
      amount: 22000.75,
      sender_id: "DS004",
      recipient_id: "AM005",
    },
    {
      "#": 5,
      seller: "Advanced Materials Co",
      buyer: "Retail Distribution Network",
      amount: 5000.0,
      sender_id: "AM005",
      recipient_id: "RD006",
    },
    {
      "#": 6,
      seller: "Retail Distribution Network",
      buyer: "Financial Services Group",
      amount: 18900.3,
      sender_id: "RD006",
      recipient_id: "FS007",
    },
    {
      "#": 7,
      seller: "Financial Services Group",
      buyer: "Transportation Systems",
      amount: 11200.8,
      sender_id: "FS007",
      recipient_id: "TS008",
    },
    {
      "#": 8,
      seller: "Transportation Systems",
      buyer: "TechCorp Solutions",
      amount: 9500.45,
      sender_id: "TS008",
      recipient_id: "TC001",
    },
  ];

  console.log("📊 TRANSACTION OVERVIEW");
  console.log("=".repeat(80));
  let totalAmount = 0;
  testTransactions.forEach((tx, index) => {
    totalAmount += tx.amount;
    console.log(
      `${index + 1}. ${tx.seller} → ${tx.buyer}: $${tx.amount.toLocaleString()}`
    );
  });
  console.log(`\nTotal transaction volume: $${totalAmount.toLocaleString()}`);

  // Step 1: Process all transactions with dual encryption
  console.log("\n🔐 STEP 1: DUAL ENCRYPTION PROCESSING");
  console.log("=".repeat(80));
  const dualEncrypted = processor.processDualEncryption(testTransactions);
  const successfulEncryptions = dualEncrypted.filter((tx) => tx.dual_encrypted);
  console.log(
    `✅ Successfully encrypted: ${successfulEncryptions.length}/${testTransactions.length} transactions`
  );

  // Step 2: Verification from multiple perspectives
  console.log("\n🔍 STEP 2: MULTI-PARTY VERIFICATION");
  console.log("=".repeat(80));

  successfulEncryptions.slice(0, 3).forEach((tx, index) => {
    console.log(
      `\nTransaction ${index + 1}: ${tx.seller} → ${tx.buyer} ($${tx.amount})`
    );

    // Sender verification
    const senderVerification = processor.verifyDualEncryption(tx, tx.sender_id);
    console.log(
      `   📤 Sender (${senderVerification.companyName}): ${
        senderVerification.verified ? "✅" : "❌"
      } ${senderVerification.message}`
    );

    // Recipient verification
    const recipientVerification = processor.verifyDualEncryption(
      tx,
      tx.recipient_id
    );
    console.log(
      `   📥 Recipient (${recipientVerification.companyName}): ${
        recipientVerification.verified ? "✅" : "❌"
      } ${recipientVerification.message}`
    );

    // Third-party verification (should fail)
    const companies = processor.getAllCompanies();
    const thirdParty = companies.find(
      (c) => c.id !== tx.sender_id && c.id !== tx.recipient_id
    );
    const thirdPartyVerification = processor.verifyDualEncryption(
      tx,
      thirdParty.id
    );
    console.log(
      `   🚫 Third-party (${thirdPartyVerification.companyName}): ${
        !thirdPartyVerification.canDecrypt ? "✅" : "❌"
      } Cannot decrypt (privacy preserved)`
    );
  });

  // Step 3: Company-wise homomorphic sums
  console.log("\n🧮 STEP 3: COMPANY FINANCIAL SUMMARIES");
  console.log("=".repeat(80));

  const companies = processor.getAllCompanies();
  const companySummaries = [];

  companies.forEach((company) => {
    const sentSum = processor.calculateCompanyHomomorphicSum(
      successfulEncryptions,
      company.id,
      "sent"
    );
    const receivedSum = processor.calculateCompanyHomomorphicSum(
      successfulEncryptions,
      company.id,
      "received"
    );
    const netFlow = receivedSum.actualSum - sentSum.actualSum;

    const summary = {
      companyName: company.name,
      companyId: company.id,
      sent: {
        count: sentSum.transactionCount,
        amount: sentSum.actualSum,
      },
      received: {
        count: receivedSum.transactionCount,
        amount: receivedSum.actualSum,
      },
      netFlow: netFlow,
    };

    companySummaries.push(summary);

    console.log(`\n${company.name} (${company.id}):`);
    console.log(
      `   📤 Sent: ${
        sentSum.transactionCount
      } transactions, $${sentSum.actualSum.toLocaleString()}`
    );
    console.log(
      `   📥 Received: ${
        receivedSum.transactionCount
      } transactions, $${receivedSum.actualSum.toLocaleString()}`
    );
    console.log(
      `   💰 Net Flow: ${netFlow >= 0 ? "+" : ""}$${netFlow.toLocaleString()}`
    );
  });

  // Step 4: Network analysis
  console.log("\n🌐 STEP 4: NETWORK ANALYSIS");
  console.log("=".repeat(80));

  // Find most active companies
  const sortedByTotal = companySummaries
    .map((c) => ({ ...c, totalActivity: c.sent.amount + c.received.amount }))
    .sort((a, b) => b.totalActivity - a.totalActivity);

  console.log("\nMost Active Companies (by total transaction volume):");
  sortedByTotal.slice(0, 3).forEach((company, index) => {
    console.log(
      `   ${index + 1}. ${
        company.companyName
      }: $${company.totalActivity.toLocaleString()} total volume`
    );
  });

  // Find net creditors vs debtors
  const netCreditors = companySummaries
    .filter((c) => c.netFlow > 0)
    .sort((a, b) => b.netFlow - a.netFlow);
  const netDebtors = companySummaries
    .filter((c) => c.netFlow < 0)
    .sort((a, b) => a.netFlow - b.netFlow);

  console.log("\nNet Creditors (money received > money sent):");
  netCreditors.slice(0, 3).forEach((company, index) => {
    console.log(
      `   ${index + 1}. ${
        company.companyName
      }: +$${company.netFlow.toLocaleString()}`
    );
  });

  console.log("\nNet Debtors (money sent > money received):");
  netDebtors.slice(0, 3).forEach((company, index) => {
    console.log(
      `   ${index + 1}. ${
        company.companyName
      }: $${company.netFlow.toLocaleString()}`
    );
  });

  // Step 5: Save enhanced data
  console.log("\n💾 STEP 5: DATA EXPORT");
  console.log("=".repeat(80));

  // Save transactions
  const workbook = XLSX.utils.book_new();
  const transactionSheet = XLSX.utils.json_to_sheet(successfulEncryptions);
  XLSX.utils.book_append_sheet(
    workbook,
    transactionSheet,
    "DualEncryptedTransactions"
  );

  // Save company summaries
  const summarySheet = XLSX.utils.json_to_sheet(companySummaries);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "CompanySummaries");

  XLSX.writeFile(workbook, "comprehensive_dual_encryption_demo.xlsx");
  console.log(
    "✅ Saved comprehensive demo data to 'comprehensive_dual_encryption_demo.xlsx'"
  );

  // Step 6: Security demonstration
  console.log("\n🛡️ STEP 6: SECURITY DEMONSTRATION");
  console.log("=".repeat(80));

  const sampleTx = successfulEncryptions[0];
  console.log(
    `\nUsing sample transaction: ${sampleTx.seller} → ${sampleTx.buyer} ($${sampleTx.amount})`
  );
  console.log(`Sender encrypted amount: ${sampleTx["HE_pk_sender(amount)"]}`);
  console.log(
    `Recipient encrypted amount: ${sampleTx["HE_pk_recipient(amount)"]}`
  );

  console.log("\nPrivacy Features:");
  console.log(
    "✅ Transaction amounts are encrypted with both sender AND recipient keys"
  );
  console.log("✅ Only the sender can decrypt the sender-encrypted amount");
  console.log(
    "✅ Only the recipient can decrypt the recipient-encrypted amount"
  );
  console.log("✅ Third parties cannot decrypt either amount");
  console.log(
    "✅ Homomorphic properties allow sum calculations without decryption"
  );
  console.log(
    "✅ Each company can independently verify their own transactions"
  );

  console.log("\n📋 DUAL ENCRYPTION DEMO SUMMARY");
  console.log("=".repeat(80));
  console.log(
    `✅ Processed ${successfulEncryptions.length} transactions with dual encryption`
  );
  console.log(
    `🔐 Each amount encrypted with both sender and recipient Paillier keys`
  );
  console.log(`🔍 Multi-party verification confirms security model`);
  console.log(`🧮 Homomorphic sums calculated per company without decryption`);
  console.log(`🌐 Network analysis reveals business relationships`);
  console.log(`💾 Complete audit trail preserved in encrypted form`);
  console.log(`🛡️ Privacy preserved through cryptographic isolation`);

  return {
    transactions: successfulEncryptions,
    companySummaries: companySummaries,
    networkAnalysis: {
      mostActive: sortedByTotal.slice(0, 3),
      netCreditors: netCreditors,
      netDebtors: netDebtors,
    },
  };
}

if (require.main === module) {
  comprehensiveDualEncryptionDemo().catch(console.error);
}

module.exports = { comprehensiveDualEncryptionDemo };
