// AdminPanel.tsx
// Placeholder page for the Admin Panel feature.
// This will later let admins manage users, problems, reports, and view analytics.
// Built LAST in our roadmap, but we still add the placeholder now for routing completeness.

import ComingSoon from "../components/ComingSoon";
import { ShieldCheck } from "lucide-react";
// A shield icon — fits an admin/management/security feature.

export default function AdminPanel() {
  return (
    <ComingSoon
      icon={ShieldCheck}
      title="Admin Panel"
      description="Manage users, problems, reports, and view platform-wide analytics."
    />
  );
}