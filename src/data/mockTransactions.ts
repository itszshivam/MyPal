
export type PaymentStatus =
  | "Processing"
  | "On Hold"
  | "Sent"
  | "Received"
  | "Failed"
  | "Refunded";

export interface Transaction {
  id: string;
  recipient: string;
  email: string;
  amount: number;
  currency: string;
  date: string;
  status: PaymentStatus;
  reason: string;
  nextStep: string;
  lastUpdated: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: "MYPL1001",
    recipient: "Rahul Sharma",
    email: "rahul@example.com",
    amount: 5000,
    currency: "INR",
    date: "Nov 6, 2026",
    status: "Processing",
    reason:
      "The payment is still being processed. This can happen when the payment provider is verifying the transaction or waiting for the receiving bank to complete processing. No specific failure has been reported in this demo.",
    nextStep:
      "Wait for the payment to finish processing. Avoid sending the payment again until its status is updated.",
    lastUpdated: "5 minutes ago",
  },
  {
    id: "MYPL1002",
    recipient: "Sarah Johnson",
    email: "sarah@example.com",
    amount: 120,
    currency: "USD",
    date: "Nov 5, 2026",
    status: "On Hold",
    reason:
      "The payment has been temporarily placed on hold for a review. Possible reasons include a security check, unusual transaction activity, or a request for additional information. The exact reason is not confirmed in this demo.",
    nextStep:
      "Check your PayPal notifications and Resolution Centre for any requests for documents or additional information.",
    lastUpdated: "2 hours ago",
  },
  {
    id: "MYPL1003",
    recipient: "Alex Morgan",
    email: "alex@example.com",
    amount: 2500,
    currency: "INR",
    date: "Nov 4, 2026",
    status: "Failed",
    reason:
      "The payment could not be completed. Possible causes include insufficient funds, an expired payment method, incorrect payment details, or a bank decline. The exact failure reason is not available in this demo.",
    nextStep:
      "Check your payment method, verify the available balance and confirm the details before attempting another payment.",
    lastUpdated: "Yesterday",
  },
  {
    id: "MYPL1004",
    recipient: "Priya Reddy",
    email: "priya@example.com",
    amount: 3000,
    currency: "INR",
    date: "Nov 3, 2026",
    status: "Received",
    reason:
      "The payment has been successfully completed and the recipient has received the money. No payment issue is currently indicated.",
    nextStep:
      "No action is required. Keep the transaction ID for your records.",
    lastUpdated: "Nov 3",
  },
];
