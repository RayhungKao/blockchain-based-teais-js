// const bigInt = require('big-integer');

// class PaillierEncryption {
//     constructor(bits) {
//         console.log(`Initializing Paillier encryption with ${bits} bits...`);
        
//         // Start timer
//         const startTime = Date.now();

//         // Generate p and q
//         console.log('Generating p and q...');
//         const p = this.generatePrime(bits / 2);
//         const q = this.generatePrime(bits / 2);
//         console.log(`Generated p: ${p.toString()}, q: ${q.toString()}`);

//         // Calculate n and g
//         console.log('Calculating n and g...');
//         this.n = p.multiply(q);
//         this.g = bigInt(this.n.add(1));
//         console.log(`n: ${this.n.toString()}, g: ${this.g.toString()}`);

//         // Calculate lambda (lcm of p-1 and q-1)
//         console.log('Calculating lambda...');
//         const pMinus1 = bigInt(p.minus(1));
//         const qMinus1 = bigInt(q.minus(1));
//         const gcd = pMinus1.gcd(qMinus1);
//         this.lambda = pMinus1.multiply(qMinus1).divide(gcd);
//         console.log(`lambda: ${this.lambda.toString()}`);

//         // Calculate mu
//         console.log('Calculating mu...');
//         this.mu = this.calculateMu();
//         console.log(`mu: ${this.mu.toString()}`);

//         // End timer
//         const endTime = Date.now();
//         console.log(`Initialization completed in ${(endTime - startTime) / 1000} seconds`);

//         // Verify all values are correctly set
//         console.log('Verifying initialization...');
//         console.log(`n: ${this.n.toString()}`);
//         console.log(`g: ${this.g.toString()}`);
//         console.log(`lambda: ${this.lambda.toString()}`);
//         console.log(`mu: ${this.mu.toString()}`);

//         console.log('Paillier encryption initialized successfully.');
//     }

//     generatePrime(bits) {
//         console.log(`Generating prime number with ${bits} bits...`);
        
//         // Start timer
//         const startTime = Date.now();
    
//         const min = bigInt(2).pow(bits - 1);
//         const max = bigInt(2).pow(bits).minus(1);
    
//         while (true) {
//             const p = bigInt.randBetween(min, max);
//             if (this.isPrime(p)) { 
//                 console.log(`Generated prime: ${p.toString()}`);
//                 return p;
//             }
//             else 
//                 console.log(`Rejected non-prime: ${p.toString()}`);
//         }
    
//         // End timer
//         const endTime = Date.now();
//         console.log(`Prime generation took ${(endTime - startTime) / 1000} seconds`);
//     }

//     isPrime(num) {
//         if (num.equals(2) || num.equals(3)) return true;
//         if (num.equals(1) || num.equals(4) || num.equals(6) || num.equals(8) || num.equals(9)) return false;

//         let i = 3;
//         while (i * i <= num) {
//             if (num.remainder(i).equals(0)) return false;
//             i += 2;
//         }
//         return true;
//     }

//     generateRandomNumber(n) {
//         return bigInt.randBetween(bigInt(1), bigInt(n));
//     }

//     calculateMu() {
//         const n2 = this.n.square();
//         const gLambda = this.g.modPow(this.lambda, n2);
//         const L = this.L(gLambda);
//         return L.modInv(this.n);
//     }

//     L(x) {
//         return bigInt(x.minus(1)).divide(this.n);
//     }

//     encrypt(m) {
//         const r = this.generateRandomNumber(this.n);
//         const n2 = this.n.square();
        
//         // c = g^m * r^n mod n^2
//         return this.g.modPow(bigInt(m), n2)
//             .multiply(r.modPow(this.n, n2))
//             .mod(n2);
//     }

//     decrypt(c) {
//         const n2 = this.n.square();
        
//         // m = L(c^lambda mod n^2) * mu mod n
//         const x = bigInt(c).modPow(this.lambda, n2);
//         const L = this.L(x);
//         return L.multiply(this.mu).mod(this.n);
//     }

//     add(c1, c2) {
//         return bigInt(c1).multiply(bigInt(c2)).mod(this.n.square());
//     }
// }

// module.exports = { PaillierEncryption };


// ------ For test mode ------
const bigInt = require('big-integer');

class PaillierEncryption {
    constructor(useTestMode = false) {
        console.log('Initializing Paillier encryption...');
        
        // Test mode parameters
        this.testParams = {
            n: bigInt(2).pow(2048).plus(1),
            g: bigInt(2),
            p: bigInt(1234567890123456789012345678901234567890),
            q: bigInt(9876543210987654321098765432109876543210),
            lambda: bigInt(65537),
            mu: bigInt(1234567890123456789012345678901234567890)
        };

        // Normal mode parameters
        this.normalParams = {
            n: null,
            g: null,
            p: null,
            q: null,
            lambda: null,
            mu: null
        };

        // Use test mode parameters if specified
        if (useTestMode) {
            this.params = this.testParams;
        } else {
            this.params = this.normalParams;
        }

        // Set initial values
        this.setParams();

        console.log(`Using params: n=${this.params.n}, g=${this.params.g}, p=${this.params.p}, q=${this.params.q}`);
        console.log('Paillier encryption initialized.');
    }

    setParams() {
        this.params.n = this.testParams.n;
        this.params.g = this.testParams.g;
        this.params.p = this.testParams.p;
        this.params.q = this.testParams.q;
        this.params.lambda = this.testParams.lambda;
        this.params.mu = this.testParams.mu;
    }

    // Methods to override test mode parameters
    setNormalParams() {
        // In a real implementation, you'd generate these here
        this.params.n = bigInt(2).pow(2048).plus(1);
        this.params.g = bigInt(2);
        this.params.p = bigInt.randBetween(bigInt(2).pow(512), bigInt(2).pow(513)).minus(1);
        this.params.q = bigInt.randBetween(bigInt(2).pow(512), bigInt(2).pow(513)).minus(1);
        this.params.lambda = bigInt(this.params.p).minus(1).multiply(bigInt(this.params.q).minus(1)).divide(bigInt(this.params.p).gcd(bigInt(this.params.q).minus(1)));
        this.params.mu = this.calculateMu();
    }

    calculateMu() {
        const n2 = this.params.n.square();
        const gLambda = this.params.g.modPow(this.params.lambda, n2);
        const L = this.L(gLambda);
        return L.modInv(this.params.n);
    }

    L(x) {
        return bigInt(x.minus(1)).divide(this.params.n);
    }

    encrypt(m) {
        const r = this.generateRandomNumber(this.params.n);
        const n2 = this.params.n.square();
        return this.params.g.modPow(bigInt(m), n2)
            .multiply(r.modPow(this.params.n, n2))
            .mod(n2);
    }

    decrypt(c) {
        const n2 = this.params.n.square();
        const x = bigInt(c).modPow(this.params.lambda, n2);
        const L = this.L(x);
        return L.multiply(this.params.mu).mod(this.params.n);
    }

    add(c1, c2) {
        return bigInt(c1).multiply(bigInt(c2)).mod(this.params.n.square());
    }

    generateRandomNumber(n) {
        return bigInt.randBetween(bigInt(1), bigInt(n));
    }
}

module.exports = { PaillierEncryption };