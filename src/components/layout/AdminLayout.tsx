import { Avatar, Button, Grid, Layout, Menu, Space, Typography } from "antd";
import type { PropsWithChildren } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminNav } from "@/config/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export function AdminLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { admin, logoutAdminSession } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Sider
        width={250}
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          padding: 16,
          zIndex: 2
        }}
      >
        <div
          className="rm-surface-dark"
          style={{
            borderRadius: 28,
            height: "100%",
            padding: 18,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <img
            src="/reelmind-logo-horizontal.png"
            alt="ReelMind Admin"
            style={{ height: 28, width: "fit-content", marginBottom: 18, filter: "brightness(1.1)" }}
          />
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[adminNav.find((item) => location.pathname === item.path)?.key ?? "overview"]}
            items={adminNav.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => navigate(item.path)
            }))}
            style={{ background: "transparent", flex: 1, borderInlineEnd: "none" }}
          />
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <Space size={10}>
              <Avatar style={{ background: "#ff6a1a" }}>A</Avatar>
              <div>
                <Typography.Text strong style={{ display: "block", color: "#f8fafc" }}>
                  {admin?.email ?? "admin"}
                </Typography.Text>
                <Typography.Text style={{ color: "rgba(248,250,252,0.68)" }}>
                  超级管理员
                </Typography.Text>
              </div>
            </Space>
            <Button
              block
              icon={<LogOut size={16} />}
              style={{ marginTop: 14 }}
              onClick={async () => {
                await logoutAdminSession();
                navigate("/auth", { replace: true });
              }}
            >
              退出后台
            </Button>
          </div>
        </div>
      </Sider>

      <Layout style={{ background: "transparent" }}>
        <Content style={{ padding: screens.md ? "22px 26px 28px 14px" : "12px", position: "relative", zIndex: 1 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
