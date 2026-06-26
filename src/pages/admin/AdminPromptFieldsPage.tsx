import { Button, Card, Form, Input, InputNumber, Modal, Select, Switch, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { ApiPromptField } from "@/api/types";
import { createPromptField, listPromptFields, updatePromptField, updatePromptFieldStatus } from "@/api/admin";
import { StatusTag } from "@/components/common/StatusTag";
import { titleCaseStatus } from "@/utils/format";
import { getErrorMessage } from "@/utils/errors";

export function AdminPromptFieldsPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [fields, setFields] = useState<ApiPromptField[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ApiPromptField | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPromptFields();
      setFields(result.list);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openModal = (record?: ApiPromptField) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ? {
      ...record,
      options_text: record.options.map((item) => typeof item === "string" ? item : item.label ?? item.value ?? "").filter(Boolean).join("\n")
    } : {
      control_type: "input",
      allow_custom_value: true,
      is_required: false,
      is_enabled: true,
      sort_order: 100
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const options = String(values.options_text ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ label: item, value: item }));
    const payload = { ...values, options };
    delete payload.options_text;
    setLoading(true);
    try {
      if (editing) {
        await updatePromptField(editing.id, payload);
      } else {
        await createPromptField(payload);
      }
      message.success("字段已保存");
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
            eyebrow="高级提示词"
            title="提示词字段"
            extra={<Button type="primary" onClick={() => openModal()}>新增字段</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="key"
            pagination={false}
            loading={loading}
            dataSource={fields}
            columns={[
              { title: "字段 Key", dataIndex: "field_key", key: "field_key" },
              { title: "字段名称", dataIndex: "label", key: "label" },
              { title: "控件类型", dataIndex: "control_type", key: "control_type", render: (value: string) => titleCaseStatus(value) },
              { title: "说明", dataIndex: "description", key: "description" },
              {
                title: "必填",
                dataIndex: "is_required",
                key: "is_required",
                render: (value: boolean) => (value ? "是" : "否")
              },
              {
                title: "状态",
                dataIndex: "is_enabled",
                key: "is_enabled",
                render: (value: boolean) => <StatusTag status={value ? "enabled" : "disabled"} />
              },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <>
                    <Button type="link" onClick={() => openModal(record)}>编辑</Button>
                    <Button type="link" onClick={async () => {
                      await updatePromptFieldStatus(record.id, !record.is_enabled);
                      message.success("状态已更新");
                      await loadData();
                    }}>{record.is_enabled ? "禁用" : "启用"}</Button>
                  </>
                )
              }
            ]}
          />
        </Card>
      </div>

      <Modal open={modalOpen} title={editing ? "编辑字段" : "新增字段"} okText="保存" confirmLoading={loading} onOk={handleSave} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="字段 Key" name="field_key" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="字段名称" name="label" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="说明" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="占位文案" name="placeholder">
            <Input />
          </Form.Item>
          <Form.Item label="控件类型" name="control_type">
            <Select options={[
              { value: "input", label: "单行输入" },
              { value: "textarea", label: "多行输入" },
              { value: "select", label: "下拉选择" },
              { value: "combobox", label: "可输入选择" }
            ]} />
          </Form.Item>
          <Form.Item label="选项，每行一个" name="options_text">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="允许自定义" name="allow_custom_value" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="必填" name="is_required" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="启用" name="is_enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
