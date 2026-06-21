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
      <Route path="/admin" element={<AdminOverviewPage />} />
      <Route path="/admin/models" element={<AdminModelsPage />} />
      <Route path="/admin/providers" element={<AdminProvidersPage />} />
      <Route path="/admin/prompt-fields" element={<AdminPromptFieldsPage />} />
      <Route path="/admin/packages" element={<AdminPackagesPage />} />
      <Route path="/admin/redeem-codes" element={<AdminRedeemCodesPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/tasks" element={<AdminTasksPage />} />
      <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
