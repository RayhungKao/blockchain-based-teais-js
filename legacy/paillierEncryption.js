const bigInt = require("big-integer");

class PaillierEncryption {
  constructor(useTestMode = false) {
    console.log("Initializing Paillier encryption...");

    if (useTestMode) {
      // Use small but working test parameters
      this.p = bigInt(61);
      this.q = bigInt(53);
    } else {
      // Use larger parameters that can handle real transaction amounts
      this.p = bigInt(1009); // Larger prime
      this.q = bigInt(1013); // Larger prime
    }

    this.n = this.p.multiply(this.q);
    this.g = this.n.add(1); // g = n + 1 (common choice)

    // Calculate lambda = lcm(p-1, q-1)
    const pMinus1 = this.p.minus(1);
    const qMinus1 = this.q.minus(1);
    const gcd = bigInt.gcd(pMinus1, qMinus1);
    this.lambda = pMinus1.multiply(qMinus1).divide(gcd);

    // Calculate mu = (L(g^lambda mod n^2))^-1 mod n
    this.mu = this.calculateMu();

    console.log(
      `Using params: n=${this.n}, g=${this.g}, lambda=${this.lambda}, mu=${this.mu}`
    );
    console.log("Paillier encryption initialized.");
  }

  calculateMu() {
    const n2 = this.n.square();
    const gLambda = this.g.modPow(this.lambda, n2);
    const L = this.L(gLambda);
    return L.modInv(this.n);
  }

  L(x) {
    // L(x) = (x-1)/n
    return x.minus(1).divide(this.n);
  }

  encrypt(m) {
    // Generate random r where gcd(r,n) = 1
    let r;
    do {
      r = bigInt.randBetween(bigInt(1), this.n.minus(1));
    } while (!bigInt.gcd(r, this.n).equals(1));

    const n2 = this.n.square();

    // c = g^m * r^n mod n^2
    const gm = this.g.modPow(bigInt(m), n2);
    const rn = r.modPow(this.n, n2);
    return gm.multiply(rn).mod(n2);
  }

  decrypt(c) {
    const n2 = this.n.square();

    // m = L(c^lambda mod n^2) * mu mod n
    const cLambda = bigInt(c).modPow(this.lambda, n2);
    const L = this.L(cLambda);
    return L.multiply(this.mu).mod(this.n);
  }

  add(c1, c2) {
    // Homomorphic addition: c1 * c2 mod n^2
    // Ensure both inputs are bigInt objects
    const cipher1 = bigInt(c1);
    const cipher2 = bigInt(c2);
    const n2 = this.n.square();
    return cipher1.multiply(cipher2).mod(n2);
  }

  generateRandomNumber(n) {
    return bigInt.randBetween(bigInt(1), bigInt(n));
  }

  // Get maximum value that can be encrypted
  getMaxValue() {
    return this.n.minus(1);
  }
}

module.exports = { PaillierEncryption };
