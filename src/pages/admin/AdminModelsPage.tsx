import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Typography, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { ApiProvider, ApiVideoModel } from "@/api/types";
import { createAdminModel, listAdminModels, listProviders, updateAdminModel, updateAdminModelStatus } from "@/api/admin";
import { getErrorMessage } from "@/utils/errors";

export function AdminModelsPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [models, setModels] = useState<ApiVideoModel[]>([]);
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ApiVideoModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [modelResult, providerResult] = await Promise.all([listAdminModels(), listProviders()]);
      setModels(modelResult.list);
      setProviders(providerResult.list);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openModal = (record?: ApiVideoModel) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ? {
      ...record,
      duration_options: record.duration_options.join(","),
      supported_input_types: record.supported_input_types,
      aspect_ratio_options: record.aspect_ratio_options.join(","),
      supported_resolutions: record.supported_resolutions.join(",")
    } : {
      status: "maintenance",
      billing_type: "per_second",
      price_per_second: 15,
      duration_options: "4,8",
      supported_input_types: ["text"],
      aspect_ratio_options: "16:9,9:16",
      supported_resolutions: "1280x720,720x1280",
      is_visible: true,
      sort_order: 100
    });
    setModalOpen(true);
  };

  const splitValues = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      duration_options: splitValues(values.duration_options).map(Number).filter(Boolean),
      supported_input_types: values.supported_input_types,
      supported_input_combinations: [values.supported_input_types],
      aspect_ratio_options: splitValues(values.aspect_ratio_options),
      supported_resolutions: splitValues(values.supported_resolutions),
      input_asset_rules: {},
      resolution_price_rules: {},
      input_price_rules: {},
      upstream_default_params: {},
      upstream_param_mapping: {}
    };
    setLoading(true);
    try {
      if (editing) {
        await updateAdminModel(editing.id, payload);
      } else {
        await createAdminModel(payload);
      }
      message.success("模型配置已保存");
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
            eyebrow="模型管理"
            title="模型管理"
            extra={<Button type="primary" onClick={() => openModal()}>新增模型</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1200 }}
            loading={loading}
            dataSource={models}
            columns={[
              { title: "模型名称", dataIndex: "name", key: "name" },
              { title: "供应商", dataIndex: "provider_name", key: "provider_name" },
              { title: "模型 Key", dataIndex: "model_key", key: "model_key" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              {
                title: "计费方式",
                dataIndex: "billing_type",
                key: "billing_type",
                render: (value: string) => (value === "per_second" ? "按秒计费" : "按次计费")
              },
              {
                title: "价格",
                key: "price",
                render: (_, record) => `${record.billing_type === "per_second" ? record.price_per_second : record.price_per_generation} 积分`
              },
              {
                title: "输入能力",
                dataIndex: "supported_input_types",
                key: "supported_input_types",
                render: (value: string[]) => value.join(" / ")
              },
              {
                title: "比例",
                dataIndex: "aspect_ratio_options",
                key: "aspect_ratio_options",
                render: (value: string[]) => value.join("、")
              },
              {
                title: "清晰度",
                dataIndex: "supported_resolutions",
                key: "supported_resolutions",
                render: (value: string[]) => value.join("、")
              },
              {
                title: "时长",
                dataIndex: "duration_options",
                key: "duration_options",
                render: (value: number[]) => value.map((item) => `${item} 秒`).join("、")
              },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button onClick={() => openModal(record)}>编辑</Button>
                    <Button
                      type="primary"
                      ghost
                      onClick={async () => {
                        const next = record.status === "available" ? "maintenance" : "available";
                        await updateAdminModelStatus(record.id, next);
                        message.success(next === "available" ? "模型已开启" : "模型已维护");
                        await loadData();
                      }}
                    >
                      {record.status === "available" ? "设为维护" : "开启"}
                    </Button>
                  </Space>
                )
              }
            ]}
            expandable={{
              expandedRowRender: (record) => (
                <Space direction="vertical">
                  <Typography.Text>{record.description}</Typography.Text>
                  <Typography.Text type="secondary">{record.model_key} · {record.upstream_model_id || "未绑定上游模型"}</Typography.Text>
                </Space>
              )
            }}
          />
        </Card>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "编辑模型" : "新增模型"}
        okText="保存"
        confirmLoading={loading}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="模型名称" name="name" rules={[{ required: true, message: "请输入模型名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="供应商名称" name="provider_name" rules={[{ required: true, message: "请输入供应商名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="模型 Key" name="model_key" rules={[{ required: true, message: "请输入模型 Key" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="标签" name="badge">
            <Input />
          </Form.Item>
          <Space size={16} style={{ width: "100%" }} align="start">
            <Form.Item label="状态" name="status" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={[
                { value: "available", label: "可用" },
                { value: "maintenance", label: "维护中" },
                { value: "coming_soon", label: "即将推出" },
                { value: "disabled", label: "禁用" }
              ]} />
            </Form.Item>
            <Form.Item label="展示" name="is_visible" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Space size={16} style={{ width: "100%" }} align="start">
            <Form.Item label="计费方式" name="billing_type" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={[
                { value: "per_second", label: "按秒" },
                { value: "per_generation", label: "按次" }
              ]} />
            </Form.Item>
            <Form.Item label="每秒积分" name="price_per_second" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="每次积分" name="price_per_generation" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item label="时长选项，逗号分隔" name="duration_options" rules={[{ required: true }]}>
            <Input placeholder="4,8" />
          </Form.Item>
          <Form.Item label="默认时长" name="default_duration_seconds">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="输入能力" name="supported_input_types" rules={[{ required: true }]}>
            <Select mode="multiple" options={[
              { value: "text", label: "文本" },
              { value: "image", label: "图片" },
              { value: "video", label: "视频" },
              { value: "audio", label: "音频" }
            ]} />
          </Form.Item>
          <Form.Item label="比例选项，逗号分隔" name="aspect_ratio_options" rules={[{ required: true }]}>
            <Input placeholder="16:9,9:16" />
          </Form.Item>
          <Form.Item label="分辨率选项，逗号分隔" name="supported_resolutions" rules={[{ required: true }]}>
            <Input placeholder="1280x720,720x1280" />
          </Form.Item>
          <Form.Item label="上游供应商" name="upstream_provider_id">
            <Select allowClear options={providers.map((provider) => ({ value: provider.id, label: provider.name }))} />
          </Form.Item>
          <Form.Item label="上游模型 ID" name="upstream_model_id">
            <Input placeholder="sora-2 / veo-3.1 / veo-3.1-fast" />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
