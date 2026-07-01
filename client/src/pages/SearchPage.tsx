// SearchPage.tsx
// Placeholder page for the Global Search feature.
// This will later let users search across problems, notes, and past interviews.
// Named "SearchPage" (not "Search") to avoid clashing with the built-in browser Search APIs / naming confusion.

import ComingSoon from "../components/ComingSoon";
import { Search } from "lucide-react";
// A magnifying glass icon — the universal symbol for search.

export default function SearchPage() {
  return (
    <ComingSoon
      icon={Search}
      title="Global Search"
      description="Search across all your problems, notes, and past interview sessions in one place."
    />
  );
}