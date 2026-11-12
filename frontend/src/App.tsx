
import { useEffect, useMemo, useState } from "react";
import {
  Home, CreditCard, MessageCircle, ShieldCheck, Settings,
  Bell, Search, ArrowUpRight, ArrowDownLeft, Wallet,
  ChevronRight, Sparkles, CheckCircle2, Clock3, Sun, Moon,
  LifeBuoy, AlertTriangle, Send, LockKeyhole, Activity,
  FileText, ShieldAlert, Info, Zap, BarChart3, Accessibility,
  Headphones, Menu, Eye, ArrowRight, CircleHelp, Volume2,
  Copy, Plus, X, Play, StopCircle
} from "lucide-react";
import { jsPDF } from "jspdf";

type Page =
  | "dashboard" | "track"
  | "resolve" | "shield" | "cases" | "insights"
  | "access" | "settings";

type Status = "Completed" | "Pending" | "Failed";

type Transaction = {
  id: string | number;
  name: string;
  amount: number;
  currency?: string;
  type: "sent" | "received";
  date: string;
  status: Status;
  reference: string;
  note: string;
  source?: string;
};

type ChatMessage = { from: "ai" | "user"; text: string };

type SupportCase = {
  id: string;
  title: string;
  reference: string;
  status: string;
  date: string;
  complaint: string;
  timeline: string[];
};

type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "CAD" | "AUD" | "SGD" | "JPY" | "CHF";

type TransferReceipt = {
  reference: string;
  recipient: string;
  amountInr: number;
  currency: CurrencyCode;
  convertedAmount: number;
  exchangeRate: number;
  note: string;
  type: "sent" | "received";
  date: string;
};

const initialTransactions: Transaction[] = [
  { id: 1, name: "Netflix", amount: 649, type: "sent", date: "Nov 06, 2026", status: "Completed", reference: "MP10021", note: "Monthly subscription" },
  { id: 2, name: "Rahul Sharma", amount: 2500, type: "received", date: "Nov 06, 2026", status: "Completed", reference: "MP10022", note: "Money received" },
  { id: 3, name: "Swiggy", amount: 428, type: "sent", date: "Nov 05, 2026", status: "Completed", reference: "MP10023", note: "Food order" },
  { id: 4, name: "Amazon", amount: 1899, type: "sent", date: "Nov 05, 2026", status: "Pending", reference: "MP10024", note: "Online purchase" },
  { id: 5, name: "Aarav Mehta", amount: 1200, type: "received", date: "Nov 04, 2026", status: "Completed", reference: "MP10025", note: "Money received" },
  { id: 6, name: "Myntra", amount: 3200, type: "sent", date: "Nov 03, 2026", status: "Failed", reference: "MP10026", note: "Fashion purchase" }
];

const initialCases: SupportCase[] = [
  { id: "CASE-1001", title: "Amazon payment pending", reference: "MP10024", status: "Under review", date: "Nov 05, 2026", complaint: "Demo case for an Amazon payment marked pending.", timeline: ["Case created", "Details recorded", "Awaiting official support"] },
  { id: "CASE-1002", title: "Myntra payment failed", reference: "MP10026", status: "Action required", date: "Nov 03, 2026", complaint: "Demo case for a Myntra payment marked failed.", timeline: ["Case created", "Payment reference recorded", "Check bank statement"] },
  { id: "CASE-1003", title: "Refund status enquiry", reference: "MP10023", status: "Resolved", date: "Nov 02, 2026", complaint: "Demo refund enquiry.", timeline: ["Case created", "Information reviewed", "Demo case resolved"] }
];

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);

const transactionMoney = (
  amount: number,
  currency = "INR"
) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);

const currencySymbols: Record<CurrencyCode, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ",
  CAD: "C$", AUD: "A$", SGD: "S$", JPY: "¥", CHF: "CHF "
};

const currencyNames: Record<CurrencyCode, string> = {
  INR: "Indian Rupee", USD: "US Dollar", EUR: "Euro", GBP: "British Pound",
  AED: "UAE Dirham", CAD: "Canadian Dollar", AUD: "Australian Dollar",
  SGD: "Singapore Dollar", JPY: "Japanese Yen", CHF: "Swiss Franc"
};

const formatCurrency = (amount: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2
  }).format(amount);

const navItems: { id: Page; label: string; icon: any; group: string }[] = [
  { id: "dashboard", label: "Overview", icon: Home, group: "MAIN" },
  { id: "track", label: "ONE Track", icon: Activity, group: "MAIN" },
  { id: "resolve", label: "ONE Resolve", icon: LifeBuoy, group: "INTELLIGENCE" },
  { id: "shield", label: "ONE Shield", icon: ShieldCheck, group: "INTELLIGENCE" },
  { id: "cases", label: "ONE Cases", icon: FileText, group: "INTELLIGENCE" },
  { id: "insights", label: "ONE Insights", icon: BarChart3, group: "TOOLS" },
  { id: "access", label: "ONE Access+", icon: Accessibility, group: "TOOLS" },
  { id: "settings", label: "Settings", icon: Settings, group: "TOOLS" }
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  // ONE Wallet + ONE Global are demo-only. No real money is moved.
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = Number(localStorage.getItem("mypal-demo-wallet-balance"));
    // Start with ₹1,00,000 if this is a fresh/zero-balance demo wallet.
    return Number.isFinite(saved) && saved > 0 ? saved : 100000;
  });
  const [transferOpen, setTransferOpen] = useState<null | "send" | "receive">(null);
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferCurrency, setTransferCurrency] = useState<CurrencyCode>("INR");
  const [transferNote, setTransferNote] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferReceipt, setTransferReceipt] = useState<TransferReceipt | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Partial<Record<CurrencyCode, number>>>({ INR: 1 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState("");
  const [ratesError, setRatesError] = useState("");
  const [receiveCode, setReceiveCode] = useState("");

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("mypal-dark") === "true";
  });

  useEffect(() => {
    localStorage.setItem("mypal-dark", String(dark));
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("mypal-demo-wallet-balance", String(walletBalance));
  }, [walletBalance]);

  useEffect(() => {
    const controller = new AbortController();
    const loadRates = async () => {
      setRatesLoading(true);
      setRatesError("");
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/INR", {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Exchange-rate service unavailable");
        const data = await response.json();
        if (data.result !== "success" || !data.rates) throw new Error("Invalid exchange-rate response");
        const supported: CurrencyCode[] = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD", "JPY", "CHF"];
        const nextRates: Partial<Record<CurrencyCode, number>> = { INR: 1 };
        supported.forEach(code => {
          const rate = Number(data.rates[code]);
          if (Number.isFinite(rate) && rate > 0) nextRates[code] = rate;
        });
        setExchangeRates(nextRates);
        setRatesUpdatedAt(data.time_last_update_utc || new Date().toLocaleString());
      } catch (error) {
        if (!controller.signal.aborted) {
          setRatesError("Live exchange rates could not be loaded. INR transfers still work; foreign-currency estimates are unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setRatesLoading(false);
      }
    };
    loadRates();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        setTransactionError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/transactions"
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        const records = Array.isArray(data)
          ? data
          : data.transactions;

        if (!Array.isArray(records)) {
          throw new Error("Invalid transaction response");
        }

        const formattedTransactions: Transaction[] = records.map(
          (item: any, index: number) => ({
            id: String(item.id ?? index + 1),
            name: item.name ?? "Unknown",
            amount: Number(item.amount),
            type:
              String(item.type).toLowerCase().includes("received") ||
                String(item.type).toLowerCase().includes("refund")
                ? "received"
                : "sent",
            date: item.date ?? "",
            status: ["Completed", "Pending", "Failed"].includes(item.status)
              ? item.status
              : "Pending",
            reference: String(item.id ?? item.reference ?? index + 1),
            note: item.description ?? item.type ?? ""
          })
        );

        setTransactions(prev => [
          ...prev.filter(t => t.note.includes("DEMO")),
          ...formattedTransactions
        ]);

      } catch (error) {
        console.error("Transaction API error:", error);

        setTransactionError(
          "Could not load transactions. Showing demo data instead."
        );

      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState("");

  useEffect(() => {
    const fetchPayPalTransactions = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/paypal/transactions"
        );

        if (!response.ok) {
          throw new Error(`PayPal API returned ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.transactions)) {
          throw new Error("Invalid PayPal transaction response");
        }

        const paypalTransactions: Transaction[] =
          data.transactions.map((item: any) => ({
            id: item.capture_id,
            name:
              item.payer_name ||
              item.payer_email ||
              "PayPal Sandbox Buyer",
            amount: Number(item.amount),
            currency: item.currency_code || "USD",
            type: "received",
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString("en-IN")
              : "",
            status:
              item.status === "COMPLETED"
                ? "Completed"
                : item.status === "FAILED"
                  ? "Failed"
                  : "Pending",
            reference: item.capture_id || item.order_id,
            note: `PayPal Sandbox · Order ${item.order_id}`,
            source: "PayPal Sandbox"
          }));

        setTransactions(prev => [
          ...paypalTransactions,
          ...prev.filter(t => t.source !== "PayPal Sandbox")
        ]);

        console.log(
          "PayPal transactions loaded:",
          paypalTransactions.length
        );

      } catch (error) {
        console.error("PayPal transaction loading error:", error);
      }
    };

    fetchPayPalTransactions();
  }, []);

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "ai",
      text: "Hey! I'm ONE Assist. I can help you understand your sample transactions, pending payments, failed payments, refunds and support cases. Try asking me about Amazon or MP10024!"
    }
  ]);

  const [chatInput, setChatInput] = useState("");
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const [issue, setIssue] = useState("Failed payment");
  const [issueAmount, setIssueAmount] = useState("5000");
  const [resolveStep, setResolveStep] = useState(0);

  const [shieldText, setShieldText] = useState("");
  const [shieldResult, setShieldResult] = useState<null | {
    level: string;
    reasons: string[];
    advice: string
  }>(null);

  const [settings, setSettings] = useState({
    alerts: true,
    simple: true,
    insights: true
  });

  const [access, setAccess] = useState(() => {
    const defaults = {
      largeText: false,
      simpleLanguage: true,
      highContrast: false,
      guided: true
    };

    try {
      const saved = localStorage.getItem("mypal-access-settings");

      if (saved) {
        const parsed = JSON.parse(saved);

        return {
          largeText: parsed.largeText ?? defaults.largeText,
          simpleLanguage: parsed.simpleLanguage ?? defaults.simpleLanguage,
          highContrast: parsed.highContrast ?? defaults.highContrast,
          guided: parsed.guided ?? defaults.guided
        };
      }
    } catch (error) {
      console.error("Could not load accessibility settings:", error);
    }

    return defaults;
  });
  useEffect(() => {
    localStorage.setItem(
      "mypal-access-settings",
      JSON.stringify(access)
    );
  }, [access]);

  const [cases, setCases] = useState<SupportCase[]>(initialCases);
  const [caseTransactionRef, setCaseTransactionRef] = useState("MP10024");
  const [caseIssue, setCaseIssue] = useState("Payment is pending");
  const [complaint, setComplaint] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const [evidence, setEvidence] = useState({
    screenshot: false,
    bank: false,
    merchant: false,
    reference: true
  });

  const [guidedStep, setGuidedStep] = useState(0);


  const filtered = useMemo(
    () =>
      transactions.filter(t => {
        const matchesSearch =
          `${t.name} ${t.reference} ${t.status}`
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || t.status === statusFilter;

        const matchesType =
          typeFilter === "All" || t.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      }),
    [transactions, search, statusFilter, typeFilter]
  );

  const sortedTransactions = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      ),
    [filtered]
  );

  const caseTransaction =
    transactions.find(t => t.reference === caseTransactionRef) ||
    transactions[0];

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Read aloud is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const openCaseBuilder = (transaction?: Transaction) => {
    if (transaction) {
      setCaseTransactionRef(transaction.reference);
      setCaseIssue(
        transaction.status === "Pending"
          ? "Payment is pending"
          : transaction.status === "Failed"
            ? "Payment failed"
            : "Unexpected transaction"
      );
    }

    setComplaint("");
    setCopyMessage("");
    setPage("cases");
    setSelected(null);
  };


  const generateComplaint = () => {
    const t = caseTransaction;

    if (!t) {
      setCopyMessage("Please select a transaction first.");
      return;
    }

    const text = `Subject: Assistance Required for ${caseIssue}

Hello Support Team,

I need assistance regarding a transaction in my account.

TRANSACTION DETAILS

Merchant / Recipient: ${t.name || "Not available"}
Transaction Amount: ${transactionMoney(t.amount, t.currency)}
Transaction Date: ${t.date || "Not available"}
Transaction Reference: ${t.reference || "Not available"}
Payment Source: ${t.source || "Not available"}
Current Transaction Status: ${t.status || "Unknown"}

ISSUE DESCRIPTION

${caseIssue}

REQUESTED RESOLUTION

I kindly request your team to investigate this transaction, verify its current status, and provide guidance regarding the appropriate resolution.

Please let me know if any additional information or supporting evidence is required.

Thank you for your assistance.

Regards,
MyPal User`;

    setComplaint(text);
    setCopyMessage(
      "Professional complaint generated successfully. You can edit it before copying."
    );
  };


  const downloadComplaintPDF = () => {
    if (!complaint) {
      setCopyMessage("Please generate a complaint first.");
      return;
    }

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MyPal - ONE Resolve", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Payment Support Complaint", 20, 28);

    doc.setDrawColor(100);
    doc.line(20, 33, 190, 33);

    doc.setFontSize(11);

    const lines = doc.splitTextToSize(complaint, 170);

    let y = 43;

    lines.forEach((line) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, 20, y);
      y += 7;
    });

    doc.save("MyPal_Complaint.pdf");

    setCopyMessage("Complaint PDF downloaded successfully!");
  };



  const copyComplaint = async () => {
    if (!complaint.trim()) return;

    try {
      await navigator.clipboard.writeText(complaint);
      setCopyMessage("Complaint copied successfully!");
    } catch {
      setCopyMessage(
        "Clipboard unavailable. Please select and copy the text manually."
      );
    }
  };

  const createDemoCase = () => {
    if (!complaint.trim()) {
      setCopyMessage("Generate a complaint first.");
      return;
    }

    const id = `CASE-${1001 + cases.length}`;

    const newCase: SupportCase = {
      id,
      title: `${caseTransaction.name} - ${caseIssue}`,
      reference: caseTransaction.reference,
      status: "Demo case created",
      date: new Date().toLocaleDateString("en-IN"),
      complaint,
      timeline: [
        "Demo case created",
        "Complaint details saved locally",
        "Evidence checklist available",
        "Ready for official support submission"
      ]
    };

    setCases(prev => [newCase, ...prev]);
    setCopyMessage(
      `${id} created in this demo. It was not sent to real support.`
    );
  };

  const parsedTransferAmount = Number(transferAmount);
  const selectedRate = exchangeRates[transferCurrency] || 0;
  const convertedTransferAmount =
    transferCurrency === "INR" ? parsedTransferAmount :
      selectedRate > 0 ? parsedTransferAmount / selectedRate : 0;

  const openTransfer = (mode: "send" | "receive") => {
    setTransferOpen(mode);
    setTransferRecipient("");
    setTransferAmount("");
    setTransferCurrency("INR");
    setTransferNote("");
    setTransferError("");
    setTransferReceipt(null);
    setReceiveCode("");
  };

  const completeDemoTransfer = () => {
    const amount = Number(transferAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransferError("Enter an amount greater than zero.");
      return;
    }
    if (transferOpen === "send" && !transferRecipient.trim()) {
      setTransferError("Enter the recipient's name or payment handle.");
      return;
    }
    if (transferOpen === "send" && amount > walletBalance) {
      setTransferError("Your demo wallet does not have enough balance for this transfer.");
      return;
    }
    if (transferCurrency !== "INR" && (!selectedRate || ratesLoading)) {
      setTransferError("Wait for a valid exchange rate before using a foreign currency.");
      return;
    }

    const amountInr = transferCurrency === "INR" ? amount : amount / selectedRate;
    const reference = `MP${Date.now().toString().slice(-8)}`;
    const receipt: TransferReceipt = {
      reference,
      recipient: transferOpen === "send" ? transferRecipient.trim() : "You",
      amountInr,
      currency: transferCurrency,
      convertedAmount: amount,
      exchangeRate: selectedRate || 1,
      note: transferNote.trim() || (transferOpen === "send" ? "Demo money transfer" : "Demo money received"),
      type: transferOpen === "send" ? "sent" : "received",
      date: new Date().toLocaleString("en-IN")
    };

    if (transferOpen === "send") {
      setWalletBalance(prev => Math.max(0, prev - amountInr));
    } else {
      setWalletBalance(prev => prev + amountInr);
    }

    const newTransaction: Transaction = {
      id: reference,
      name: receipt.recipient,
      amount: amountInr,
      type: receipt.type,
      date: new Date().toLocaleDateString("en-IN"),
      status: "Completed",
      reference,
      note: `${receipt.note}${transferCurrency !== "INR" ? ` · ${formatCurrency(amount, transferCurrency)} at ${selectedRate.toFixed(6)} ${transferCurrency}/INR` : ""} · DEMO`
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setTransferReceipt(receipt);
    setTransferOpen(null);
  };

  const createReceiveRequest = () => {
    const amount = Number(transferAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransferError("Enter an amount greater than zero.");
      return;
    }
    const code = `ONE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setReceiveCode(code);
    setTransferError("");
  };

  // CONTEXT-AWARE CHATBOT
  // It checks the sample transactions before generating a reply.


  const sendMessage = async () => {
    const question = chatInput.trim();

    if (!question || chatLoading) return;

    // Display the user's message
    setMessages(prev => [
      ...prev,
      { from: "user", text: question }
    ]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/assist/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: question,
            transactions: transactions
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Assistant request failed.");
      }

      if (!data.reply) {
        throw new Error("No reply received from ONE Assist.");
      }

      // Display the backend response
      setMessages(prev => [
        ...prev,
        { from: "ai", text: data.reply }
      ]);

    } catch (error) {
      console.error("ONE Assist API error:", error);

      setMessages(prev => [
        ...prev,
        {
          from: "ai",
          text: "Sorry, I couldn't connect to ONE Assist. Please check whether the backend is running and try again."
        }
      ]);

    } finally {
      setChatLoading(false);
    }
  };

  const checkScam = () => {
    const text = shieldText.toLowerCase();

    const flags = [
      "otp", "password", "urgent", "click here", "prize",
      "winner", "verify account", "pin", "send money", "remote access"
    ];

    const found = flags.filter(word => text.includes(word));

    if (!shieldText.trim()) {
      setShieldResult({
        level: "No message entered",
        reasons: ["Paste a suspicious message or payment request to check it."],
        advice: "Do not share private account information."
      });
      return;
    }

    setShieldResult({
      level:
        found.length >= 2
          ? "High caution"
          : found.length === 1
            ? "Review carefully"
            : "No obvious keywords found",
      reasons: found.length
        ? found.map(f => `Contains a caution keyword: "${f}"`)
        : ["No listed warning keywords were detected."],
      advice:
        "This is only a basic keyword check. It cannot prove whether a message is safe. Never share OTPs, PINs, passwords, or install unknown apps."
    });
  };

  const resolveAdvice = [
    "Start by checking the transaction status and reference number in your payment app.",
    "Check your bank statement to see whether the amount was actually debited.",
    "Keep screenshots, merchant messages, and the transaction reference as evidence.",
    "Contact the official payment provider or merchant using verified contact details."
  ];

  const pageTitle =
    navItems.find(item => item.id === page)?.label || "Overview";

  const statusClass = (status: Status | string) =>
    status === "Completed" || status === "Resolved"
      ? "success"
      : status === "Pending" || status === "Under review"
        ? "pending"
        : status === "Failed" || status === "Action required"
          ? "danger"
          : "neutral";

  const TransactionRow = ({ t }: { t: Transaction }) => (
    <button className="transaction-row" onClick={() => setSelected(t)}>
      <div className={`transaction-icon ${t.type}`}>
        {t.type === "sent"
          ? <ArrowUpRight size={19} />
          : <ArrowDownLeft size={19} />}
      </div>

      <div className="transaction-info">
        <strong>{t.name}</strong>
        <span>{t.date} · {t.reference}</span>
      </div>

      <div className="transaction-amount">
        <strong className={t.type === "received" ? "green-text" : ""}>
          {t.type === "received" ? "+" : "-"}
          {transactionMoney(t.amount, t.currency)}
        </strong>
        <span className={`status ${statusClass(t.status)}`}>
          {t.status}
        </span>
      </div>

      <ChevronRight size={17} className="muted" />
    </button>
  );

  const PageIntro = ({
    title,
    subtitle,
    icon: Icon
  }: {
    title: string;
    subtitle: string;
    icon: any
  }) => (
    <div className="page-intro">
      <div className="intro-icon"><Icon size={22} /></div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );

  const Toggle = ({
    label,
    description,
    checked,
    onChange
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void
  }) => (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        className={`switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-label={`Toggle ${label}`}
      >
        <span />
      </button>
    </div>
  );

  const TransactionExplain = ({ t }: { t: Transaction }) => {
    const explanation =
    t.status === "Completed"
      ? {
        what: "The transaction is marked as completed in this demo.",
        why: "The payment record shows a successful status. This does not independently confirm that the merchant has fulfilled an order.",
        money: "The payment is recorded as completed. Check your bank or wallet statement for the final account entry.",
        next: [
          "Check the merchant order or recipient confirmation.",
          "Save the transaction reference.",
          "Contact the merchant if the order or service is missing."
        ],
        avoid: "Do not pay again before checking the merchant and your bank statement."
      }
      : t.status === "Pending"
        ? {
          what: "The payment has started, but its final result is not confirmed yet.",
          why: "The bank, payment provider, or merchant may still be processing the transaction. This demo cannot identify the exact cause.",
          money: "The amount may be temporarily held or debited depending on the payment method. Check your bank statement for the actual account status.",
          next: [
            "Check your bank activity.",
            "Check the merchant order status.",
            "Keep the reference number and wait for the provider's stated processing time."
          ],
          avoid: "Avoid making the same payment again immediately. It could create a duplicate payment."
        }
        : {
          what: "The transaction is marked as failed in this demo.",
          why: "Possible reasons include a bank decline, insufficient balance, connection issue, or verification problem. The actual reason needs provider confirmation.",
          money: "If money was deducted, check your bank statement and ask the payment provider about the reversal or refund timeline.",
          next: [
            "Check whether money was deducted.",
            "Save the transaction reference.",
            "Contact the official provider if the amount was debited or the issue continues."
          ],
          avoid: "Do not retry repeatedly without checking whether the first payment was deducted."
        };

    const spoken =
      `${t.name}. ${t.status}. What happened: ${explanation.what}. ` +
      `Why: ${explanation.why}. Money: ${explanation.money}. ` +
      `Next steps: ${explanation.next.join(". ")}. Avoid: ${explanation.avoid}`;

    return (
      <div className="explain-panel">
        <div className="explain-heading">
          <div>
            <span className="eyebrow">MY TRANSACTION GUIDE</span>
            <h2>ONE Explain</h2>
            <p>Understand your payment, without the confusing jargon.</p>
          </div>
          <button className="icon-button" onClick={() => setSelected(null)}>
            <X size={19} />
          </button>
        </div>

        <div className="explain-transaction">
          <div className="transaction-icon sent"><Wallet size={20} /></div>
          <div>
            <strong>{t.name}</strong>
            <span>{t.reference} · {t.date}</span>
            <span>
              Payment source: {t.source || "MyPal"}
            </span>
            <span>
              {t.note}
            </span>

            <button
              className="secondary-button"
              onClick={() => {
                navigator.clipboard.writeText(t.reference);
              }}
            >
              Copy reference
            </button>

          </div>
          <div className="explain-amount">
            <strong>
              {formatCurrency(
                t.amount,
                (t.currency || "INR") as CurrencyCode
              )}
            </strong>
            <span className={`status ${statusClass(t.status)}`}>
              {t.status}
            </span>
          </div>
        </div>


        <div className="panel" style={{ padding: "20px", marginBottom: "20px" }}>
          <h3>Payment Timeline</h3>
          <p style={{ color: "#999", fontSize: "13px" }}>
            Status journey based on the current transaction record.
            These are not live provider events.
          </p>

          {[
            {
              title: "Payment Initiated",
              detail: "Transaction recorded successfully",
              state: "Completed"
            },
            {
              title: "Payment Processing",
              detail: t.status === "Pending"
                ? "Awaiting final confirmation"
                : t.status === "Failed"
                  ? "Processing was interrupted"
                  : "Processing completed",
              state: t.status === "Pending"
                ? "Pending"
                : t.status === "Failed"
                  ? "Failed"
                  : "Completed"
            },
            {
              title: "Final Payment Status",
              detail: t.status === "Completed"
                ? "Payment completed successfully"
                : t.status === "Pending"
                  ? "Final confirmation is awaited"
                  : "Payment was unsuccessful",
              state: t.status
            }
          ].map((step, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "14px",
                padding: "12px 0",
                borderBottom: "1px solid rgba(150,150,150,0.2)"
              }}
            >
              <div>
                {step.state === "Completed" ? "🟢" :
                  step.state === "Pending" ? "🟡" : "🔴"}
              </div>

              <div>
                <strong>{step.title}</strong>
                <p style={{ fontSize: "13px", color: "#999" }}>
                  {step.detail}
                </p>
                <span className={`status ${statusClass(step.state)}`}>
                  {step.state}
                </span>
              </div>
            </div>
          ))}
        </div>


        <div className="explain-grid">
          <div className="explain-card">
            <span className="explain-number">01</span>
            <h3>What happened?</h3>
            <p>{access.simpleLanguage
              ? explanation.what.replace("The transaction is marked as", "Your payment is marked as")
              : explanation.what}</p>
          </div>

          <div className="explain-card">
            <span className="explain-number">02</span>
            <h3>Why did it happen?</h3>
            <p>{explanation.why}</p>
          </div>

          <div className="explain-card">
            <span className="explain-number">03</span>
            <h3>What happens to your money?</h3>
            <p>{explanation.money}</p>
          </div>

          <div className="explain-card">
            <span className="explain-number">04</span>
            <h3>What should you do next?</h3>
            <ul>
              {explanation.next.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="warning-note">
          <AlertTriangle size={19} />
          <div>
            <strong>Things to avoid</strong>
            <p>{explanation.avoid}</p>
          </div>
        </div>
        </div>
      );
  };

        return (
        <div className={`app ${dark ? "dark-mode" : ""} ${access.largeText ? "large-text" : ""} ${access.highContrast ? "high-contrast" : ""}`}>

          <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
            <div className="brand">
              <div className="brand-mark"><Zap size={22} fill="white" /></div>
              <div>
                <strong>MyPal <span>ONE</span></strong>
                <small>PAYMENT COMPANION</small>
              </div>
              <button
                className="mobile-close icon-button"
                onClick={() => setMobileMenu(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="profile-mini">
              <div className="avatar">M</div>
              <div>
                <strong>My Account</strong>
                <span>Personal workspace</span>
              </div>
              <span className="online-dot" />
            </div>

            {["MAIN", "INTELLIGENCE", "TOOLS"].map(group => (
              <div className="nav-group" key={group}>
                <span className="nav-label">{group}</span>

                {navItems.filter(item => item.group === group).map(item => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`nav-item ${page === item.id ? "active" : ""}`}
                      onClick={() => {
                        setPage(item.id);
                        setSelected(null);
                        setMobileMenu(false);
                      }}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.id === "cases" &&
                        <span className="nav-count">{cases.length}</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="sidebar-bottom">
              <div className="help-card">
                <div className="help-icon"><Headphones size={19} /></div>
                <strong>Need a hand?</strong>
                <p>ONE Assist is here whenever you need help.</p>
                <button onClick={() => setChatWidgetOpen(true)}>
                  Chat with ONE Assist <ArrowRight size={14} />
                </button>
              </div>
              <div className="sidebar-footer">
                <ShieldCheck size={15} /> Your clarity comes first.
              </div>
            </div>
          </aside>

          <main className="main">
            <header className="topbar">
              <div className="topbar-left">
                <button
                  className="mobile-menu icon-button"
                  onClick={() => setMobileMenu(true)}
                >
                  <Menu size={20} />
                </button>

                <div>
                  <div className="breadcrumb">MyPal ONE / {pageTitle}</div>
                  <h1>{pageTitle}</h1>
                </div>
              </div>

              <div className="topbar-actions">
                <label className="search-box">
                  <Search size={17} />
                  <input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </label>

                <button
                  className="icon-button"
                  onClick={() => setDark(!dark)}
                  title="Toggle theme"
                >
                  {dark ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                <div className="notification-wrap">
                  <button
                    className="icon-button notification-button"
                    onClick={() => setAlertsOpen(!alertsOpen)}
                  >
                    <Bell size={19} />
                    {settings.alerts && <i />}
                  </button>

                  {alertsOpen && (
                    <div className="notification-pop">
                      <strong>Notifications</strong>
                      <p><Clock3 size={15} /> Amazon payment is pending.</p>
                      <p><ShieldAlert size={15} /> Review your failed Myntra payment.</p>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="content">
              {selected && <TransactionExplain t={selected} />}

              {!selected && page === "dashboard" && <>
                <div className="welcome-row">
                  <div>
                    <span className="eyebrow">YOUR MONEY, MADE CLEARER</span>
                    <h2>Good to see you again.</h2>
                    <p>Here's what's happening with your transactions.</p>
                  </div>
                  <div className="dashboard-actions">
                    <div className="date-chip"><Activity size={15} /> Demo account</div>
                    <div className="button-row">
                      <button className="primary-button" onClick={() => openTransfer("send")}><Send size={16} /> Send money</button>
                      <button className="secondary-button" onClick={() => openTransfer("receive")}><ArrowDownLeft size={16} /> Receive money</button>
                    </div>
                  </div>
                </div>

                <div className="wallet-balance-card">
                  <div>
                    <span className="eyebrow">ONE WALLET · DEMO BALANCE</span>
                    <h2>{money(walletBalance)}</h2>
                    <p>Available demo balance · Transfers update this prototype only</p>
                  </div>
                  <div className="wallet-balance-icon"><Wallet size={27} /></div>
                </div>

                <div className="hero-banner">
                  <div className="hero-copy">
                    <span className="hero-tag">
                      <Sparkles size={13} /> INTRODUCING MY PAL ONE
                    </span>
                    <h2>
                      Payments are complicated.<br />
                      <em>Understanding them shouldn't be.</em>
                    </h2>
                    <p>
                      Understand transactions, prepare support requests,
                      and make payments more accessible.
                    </p>
                    <button onClick={() => setPage("track")}>
                      Explore ONE Track <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="hero-art">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <div className="hero-symbol"><Zap size={48} fill="white" /></div>
                    <div className="floating-chip chip-a">
                      <CheckCircle2 size={15} /> Clear status
                    </div>
                    <div className="floating-chip chip-b">
                      <ShieldCheck size={15} /> Safer choices
                    </div>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-top">
                      <span>Total transactions</span>
                      <span className="stat-icon blue"><CreditCard size={18} /></span>
                    </div>
                    <strong>{transactions.length}</strong>
                    <small>In this sample account</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <span>Money sent</span>
                      <span className="stat-icon purple"><ArrowUpRight size={18} /></span>
                    </div>
                    <strong>{money(transactions.filter(t => t.type === "sent").reduce((a, t) => a + t.amount, 0))}</strong>
                    <small>Sample transaction total</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <span>Money received</span>
                      <span className="stat-icon green"><ArrowDownLeft size={18} /></span>
                    </div>
                    <strong>{money(transactions.filter(t => t.type === "received").reduce((a, t) => a + t.amount, 0))}</strong>
                    <small>Sample transaction total</small>
                  </div>

                  <div className="stat-card">
                    <div className="stat-top">
                      <span>Needs attention</span>
                      <span className="stat-icon orange"><AlertTriangle size={18} /></span>
                    </div>
                    <strong>{transactions.filter(t => t.status !== "Completed").length}</strong>
                    <small>Pending or failed</small>
                  </div>
                </div>

                <div className="section-heading">
                  <div>
                    <h3>Recent transactions</h3>
                    <p>Select any transaction to understand it.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage("track")}>
                    View all <ArrowRight size={15} />
                  </button>
                </div>

                <div className="panel transaction-list">

                  {loadingTransactions && (
                    <p>Loading transactions...</p>
                  )}

                  {transactionError && (
                    <p role="alert">{transactionError}</p>
                  )}

                  {!loadingTransactions && transactions.length === 0 && (
                    <p>No transactions available.</p>
                  )}

                  {transactions.slice(0, 4).map(t => (
                    <TransactionRow key={t.id} t={t} />
                  ))}

                </div>
                <div className="feature-grid">
                  <button
                    className="feature-card"
                    onClick={() => setChatWidgetOpen(true)}
                  >
                    <div className="feature-icon lavender"><MessageCircle /></div>
                    <strong>ONE Assist</strong>
                    <p>Ask questions in simple language.</p>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    className="feature-card"
                    onClick={() => setPage("cases")}
                  >
                    <div className="feature-icon peach"><FileText /></div>
                    <strong>ONE Case Builder</strong>
                    <p>Prepare a support-ready complaint.</p>
                    <ArrowRight size={17} />
                  </button>

                  <button
                    className="feature-card"
                    onClick={() => setPage("access")}
                  >
                    <div className="feature-icon mint"><Accessibility /></div>
                    <strong>ONE Access+</strong>
                    <p>Make payment guidance easier to use.</p>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </>}



              {!selected && page === "track" && <>
                <PageIntro
                  title="ONE Track"
                  subtitle="Follow what happened to a payment and understand what to do next."
                  icon={Activity}
                />
                <div className="track-banner">
                  <div>
                    <span className="eyebrow">TRANSACTION CLARITY</span>
                    <h2>Every payment has a story.</h2>
                    <p>
                      Choose a transaction below to see its status, possible
                      explanation, and recommended next steps.
                    </p>
                  </div>
                  <div className="track-graphic"><Activity size={48} /></div>
                </div>

                <div className="section-heading">
                  <div>
                    <h3>Choose a transaction</h3>
                    <p>Tap a row to open ONE Explain.</p>
                  </div>
                </div>


                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "16px"
                  }}
                >
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px" }}
                  >
                    <option value="All">All statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{ padding: "10px", borderRadius: "8px" }}
                  >
                    <option value="All">All types</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                  </select>

                  <button
                    onClick={() => {
                      setStatusFilter("All");
                      setTypeFilter("All");
                      setSearch("");
                    }}
                  >
                    Clear filters
                  </button>
                </div>

                <div className="panel transaction-list">
                  {transactions.map(t => <TransactionRow key={t.id} t={t} />)}
                </div>
              </>}

              {!selected && page === "resolve" && <>
                <PageIntro
                  title="ONE Resolve"
                  subtitle="A step-by-step guide to preparing for a payment issue."
                  icon={LifeBuoy}
                />

                <div className="smart-guidance-grid">
                  <div className="panel smart-guidance-card">
                    <span className="eyebrow"><Sparkles size={13} /> ONE SMART JOURNEY</span>
                    <h3>Your next best steps, in one place.</h3>
                    <p>ONE Resolve brings the guided journey together: verify the payment, check your bank entry, collect evidence, then contact verified support.</p>
                    <ol>
                      <li>Understand the transaction status</li>
                      <li>Confirm whether money was debited</li>
                      <li>Keep the reference and supporting evidence</li>
                      <li>Use the official provider's support channel</li>
                    </ol>
                  </div>
                  <div className="panel smart-guidance-card">
                    <span className="eyebrow"><Bell size={13} /> ONE SMART ALERTS</span>
                    <h3>Important things to notice.</h3>
                    <p>These alerts are generated from the demo transaction records, not from a live bank connection.</p>
                    {transactions.filter(t => t.status !== "Completed").slice(0, 3).map(t => (
                      <button className="smart-alert-row" key={t.reference} onClick={() => setSelected(t)}>
                        <AlertTriangle size={16} />
                        <span><strong>{t.name}</strong><small>{t.status} · {t.reference}</small></span>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                    {transactions.every(t => t.status === "Completed") && <p>No pending or failed demo transactions right now.</p>}
                  </div>
                </div>

                <div className="resolve-layout">
                  <div className="panel resolve-panel">
                    <span className="eyebrow">GUIDED RESOLUTION</span>
                    <h2>Let's understand the issue.</h2>

                    <label className="field-label">What issue are you facing?</label>
                    <select
                      value={issue}
                      onChange={e => {
                        setIssue(e.target.value);
                        setResolveStep(0);
                      }}
                    >
                      <option>Failed payment</option>
                      <option>Payment pending</option>
                      <option>Refund not received</option>
                      <option>Money deducted twice</option>
                      <option>Unknown transaction</option>
                    </select>

                    <label className="field-label">Amount involved (₹)</label>
                    <input
                      value={issueAmount}
                      onChange={e => setIssueAmount(e.target.value)}
                      type="number"
                    />

                    <div className="resolve-progress">
                      <span>Step {resolveStep + 1} of {resolveAdvice.length}</span>
                      <div>
                        <i style={{
                          width: `${((resolveStep + 1) / resolveAdvice.length) * 100}%`
                        }} />
                      </div>
                    </div>

                    <div className="resolve-step">
                      <span className="step-number">0{resolveStep + 1}</span>
                      <div>
                        <h3>{[
                          "Check the transaction",
                          "Verify the bank entry",
                          "Collect your evidence",
                          "Contact official support"
                        ][resolveStep]}</h3>
                        <p>{resolveAdvice[resolveStep]}</p>
                      </div>
                    </div>

                    <div className="button-row">
                      <button
                        className="secondary-button"
                        disabled={resolveStep === 0}
                        onClick={() => setResolveStep(s => s - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="primary-button"
                        onClick={() =>
                          resolveStep === 3
                            ? openCaseBuilder()
                            : setResolveStep(s => s + 1)
                        }
                      >
                        {resolveStep === 3 ? "Build support case" : "Next step"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="side-info-card">
                    <ShieldCheck size={28} />
                    <h3>Your safety matters.</h3>
                    <p>
                      Only contact support through official channels.
                      Never share your OTP, PIN, or password with anyone.
                    </p>
                  </div>
                </div>
              </>}

              {!selected && page === "shield" && <>
                <PageIntro
                  title="ONE Shield"
                  subtitle="A basic warning check for suspicious messages and payment requests."
                  icon={ShieldCheck}
                />

                <div className="shield-layout">
                  <div className="panel shield-panel">
                    <div className="shield-top">
                      <div className="feature-icon mint"><ShieldCheck /></div>
                      <div>
                        <h2>Check before you trust.</h2>
                        <p>Paste a suspicious message or payment request.</p>
                      </div>
                    </div>

                    <textarea
                      value={shieldText}
                      onChange={e => setShieldText(e.target.value)}
                      placeholder="Paste the message here..."
                      rows={6}
                    />

                    <button className="primary-button full-button" onClick={checkScam}>
                      <Eye size={17} /> Check this message
                    </button>

                    {shieldResult && (
                      <div className="shield-result">
                        <h3>{shieldResult.level}</h3>
                        {shieldResult.reasons.map((r, i) => (
                          <p key={i}><AlertTriangle size={15} /> {r}</p>
                        ))}
                        <div className="warning-note">
                          <Info size={18} />
                          <p>{shieldResult.advice}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="side-info-card">
                    <LockKeyhole size={28} />
                    <h3>Keep these private</h3>
                    <ul>
                      <li>One-time passwords (OTPs)</li>
                      <li>PINs and passwords</li>
                      <li>Full card details</li>
                      <li>Remote access to your device</li>
                    </ul>
                  </div>
                </div>
              </>}

              {!selected && page === "cases" && <>
                <PageIntro
                  title="ONE Case Builder"
                  subtitle="Turn a confusing payment issue into a clear support request."
                  icon={FileText}
                />

                <div className="case-layout">
                  <div className="panel case-builder">
                    <div className="builder-heading">
                      <div className="feature-icon lavender"><FileText /></div>
                      <div>
                        <h2>Build your support case</h2>
                        <p>Prepare the details before contacting official support.</p>
                      </div>
                    </div>

                    <label className="field-label">Choose a transaction</label>
                    <select
                      value={caseTransactionRef}
                      onChange={e => {
                        setCaseTransactionRef(e.target.value);
                        setComplaint("");
                      }}
                    >
                      {transactions.map(t => (
                        <option key={t.reference} value={t.reference}>
                          {t.name} · {t.reference} · {
                            formatCurrency(t.amount, (t.currency || "INR") as CurrencyCode)
                          }
                        </option>
                      ))}
                    </select>

                    <div className="selected-case-summary">
                      <div>
                        <span>Transaction status</span>
                        <strong className={`status ${statusClass(caseTransaction.status)}`}>
                          {caseTransaction.status}
                        </strong>
                      </div>
                      <div>
                        <span>Amount</span>
                        <strong>
                          {formatCurrency(
                            caseTransaction.amount,
                            (caseTransaction.currency || "INR") as CurrencyCode
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Reference</span>
                        <strong>{caseTransaction.reference}</strong>
                      </div>
                    </div>

                    <label className="field-label">
                      What issue do you need help with?
                    </label>
                    <select
                      value={caseIssue}
                      onChange={e => {
                        setCaseIssue(e.target.value);
                        setComplaint("");
                      }}
                    >
                      <option>Payment is pending</option>
                      <option>Payment failed</option>
                      <option>Money deducted but payment failed</option>
                      <option>Refund not received</option>
                      <option>Unexpected transaction</option>
                      <option>Other payment issue</option>
                    </select>

                    <button
                      className="primary-button full-button"
                      onClick={generateComplaint}
                    >
                      <Sparkles size={17} /> Generate complaint
                    </button>

                    <label className="field-label">
                      Your support-ready complaint (editable)
                    </label>
                    <textarea
                      className="complaint-box"
                      rows={10}
                      value={complaint}
                      onChange={e => setComplaint(e.target.value)}
                      placeholder="Your generated complaint will appear here. You can edit it before copying."
                    />

                    <div className="button-row">
                      <button
                        className="secondary-button"
                        onClick={copyComplaint}
                        disabled={!complaint.trim()}
                      >
                        <Copy size={16} /> Copy complaint
                      </button>
                      <button
                        className="secondary-button"
                        onClick={downloadComplaintPDF}
                        disabled={!complaint.trim()}
                      >
                        <FileText size={16} /> Download PDF
                      </button>
                      <button
                        className="primary-button"
                        onClick={createDemoCase}
                        disabled={!complaint.trim()}
                      >
                        <Plus size={16} /> Create demo case
                      </button>
                    </div>

                    {copyMessage && (
                      <p className="inline-feedback">
                        <Info size={15} /> {copyMessage}
                      </p>
                    )}

                    <div className="demo-disclaimer">
                      Demo only: this creates a local sample case. It does not
                      submit a complaint to PayPal, a bank, or any support team.
                    </div>
                  </div>

                  <div className="panel evidence-panel">
                    <div className="feature-icon peach"><CheckCircle2 /></div>
                    <h3>Evidence checklist</h3>
                    <p>Collect useful information before contacting support.</p>

                    {[
                      ["screenshot", "Transaction screenshot"],
                      ["bank", "Bank statement or debit proof"],
                      ["merchant", "Merchant communication or refund message"],
                      ["reference", "Transaction reference number"]
                    ].map(([key, label]) => (
                      <label className="check-row" key={key}>
                        <input
                          type="checkbox"
                          checked={evidence[key as keyof typeof evidence]}
                          onChange={e => setEvidence(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                        />
                        <span>{label}</span>
                      </label>
                    ))}

                    <div className="check-progress">
                      {Object.values(evidence).filter(Boolean).length} of 4 items ready
                    </div>

                    <div className="case-tip">
                      <Info size={17} />
                      <p>
                        Never attach passwords, OTPs, PINs, or full card numbers
                        to a support complaint.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section-heading">
                  <div>
                    <h3>Your demo cases</h3>
                    <p>Cases created in this prototype.</p>
                  </div>
                  <span className="count-pill">{cases.length} cases</span>
                </div>

                <div className="case-list">
                  {cases.map(c => (
                    <div className="panel case-card" key={c.id}>
                      <div className="case-card-top">
                        <div>
                          <span className="eyebrow">{c.id}</span>
                          <h3>{c.title}</h3>
                          <p>{c.reference} · {c.date}</p>
                        </div>
                        <span className={`status ${statusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="timeline">
                        {c.timeline.map((step, i) => (
                          <div className="timeline-item" key={i}>
                            <span className="timeline-dot" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>}

              {!selected && page === "insights" && <>
                <PageIntro
                  title="ONE Insights"
                  subtitle="A simple view of the spending patterns in this sample account."
                  icon={BarChart3}
                />

                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Total sent</span>
                    <strong>{money(transactions.filter(t => t.type === "sent").reduce((a, t) => a + t.amount, 0))}</strong>
                    <small>Across sample records</small>
                  </div>
                  <div className="stat-card">
                    <span>Total received</span>
                    <strong>{money(transactions.filter(t => t.type === "received").reduce((a, t) => a + t.amount, 0))}</strong>
                    <small>Across sample records</small>
                  </div>
                  <div className="stat-card">
                    <span>Completed</span>
                    <strong>{transactions.filter(t => t.status === "Completed").length}</strong>
                    <small>Sample transactions</small>
                  </div>
                  <div className="stat-card">
                    <span>Needs attention</span>
                    <strong>{transactions.filter(t => t.status !== "Completed").length}</strong>
                    <small>Pending or failed</small>
                  </div>
                </div>

                <div className="panel insights-panel">
                  <h3>Where your sample spending goes</h3>
                  {transactions.filter(t => t.type === "sent").map(t => {
                    const total = transactions
                      .filter(x => x.type === "sent")
                      .reduce((a, x) => a + x.amount, 0);

                    return (
                      <div className="bar-row" key={t.id}>
                        <div>
                          <strong>{t.name}</strong>
                          <span>{money(t.amount)}</span>
                        </div>
                        <div className="bar-track">
                          <i style={{ width: `${(t.amount / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="demo-disclaimer">
                    Illustrative breakdown based only on the sample transactions
                    shown in this prototype.
                  </p>
                </div>
              </>}

              {!selected && page === "access" && <>
                <PageIntro
                  title="ONE Access+"
                  subtitle="A more comfortable and understandable payment experience."
                  icon={Accessibility}
                />

                <div className="access-layout">
                  <div className="panel access-settings">
                    <div className="access-heading">
                      <div className="feature-icon mint"><Accessibility /></div>
                      <div>
                        <h2>Make it work for you.</h2>
                        <p>Adjust how MyPal ONE looks and explains information.</p>
                      </div>
                    </div>

                    <Toggle
                      label="Large text"
                      description="Increase text size across the app."
                      checked={access.largeText}
                      onChange={v => setAccess(a => ({ ...a, largeText: v }))}
                    />

                    <Toggle
                      label="Simple language"
                      description="Prefer straightforward explanations."
                      checked={access.simpleLanguage}
                      onChange={v => setAccess(a => ({ ...a, simpleLanguage: v }))}
                    />

                    <Toggle
                      label="High contrast"
                      description="Make text and interface elements easier to distinguish."
                      checked={access.highContrast}
                      onChange={v => setAccess(a => ({ ...a, highContrast: v }))}
                    />

                    <Toggle
                      label="Guided explanations"
                      description="Show a step-by-step path through payment guidance."
                      checked={access.guided}
                      onChange={v => setAccess(a => ({ ...a, guided: v }))}
                    />

                    <div className="access-speech">
                      <div>
                        <Volume2 size={19} />
                        <div>
                          <strong>Read aloud</strong>
                          <p>Listen to guidance instead of reading it.</p>
                        </div>
                      </div>
                      <div className="button-row">
                        <button
                          className="secondary-button"
                          onClick={() => speak(
                            "Welcome to ONE Access Plus. You can turn on large text, simple language, high contrast, and guided explanations. Choose a transaction to understand what happened and what to do next."
                          )}
                        >
                          <Play size={15} /> Play preview
                        </button>
                        <button className="secondary-button" onClick={stopSpeaking}>
                          <StopCircle size={15} /> Stop
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="panel access-preview">
                    <span className="eyebrow">LIVE PREVIEW</span>
                    <h2>Your payments, explained simply.</h2>
                    <p>
                      {access.simpleLanguage
                        ? "Your payment is still being checked. Wait for the final update before paying again."
                        : "Your transaction is pending and awaiting final confirmation from the relevant payment provider."}
                    </p>

                    <div className="preview-status">
                      <Clock3 size={17} /> Payment pending
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => {
                        setPage("track");
                        setSelected(null);
                      }}
                    >
                      Explore guided tracking <ArrowRight size={15} />
                    </button>

                    {access.guided && (
                      <div className="guided-box">
                        <h3>Guided walkthrough</h3>
                        <p>{[
                          "Step 1: Open ONE Track and choose a transaction.",
                          "Step 2: Read what happened and why.",
                          "Step 3: Check what happens to your money.",
                          "Step 4: Follow the recommended next steps or build a support case."
                        ][guidedStep]}</p>

                        <div className="button-row">
                          <button
                            className="secondary-button"
                            disabled={guidedStep === 0}
                            onClick={() => setGuidedStep(s => s - 1)}
                          >
                            Back
                          </button>
                          <button
                            className="primary-button"
                            onClick={() => setGuidedStep(s => s === 3 ? 0 : s + 1)}
                          >
                            {guidedStep === 3 ? "Restart" : "Next"}
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>}

              {!selected && page === "settings" && <>
                <PageIntro
                  title="Settings"
                  subtitle="Manage your MyPal ONE demo preferences."
                  icon={Settings}
                />

                <div className="panel settings-panel">
                  <Toggle
                    label="Notifications"
                    description="Show sample payment alerts in the notification menu."
                    checked={settings.alerts}
                    onChange={v => setSettings(s => ({ ...s, alerts: v }))}
                  />

                  <Toggle
                    label="Simple language by default"
                    description="Use simpler wording in guidance."
                    checked={settings.simple}
                    onChange={v => {
                      setSettings(s => ({ ...s, simple: v }));
                      setAccess(a => ({ ...a, simpleLanguage: v }));
                    }}
                  />

                  <Toggle
                    label="Insights"
                    description="Enable spending insight features in this demo."
                    checked={settings.insights}
                    onChange={v => setSettings(s => ({ ...s, insights: v }))}
                  />

                  <Toggle
                    label="Dark mode"
                    description="Switch to a darker interface."
                    checked={dark}
                    onChange={setDark}
                  />

                  <div className="settings-footnote">
                    <Info size={17} />
                    This is an independent demonstration prototype using sample data.
                    It is not connected to PayPal or a bank.
                  </div>
                </div>
              </>}
            </div>

            <footer className="app-footer">
              <span>MyPal ONE · Independent prototype</span>
              <span>Built for clarity, confidence & accessibility</span>
            </footer>
          </main>

          {/* MOBILE NAVIGATION — ONE ASSIST REMOVED */}
          <nav className="mobile-nav">
            {[
              ["dashboard", Home, "Home"],
              ["transactions", CreditCard, "Activity"],
              ["cases", FileText, "Cases"],
              ["access", Accessibility, "Access"]
            ].map(([id, Icon, label]: any) => (
              <button
                key={id}
                className={page === id ? "active" : ""}
                onClick={() => {
                  setPage(id);
                  setSelected(null);
                }}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* FLOATING CHAT WIDGET — AVAILABLE ON EVERY PAGE */}
          <div className="floating-chat">
            {transferOpen && (
              <div className="modal-backdrop" onClick={() => setTransferOpen(null)}>
                <div className="transfer-modal" role="dialog" aria-modal="true" aria-labelledby="transfer-title" onClick={e => e.stopPropagation()}>
                  <div className="modal-heading">
                    <div>
                      <span className="eyebrow">ONE WALLET</span>
                      <h2 id="transfer-title">{transferOpen === "send" ? "Send money" : "Receive money"}</h2>
                      <p>{transferOpen === "send" ? "Create a simulated transfer with a live currency estimate." : "Create a demo request code or record a simulated incoming payment."}</p>
                    </div>
                    <button className="icon-button" onClick={() => setTransferOpen(null)} aria-label="Close"><X size={19} /></button>
                  </div>

                  {transferOpen === "send" && (
                    <label className="field-label">Recipient name / payment handle
                      <input value={transferRecipient} onChange={e => setTransferRecipient(e.target.value)} placeholder="e.g. Alex or alex@example" />
                    </label>
                  )}
                  <label className="field-label">Amount
                    <input type="number" min="0" step="0.01" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="Enter amount" />
                  </label>
                  <label className="field-label">Currency
                    <select value={transferCurrency} onChange={e => setTransferCurrency(e.target.value as CurrencyCode)}>
                      {(Object.keys(currencyNames) as CurrencyCode[]).map(code => <option key={code} value={code}>{code} — {currencyNames[code]}</option>)}
                    </select>
                  </label>

                  <div className="conversion-preview">
                    {transferCurrency === "INR" ? (
                      <><span>Wallet amount</span><strong>{Number.isFinite(parsedTransferAmount) && parsedTransferAmount > 0 ? money(parsedTransferAmount) : "₹0"}</strong></>
                    ) : (
                      <>
                        <span>Estimated INR equivalent</span>
                        <strong>{convertedTransferAmount > 0 ? money(convertedTransferAmount) : "—"}</strong>
                        <small>{ratesLoading ? "Loading exchange rate…" : selectedRate ? `1 INR = ${selectedRate.toFixed(6)} ${transferCurrency} · 1 ${transferCurrency} = ${(1 / selectedRate).toFixed(6)} INR` : "Exchange rate unavailable"}</small>
                      </>
                    )}
                    {ratesUpdatedAt && <small>Rates last updated: {ratesUpdatedAt}</small>}
                    {ratesError && <small className="rate-warning">{ratesError}</small>}
                  </div>

                  <label className="field-label">Note (optional)
                    <input value={transferNote} onChange={e => setTransferNote(e.target.value)} placeholder="What's this payment for?" />
                  </label>
                  {transferOpen === "send" && <p className="wallet-available">Available demo balance: <strong>{money(walletBalance)}</strong></p>}
                  {transferError && <p className="form-error" role="alert">{transferError}</p>}

                  {transferOpen === "receive" && (
                    <div className="receive-request-area">
                      <button className="secondary-button" onClick={createReceiveRequest}>Generate receive request code</button>
                      {receiveCode && <div className="request-code"><span>Share this demo request code</span><strong>{receiveCode}</strong><button className="text-button" onClick={() => navigator.clipboard?.writeText(receiveCode)}>Copy code</button></div>}
                      <p className="demo-disclaimer">A request code is a demo reference only. It does not create a real payment link.</p>
                    </div>
                  )}

                  <div className="button-row modal-actions">
                    <button className="secondary-button" onClick={() => setTransferOpen(null)}>Cancel</button>
                    <button className="primary-button" onClick={completeDemoTransfer}>{transferOpen === "send" ? "Confirm demo transfer" : "Record demo receipt"} <ArrowRight size={16} /></button>
                  </div>
                  <p className="demo-disclaimer">Demo mode: this prototype does not connect to a bank, payment network, or real recipient. No real money is transferred.</p>
                </div>
              </div>
            )}

            {transferReceipt && (
              <div className="modal-backdrop" onClick={() => setTransferReceipt(null)}>
                <div className="transfer-modal receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title" onClick={e => e.stopPropagation()}>
                  <div className="receipt-success"><CheckCircle2 size={34} /><span>DEMO TRANSACTION RECORDED</span></div>
                  <h2 id="receipt-title">{transferReceipt.type === "sent" ? "Transfer summary" : "Receive summary"}</h2>
                  <div className="receipt-amount">{formatCurrency(transferReceipt.convertedAmount, transferReceipt.currency)}</div>
                  <p>{transferReceipt.type === "sent" ? "To" : "Received from"}: <strong>{transferReceipt.recipient}</strong></p>
                  <div className="receipt-details">
                    <div><span>Wallet impact (INR)</span><strong>{transferReceipt.type === "sent" ? "−" : "+"}{money(transferReceipt.amountInr)}</strong></div>
                    {transferReceipt.currency !== "INR" && <div><span>Exchange rate</span><strong>1 INR = {transferReceipt.exchangeRate.toFixed(6)} {transferReceipt.currency}</strong></div>}
                    <div><span>Reference</span><strong>{transferReceipt.reference}</strong></div>
                    <div><span>Date</span><strong>{transferReceipt.date}</strong></div>
                    <div><span>Note</span><strong>{transferReceipt.note}</strong></div>
                    <div><span>Updated demo balance</span><strong>{money(walletBalance)}</strong></div>
                  </div>
                  <div className="button-row">
                    <button className="secondary-button" onClick={() => navigator.clipboard?.writeText(`MyPal ONE demo receipt\nReference: ${transferReceipt.reference}\n${transferReceipt.type === "sent" ? "To" : "From"}: ${transferReceipt.recipient}\nAmount: ${formatCurrency(transferReceipt.convertedAmount, transferReceipt.currency)}\nWallet INR: ${money(transferReceipt.amountInr)}\nDemo only — no real payment.`)}><Copy size={16} /> Copy receipt</button>
                    <button className="primary-button" onClick={() => setTransferReceipt(null)}>Done</button>
                  </div>
                  <p className="demo-disclaimer">This is a locally recorded demo receipt, not proof of a real-world payment.</p>
                </div>
              </div>
            )}

            {chatWidgetOpen && (
              <div className="floating-chat-window">
                <div className="floating-chat-header">
                  <div className="assist-avatar">
                    <Sparkles size={20} />
                  </div>

                  <div className="floating-chat-title">
                    <strong>MyPal ONE Assist</strong>
                    <span><i className="online-dot" /> Your payment companion</span>
                  </div>

                  <button
                    className="icon-button"
                    onClick={() => setChatWidgetOpen(false)}
                    aria-label="Close chat"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="floating-chat-intro">
                  <span className="eyebrow">HERE TO HELP</span>
                  <p>Ask me about a payment, refund or transaction.</p>
                </div>

                <div className="floating-chat-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-message ${m.from}`}>
                      {m.from === "ai" && (
                        <div className="chat-mini-avatar">
                          <Sparkles size={13} />
                        </div>
                      )}
                      <div className="chat-bubble">{m.text}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message ai">
                      <div className="chat-bubble">
                        ONE Assist is typing...
                      </div>
                    </div>
                  )}
                </div>

                <div className="floating-chat-suggestions">
                  <button onClick={() => setChatInput("Why is my Amazon payment pending?")}>
                    Amazon payment?
                  </button>
                  <button onClick={() => setChatInput("How do refunds work?")}>
                    Refund help
                  </button>
                  <button onClick={() => setChatInput("Show my failed payments")}>
                    Failed payments
                  </button>
                </div>

                <div className="chat-input floating-chat-input">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Ask MyPal anything..."
                  />
                  <button onClick={sendMessage} aria-label="Send message">
                    <Send size={17} />
                  </button>
                </div>

                <p className="demo-disclaimer">
                  Demo assistant · Uses sample transaction data, not live account information.
                </p>
              </div>
            )}

            <button
              className="floating-chat-button"
              onClick={() => setChatWidgetOpen(!chatWidgetOpen)}
              aria-label="Open MyPal chat"
              title="Chat with ONE Assist"
            >
              {chatWidgetOpen ? <X size={24} /> : <MessageCircle size={24} />}
              {!chatWidgetOpen && <span className="chat-button-pulse" />}
            </button>
          </div>

          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        *{box-sizing:border-box}
        body{margin:0}
        .app{--bg:#f5f6fb;--surface:#fff;--soft:#f8f9fd;--border:#e9eaf1;--text:#20243a;--muted:#85899c;--primary:#6257e8;--primary-soft:#efedff;--green:#159b72;--red:#d65360;--orange:#d48a32;background:var(--bg);color:var(--text);min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;font-size:14px}
        .app.dark-mode{--bg:#151725;--surface:#202337;--soft:#292d42;--border:#373b50;--text:#f2f3fb;--muted:#a2a6bb;--primary:#938bff;--primary-soft:#353152}
        .app.high-contrast{--border:#8d91a4;--muted:#555b70}
        .dark-mode.high-contrast{--border:#a7aac0;--muted:#d0d2df}
        button,input,select,textarea{font:inherit}
        button{cursor:pointer}

        .sidebar{width:248px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);padding:25px 16px 18px;display:flex;flex-direction:column;min-height:100vh;position:sticky;top:0;height:100vh;overflow-y:auto;z-index:20}
        .brand{display:flex;align-items:center;gap:11px;padding:0 9px 25px}
        .brand-mark{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#7769f4,#5546d5);display:grid;place-items:center;color:white}
        .brand strong{font:800 19px Manrope}
        .brand strong span{color:var(--primary)}
        .brand small{display:block;color:var(--muted);font-size:9px;letter-spacing:1.3px;margin-top:2px;font-weight:700}
        .profile-mini{display:flex;align-items:center;gap:10px;background:var(--soft);border:1px solid var(--border);padding:11px;border-radius:12px;margin-bottom:25px}
        .avatar{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e6e1ff;color:#5b4bd5;font-weight:800}
        .profile-mini strong,.profile-mini span{display:block}
        .profile-mini strong{font-size:12px}
        .profile-mini div:nth-child(2) span{font-size:10px;color:var(--muted);margin-top:3px}
        .online-dot{width:8px;height:8px;border-radius:50%;background:#26b887;display:inline-block;margin-left:auto}
        .nav-group{margin-bottom:20px}
        .nav-label{display:block;font-size:9px;letter-spacing:1.5px;color:var(--muted);font-weight:800;padding:0 11px;margin-bottom:8px}
        .nav-item{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:var(--muted);padding:11px 12px;border-radius:9px;text-align:left;margin:2px 0;font-size:12px;font-weight:600}
        .nav-item:hover,.nav-item.active{background:var(--primary-soft);color:var(--primary)}
        .nav-count{margin-left:auto;background:var(--primary);color:white;border-radius:20px;padding:2px 7px;font-size:10px}
        .sidebar-bottom{margin-top:auto}
        .help-card{background:var(--soft);border:1px solid var(--border);padding:15px;border-radius:13px}
        .help-icon{width:31px;height:31px;border-radius:9px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;margin-bottom:10px}
        .help-card strong{font-size:12px}
        .help-card p{font-size:11px;color:var(--muted);line-height:1.6}
        .help-card button{border:0;background:none;color:var(--primary);font-size:11px;font-weight:700;padding:0;display:flex;align-items:center;gap:5px}
        .sidebar-footer{font-size:10px;color:var(--muted);display:flex;gap:7px;align-items:center;padding:17px 4px 0}

        .main{flex:1;min-width:0}
        .topbar{height:78px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 35px;position:sticky;top:0;z-index:10}
        .topbar-left,.topbar-actions{display:flex;align-items:center;gap:14px}
        .breadcrumb{font-size:10px;color:var(--muted);margin-bottom:4px}
        .topbar h1{font:800 19px Manrope;margin:0}
        .topbar-actions{gap:12px}
        .search-box{width:220px;height:37px;border:1px solid var(--border);border-radius:9px;display:flex;align-items:center;gap:8px;padding:0 11px;color:var(--muted)}
        .search-box input{border:0;outline:0;background:transparent;color:var(--text);width:100%;font-size:11px}
        .icon-button{width:36px;height:36px;border:1px solid var(--border);border-radius:9px;background:var(--surface);color:var(--muted);display:grid;place-items:center}
        .notification-wrap{position:relative}
        .notification-button{position:relative}
        .notification-button i{position:absolute;width:7px;height:7px;border-radius:50%;background:#ed6a75;right:8px;top:7px}
        .notification-pop{position:absolute;right:0;top:45px;width:250px;padding:15px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 35px #20243a20;z-index:30}
        .notification-pop strong{font-size:13px}
        .notification-pop p{display:flex;gap:8px;align-items:center;font-size:11px;color:var(--muted)}

        .content{
  width:100%;
  max-width:none;
  margin:0;
  padding:30px 35px 55px;
  min-width:0;
  overflow-x:clip;
}
        .welcome-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
        .eyebrow{font-size:9px;font-weight:800;letter-spacing:1.5px;color:var(--primary)}
        .welcome-row h2{font:800 25px Manrope;margin:7px 0 4px}
        .welcome-row p,.page-intro p{color:var(--muted);font-size:12px;margin:0}
        .date-chip{border:1px solid var(--border);border-radius:20px;padding:8px 12px;color:var(--muted);font-size:10px;display:flex;align-items:center;gap:7px}
        .hero-banner{background:linear-gradient(115deg,#302d69,#5148aa 60%,#7767e6);border-radius:17px;color:white;padding:29px 33px;display:flex;justify-content:space-between;min-height:220px;overflow:hidden;position:relative}
        .hero-copy{position:relative;z-index:2;max-width:540px}
        .hero-tag{display:inline-flex;align-items:center;gap:6px;background:#ffffff20;border:1px solid #ffffff35;border-radius:20px;padding:6px 10px;font-size:9px;letter-spacing:1px;font-weight:700}
        .hero-copy h2{font:800 25px/1.35 Manrope;margin:14px 0 8px}
        .hero-copy h2 em{font-style:normal;color:#c9c2ff}
        .hero-copy p{font-size:11px;color:#e1defd;line-height:1.7;max-width:440px}
        .hero-copy button{background:white;color:#5148aa;border:0;border-radius:8px;padding:10px 13px;font-size:11px;font-weight:800;display:flex;align-items:center;gap:8px;margin-top:17px}
        .hero-art{width:240px;position:relative;display:grid;place-items:center}
        .orbit{position:absolute;border:1px solid #ffffff30;border-radius:50%;width:190px;height:190px}
        .orbit-two{width:140px;height:140px}
        .hero-symbol{width:90px;height:90px;background:linear-gradient(145deg,#a49bff,#6658dc);border:1px solid #ffffff80;border-radius:26px;display:grid;place-items:center;box-shadow:0 15px 40px #211b6a80;transform:rotate(-9deg)}
        .floating-chip{position:absolute;background:white;color:#5148aa;padding:9px 11px;border-radius:9px;box-shadow:0 8px 20px #211b6a50;font-size:10px;font-weight:700;display:flex;align-items:center;gap:6px}
        .chip-a{top:25px;right:0}
        .chip-b{bottom:22px;left:0}

        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin:18px 0 27px}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:16px}
        .stat-top{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:10px}
        .stat-card>strong{display:block;font:800 22px Manrope;margin:12px 0 5px}
        .stat-card small{color:var(--muted);font-size:10px}
        .stat-icon{width:31px;height:31px;border-radius:9px;display:grid;place-items:center}
        .blue{background:#e9efff;color:#5875dc}
        .purple{background:#f0eaff;color:#8a5cd6}
        .green{background:#e3f8ef;color:#199d72}
        .orange{background:#fff1e2;color:#d48a32}
        .section-heading{display:flex;align-items:center;justify-content:space-between;margin:25px 0 12px}
        .section-heading h3{font:800 15px Manrope;margin:0 0 4px}
        .section-heading p{font-size:10px;color:var(--muted);margin:0}
        .text-button{display:flex;align-items:center;gap:6px;border:0;background:none;color:var(--primary);font-size:11px;font-weight:700}
        .panel{background:var(--surface);border:1px solid var(--border);border-radius:13px}
        .transaction-list{padding:0 15px}
        .transaction-row{display:flex;align-items:center;gap:12px;width:100%;padding:14px 3px;border:0;border-bottom:1px solid var(--border);background:transparent;color:var(--text);text-align:left}
        .transaction-row:last-child{border-bottom:0}
        .transaction-row:hover{background:var(--soft)}
        .transaction-icon{width:37px;height:37px;border-radius:11px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;flex-shrink:0}
        .transaction-icon.received{background:#e4f7ef;color:#159b72}
        .transaction-info{flex:1;min-width:0}
        .transaction-info strong,.transaction-info span{display:block}
        .transaction-info strong{font-size:12px}
        .transaction-info span{font-size:10px;color:var(--muted);margin-top:4px}
        .transaction-amount{text-align:right}
        .transaction-amount strong,.transaction-amount span{display:block}
        .transaction-amount strong{font-size:12px}
        .transaction-amount span{margin-top:4px}
        .green-text{color:var(--green)}
        .status{display:inline-flex;align-items:center;padding:4px 8px;border-radius:20px;font-size:9px;font-weight:700;white-space:nowrap}
        .status.success{background:#e4f7ef;color:#159b72}
        .status.pending{background:#fff3df;color:#c28627}
        .status.danger{background:#ffeaed;color:#cf5360}
        .status.neutral{background:var(--soft);color:var(--muted)}
        .muted{color:var(--muted)}
        .feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:18px}
        .feature-card{position:relative;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:17px;color:var(--text)}
        .feature-card>svg{position:absolute;right:15px;bottom:18px;color:var(--muted)}
        .feature-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;margin-bottom:12px}
        .lavender{background:#efebff;color:#725ce0}
        .peach{background:#fff0e6;color:#d17d43}
        .mint{background:#e3f7ef;color:#159b72}
        .feature-card strong{font-size:12px}
        .feature-card p{font-size:10px;color:var(--muted);margin-bottom:0;max-width:200px;line-height:1.5}
        .page-intro{display:flex;align-items:center;gap:13px;margin:2px 0 22px}
        .intro-icon{width:43px;height:43px;border-radius:12px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center}
        .page-intro h2{font:800 20px Manrope;margin:0 0 5px}
        .empty-state{padding:30px;text-align:center;color:var(--muted)}
        .track-banner{padding:24px 27px;background:var(--primary-soft);border-radius:14px;display:flex;justify-content:space-between;align-items:center;color:var(--text)}
        .track-banner h2{font:800 22px Manrope;margin:8px 0}
        .track-banner p{font-size:11px;color:var(--muted);max-width:520px;line-height:1.7}
        .track-graphic{width:85px;height:85px;border-radius:25px;background:var(--surface);display:grid;place-items:center;color:var(--primary)}

        .shield-layout,.resolve-layout,.access-layout,.case-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(230px,1fr);gap:17px;align-items:start}
        .resolve-panel,.shield-panel,.case-builder,.access-settings,.access-preview,.evidence-panel{padding:21px}
        .resolve-panel h2,.shield-panel h2,.case-builder h2,.access-settings h2,.access-preview h2{font:800 17px Manrope;margin:8px 0}
        .field-label{display:block;font-size:10px;font-weight:700;margin:17px 0 7px}
        .resolve-panel input,.resolve-panel select,.case-builder select,.case-builder textarea,.shield-panel textarea{width:100%;padding:11px;border:1px solid var(--border);background:var(--soft);border-radius:8px;color:var(--text);outline:0;font-size:11px}
        .resolve-progress{margin:20px 0}
        .resolve-progress span{font-size:10px;color:var(--muted)}
        .resolve-progress>div{height:5px;background:var(--soft);border-radius:10px;margin-top:8px;overflow:hidden}
        .resolve-progress i{display:block;height:100%;background:var(--primary);border-radius:10px}
        .resolve-step{display:flex;gap:13px;background:var(--soft);border-radius:11px;padding:15px;margin:15px 0}
        .step-number{font:800 22px Manrope;color:var(--primary)}
        .resolve-step h3{font-size:12px;margin:2px 0 6px}
        .resolve-step p{font-size:11px;color:var(--muted);line-height:1.6;margin:0}
        .primary-button,.secondary-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:8px;padding:10px 13px;font-size:10px;font-weight:700}
        .primary-button{border:1px solid var(--primary);background:var(--primary);color:white}
        .secondary-button{border:1px solid var(--border);background:var(--surface);color:var(--text)}
        .primary-button:disabled,.secondary-button:disabled{opacity:.45;cursor:not-allowed}
        .button-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:14px}
        .full-button{width:100%;margin-top:13px}
        .shield-top,.builder-heading,.access-heading{display:flex;align-items:center;gap:12px}
        .shield-top .feature-icon,.builder-heading .feature-icon,.access-heading .feature-icon{flex-shrink:0}
        .shield-top h2,.builder-heading h2,.access-heading h2{margin:0 0 4px}
        .shield-top p,.builder-heading p,.access-heading p{font-size:10px;color:var(--muted);margin:0}
        .shield-panel textarea{margin-top:20px;resize:vertical;line-height:1.6}
        .shield-result{margin-top:18px;padding:15px;background:var(--soft);border-radius:10px}
        .shield-result h3{font-size:13px}
        .shield-result>p{display:flex;gap:8px;font-size:10px;color:var(--muted)}
        .warning-note{display:flex;gap:10px;align-items:flex-start;background:#fff5e6;color:#a56d20;padding:13px;border-radius:10px;margin-top:14px}
        .warning-note p{font-size:10px;line-height:1.6;margin:4px 0}
        .warning-note strong{font-size:11px}
        .case-layout{grid-template-columns:minmax(0,1.7fr) minmax(230px,.85fr)}
        .builder-heading{margin-bottom:17px}
        .selected-case-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;background:var(--soft);padding:11px;border-radius:9px;margin-top:12px}
        .selected-case-summary span,.selected-case-summary strong{display:block}
        .selected-case-summary span{font-size:9px;color:var(--muted);margin-bottom:6px}
        .selected-case-summary strong{font-size:10px}
        .complaint-box{resize:vertical;line-height:1.7;min-height:170px}
        .inline-feedback{font-size:10px;color:var(--primary);display:flex;gap:6px;align-items:center;line-height:1.5}
        .evidence-panel h3{font:800 14px Manrope;margin:0 0 6px}
        .evidence-panel>p{font-size:10px;color:var(--muted);line-height:1.6}
        .check-row{display:flex;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid var(--border);font-size:10px}
        .check-row input{accent-color:var(--primary)}
        .check-progress{font-size:10px;font-weight:700;color:var(--green);margin-top:14px}
        .case-tip{display:flex;gap:8px;background:var(--primary-soft);color:var(--primary);padding:11px;border-radius:9px;margin-top:17px}
        .case-tip p{font-size:10px;line-height:1.6;margin:0}
        .count-pill{background:var(--primary-soft);color:var(--primary);padding:6px 10px;border-radius:20px;font-size:10px;font-weight:700}
        .case-list{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .case-card{padding:16px}
        .case-card-top{display:flex;justify-content:space-between;gap:8px}
        .case-card h3{font-size:12px;margin:6px 0}
        .case-card p{font-size:9px;color:var(--muted)}
        .timeline{border-left:1px solid var(--border);margin:15px 0 0 4px;padding-left:15px}
        .timeline-item{position:relative;font-size:10px;color:var(--muted);padding:0 0 12px}
        .timeline-dot{position:absolute;left:-19px;top:2px;width:8px;height:8px;border-radius:50%;background:var(--primary);border:2px solid var(--surface);outline:1px solid var(--primary)}

        .insights-panel{padding:20px}
        .insights-panel h3{font:800 14px Manrope}
        .bar-row{margin:18px 0}
        .bar-row>div:first-child{display:flex;justify-content:space-between;font-size:10px;margin-bottom:7px}
        .bar-row>div:first-child span{color:var(--muted)}
        .bar-track{height:8px;background:var(--soft);border-radius:10px;overflow:hidden}
        .bar-track i{height:100%;display:block;background:linear-gradient(90deg,#6257e8,#a69bff);border-radius:10px}

        .setting-row{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 0;border-bottom:1px solid var(--border)}
        .setting-row strong{font-size:11px}
        .setting-row p{font-size:10px;color:var(--muted);margin:5px 0 0}
        .switch{width:39px;height:22px;border:0;border-radius:20px;background:#c9cbd5;padding:3px;flex-shrink:0}
        .switch span{display:block;width:16px;height:16px;background:white;border-radius:50%;transition:.2s}
        .switch.on{background:var(--primary)}
        .switch.on span{transform:translateX(17px)}
        .settings-panel{padding:5px 20px}
        .settings-footnote{display:flex;gap:9px;align-items:center;color:var(--muted);font-size:10px;padding:17px 0;line-height:1.5}

        .access-layout{grid-template-columns:1.2fr 1fr}
        .access-heading{margin-bottom:12px}
        .access-preview{background:var(--primary-soft)}
        .access-preview h2{margin-top:17px}
        .access-preview>p{font-size:11px;line-height:1.7;color:var(--muted)}
        .preview-status{display:flex;align-items:center;gap:8px;color:#b17a23;background:#fff1d9;padding:10px;border-radius:8px;font-size:10px;margin:14px 0}
        .access-speech{border-top:1px solid var(--border);margin-top:15px;padding-top:15px}
        .access-speech>div:first-child{display:flex;gap:10px;align-items:center}
        .access-speech strong{font-size:11px}
        .access-speech p{font-size:10px;color:var(--muted);margin:4px 0}
        .guided-box{border-top:1px solid var(--border);margin-top:17px;padding-top:12px}
        .guided-box h3{font-size:12px}
        .guided-box p{font-size:10px;line-height:1.7;color:var(--muted)}

        .side-info-card{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:20px;color:var(--muted)}
        .side-info-card h3{color:var(--text);font:800 14px Manrope;margin:13px 0 8px}
        .side-info-card p,.side-info-card li{font-size:11px;line-height:1.7}
        .side-info-card ul{padding-left:17px}

        .explain-panel{background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:22px;margin-bottom:22px}
        .explain-heading{display:flex;justify-content:space-between;align-items:flex-start}
        .explain-heading h2{font:800 21px Manrope;margin:6px 0}
        .explain-heading p{font-size:11px;color:var(--muted);margin:0}
        .explain-transaction{display:flex;align-items:center;gap:11px;background:var(--soft);padding:13px;border-radius:10px;margin:18px 0}
        .explain-transaction>div:nth-child(2){flex:1}
        .explain-transaction strong,.explain-transaction span{display:block}
        .explain-transaction strong{font-size:12px}
        .explain-transaction span{font-size:10px;color:var(--muted);margin-top:4px}
        .explain-amount{text-align:right}
        .explain-amount strong{font-size:13px}
        .explain-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}
        .explain-card{background:var(--soft);border:1px solid var(--border);padding:15px;border-radius:11px}
        .explain-number{font-size:9px;color:var(--primary);font-weight:800;letter-spacing:1px}
        .explain-card h3{font:800 12px Manrope;margin:7px 0}
        .explain-card p,.explain-card li{font-size:10px;color:var(--muted);line-height:1.7}
        .explain-card ul{padding-left:15px;margin:5px 0}
        .explain-card li{margin-bottom:4px}

        .app-footer{border-top:1px solid var(--border);padding:16px 35px;display:flex;justify-content:space-between;color:var(--muted);font-size:9px}
        .large-text{font-size:16px}
        .large-text .transaction-info strong,.large-text .nav-item,.large-text .feature-card strong,.large-text .setting-row strong{font-size:14px}
        .large-text p,.large-text li{font-size:13px}
        .high-contrast .panel,.high-contrast .stat-card,.high-contrast .feature-card{border-width:2px}
        .mobile-menu,.mobile-close,.mobile-nav{display:none}

        /* FLOATING CHATBOT DESIGN */
        .floating-chat{
          position:fixed;
          right:25px;
          bottom:85px;
          z-index:60;
        }

        .floating-chat-button{
          position:relative;
          width:59px;
          height:59px;
          border:0;
          border-radius:50%;
          background:linear-gradient(135deg,#8175ff,#5546d5);
          color:white;
          display:grid;
          place-items:center;
          box-shadow:0 8px 28px #5148aa55;
          transition:transform .2s ease,box-shadow .2s ease;
          z-index:2;
        }

        .floating-chat-button:hover{
          transform:translateY(-3px) scale(1.04);
          box-shadow:0 12px 32px #5148aa70;
        }

        .chat-button-pulse{
          position:absolute;
          inset:-5px;
          border:1px solid #8175ff80;
          border-radius:50%;
          animation:chatPulse 2.2s infinite;
          pointer-events:none;
        }

        @keyframes chatPulse{
          0%{transform:scale(.92);opacity:.8}
          100%{transform:scale(1.35);opacity:0}
        }

        .floating-chat-window{
          position:absolute;
          bottom:75px;
          right:0;
          width:370px;
          height:540px;
          max-height:calc(100vh - 125px);
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:20px;
          box-shadow:0 22px 65px #17172e35;
          display:flex;
          flex-direction:column;
          overflow:hidden;
          animation:chatAppear .2s ease-out;
        }

        @keyframes chatAppear{
          from{opacity:0;transform:translateY(12px) scale(.98)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        .floating-chat-header{
          display:flex;
          align-items:center;
          gap:11px;
          padding:16px;
          background:var(--surface);
          border-bottom:1px solid var(--border);
        }

        .floating-chat-header .assist-avatar{
          width:40px;
          height:40px;
          flex-shrink:0;
        }

        .floating-chat-title{flex:1;min-width:0}
        .floating-chat-title strong,.floating-chat-title span{display:block}
        .floating-chat-title strong{font-size:13px;color:var(--text)}
        .floating-chat-title span{
          font-size:10px;
          color:var(--muted);
          margin-top:5px;
          display:flex;
          align-items:center;
          gap:6px;
        }

        .floating-chat-title .online-dot{
          width:7px;
          height:7px;
          margin:0;
        }

        .floating-chat-intro{
          padding:12px 16px 10px;
          background:var(--surface);
        }

        .floating-chat-intro p{
          font-size:11px;
          color:var(--muted);
          margin:5px 0 0;
        }

        .floating-chat-messages{
          flex:1;
          min-height:0;
          padding:12px 13px;
          overflow-y:auto;
          background:var(--bg);
          scroll-behavior:smooth;
        }

        .floating-chat-messages .chat-message{
          display:flex;
          align-items:flex-end;
          gap:7px;
          margin:12px 0;
        }

        .floating-chat-messages .chat-message.user{
          justify-content:flex-end;
        }

        .chat-mini-avatar{
          width:24px;
          height:24px;
          border-radius:8px;
          background:var(--primary-soft);
          color:var(--primary);
          display:grid;
          place-items:center;
          flex-shrink:0;
          margin-bottom:2px;
        }

        .floating-chat-messages .chat-bubble{
          max-width:85%;
          padding:11px 13px;
          border-radius:14px;
          font-size:11px;
          line-height:1.65;
          overflow-wrap:anywhere;
        }

        .floating-chat-messages .chat-message.ai .chat-bubble{
          background:var(--surface);
          color:var(--text);
          border:1px solid var(--border);
          border-bottom-left-radius:5px;
        }

        .floating-chat-messages .chat-message.user .chat-bubble{
          background:var(--primary);
          color:white;
          border-bottom-right-radius:5px;
        }

        .floating-chat-suggestions{
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          padding:10px 12px;
          background:var(--surface);
          border-top:1px solid var(--border);
        }

        .floating-chat-suggestions button{
          border:1px solid var(--border);
          background:var(--soft);
          color:var(--primary);
          border-radius:20px;
          padding:7px 10px;
          font-size:9px;
          font-weight:600;
          transition:background .2s ease;
        }

        .floating-chat-suggestions button:hover{
          background:var(--primary-soft);
        }

        .floating-chat-input{
          padding:10px 12px;
          background:var(--surface);
          border-top:0;
        }

        .floating-chat-input input{
          border-radius:22px;
          padding:11px 14px;
          font-size:11px;
        }

        .floating-chat-input button{
          width:39px;
          height:39px;
          border-radius:50%;
          display:grid;
          place-items:center;
          flex-shrink:0;
        }

        .floating-chat-window .demo-disclaimer{
          margin:0;
          padding:3px 14px 10px;
          background:var(--surface);
          text-align:center;
          font-size:8px;
        }

        .dark-mode .floating-chat-messages .chat-message.ai .chat-bubble{
          background:#292d42;
        }

        .dark-mode .floating-chat-suggestions button{
          background:#292d42;
        }

        @media(max-width:1000px){
          .sidebar{width:220px}
          .content{padding:25px 22px}
          .topbar{padding:0 22px}
          .hero-art{width:180px}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
        }

        @media(max-width:720px){
          .sidebar{
            position:fixed;
            left:-260px;
            top:0;
            transition:left .2s;
            width:250px;
            box-shadow:10px 0 30px #0002;
          }

          .sidebar.mobile-open{left:0}
          .mobile-menu,.mobile-close{display:grid}
          .topbar{height:68px;padding:0 14px}
          .topbar h1{font-size:16px}
          .topbar-actions{gap:6px}
          .search-box{width:35px;padding:0 9px;border:0}
          .search-box input{width:0;display:none}
          .content{padding:20px 14px 90px}
          .welcome-row h2{font-size:20px}
          .hero-banner{padding:22px;min-height:0}
          .hero-copy h2{font-size:19px}
          .hero-art{width:95px;opacity:.8}
          .orbit{width:105px;height:105px}
          .orbit-two{width:75px;height:75px}
          .hero-symbol{width:55px;height:55px;border-radius:17px}
          .hero-symbol svg{width:30px}
          .floating-chip{font-size:8px;padding:6px}
          .chip-a{right:-12px}
          .chip-b{left:-15px}
          .stats-grid{gap:9px}
          .stat-card{padding:12px}
          .stat-card>strong{font-size:17px}
          .feature-grid{grid-template-columns:1fr}
          .shield-layout,.resolve-layout,.access-layout,.case-layout{grid-template-columns:1fr}
          .case-list{grid-template-columns:1fr}
          .explain-grid{grid-template-columns:1fr}
          .explain-panel{padding:15px}
          .selected-case-summary{grid-template-columns:1fr 1fr}
          .app-footer{padding:13px 15px 75px;gap:10px;flex-wrap:wrap}
          .mobile-nav{
            display:flex;
            position:fixed;
            bottom:0;
            left:0;
            right:0;
            height:62px;
            background:var(--surface);
            border-top:1px solid var(--border);
            z-index:40;
            justify-content:space-around;
            padding:5px 3px env(safe-area-inset-bottom);
          }
          .mobile-nav button{
            border:0;
            background:transparent;
            color:var(--muted);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:3px;
            font-size:9px;
            flex:1;
          }
          .mobile-nav button.active{color:var(--primary)}
          .date-chip{display:none}
          .track-banner{padding:18px}
          .track-graphic{width:55px;height:55px}
          .section-heading{margin-top:20px}
          .transaction-row{gap:8px}
          .transaction-amount strong{font-size:10px}

          .floating-chat{
            right:15px;
            bottom:76px;
          }

          .floating-chat-button{
            width:55px;
            height:55px;
          }

          .floating-chat-window{
            position:fixed;
            left:10px;
            right:10px;
            bottom:145px;
            width:auto;
            height:min(540px,calc(100vh - 175px));
            max-height:calc(100vh - 175px);
            border-radius:18px;
          }
        }

        @media(max-width:380px){
          .floating-chat-window{
            left:7px;
            right:7px;
            bottom:137px;
            height:calc(100vh - 165px);
          }

          .floating-chat-suggestions button{
            font-size:8px;
            padding:6px 8px;
          }
        }
        .dashboard-actions{display:flex;flex-direction:column;align-items:flex-end;gap:12px}
        .wallet-balance-card{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 28px;margin:18px 0 22px;border-radius:18px;background:linear-gradient(120deg,#172b55,#3158a5);color:#fff;box-shadow:0 12px 30px rgba(35,65,130,.16)}
        .wallet-balance-card h2{font-size:32px;margin:8px 0 4px}
        .wallet-balance-card p{margin:0;color:rgba(255,255,255,.76);font-size:13px}
        .wallet-balance-card .eyebrow{color:#c9d8ff}
        .wallet-balance-icon{width:58px;height:58px;border-radius:17px;background:rgba(255,255,255,.14);display:grid;place-items:center}
        .smart-guidance-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
        .smart-guidance-card{padding:20px}
        .smart-guidance-card h3{margin:10px 0 8px}
        .smart-guidance-card p,.smart-guidance-card li{font-size:13px;line-height:1.6;color:var(--muted)}
        .smart-guidance-card ol{padding-left:20px;margin-bottom:0}
        .smart-guidance-card .eyebrow{display:flex;align-items:center;gap:6px}
        .smart-alert-row{width:100%;display:flex;align-items:center;gap:10px;padding:10px 0;border:0;border-top:1px solid var(--border);background:transparent;color:var(--text);text-align:left;cursor:pointer}
        .smart-alert-row span{display:flex;flex:1;flex-direction:column;gap:3px}
        .smart-alert-row small{color:var(--muted)}
        .modal-backdrop{position:fixed;inset:0;background:rgba(10,18,35,.62);z-index:100;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}
        .transfer-modal{width:min(100%,540px);max-height:min(92vh,900px);overflow:auto;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 25px 80px rgba(0,0,0,.25)}
        .modal-heading{display:flex;justify-content:space-between;gap:15px;margin-bottom:20px}
        .modal-heading h2{margin:6px 0}
        .modal-heading p{margin:0;color:var(--muted);font-size:13px;line-height:1.5}
        .transfer-modal .field-label{display:flex;flex-direction:column;gap:8px;margin:14px 0;font-weight:600;font-size:13px}
        .transfer-modal .field-label input,.transfer-modal .field-label select{width:100%;padding:12px 13px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font:inherit}
        .transfer-modal .field-label select{color-scheme:light;appearance:auto}
        .app.dark-mode .transfer-modal .field-label select{background-color:#292d42;color:#f2f3fb;color-scheme:dark;border-color:#4a4f68}
        .app.dark-mode .transfer-modal .field-label select option{background-color:#202337;color:#f2f3fb}
        .app:not(.dark-mode) .transfer-modal .field-label select option{background-color:#fff;color:#20243a}
        .conversion-preview{display:flex;flex-direction:column;gap:5px;padding:15px;border:1px solid var(--border);border-radius:12px;background:var(--background);margin:14px 0}
        .conversion-preview span,.conversion-preview small{font-size:12px;color:var(--muted)}
        .conversion-preview strong{font-size:23px}
        .rate-warning,.form-error{color:#d94b4b!important}
        .wallet-available{font-size:13px;color:var(--muted)}
        .form-error{font-size:13px;margin:8px 0}
        .receive-request-area{padding:12px 0}
        .request-code{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:13px;margin-top:10px;border:1px dashed var(--primary);border-radius:12px}
        .request-code span{font-size:12px;color:var(--muted)}
        .request-code strong{font-size:18px;letter-spacing:1px}
        .request-code .text-button{margin-left:auto}
        .modal-actions{justify-content:flex-end;margin-top:14px}
        .receipt-modal h2{text-align:center;margin:12px 0}
        .receipt-success{display:flex;flex-direction:column;align-items:center;gap:7px;color:#15966a;font-size:11px;font-weight:800;letter-spacing:1px}
        .receipt-amount{text-align:center;font-size:30px;font-weight:800;margin:12px 0}
        .receipt-modal>p{text-align:center;font-size:13px}
        .receipt-details{display:flex;flex-direction:column;gap:0;margin:18px 0;border-top:1px solid var(--border)}
        .receipt-details>div{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid var(--border);font-size:12px}
        .receipt-details span{color:var(--muted)}
        .receipt-details strong{text-align:right;max-width:60%;overflow-wrap:anywhere}
        .receipt-modal .button-row{justify-content:center}
        .transfer-modal .demo-disclaimer{font-size:11px;line-height:1.5;color:var(--muted);margin:14px 0 0}
        @media(max-width:700px){
          .dashboard-actions{align-items:flex-start}
          .wallet-balance-card{padding:19px}
          .wallet-balance-card h2{font-size:27px}
          .smart-guidance-grid{grid-template-columns:1fr}
          .transfer-modal{padding:19px}
          .receipt-details>div{align-items:flex-start}
        }
      `}</style>
        </div>
        );
}