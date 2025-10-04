const XLSX = require("xlsx");
const bigInt = require("big-integer");

function readExcelFile(fileName, sheetName) {
  console.log(`Reading Excel file: ${fileName}, Sheet: ${sheetName}`);

  try {
    const workbook = XLSX.readFile(fileName);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Validate that the required columns exist
    const requiredColumns = [
      "#",
      "seller",
      "buyer",
      "date",
      "quantity",
      "unit",
      "unit-price",
      "amount",
      "item-description",
      "pk_sender",
      "pk_recipient",
      "hashed-AT-info",
      "HE_pk_sender(amount)",
      "HE_pk_recipient(amount)",
      "homomorphic_original_sum",
      "homomorphic_total_sum",
      "decrypted_original_sum_hash",
      "decrypted_total_sum_hash",
    ];

    if (data.length > 0) {
      const missingColumns = requiredColumns.filter(
        (col) => !Object.keys(data[0]).includes(col)
      );

      if (missingColumns.length > 0) {
        console.warn("Warning: Missing columns:", missingColumns);
      }
    }

    return data;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw error;
  }
}

function writeToExcel(data, fileName, sheetName) {
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Error writing to Excel file:", error);
    throw error;
  }
}

function generateAndAddHashes(
  data,
  columnsToHash,
  hashedColumnName,
  generateHashes
) {
  // Check if data is empty or undefined
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("No data provided or data is empty");
    return [];
  }

  // Check if all required columns exist
  if (columnsToHash.every((col) => data[0].hasOwnProperty(col))) {
    const hashes = generateHashes(data, columnsToHash);
    data.forEach((row, index) => {
      row[hashedColumnName] = hashes[index];
    });
    console.log("Data with hashes:", data);
  } else {
    console.log(
      "One or more specified columns are missing in the data. Available columns:",
      Object.keys(data[0])
    );
  }
  return data;
}

function updateColumn(data, columnName, newData) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log("No data provided or data is empty");
    return [];
  }
  return data.map((row, index) => ({
    ...row,
    [columnName]: newData[index],
  }));
}

function encryptAmounts(data, paillier) {
  console.log("\n=== PAILLIER ENCRYPTION PROCESS ===");
  const maxValue = paillier.n; // Use n, not n-1
  console.log(`Paillier modulus (n): ${maxValue}`);
  console.log(`Processing ${data.length} transactions for encryption...`);

  const encryptedData = data.map((row, index) => {
    // Convert decimal amounts to cents (integers) for encryption
    const amountInCents = Math.round(parseFloat(row.amount) * 100);

    // Use modular arithmetic for large amounts - use n, not n-1
    const encryptableAmount = bigInt(amountInCents).mod(maxValue);

    // Show reduction only when significant
    const reductionRatio =
      amountInCents > maxValue ? ` (reduced from ${amountInCents})` : "";

    console.log(
      `[${index + 1}/${data.length}] $${
        row.amount
      } → ${encryptableAmount}${reductionRatio}`
    );

    return {
      ...row,
      "HE_pk_sender(amount)": paillier.encrypt(encryptableAmount).toString(),
      "HE_pk_recipient(amount)": paillier.encrypt(encryptableAmount).toString(),
      original_amount_cents: amountInCents,
      encryptable_amount: encryptableAmount.toString(),
    };
  });

  console.log(
    `✅ Encryption completed for ${encryptedData.length} transactions`
  );
  return encryptedData;
}

function calculateHomomorphicSum(data, paillier) {
  console.log("\n=== HOMOMORPHIC ADDITION PROCESS ===");

  if (data.length === 0) {
    console.log("⚠️  No encrypted amounts found. Returning 0.");
    return bigInt(0);
  }

  // Get the encrypted amounts as bigInt objects (not converting to regular BigInt)
  const encryptedAmounts = data.map((row) =>
    bigInt(row["HE_pk_sender(amount)"])
  );

  console.log(`Processing ${encryptedAmounts.length} encrypted values...`);
  console.log(
    "Encrypted amounts (first 5):",
    encryptedAmounts.slice(0, 5).map((x) => x.toString())
  );
  if (encryptedAmounts.length > 5) {
    console.log(`... and ${encryptedAmounts.length - 5} more values`);
  }

  // Start with the first encrypted value
  let sum = encryptedAmounts[0];
  console.log(`Starting with first encrypted value: ${sum.toString()}`);

  // Add the rest homomorphically
  for (let i = 1; i < encryptedAmounts.length; i++) {
    sum = paillier.add(sum, encryptedAmounts[i]);
    if (i <= 3) {
      console.log(`After adding value ${i + 1}: ${sum.toString()}`);
    } else if (i === 4) {
      console.log("... continuing homomorphic additions ...");
    }
  }

  console.log(`✅ Homomorphic sum completed: ${sum.toString()}`);
  return sum;
}

module.exports = {
  readExcelFile,
  writeToExcel,
  generateAndAddHashes,
  updateColumn,
  encryptAmounts,
  calculateHomomorphicSum,
};
