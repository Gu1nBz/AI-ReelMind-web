import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { ApiProvider } from "@/api/types";
import { createProvider, getProviderMappings, listProviders, providerHealthCheck, updateProvider, updateProviderStatus } from "@/api/admin";
import { getErrorMessage } from "@/utils/errors";

export function AdminProvidersPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ApiProvider | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProviders();
      setProviders(result.list);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openModal = (record?: ApiProvider) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? {
      auth_type: "bearer",
      update_mode: "polling",
      polling_interval_seconds: 10,
      max_wait_seconds: 600,
      max_retry_count: 60,
      status: "enabled"
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editing) {
        await updateProvider(editing.id, values);
      } else {
        await createProvider(values);
      }
      message.success("供应商已保存");
      setModalOpen(false);
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
            eyebrow="上游供应商"
            title="上游供应商"
            extra={<Button type="primary" onClick={() => openModal()}>新增供应商</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            dataSource={providers}
            loading={loading}
            scroll={{ x: 960 }}
            columns={[
              { title: "供应商名称", dataIndex: "name", key: "name" },
              { title: "适配器 Key", dataIndex: "adapter_key", key: "adapter_key" },
              { title: "更新方式", dataIndex: "update_mode", key: "update_mode" },
              { title: "接口地址", dataIndex: "api_base_url", key: "api_base_url", ellipsis: true },
              { title: "凭据", dataIndex: "credential_status", key: "credential_status" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button onClick={() => openModal(record)}>编辑</Button>
                    <Button onClick={async () => {
                      const result = await providerHealthCheck(record.id);
                      message.info(result.message);
                    }}>健康检查</Button>
                    <Button onClick={async () => {
                      const result = await getProviderMappings(record.id);
                      Modal.info({
                        title: "供应商映射",
                        width: 720,
                        content: <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
                      });
                    }}>查看映射</Button>
                    <Button onClick={async () => {
                      await updateProviderStatus(record.id, record.status === "enabled" ? "disabled" : "enabled");
                      message.success("状态已更新");
                      await loadData();
                    }}>{record.status === "enabled" ? "禁用" : "启用"}</Button>
                  </Space>
                )
              }
            ]}
          />
        </Card>
      </div>

      <Modal open={modalOpen} title={editing ? "编辑供应商" : "新增供应商"} okText="保存" confirmLoading={loading} onOk={handleSave} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Adapter Key" name="adapter_key" rules={[{ required: true }]}>
            <Input placeholder="newapi_video_generations" />
          </Form.Item>
          <Form.Item label="API Base URL" name="api_base_url" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="认证类型" name="auth_type">
            <Select options={[{ value: "bearer", label: "Bearer" }, { value: "none", label: "None" }]} />
          </Form.Item>
          <Form.Item label="更新方式" name="update_mode">
            <Select options={[
              { value: "callback", label: "Callback" },
              { value: "polling", label: "Polling" },
              { value: "both", label: "Both" }
            ]} />
          </Form.Item>
          <Space size={12} style={{ width: "100%" }} align="start">
            <Form.Item label="轮询间隔" name="polling_interval_seconds" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="最长等待" name="max_wait_seconds" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="重试次数" name="max_retry_count" style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: "enabled", label: "启用" }, { value: "disabled", label: "禁用" }]} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
