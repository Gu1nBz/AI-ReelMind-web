import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "@/pages/auth/AuthPage";
import { UserWorkspacePage } from "@/pages/user/UserWorkspacePage";
import { HistoryPage } from "@/pages/user/HistoryPage";
import { PricingPage } from "@/pages/user/PricingPage";
import { RedeemPage } from "@/pages/user/RedeemPage";
import { ProfilePage } from "@/pages/user/ProfilePage";
import { ContactPage } from "@/pages/user/ContactPage";
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage";
import { AdminModelsPage } from "@/pages/admin/AdminModelsPage";
import { AdminProvidersPage } from "@/pages/admin/AdminProvidersPage";
import { AdminPackagesPage } from "@/pages/admin/AdminPackagesPage";
import { AdminRedeemCodesPage } from "@/pages/admin/AdminRedeemCodesPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminTasksPage } from "@/pages/admin/AdminTasksPage";
import { AdminTransactionsPage } from "@/pages/admin/AdminTransactionsPage";
import { AdminPromptFieldsPage } from "@/pages/admin/AdminPromptFieldsPage";
import { AdminGuard } from "@/components/auth/AdminGuard";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<UserWorkspacePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/redeem" element={<RedeemPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin" element={<AdminGuard><AdminOverviewPage /></AdminGuard>} />
      <Route path="/admin/models" element={<AdminGuard><AdminModelsPage /></AdminGuard>} />
      <Route path="/admin/providers" element={<AdminGuard><AdminProvidersPage /></AdminGuard>} />
      <Route path="/admin/prompt-fields" element={<AdminGuard><AdminPromptFieldsPage /></AdminGuard>} />
      <Route path="/admin/packages" element={<AdminGuard><AdminPackagesPage /></AdminGuard>} />
      <Route path="/admin/redeem-codes" element={<AdminGuard><AdminRedeemCodesPage /></AdminGuard>} />
      <Route path="/admin/users" element={<AdminGuard><AdminUsersPage /></AdminGuard>} />
      <Route path="/admin/tasks" element={<AdminGuard><AdminTasksPage /></AdminGuard>} />
      <Route path="/admin/transactions" element={<AdminGuard><AdminTransactionsPage /></AdminGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
