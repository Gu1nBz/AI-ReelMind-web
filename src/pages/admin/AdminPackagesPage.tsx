import { Button, Card, Form, Input, InputNumber, Modal, Select, Switch, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { ApiCreditPackage } from "@/api/types";
import { createPackage, listAdminPackages, updatePackage, updatePackageStatus } from "@/api/admin";
import { StatusTag } from "@/components/common/StatusTag";
import { getErrorMessage } from "@/utils/errors";

export function AdminPackagesPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [packages, setPackages] = useState<ApiCreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ApiCreditPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminPackages();
      setPackages(result.list);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openModal = (record?: ApiCreditPackage) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? {
      payment_provider: "external",
      button_text: "去购买",
      status: "visible",
      is_recommended: false,
      sort_order: 100
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      if (editing) {
        await updatePackage(editing.id, values);
      } else {
        await createPackage(values);
      }
      message.success("套餐已保存");
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
            eyebrow="积分套餐"
            title="积分套餐"
            extra={<Button type="primary" onClick={() => openModal()}>新增套餐</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            pagination={false}
            loading={loading}
            dataSource={packages}
            columns={[
              { title: "套餐名称", dataIndex: "title", key: "title" },
              { title: "展示价格", dataIndex: "price_label", key: "price_label" },
              { title: "积分数", dataIndex: "credits", key: "credits" },
              { title: "支付页面", dataIndex: "payment_url", key: "payment_url", ellipsis: true },
              {
                title: "推荐",
                dataIndex: "is_recommended",
                key: "is_recommended",
                render: (value: boolean) => (value ? "是" : "否")
              },
              { title: "状态", dataIndex: "status", key: "status", render: (value: string) => <StatusTag status={value} /> },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <>
                    <Button type="link" onClick={() => openModal(record)}>编辑</Button>
                    <Button type="link" onClick={async () => {
                      await updatePackageStatus(record.id, record.status === "visible" ? "hidden" : "visible");
                      message.success("状态已更新");
                      await loadData();
                    }}>{record.status === "visible" ? "隐藏" : "展示"}</Button>
                  </>
                )
              }
            ]}
          />
        </Card>
      </div>

      <Modal open={modalOpen} title={editing ? "编辑套餐" : "新增套餐"} okText="保存" confirmLoading={loading} onOk={handleSave} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="套餐名称" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="积分数" name="credits" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="展示价格" name="price_label" rules={[{ required: true }]}>
            <Input placeholder="¥100" />
          </Form.Item>
          <Form.Item label="支付提供方" name="payment_provider">
            <Input />
          </Form.Item>
          <Form.Item label="外链支付地址" name="payment_url" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="按钮文案" name="button_text">
            <Input />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select options={[{ value: "visible", label: "展示" }, { value: "hidden", label: "隐藏" }]} />
          </Form.Item>
          <Form.Item label="排序" name="sort_order">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="推荐" name="is_recommended" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
