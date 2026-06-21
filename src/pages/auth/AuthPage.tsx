import { Button, Card, Checkbox, Form, Input, Row, Segmented, Space, Typography, message } from "antd";
import { ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { animateEntrance } from "@/utils/motion";
import { useEffect, useRef } from "react";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "code">("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const animation = animateEntrance(ref.current, 120);
    return () => {
      animation?.revert();
    };
  }, []);

  return (
    <div className="rm-page-shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh", paddingTop: 0 }}>
      <Card
        bordered={false}
        className="rm-page-section"
        style={{ width: "min(100%, 540px)", padding: 18 }}
        ref={ref}
      >
        <Space direction="vertical" size={22} style={{ width: "100%" }}>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate("/")}>
            返回工作室
          </Button>

          <Space direction="vertical" size={8} align="center" style={{ width: "100%" }}>
            <img src="/reelmind-logo-horizontal.png" alt="ReelMind" style={{ height: 40 }} />
            <Typography.Title level={2} style={{ margin: 0 }}>
              {mode === "register" ? "创建你的创作账号" : "欢迎回来"}
            </Typography.Title>
          </Space>

          <Segmented
            block
            value={mode}
            onChange={(value) => setMode(value as typeof mode)}
            options={[
              { label: "密码登录", value: "login" },
              { label: "验证码登录", value: "code" },
              { label: "注册", value: "register" }
            ]}
          />

          <Form
            layout="vertical"
            onFinish={() => message.success("登录成功")}
          >
            <Form.Item
              label="电子邮箱"
              name="email"
              required
              rules={[
                { required: true, message: "请输入邮箱地址" },
                { type: "email", message: "邮箱格式不正确" }
              ]}
            >
              <Input prefix={<Mail size={16} />} placeholder="输入您的电子邮箱" />
            </Form.Item>

            {mode === "code" ? (
              <Row gutter={12}>
                <Form.Item
                  style={{ flex: 1 }}
                  label="验证码"
                  name="code"
                  rules={[{ required: true, message: "请输入验证码" }]}
                >
                  <Input placeholder="6 位验证码" />
                </Form.Item>
                <Form.Item label=" " colon={false}>
                  <Button>发送验证码</Button>
                </Form.Item>
              </Row>
            ) : (
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="输入您的密码"
                  suffix={
                    <Button
                      type="text"
                      size="small"
                      icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      onClick={() => setShowPassword((prev) => !prev)}
                    />
                  }
                />
              </Form.Item>
            )}

            {mode !== "register" ? (
              <Space style={{ justifyContent: "space-between", width: "100%", marginBottom: 18 }}>
                <Checkbox>记住我</Checkbox>
                <Button type="link">忘记密码？</Button>
              </Space>
            ) : null}

            <Button htmlType="submit" type="primary" block size="large">
              {mode === "register" ? "注册并进入工作室" : "继续"}
            </Button>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
