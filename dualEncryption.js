const { getCompanyKeypairs, getCompanyById } = require('./sampleDataGenerator');
const bigInt = require("big-integer");

/**
 * Dual Encryption System for Multi-Party Accounting
 * 
 * This module implements the core innovation of the system:
 * Each transaction amount is encrypted with BOTH sender and recipient Paillier keys
 * 
 * Benefits:
 * - Sender can decrypt and verify their outgoing amounts
 * - Recipient can decrypt and verify their incoming amounts  
 * - Public can verify homomorphic sums for each company
 * - No single party has complete visibility over all transactions
 */

class DualEncryptionProcessor {
  constructor() {
    this.companies = null;
    this.companyLookup = new Map();
    this.initializeCompanies();
  }

  /**
   * Initialize company keypairs and create lookup maps
   */
  initializeCompanies() {
    console.log("🔑 Initializing dual encryption system...");
    
    this.companies = getCompanyKeypairs();
    
    // Create lookup maps for efficient company retrieval
    this.companies.forEach(company => {
      this.companyLookup.set(company.id, company);
      this.companyLookup.set(company.name, company);
    });
    
    console.log(`✅ Loaded ${this.companies.length} companies with Paillier keypairs`);
    this.companies.forEach(company => {
      console.log(`   ${company.name}: n=${company.paillierPublicKey.n.toString()}`);
    });
  }

  /**
   * Dual encrypt a transaction amount
   * @param {number} amount - Transaction amount in dollars
   * @param {string} senderId - Sender company ID  
   * @param {string} recipientId - Recipient company ID
   * @returns {Object} - Dual encryption result
   */
  dualEncryptAmount(amount, senderId, recipientId) {
    const sender = this.companyLookup.get(senderId);
    const recipient = this.companyLookup.get(recipientId);

    if (!sender || !recipient) {
      throw new Error(`Invalid company IDs: ${senderId} or ${recipientId}`);
    }

    // Convert amount to cents for encryption
    const amountInCents = Math.round(amount * 100);
    
    console.log(`🔐 Dual encrypting $${amount} (${amountInCents} cents)`);
    console.log(`   Sender: ${sender.name} (n=${sender.paillierPublicKey.n})`);
    console.log(`   Recipient: ${recipient.name} (n=${recipient.paillierPublicKey.n})`);

    // Encrypt with sender's public key (sender can later decrypt to verify)
    const senderEncrypted = this.paillierEncrypt(
      amountInCents, 
      sender.paillierPublicKey
    );

    // Encrypt with recipient's public key (recipient can later decrypt to verify)
    const recipientEncrypted = this.paillierEncrypt(
      amountInCents, 
      recipient.paillierPublicKey
    );

    const result = {
      originalAmount: amount,
      amountInCents: amountInCents,
      senderId: senderId,
      recipientId: recipientId,
      senderCompany: sender.name,
      recipientCompany: recipient.name,
      
      // Dual encrypted amounts
      senderEncrypted: senderEncrypted.toString(),
      recipientEncrypted: recipientEncrypted.toString(),
      
      // Key metadata for verification
      senderPaillierN: sender.paillierPublicKey.n.toString(),
      recipientPaillierN: recipient.paillierPublicKey.n.toString(),
      
      // Timestamp
      encryptionTimestamp: Date.now()
    };

    console.log(`   ✅ Sender encrypted: ${result.senderEncrypted.substring(0, 20)}...`);
    console.log(`   ✅ Recipient encrypted: ${result.recipientEncrypted.substring(0, 20)}...`);

    return result;
  }

  /**
   * Process multiple transactions with dual encryption
   * @param {Array} transactions - Array of transaction objects
   * @returns {Array} - Enhanced transactions with dual encryption
   */
  processDualEncryption(transactions) {
    console.log(`\n🔄 Processing ${transactions.length} transactions with dual encryption...`);
    
    const enhancedTransactions = transactions.map((transaction, index) => {
      console.log(`\n[${index + 1}/${transactions.length}] Processing: ${transaction.seller} → ${transaction.buyer}`);
      
      // Get company IDs from transaction data
      const senderId = transaction.sender_id;
      const recipientId = transaction.recipient_id;
      
      if (!senderId || !recipientId) {
        console.error(`❌ Missing company IDs in transaction ${index + 1}`);
        return transaction; // Return original if IDs missing
      }

      try {
        // Perform dual encryption
        const dualEncryption = this.dualEncryptAmount(
          transaction.amount,
          senderId,
          recipientId
        );

        // Enhanced transaction with dual encryption data
        return {
          ...transaction,
          
          // Update the encryption fields with dual encryption
          "HE_pk_sender(amount)": dualEncryption.senderEncrypted,
          "HE_pk_recipient(amount)": dualEncryption.recipientEncrypted,
          
          // Add dual encryption metadata
          dual_encryption_metadata: {
            encryptionTimestamp: dualEncryption.encryptionTimestamp,
            senderPaillierN: dualEncryption.senderPaillierN,
            recipientPaillierN: dualEncryption.recipientPaillierN,
            encryptionMethod: "dual_paillier",
            originalAmount: dualEncryption.originalAmount,
            amountInCents: dualEncryption.amountInCents
          },
          
          // Processing status
          dual_encrypted: true,
          processing_timestamp: Date.now()
        };

      } catch (error) {
        console.error(`❌ Error encrypting transaction ${index + 1}:`, error.message);
        return {
          ...transaction,
          dual_encrypted: false,
          encryption_error: error.message
        };
      }
    });

    const successCount = enhancedTransactions.filter(tx => tx.dual_encrypted).length;
    console.log(`\n✅ Dual encryption completed: ${successCount}/${transactions.length} successful`);
    
    return enhancedTransactions;
  }

  /**
   * Verify dual encryption by decrypting with company keys
   * @param {Object} transaction - Transaction with dual encryption
   * @param {string} companyId - Company ID to verify from their perspective
   * @returns {Object} - Verification result
   */
  verifyDualEncryption(transaction, companyId) {
    const company = this.companyLookup.get(companyId);
    if (!company) {
      throw new Error(`Invalid company ID: ${companyId}`);
    }

    const result = {
      companyId: companyId,
      companyName: company.name,
      transactionId: transaction["#"],
      sender: transaction.seller,
      recipient: transaction.buyer,
      originalAmount: transaction.amount
    };

    try {
      // Determine which encrypted amount this company can decrypt
      let encryptedAmount;
      let role;

      if (transaction.sender_id === companyId) {
        // Company is the sender - decrypt sender's encrypted amount
        encryptedAmount = bigInt(transaction["HE_pk_sender(amount)"]);
        role = "sender";
      } else if (transaction.recipient_id === companyId) {
        // Company is the recipient - decrypt recipient's encrypted amount  
        encryptedAmount = bigInt(transaction["HE_pk_recipient(amount)"]);
        role = "recipient";
      } else {
        // Company is neither sender nor recipient
        return {
          ...result,
          role: "third_party",
          canDecrypt: false,
          verified: false,
          message: "Company is not involved in this transaction"
        };
      }

      // Decrypt the amount using company's private key
      const decryptedCents = this.paillierDecrypt(
        encryptedAmount,
        company.paillierPrivateKey
      );

      const decryptedAmount = decryptedCents.toJSNumber() / 100;
      const amountMatches = Math.abs(decryptedAmount - transaction.amount) < 0.01;

      return {
        ...result,
        role: role,
        canDecrypt: true,
        decryptedAmount: decryptedAmount,
        decryptedCents: decryptedCents.toJSNumber(),
        verified: amountMatches,
        message: amountMatches ? "Amount verification successful" : "Amount mismatch detected"
      };

    } catch (error) {
      return {
        ...result,
        canDecrypt: false,
        verified: false,
        error: error.message,
        message: "Decryption failed"
      };
    }
  }

  /**
   * Calculate homomorphic sum for a specific company
   * @param {Array} transactions - Array of transactions
   * @param {string} companyId - Company ID to calculate sum for
   * @param {string} direction - "sent" or "received"
   * @returns {Object} - Homomorphic sum result
   */
  calculateCompanyHomomorphicSum(transactions, companyId, direction = "sent") {
    const company = this.companyLookup.get(companyId);
    if (!company) {
      throw new Error(`Invalid company ID: ${companyId}`);
    }

    console.log(`🧮 Calculating ${direction} sum for ${company.name}...`);

    // Filter relevant transactions
    let relevantTransactions;
    if (direction === "sent") {
      relevantTransactions = transactions.filter(tx => tx.sender_id === companyId);
    } else {
      relevantTransactions = transactions.filter(tx => tx.recipient_id === companyId);
    }

    console.log(`   Found ${relevantTransactions.length} ${direction} transactions`);

    if (relevantTransactions.length === 0) {
      return {
        companyId,
        companyName: company.name,
        direction,
        transactionCount: 0,
        homomorphicSum: null,
        actualSum: 0
      };
    }

    // Extract encrypted amounts and calculate homomorphic sum
    const encryptedAmounts = relevantTransactions.map(tx => {
      if (direction === "sent") {
        return bigInt(tx["HE_pk_sender(amount)"]);
      } else {
        return bigInt(tx["HE_pk_recipient(amount)"]);
      }
    });

    const homomorphicSum = this.calculatePaillierSum(encryptedAmounts, company.paillierPublicKey);
    const actualSum = relevantTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    console.log(`   Homomorphic sum: ${homomorphicSum.toString().substring(0, 20)}...`);
    console.log(`   Actual sum: $${actualSum.toFixed(2)}`);

    return {
      companyId,
      companyName: company.name,
      direction,
      transactionCount: relevantTransactions.length,
      homomorphicSum: homomorphicSum.toString(),
      actualSum: actualSum,
      transactions: relevantTransactions.map(tx => ({
        id: tx["#"],
        counterparty: direction === "sent" ? tx.buyer : tx.seller,
        amount: tx.amount
      }))
    };
  }

  /**
   * Paillier encryption function
   */
  paillierEncrypt(plaintext, publicKey) {
    const { n, g } = publicKey;
    const n2 = n.square();
    
    // Generate random r where gcd(r,n) = 1
    let r;
    do {
      r = bigInt.randBetween(1, n);
    } while (!bigInt.gcd(r, n).equals(1));
    
    // c = g^m * r^n mod n^2
    const gm = g.modPow(bigInt(plaintext), n2);
    const rn = r.modPow(n, n2);
    return gm.multiply(rn).mod(n2);
  }

  /**
   * Paillier decryption function
   */
  paillierDecrypt(ciphertext, privateKey) {
    const { n, lambda, mu } = privateKey;
    const n2 = n.square();
    
    // m = L(c^lambda mod n^2) * mu mod n
    const cLambda = bigInt(ciphertext).modPow(lambda, n2);
    const L = cLambda.minus(1).divide(n);
    return L.multiply(mu).mod(n);
  }

  /**
   * Calculate homomorphic sum of Paillier encrypted values
   */
  calculatePaillierSum(encryptedValues, publicKey) {
    if (encryptedValues.length === 0) {
      return bigInt(0);
    }

    const n2 = publicKey.n.square();
    return encryptedValues.reduce((sum, value) => {
      if (sum.equals(bigInt(0))) {
        return value;
      }
      return sum.multiply(value).mod(n2);
    }, bigInt(0));
  }

  /**
   * Get company information
   */
  getCompany(companyId) {
    return this.companyLookup.get(companyId);
  }

  /**
   * List all companies
   */
  getAllCompanies() {
    return this.companies;
  }
}

module.exports = {
  DualEncryptionProcessor
};