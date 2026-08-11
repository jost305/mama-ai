import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = path.join(__dirname, "payment-ledger.json");

function _loadLedger() {
  try {
    if (!fs.existsSync(LEDGER_PATH)) {
      return { records: [] };
    }
    const rawData = fs.readFileSync(LEDGER_PATH, "utf-8");
    return JSON.parse(rawData || "{\"records\": []}");
  } catch (err) {
    console.warn(`[PaymentLedger] failed to load ledger: ${err.message}`);
    return { records: [] };
  }
}

function _saveLedger(ledger) {
  try {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn(`[PaymentLedger] failed to save ledger: ${err.message}`);
    return false;
  }
}

export function getPaymentRecord(transactionHash) {
  if (!transactionHash) return null;
  const ledger = _loadLedger();
  return ledger.records.find((record) => record.transactionHash === transactionHash) || null;
}

export function addPaymentRecord(record) {
  const ledger = _loadLedger();
  const existing = ledger.records.find((item) => item.transactionHash === record.transactionHash);
  if (existing) {
    throw new Error("PAYMENT_ALREADY_RECORDED");
  }

  const normalized = {
    ...record,
    processedAt: new Date().toISOString(),
  };
  ledger.records.push(normalized);
  _saveLedger(ledger);
  return normalized;
}
