import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import "../styles.css";

document.title = "智核 LiveCore";

export const Route = createRootRoute({
  component: () => (
    <>
      <PreviewHostBridge />
      <AuthProvider><Outlet /></AuthProvider>
    </>
  ),
});
