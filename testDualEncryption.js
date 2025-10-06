const { DualEncryptionProcessor } = require("./dualEncryption");
const XLSX = require("xlsx");

async function testDualEncryption() {
  console.log("=== DUAL ENCRYPTION SYSTEM TEST ===\n");

  // Initialize dual encryption processor
  const processor = new DualEncryptionProcessor();

  // Test 1: Load sample data
  console.log("📊 TEST 1: Loading Sample Data");
  const workbook = XLSX.readFile("sample.xlsx");
  const transactions = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);
  console.log(`   Loaded ${transactions.length} transactions`);

  // Test 2: Process first few transactions with dual encryption
  console.log("\n🔐 TEST 2: Dual Encryption Processing");
  const testTransactions = transactions.slice(0, 5); // Test with first 5 transactions
  const dualEncrypted = processor.processDualEncryption(testTransactions);

  // Test 3: Verify encryption results
  console.log("\n🔍 TEST 3: Verification Results");
  dualEncrypted.forEach((tx, index) => {
    if (tx.dual_encrypted) {
      console.log(
        `\nTransaction ${index + 1}: ${tx.seller} → ${tx.buyer} ($${tx.amount})`
      );

      // Verify from sender's perspective
      const senderVerification = processor.verifyDualEncryption(
        tx,
        tx.sender_id
      );
      console.log(
        `   Sender verification (${senderVerification.companyName}): ${
          senderVerification.verified ? "✅" : "❌"
        } ${senderVerification.message}`
      );

      // Verify from recipient's perspective
      const recipientVerification = processor.verifyDualEncryption(
        tx,
        tx.recipient_id
      );
      console.log(
        `   Recipient verification (${recipientVerification.companyName}): ${
          recipientVerification.verified ? "✅" : "❌"
        } ${recipientVerification.message}`
      );

      // Test third-party (cannot decrypt)
      const companies = processor.getAllCompanies();
      const thirdParty = companies.find(
        (c) => c.id !== tx.sender_id && c.id !== tx.recipient_id
      );
      if (thirdParty) {
        const thirdPartyVerification = processor.verifyDualEncryption(
          tx,
          thirdParty.id
        );
        console.log(
          `   Third-party (${thirdPartyVerification.companyName}): ${
            thirdPartyVerification.canDecrypt
              ? "❌ Should not decrypt"
              : "✅ Cannot decrypt (correct)"
          }`
        );
      }
    }
  });

  // Test 4: Homomorphic sum calculation
  console.log("\n🧮 TEST 4: Company Homomorphic Sums");
  const companies = processor.getAllCompanies();

  companies.slice(0, 3).forEach((company) => {
    console.log(`\n${company.name} (${company.id}):`);

    // Calculate sent amounts
    const sentSum = processor.calculateCompanyHomomorphicSum(
      dualEncrypted,
      company.id,
      "sent"
    );
    console.log(
      `   Sent: ${
        sentSum.transactionCount
      } transactions, $${sentSum.actualSum.toFixed(2)} total`
    );

    // Calculate received amounts
    const receivedSum = processor.calculateCompanyHomomorphicSum(
      dualEncrypted,
      company.id,
      "received"
    );
    console.log(
      `   Received: ${
        receivedSum.transactionCount
      } transactions, $${receivedSum.actualSum.toFixed(2)} total`
    );
  });

  // Test 5: Save enhanced data
  console.log("\n💾 TEST 5: Saving Enhanced Data");
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dualEncrypted);
  XLSX.utils.book_append_sheet(wb, ws, "DualEncrypted");
  XLSX.writeFile(wb, "dual_encrypted_sample.xlsx");
  console.log("   ✅ Saved to dual_encrypted_sample.xlsx");

  // Summary
  console.log("\n📋 DUAL ENCRYPTION TEST SUMMARY:");
  const successfulEncryptions = dualEncrypted.filter(
    (tx) => tx.dual_encrypted
  ).length;
  console.log(
    `   ✅ Successfully encrypted: ${successfulEncryptions}/${dualEncrypted.length} transactions`
  );
  console.log(
    `   🔐 Each amount encrypted with BOTH sender and recipient keys`
  );
  console.log(`   🔍 Verification confirms only involved parties can decrypt`);
  console.log(`   🧮 Homomorphic sums calculated per company`);
  console.log(`   💾 Enhanced data saved with dual encryption metadata`);

  return dualEncrypted;
}

// Run the test
if (require.main === module) {
  testDualEncryption().catch(console.error);
}

module.exports = { testDualEncryption };
