import { Button, Card, Checkbox, Form, Input, Modal, Row, Segmented, Space, Typography, message } from "antd";
import { ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { animateEntrance } from "@/utils/motion";
import { useEffect, useRef } from "react";
import { confirmPasswordReset, sendEmailCode } from "@/api/auth";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "@/hooks/useAuth";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "code">("code");
  const [showPassword, setShowPassword] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<HTMLDivElement | null>(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const { loginByPassword, loginByCode } = useAuth();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const animation = animateEntrance(ref.current, 120);
    return () => {
      animation?.revert();
    };
  }, []);

  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

  const handleSendCode = async () => {
    const email = form.getFieldValue("email") as string | undefined;
    if (!email) {
      message.warning("请先输入邮箱");
      return;
    }
    setSendingCode(true);
    try {
      const result = await sendEmailCode(email, "login");
      message.success(result.debug_code ? `验证码：${result.debug_code}` : "验证码已发送");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (values: { email: string; password?: string; code?: string }) => {
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginByPassword(values.email, values.password ?? "");
        message.success("登录成功");
        navigate(redirectTo, { replace: true });
      } else {
        await loginByCode(values.email, values.code ?? "");
        message.success("登录成功");
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (values: { email: string; code?: string; password?: string }) => {
    setSubmitting(true);
    try {
      if (!values.code || !values.password) {
        const result = await sendEmailCode(values.email, "reset_password");
        message.success(result.debug_code ? `重置验证码：${result.debug_code}` : "重置验证码已发送");
        return;
      }
      await confirmPasswordReset(values.email, values.code, values.password);
      message.success("密码已重置");
      setResetOpen(false);
      resetForm.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

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
              欢迎回来
            </Typography.Title>
          </Space>

          <Segmented
            block
            value={mode}
            onChange={(value) => setMode(value as typeof mode)}
            options={[
              { label: "密码登录", value: "login" },
              { label: "验证码登录", value: "code" }
            ]}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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
              <>
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
                    <Button loading={sendingCode} onClick={handleSendCode}>发送验证码</Button>
                  </Form.Item>
                </Row>
                <Typography.Text className="rm-muted" style={{ display: "block", marginTop: -8, marginBottom: 18 }}>
                  首次验证码登录会自动创建账号。
                </Typography.Text>
              </>
            ) : null}

            {mode === "login" ? (
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
            ) : null}

            <Space style={{ justifyContent: "space-between", width: "100%", marginBottom: 18 }}>
              <Checkbox>记住我</Checkbox>
              <Button type="link" onClick={() => setResetOpen(true)}>忘记密码？</Button>
            </Space>

            <Button htmlType="submit" type="primary" block size="large" loading={submitting}>
              继续
            </Button>
          </Form>
        </Space>
      </Card>

      <Modal
        open={resetOpen}
        title="重置密码"
        okText="提交"
        confirmLoading={submitting}
        onCancel={() => setResetOpen(false)}
        onOk={() => resetForm.submit()}
      >
        <Form form={resetForm} layout="vertical" onFinish={handleReset}>
          <Form.Item label="电子邮箱" name="email" rules={[{ required: true, message: "请输入邮箱" }, { type: "email", message: "邮箱格式不正确" }]}>
            <Input prefix={<Mail size={16} />} placeholder="输入需要重置的邮箱" />
          </Form.Item>
          <Form.Item label="验证码" name="code">
            <Input placeholder="不填验证码时会发送重置验证码" />
          </Form.Item>
          <Form.Item label="新密码" name="password">
            <Input.Password placeholder="收到验证码后填写新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
