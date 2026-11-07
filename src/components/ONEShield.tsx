
import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  LockKeyhole,
  Info,
  ArrowRight,
} from "lucide-react";

type RiskLevel = "High" | "Medium" | "Low";

type Assessment = {
  risk: RiskLevel;
  title: string;
  explanation: string;
  actions: string[];
  reasons: string[];
};

const examples = [
  {
    label: "Fake KYC message",
    message:
      "URGENT! Your bank account will be blocked today. Click this link immediately and update your KYC details to avoid account suspension.",
  },
  {
    label: "Fake cashback offer",
    message:
      "Congratulations! You won ₹5000 cashback. Enter your UPI PIN to receive your reward. Limited time offer!",
  },
  {
    label: "Fake payment request",
    message:
      "I have sent you ₹2000. Please approve this collect request and enter your UPI PIN to receive the money.",
  },
];

function analyseMessage(message: string): Assessment {
  const text = message.toLowerCase();

  const highSignals = [
    "enter your upi pin",
    "share your otp",
    "share otp",
    "tell me your otp",
    "enter otp",
    "password",
    "remote access",
    "screen sharing",
    "anydesk",
    "receive your reward",
    "approve this collect request",
    "pay to receive",
  ];

  const mediumSignals = [
    "urgent",
    "immediately",
    "account will be blocked",
    "account suspended",
    "click this link",
    "kyc",
    "limited time",
    "cashback",
    "prize",
    "winner",
    "verify your account",
    "unknown number",
  ];

  const reasons: string[] = [];

  highSignals.forEach((signal) => {
    if (text.includes(signal)) {
      reasons.push(`Contains suspicious request: "${signal}"`);
    }
  });

  mediumSignals.forEach((signal) => {
    if (text.includes(signal)) {
      reasons.push(`Contains a possible warning sign: "${signal}"`);
    }
  });

  const highCount = highSignals.filter((signal) =>
    text.includes(signal)
  ).length;

  const mediumCount = mediumSignals.filter((signal) =>
    text.includes(signal)
  ).length;

  if (highCount > 0) {
    return {
      risk: "High",
      title: "Potential scam detected",
      explanation:
        "This message contains requests commonly associated with payment scams or attempts to obtain sensitive information.",
      reasons,
      actions: [
        "Do not share your UPI PIN, OTP or password.",
        "Do not approve unexpected payment requests.",
        "Do not click suspicious links.",
        "Verify the sender through an official channel.",
      ],
    };
  }

  if (mediumCount >= 2) {
    return {
      risk: "Medium",
      title: "Be careful before proceeding",
      explanation:
        "This message contains multiple warning signs. Verify the offer or request independently before taking action.",
      reasons,
      actions: [
        "Check the sender's identity.",
        "Avoid clicking unknown links.",
        "Contact the organisation using its official website or app.",
        "Never share confidential banking information.",
      ],
    };
  }

  if (mediumCount === 1) {
    return {
      risk: "Medium",
      title: "Some caution is recommended",
      explanation:
        "One possible warning sign was found. This does not prove that the message is fraudulent, so verify it before acting.",
      reasons,
      actions: [
        "Verify the information independently.",
        "Do not share OTPs or PINs.",
        "Avoid making payments under pressure.",
      ],
    };
  }

  return {
    risk: "Low",
    title: "No obvious warning signs found",
    explanation:
      "Our basic demo checker did not identify common scam phrases. This does not guarantee that the message or sender is safe.",
    reasons: ["No matching warning phrases were identified."],
    actions: [
      "Still verify the sender.",
      "Never share your UPI PIN or OTP.",
      "Only use trusted payment applications.",
    ],
  };
}

export default function ONEShield() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Assessment | null>(null);

  const checkMessage = () => {
    if (!message.trim()) return;
    setResult(analyseMessage(message));
  };

  const loadExample = (example: string) => {
    setMessage(example);
    setResult(null);
  };

  const reset = () => {
    setMessage("");
    setResult(null);
  };

  const riskClass = result?.risk.toLowerCase();

  return (
    <div className="content shield-page">
      <section className="shield-hero">
        <div className="shield-hero-icon">
          <ShieldCheck size={34} />
        </div>

        <div>
          <span className="section-label">MYPAL SECURITY</span>
          <h2>Your money deserves protection.</h2>
          <p>
            Check suspicious messages and learn how to
            recognise common payment scams before you act.
          </p>
        </div>
      </section>

      <div className="shield-notice">
        <Info size={19} />
        <span>
          ONE Shield uses a basic demo-based text checker.
          It is not a real-time fraud detection system.
        </span>
      </div>

      <section className="shield-checker panel">
        <div className="shield-section-heading">
          <div className="shield-small-icon">
            <Search size={21} />
          </div>

          <div>
            <span className="section-label">MESSAGE CHECKER</span>
            <h3>Does this message look suspicious?</h3>
            <p>
              Paste a payment request, SMS or suspicious
              message below.
            </p>
          </div>
        </div>

        <textarea
          className="shield-textarea"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setResult(null);
          }}
          placeholder="Paste your suspicious message here..."
          rows={5}
        />

        <div className="shield-actions">
          <button
            className="primary-button"
            onClick={checkMessage}
            disabled={!message.trim()}
          >
            <ShieldCheck size={18} />
            Check message
          </button>

          <button className="secondary-button" onClick={reset}>
            Clear
          </button>
        </div>

        {result && (
          <div className={`shield-result ${riskClass}`}>
            <div className="shield-result-heading">
              <div className="shield-result-icon">
                {result.risk === "High" ? (
                  <ShieldAlert size={25} />
                ) : result.risk === "Medium" ? (
                  <AlertTriangle size={25} />
                ) : (
                  <CheckCircle2 size={25} />
                )}
              </div>

              <div>
                <span className="section-label">
                  DEMO ASSESSMENT
                </span>
                <h3>{result.title}</h3>
                <span className={`risk-label ${riskClass}`}>
                  {result.risk} Risk
                </span>
              </div>
            </div>

            <p>{result.explanation}</p>

            <div className="shield-result-block">
              <strong>What we noticed</strong>

              {result.reasons.map((reason, index) => (
                <div className="shield-reason" key={index}>
                  <AlertTriangle size={15} />
                  {reason}
                </div>
              ))}
            </div>

            <div className="shield-result-block">
              <strong>What you should do</strong>

              {result.actions.map((action, index) => (
                <div className="shield-advice" key={index}>
                  <CheckCircle2 size={16} />
                  {action}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="shield-examples">
        <div className="panel-header">
          <div>
            <span className="section-label">TRY IT OUT</span>
            <h3>Test common scam scenarios</h3>
          </div>
        </div>

        <div className="shield-example-grid">
          {examples.map((example) => (
            <button
              className="shield-example-card"
              key={example.label}
              onClick={() => loadExample(example.message)}
            >
              <div className="shield-example-icon">
                <AlertTriangle size={20} />
              </div>

              <strong>{example.label}</strong>

              <span>
                Try this example
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="shield-tips panel">
        <div className="shield-section-heading">
          <div className="shield-small-icon">
            <LockKeyhole size={21} />
          </div>

          <div>
            <span className="section-label">STAY PROTECTED</span>
            <h3>Four golden payment safety rules</h3>
          </div>
        </div>

        <div className="shield-tip">
          <CheckCircle2 size={19} />
          <span>Never share your UPI PIN or OTP with anyone.</span>
        </div>

        <div className="shield-tip">
          <CheckCircle2 size={19} />
          <span>
            You do not need to enter your UPI PIN to receive money.
          </span>
        </div>

        <div className="shield-tip">
          <CheckCircle2 size={19} />
          <span>
            Never approve an unexpected collect request.
          </span>
        </div>

        <div className="shield-tip">
          <CheckCircle2 size={19} />
          <span>
            Verify payment links and requests through official channels.
          </span>
        </div>
      </section>
    </div>
  );
}
