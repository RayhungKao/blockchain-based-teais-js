const bigInt = require("big-integer");
const crypto = require("crypto");

/**
 * Company-specific Paillier Key Generation
 * Each company gets their own unique Paillier keypair for encryption/decryption
 */

class CompanyPaillierKeyGenerator {
  constructor() {
    // Pre-selected prime pairs for each company (for consistency)
    // In production, these would be generated using cryptographically secure methods
    this.companyPrimePairs = [
      [1009, 1013], // Company 1: TechCorp Solutions
      [1019, 1021], // Company 2: Global Manufacturing Inc
      [1031, 1033], // Company 3: Supply Chain Logistics
      [1039, 1049], // Company 4: Digital Services Ltd
      [1051, 1061], // Company 5: Advanced Materials Co
      [1063, 1069], // Company 6: Retail Distribution Network
      [1087, 1091], // Company 7: Financial Services Group
      [1093, 1097], // Company 8: Transportation Systems
    ];
  }

  /**
   * Generate Paillier keypair for a specific company
   * @param {number} companyIndex - Index of the company (0-7)
   * @returns {Object} - {publicKey: {n, g}, privateKey: {n, lambda, mu}}
   */
  generateCompanyKeypair(companyIndex) {
    if (companyIndex >= this.companyPrimePairs.length) {
      throw new Error(
        `Company index ${companyIndex} exceeds available prime pairs`
      );
    }

    const [p, q] = this.companyPrimePairs[companyIndex];
    console.log(`  Generating Paillier keypair with primes p=${p}, q=${q}`);

    // Calculate n = p * q
    const bigP = bigInt(p);
    const bigQ = bigInt(q);
    const n = bigP.multiply(bigQ);

    // Calculate g = n + 1 (common choice for Paillier)
    const g = n.add(1);

    // Calculate λ = lcm(p-1, q-1)
    const pMinus1 = bigP.minus(1);
    const qMinus1 = bigQ.minus(1);
    const gcd = bigInt.gcd(pMinus1, qMinus1);
    const lambda = pMinus1.multiply(qMinus1).divide(gcd);

    // Calculate μ = (L(g^λ mod n²))^(-1) mod n
    const mu = this.calculateMu(g, lambda, n);

    const keypair = {
      publicKey: {
        n: n,
        g: g,
      },
      privateKey: {
        n: n,
        lambda: lambda,
        mu: mu,
      },
      // Additional metadata
      metadata: {
        p: bigP,
        q: bigQ,
        keySize: n.toString().length + " digits",
        companyIndex: companyIndex,
      },
    };

    console.log(`  Generated keypair: n=${n}, g=${g}, λ=${lambda}, μ=${mu}`);
    return keypair;
  }

  /**
   * Calculate μ = (L(g^λ mod n²))^(-1) mod n
   * where L(x) = (x-1)/n
   */
  calculateMu(g, lambda, n) {
    const n2 = n.square();
    const gLambda = g.modPow(lambda, n2);
    const L = this.L(gLambda, n);
    return L.modInv(n);
  }

  /**
   * L function: L(x) = (x-1)/n
   */
  L(x, n) {
    return x.minus(1).divide(n);
  }

  /**
   * Generate RSA signing keypair for digital signatures
   */
  generateSigningKeypair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    return {
      publicKey,
      privateKey,
    };
  }

  /**
   * Serialize public key for Excel storage (base64 encoded)
   */
  serializePublicKeyForExcel(publicKey) {
    const keyString = `${publicKey.n.toString()}_${publicKey.g.toString()}`;
    return Buffer.from(keyString).toString("base64").substring(0, 32);
  }

  /**
   * Test encryption/decryption with generated keypair
   */
  testKeypair(keypair, testValue = 12345) {
    console.log(`  Testing keypair with value: ${testValue}`);

    const { publicKey, privateKey } = keypair;

    // Encrypt
    const encrypted = this.paillierEncrypt(testValue, publicKey);
    console.log(`  Encrypted: ${encrypted.toString().substring(0, 20)}...`);

    // Decrypt
    const decrypted = this.paillierDecrypt(encrypted, privateKey);
    console.log(`  Decrypted: ${decrypted.toString()}`);

    const isValid = decrypted.equals(bigInt(testValue));
    console.log(`  Test result: ${isValid ? "✅ PASS" : "❌ FAIL"}`);

    return isValid;
  }

  /**
   * Paillier encryption: c = g^m * r^n mod n²
   */
  paillierEncrypt(plaintext, publicKey) {
    const { n, g } = publicKey;
    const n2 = n.square();

    // Generate random r where gcd(r,n) = 1
    let r;
    do {
      r = bigInt.randBetween(1, n);
    } while (!bigInt.gcd(r, n).equals(1));

    // c = g^m * r^n mod n²
    const gm = g.modPow(bigInt(plaintext), n2);
    const rn = r.modPow(n, n2);
    return gm.multiply(rn).mod(n2);
  }

  /**
   * Paillier decryption: m = L(c^λ mod n²) * μ mod n
   */
  paillierDecrypt(ciphertext, privateKey) {
    const { n, lambda, mu } = privateKey;
    const n2 = n.square();

    // m = L(c^λ mod n²) * μ mod n
    const cLambda = bigInt(ciphertext).modPow(lambda, n2);
    const L = this.L(cLambda, n);
    return L.multiply(mu).mod(n);
  }

  /**
   * Generate all company keypairs at once
   */
  generateAllCompanyKeypairs() {
    console.log("🔑 Generating Paillier keypairs for all companies...\n");

    const companyKeypairs = [];

    for (let i = 0; i < this.companyPrimePairs.length; i++) {
      console.log(`Generating keypair for company ${i + 1}:`);
      const keypair = this.generateCompanyKeypair(i);
      const isValid = this.testKeypair(keypair);

      if (isValid) {
        companyKeypairs.push(keypair);
        console.log(
          `✅ Company ${i + 1} keypair generated and tested successfully\n`
        );
      } else {
        throw new Error(
          `Failed to generate valid keypair for company ${i + 1}`
        );
      }
    }

    console.log(
      `🎉 Successfully generated ${companyKeypairs.length} company keypairs`
    );
    return companyKeypairs;
  }
}

// Export for use in other modules
module.exports = {
  CompanyPaillierKeyGenerator,
};
