import { Button, Card, Form, Input, InputNumber, Modal, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { formatCredits } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useEffect, useState } from "react";
import type { ApiUser } from "@/api/types";
import { createCompensationCode, listAdminUsers } from "@/api/admin";
import { getErrorMessage } from "@/utils/errors";

export function AdminUsersPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    listAdminUsers(1, 100)
      .then((result) => setUsers(result.list))
      .catch((error) => message.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const handleCompensation = async () => {
    if (!selectedUser) {
      return;
    }
    const values = await form.validateFields();
    setLoading(true);
    try {
      await createCompensationCode(selectedUser.id, values);
      message.success("补偿兑换码已生成");
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="用户管理"
            title="用户管理"
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1024 }}
            loading={loading}
            dataSource={users}
            columns={[
              { title: "用户 ID", dataIndex: "id", key: "id" },
              { title: "邮箱", dataIndex: "email", key: "email" },
              {
                title: "当前余额",
                dataIndex: "credit_balance",
                key: "credit_balance",
                render: (value: number) => formatCredits(value)
              },
              {
                title: "累计充值",
                dataIndex: "total_recharge_credits",
                key: "total_recharge_credits",
                render: (value: number) => formatCredits(value)
              },
              {
                title: "累计消耗",
                dataIndex: "total_consumed_credits",
                key: "total_consumed_credits",
                render: (value: number) => formatCredits(value)
              },
              { title: "最近登录", dataIndex: "last_login_at", key: "last_login_at" },
              { title: "注册时间", dataIndex: "created_at", key: "created_at" },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => <Button type="link" onClick={() => {
                  setSelectedUser(record);
                  form.setFieldsValue({ credits: 100, channel: "人工补偿", note: "后台补偿" });
                }}>生成补偿码</Button>
              }
            ]}
          />
        </Card>
      </div>

      <Modal open={Boolean(selectedUser)} title="生成补偿兑换码" okText="生成" confirmLoading={loading} onOk={handleCompensation} onCancel={() => setSelectedUser(null)}>
        <Form form={form} layout="vertical">
          <Form.Item label="积分" name="credits" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="渠道" name="channel">
            <Input />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
