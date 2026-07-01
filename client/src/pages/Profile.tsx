// Profile.tsx
// Placeholder page for the User Profile feature.
// This will later show badges, stats, history, and progress graphs.

import ComingSoon from "../components/ComingSoon";
import { UserCircle2 } from "lucide-react";
// A user/person icon — fits a profile page.

export default function Profile() {
  return (
    <ComingSoon
      icon={UserCircle2}
      title="Profile"
      description="View your badges, stats, activity history, and progress graphs — all in one place."
    />
  );
}