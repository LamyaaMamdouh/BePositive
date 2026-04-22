import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { OrgLoginPage } from "./pages/org-login";
import { OrgRegisterPage } from "./pages/org-register";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { VerifyOTPPage } from "./pages/verify-otp";
import { ResetPasswordPage } from "./pages/reset-password";
import { NotFoundPage } from "./components/not-found-page";
import { DashboardLayout } from "./components/dashboard-layout";
import { DashboardOverview } from "./pages/dashboard/index";
import { CreateRequest } from "./pages/dashboard/create-request";
import { ActiveRequests } from "./pages/dashboard/active-requests";
import { DonorsMonitoring } from "./pages/dashboard/donors";
import { DashboardAnalytics } from "./pages/dashboard/analytics";
import { HospitalProfile } from "./pages/dashboard/profile";
import { DashboardSettings } from "./pages/dashboard/settings";
import { InventoryManagement } from "./pages/dashboard/inventory-management";
import { ActivityLogPage } from "./pages/dashboard/activity-log";
import { UrgentRequestPage } from "./pages/dashboard/urgent-request";
import { RequestDetails } from "./pages/dashboard/request-details";
import { UpdateRequest } from "./pages/dashboard/update-request";
import { MessagingPage } from "./pages/dashboard/messaging";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/org/login",
    Component: OrgLoginPage,
  },
  {
    path: "/org/register",
    Component: OrgRegisterPage,
  },
  {
    path: "/org/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/org/verify-otp",
    Component: VerifyOTPPage,
  },
  {
    path: "/org/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/org/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: "requests/create", Component: CreateRequest },
      { path: "requests/active", Component: ActiveRequests },
      { path: "requests/:id/details", Component: RequestDetails },
      { path: "requests/:id/update", Component: UpdateRequest },
      { path: "donors", Component: DonorsMonitoring },
      { path: "messaging", Component: MessagingPage },
      { path: "analytics", Component: DashboardAnalytics },
      { path: "profile", Component: HospitalProfile },
      { path: "settings", Component: DashboardSettings },
      { path: "inventory-management", Component: InventoryManagement },
      { path: "activity-log", Component: ActivityLogPage },
      { path: "urgent-request/new", Component: UrgentRequestPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);