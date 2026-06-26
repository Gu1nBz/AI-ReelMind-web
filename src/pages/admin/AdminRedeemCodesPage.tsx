import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Space, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { RedeemCodeRecord } from "@/mock/types";
import { batchCreateRedeemCodes, createRedeemCode, disableRedeemCode, exportRedeemCodes, listRedeemCodes } from "@/api/admin";
import { toAdminRedeemCode } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";

export function AdminRedeemCodesPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [codes, setCodes] = useState<RedeemCodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listRedeemCodes(1, 100);
      setCodes(result.list.map(toAdminRedeemCode));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const expiresAt = values.expires_at?.toDate?.().toISOString?.() ?? "";
    const payload = { ...values, expires_at: expiresAt };
    delete payload.count;
    setLoading(true);
    try {
      if (values.count && values.count > 1) {
        await batchCreateRedeemCodes({ ...payload, count: values.count });
      } else {
        await createRedeemCode(payload);
      }
      message.success("兑换码已生成");
      setModalOpen(false);
      form.resetFields();
      await loadData();
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
            eyebrow="兑换码管理"
            title="兑换码管理"
            extra={
              <Space>
                <Button onClick={() => exportRedeemCodes().catch((error) => message.error(getErrorMessage(error)))}>批量导出 CSV</Button>
                <Button type="primary" onClick={() => {
                  form.setFieldsValue({ count: 10, credits: 100, batch_no: `batch-${Date.now()}`, channel: "运营发放", prefix: "REEL" });
                  setModalOpen(true);
                }}>批量生成兑换码</Button>
              </Space>
            }
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1024 }}
            loading={loading}
            dataSource={codes}
            columns={[
              { title: "兑换码", dataIndex: "code", key: "code" },
              { title: "积分", dataIndex: "credits", key: "credits" },
              { title: "批次号", dataIndex: "batchNo", key: "batchNo" },
              { title: "渠道", dataIndex: "channel", key: "channel" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              { title: "使用用户", dataIndex: "usedBy", key: "usedBy" },
              { title: "使用时间", dataIndex: "usedAt", key: "usedAt" },
              { title: "过期时间", dataIndex: "expiresAt", key: "expiresAt" },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => record.status === "unused" ? (
                  <Button danger type="link" onClick={async () => {
                    await disableRedeemCode(record.id);
                    message.success("兑换码已禁用");
                    await loadData();
                  }}>禁用</Button>
                ) : null
              }
            ]}
          />
        </Card>
      </div>

      <Modal open={modalOpen} title="生成兑换码" okText="生成" confirmLoading={loading} onOk={handleCreate} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="生成数量" name="count" rules={[{ required: true }]}>
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="积分" name="credits" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="批次号" name="batch_no" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="渠道" name="channel">
            <Input />
          </Form.Item>
          <Form.Item label="前缀" name="prefix">
            <Input />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="过期时间" name="expires_at">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
