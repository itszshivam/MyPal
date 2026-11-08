
import { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  RefreshCw,
  X,
  ArrowUpRight,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

import {
  mockTransactions,
  Transaction,
} from "../data/mockTransactions";

export default function PaymentTracker() {
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const statuses = [
    "All",
    "Processing",
    "On Hold",
    "Received",
    "Failed",
  ];

  const filteredTransactions = mockTransactions.filter((t) => {
    const matchesFilter =
      filter === "All" || t.status === filter;

    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      t.recipient.toLowerCase().includes(searchValue) ||
      t.id.toLowerCase().includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <RefreshCw size={16} />;
      case "On Hold":
        return <PauseCircle size={16} />;
      case "Received":
        return <CheckCircle2 size={16} />;
      case "Failed":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusClass = (status: string) =>
    status.toLowerCase().replace(/\s+/g, "-");

  const getCount = (status: string) =>
    mockTransactions.filter((t) => t.status === status).length;

  const clearFilters = () => {
    setFilter("All");
    setSearch("");
    setSelected(null);
  };

  return (
    <div className="payment-tracker">

      {/* HEADER */}
      <div className="payment-header">
        <div>
          <span className="details-label">ONE TRACK</span>
          <h1>Where is your money?</h1>
          <p>
            Understand every payment, why it happened,
            and what you should do next.
          </p>
        </div>

        <span className="demo-badge">DEMO DATA</span>
      </div>

      {/* STATISTICS */}
      <div className="payment-stats">
        {[
          {
            label: "Processing",
            icon: <RefreshCw size={19} />,
          },
          {
            label: "On Hold",
            icon: <PauseCircle size={19} />,
          },
          {
            label: "Received",
            icon: <CheckCircle2 size={19} />,
          },
          {
            label: "Failed",
            icon: <AlertCircle size={19} />,
          },
        ].map((item) => (
          <div className="payment-stat" key={item.label}>
            <div className="stat-top">
              {item.icon}
              <span>{item.label}</span>
            </div>

            <strong>{getCount(item.label)}</strong>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="payment-content">

        {/* LEFT: TRANSACTION LIST */}
        <div className="payment-list">

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search recipient or transaction ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
              }}
            />
          </div>

          {/* FILTER BUTTONS */}
          <div className="payment-filters">
            {statuses.map((status) => (
              <button
                type="button"
                key={status}
                className={
                  filter === status ? "active-filter" : ""
                }
                onClick={() => {
                  setFilter(status);
                  setSelected(null);
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* TRANSACTIONS */}
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <button
                type="button"
                key={transaction.id}
                className={`payment-row ${
                  selected?.id === transaction.id
                    ? "selected-payment"
                    : ""
                }`}
                onClick={() => setSelected(transaction)}
              >
                <div className="payment-person">

                  <div className="payment-avatar">
                    {transaction.recipient.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{transaction.recipient}</strong>

                    <span>
                      {transaction.id} · {transaction.date}
                    </span>
                  </div>

                </div>

                <div className="payment-amount">
                  <strong>
                    {transaction.currency}{" "}
                    {transaction.amount.toLocaleString()}
                  </strong>

                  <span
                    className={`payment-status ${getStatusClass(
                      transaction.status
                    )}`}
                  >
                    {getStatusIcon(transaction.status)}
                    {transaction.status}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="empty">
              <Search size={28} />
              <h3>No payments found</h3>

              <p>
                Try another search or change your filter.
              </p>

              <button
                type="button"
                className="text-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: TRANSACTION DETAILS */}
        <div className="payment-details">

          {selected ? (
            <>

              {/* DETAILS HEADER */}
              <div className="details-top">
                <span className="details-label">
                  TRANSACTION DETAILS
                </span>

                <button
                  type="button"
                  className="close-button"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>

              {/* RECIPIENT */}
              <div className="payment-avatar large-avatar">
                {selected.recipient.charAt(0).toUpperCase()}
              </div>

              <h2>{selected.recipient}</h2>

              <p className="recipient-email">
                {selected.email}
              </p>

              {/* AMOUNT */}
              <div className="big-amount">
                {selected.currency}{" "}
                {selected.amount.toLocaleString()}
              </div>

              {/* STATUS */}
              <span
                className={`payment-status ${getStatusClass(
                  selected.status
                )}`}
              >
                {getStatusIcon(selected.status)}
                {selected.status}
              </span>

              {/* WHY IT HAPPENED */}
              <div className="explanation reason-box">
                <h3>
                  <ShieldCheck size={18} />
                  Why did this happen?
                </h3>

                <p>
                  {selected.reason ||
                    "No specific reason is available for this transaction."}
                </p>
              </div>

              {/* WHAT TO DO */}
              <div className="explanation next-step-box">
                <h3>
                  <Lightbulb size={18} />
                  What should you do next?
                </h3>

                <p>
                  {selected.nextStep ||
                    "Check your payment details and notifications for further information."}
                </p>
              </div>

              {/* LAST UPDATED */}
              <div className="explanation">
                <h3>Last updated</h3>
                <p>{selected.lastUpdated}</p>
              </div>

              {/* TRANSACTION ID */}
              <div className="transaction-id">
                Transaction ID: {selected.id}
              </div>

              <p className="payment-disclaimer">
                These explanations use illustrative demo data,
                not live PayPal transaction diagnostics.
              </p>

            </>
          ) : (

            /* DEFAULT EMPTY DETAILS */
            <div className="select-payment">

              <div className="assistant-icon">
                <ArrowUpRight size={25} />
              </div>

              <h2>Where is my money?</h2>

              <p>
                Select any transaction to discover why
                it has that status and what you can do next.
              </p>

            </div>
          )}

        </div>
      </div>

      <p className="payment-disclaimer">
        Demo transaction data. This prototype does not
        display live PayPal account information.
      </p>

    </div>
  );
}
