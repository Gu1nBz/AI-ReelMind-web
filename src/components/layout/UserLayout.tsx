import { Layout } from "antd";
import type { PropsWithChildren } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";

export function UserLayout({ children }: PropsWithChildren) {
  return (
    <Layout style={{ background: "transparent", minHeight: "100vh" }}>
      <AppNavbar />
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  );
}
