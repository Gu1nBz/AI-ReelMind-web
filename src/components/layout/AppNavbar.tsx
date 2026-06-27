import { Button, Drawer, Grid, Layout, Space } from "antd";
import {
  AlignJustify,
  Coins,
  LogIn,
  Menu as MenuIcon,
  LogOut,
  UserRound
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { siteNav } from "@/config/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export function AppNavbar() {
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const items = siteNav.map((item) => (
    <NavLink
      key={item.key}
      to={item.path}
      style={{
        color: location.pathname === item.path ? "#ff6a1a" : "#303542",
        fontWeight: location.pathname === item.path ? 700 : 600,
        padding: "10px 2px"
      }}
    >
      {item.label}
    </NavLink>
  ));

  const actions = (
    <Space size={12} wrap>
      <Button
        icon={<Coins size={16} />}
        onClick={() => navigate("/pricing")}
        aria-label="前往充值页面"
      >
        {user ? `${user.credit_balance} 积分` : "积分套餐"}
      </Button>
      {user ? (
        <>
          <Button icon={<UserRound size={16} />} onClick={() => navigate("/profile")}>
            个人中心
          </Button>
          <Button icon={<LogOut size={16} />} onClick={logout}>
            退出
          </Button>
        </>
      ) : (
        <Button type="primary" icon={<LogIn size={16} />} onClick={() => navigate("/auth")}>
          登录
        </Button>
      )}
    </Space>
  );

  return (
    <>
      <Header
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(1440px, calc(100% - 24px))",
          height: 68,
          zIndex: 30,
          borderRadius: 22,
          border: "1px solid rgba(17,24,39,0.08)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: screens.md ? "0 20px" : "0 14px"
        }}
      >
        <Space align="center" size={screens.md ? 18 : 10}>
          {!screens.md ? (
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              aria-label="展开菜单"
              onClick={() => setOpen(true)}
            />
          ) : (
            <AlignJustify size={18} color="#7c8595" />
          )}
          <NavLink to="/" aria-label="ReelMind 首页">
            <img
              src="/reelmind-logo-horizontal.png"
              alt="ReelMind"
              style={{ height: screens.md ? 32 : 28, width: "auto" }}
            />
          </NavLink>
          {screens.md ? <Space size={28}>{items}</Space> : null}
        </Space>

        {screens.md ? actions : (
          <Button type="primary" onClick={() => (user ? navigate("/profile") : navigate("/auth"))}>
            {user ? `${user.credit_balance} 积分` : "登录"}
          </Button>
        )}
      </Header>

      <Drawer
        placement="left"
        open={open}
        onClose={() => setOpen(false)}
        title={<img src="/reelmind-logo-horizontal.png" alt="ReelMind" style={{ height: 28 }} />}
      >
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space direction="vertical" size={8}>
            {siteNav.map((item) => (
              <Button
                key={item.key}
                type={location.pathname === item.path ? "primary" : "text"}
                block
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}
          </Space>
          {actions}
        </Space>
      </Drawer>
    </>
  );
}
