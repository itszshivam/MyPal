import { useState } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";

const rates: Record<string, number> = {
  INR: 1,
  USD: 0.0117,
  EUR: 0.0101,
  GBP: 0.0088,
  AED: 0.043,
  SGD: 0.0158,
};

const symbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");

  const numericAmount = Number(amount) || 0;

  const converted =
    from === to
      ? numericAmount
      : numericAmount * (rates[to] / rates[from]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="currency-card">
      <div className="currency-header">
        <div>
          <span className="section-label">SMART CURRENCY</span>
          <h3>Currency Converter</h3>
          <p>See how much your money is worth before you send it.</p>
        </div>

        <div className="currency-icon">
          <RefreshCw size={18} />
        </div>
      </div>

      <div className="currency-form">
        <div className="currency-input-group">
          <label>Amount</label>

          <div className="amount-input">
            <span>{symbols[from]}</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="currency-select-group">
          <label>From</label>

          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <button
          className="swap-currency"
          onClick={swapCurrencies}
          title="Swap currencies"
        >
          <ArrowRightLeft size={16} />
        </button>

        <div className="currency-select-group">
          <label>To</label>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="conversion-result">
        <div>
          <span>Converted amount</span>
          <strong>
            {symbols[to]}
            {converted.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>

        <div className="rate-info">
          1 {from} ≈{" "}
          {(rates[to] / rates[from]).toFixed(4)} {to}
        </div>
      </div>

      <p className="currency-note">
        Demo exchange rates for the hackathon prototype.
      </p>
    </div>
  );
}