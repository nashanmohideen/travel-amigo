import type { Metadata } from "next";
import AdminRoute from "@/components/auth/AdminRoute";
import FeedbackDashboard from "@/components/features/FeedbackDashboard";

export const metadata: Metadata = {
  title: "Admin · Feedback — Travel Amigo",
};

/** Admin home for feedback review — same dashboard as /feedback, admin-gated. */
export default function AdminFeedbackPage() {
  return (
    <AdminRoute>
      <FeedbackDashboard />
    </AdminRoute>
  );
}
