import { useState } from "react";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

const financialData = {
  monthlyIncome: 45000,
  monthlyExpenses: 28750,
  monthlySavings: 16250,
  savingsGoal: 50000,
  savedForGoal: 22000,
};

function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (
    q.includes("save") &&
    (q.includes("goal") || q.includes("more"))
  ) {
    const remaining =
      financialData.savingsGoal - financialData.savedForGoal;

    return `You have ₹${remaining.toLocaleString()} left to reach your ₹${financialData.savingsGoal.toLocaleString()} goal. At your current monthly savings of ₹${financialData.monthlySavings.toLocaleString()}, you're on track to reach it in about ${Math.ceil(
      remaining / financialData.monthlySavings
    )} months.`;
  }

  if (
    q.includes("income") ||
    q.includes("earn")
  ) {
    return `Your current monthly income is ₹${financialData.monthlyIncome.toLocaleString()}.`;
  }

  if (
    q.includes("expense") ||
    q.includes("spend")
  ) {
    return `You've spent around ₹${financialData.monthlyExpenses.toLocaleString()} this month. That's about ${Math.round(
      (financialData.monthlyExpenses /
        financialData.monthlyIncome) *
        100
    )}% of your monthly income.`;
  }

  if (
    q.includes("saving") ||
    q.includes("saved")
  ) {
    return `You've currently saved ₹${financialData.monthlySavings.toLocaleString()} this month. Your savings rate is approximately ${Math.round(
      (financialData.monthlySavings /
        financialData.monthlyIncome) *
        100
    )}%.`;
  }

  if (q.includes("goal")) {
    return `Your current savings goal is ₹${financialData.savingsGoal.toLocaleString()}, and you've already saved ₹${financialData.savedForGoal.toLocaleString()} toward it.`;
  }

  return "I can help you understand your spending, savings, income and goals. Try asking me something like: \"How much more do I need to save for my goal?\"";
}

export default function MyPalAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hey! I'm MyPal AI 👋 Ask me anything about your money, spending or savings goals.",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    const aiMessage: Message = {
      id: Date.now() + 1,
      sender: "ai",
      text: generateResponse(input),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      aiMessage,
    ]);

    setInput("");
  };

  return (
    <div className="mypal-ai">
      <div className="ai-header">
        <div>
          <h1>MyPal AI</h1>
          <p>Your personal financial companion</p>
        </div>

        <div className="ai-status">
          <span></span>
          Online
        </div>
      </div>

      <div className="ai-chat">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.sender === "user"
                ? "user-message"
                : "ai-message"
            }`}
          >
            {message.sender === "ai" && (
              <div className="ai-avatar">M</div>
            )}

            <div className="message-bubble">
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="ai-suggestions">
        <button
          onClick={() =>
            setInput("How much more do I need to save for my goal?")
          }
        >
          🎯 My savings goal
        </button>

        <button
          onClick={() =>
            setInput("How much did I spend this month?")
          }
        >
          💸 My spending
        </button>

        <button
          onClick={() =>
            setInput("How much have I saved?")
          }
        >
          💰 My savings
        </button>
      </div>

      <div className="ai-input">
        <input
          type="text"
          placeholder="Ask MyPal anything about your money..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}