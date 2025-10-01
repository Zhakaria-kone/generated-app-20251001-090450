// This file has been replaced by the new routing structure in main.tsx.
// The root path '/' now renders DashboardPage.tsx within the AppLayout.
// This file is kept to satisfy the blueprint but is not actively used in navigation.
import { DashboardPage } from './DashboardPage';
export function HomePage() {
  return <DashboardPage />;
}