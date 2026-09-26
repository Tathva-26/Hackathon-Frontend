// Display helpers shared by the admin console.

const TIME_ZONE = "Asia/Kolkata";

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

const dayFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatDate(value) {
  if (!value) return "–";
  return dateTimeFormat.format(new Date(value));
}

// "2026-09-25" -> "25 Sep"
export function formatDay(key) {
  return dayFormat.format(new Date(`${key}T00:00:00Z`));
}

export function rupees(paise) {
  if (paise === null || paise === undefined) return "–";
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function timeAgo(value, now = Date.now()) {
  if (!value) return "–";
  const minutes = Math.round((now - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// "12m left" until an expiry, or null once it has passed.
export function timeLeft(value, now = Date.now()) {
  if (!value) return null;
  const ms = new Date(value).getTime() - now;
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  return minutes < 60 ? `${minutes}m left` : `${Math.floor(minutes / 60)}h ${minutes % 60}m left`;
}

// Phones are stored as bare digits; 10 digits is an Indian mobile.
export function displayPhone(phone) {
  if (!phone) return "–";
  if (/^\d{10}$/.test(phone)) return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  return phone;
}

export function dialNumber(phone) {
  if (!phone) return "";
  return /^\d{10}$/.test(phone) ? `+91${phone}` : `+${phone.replace(/^\+/, "")}`;
}

export function whatsappNumber(phone) {
  if (!phone) return "";
  return /^\d{10}$/.test(phone) ? `91${phone}` : phone.replace(/^\+/, "");
}

export function plural(count, word, pluralWord = `${word}s`) {
  return `${count} ${count === 1 ? word : pluralWord}`;
}

export const REGISTRATION_STATUSES = [
  "DRAFT",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "PAID",
  "EXPIRED",
  "CANCELLED",
  "REMOVED",
];

export const UNPAID_STATUSES = "DRAFT,PAYMENT_PENDING,PAYMENT_FAILED";

export const PAYMENT_STATUSES = ["PENDING", "CONFIRMED", "FAILED"];

export const STATUS_LABELS = {
  DRAFT: "Draft",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_FAILED: "Payment failed",
  PAID: "Paid",
  EXPIRED: "Expired",
  CANCELLED: "Superseded",
  REMOVED: "Removed",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FAILED: "Failed",
  PUBLISHED: "Published",
  ADMIN: "Admin",
};

export const STATUS_HELP = {
  DRAFT: "Team created, payment not started",
  PAYMENT_PENDING: "Sent to TIQR checkout, waiting for confirmation",
  PAYMENT_FAILED: "Payment failed or was cancelled at TIQR",
  PAID: "Paid and confirmed as a team",
  EXPIRED: "Abandoned registration",
  CANCELLED: "Replaced by a newer registration from the same leader",
  REMOVED: "Paid team deleted by an admin",
};

export function isUnpaid(status) {
  return UNPAID_STATUSES.split(",").includes(status);
}
