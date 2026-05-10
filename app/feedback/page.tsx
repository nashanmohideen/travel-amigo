import type { Metadata } from "next";
import FeedbackDashboard from "@/components/features/FeedbackDashboard";

export const metadata: Metadata = {
  title: "Feedback — Travel Amigo",
};

export default function FeedbackPage() {
  return <FeedbackDashboard />;
}
