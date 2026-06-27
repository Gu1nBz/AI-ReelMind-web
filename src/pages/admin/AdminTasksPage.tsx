import { Button, Card, Modal, Space, Table, Typography, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useState } from "react";
import type { GenerationTask } from "@/types/domain";
import { listAdminTasks, markTaskFailed, refundTask } from "@/api/admin";
import { listPublicModels } from "@/api/public";
import { toGenerationTask, toVideoModel } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";

export function AdminTasksPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskResult, modelResult] = await Promise.all([listAdminTasks(1, 100), listPublicModels()]);
      const modelMap = new Map(modelResult.list.map(toVideoModel).map((model) => [model.id, model.name]));
      setTasks(taskResult.list.map((item) => toGenerationTask(item, modelMap)));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="任务管理"
            title="任务管理"
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            scroll={{ x: 1220 }}
            loading={loading}
            dataSource={tasks}
            columns={[
              { title: "任务 ID", dataIndex: "id", key: "id" },
              { title: "模型", dataIndex: "modelName", key: "modelName" },
              { title: "提示词", dataIndex: "prompt", key: "prompt", width: 340, ellipsis: true },
              { title: "创建时间", dataIndex: "createdAt", key: "createdAt" },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (value: string) => <StatusTag status={value} />
              },
              { title: "积分消耗", dataIndex: "cost", key: "cost" },
              {
                title: "操作",
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button onClick={() => Modal.info({
                      title: "任务详情",
                      width: 720,
                      content: <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(record, null, 2)}</pre>
                    })}>查看详情</Button>
                    {["pending", "submitted", "processing"].includes(record.status) ? (
                      <Button danger onClick={async () => {
                        await markTaskFailed(record.id, "管理员手动标记失败");
                        message.success("任务已标记失败并按规则退款");
                        await loadData();
                      }}>标记失败</Button>
                    ) : null}
                    {record.status === "failed" || record.status === "timed_out" ? (
                      <Button onClick={async () => {
                        await refundTask(record.id, "管理员手动退款");
                        message.success("任务已退款");
                        await loadData();
                      }}>退款</Button>
                    ) : null}
                  </Space>
                )
              }
            ]}
            expandable={{
              expandedRowRender: (record) => (
                <Space direction="vertical">
                  <Typography.Text>
                    参数：{record.aspectRatio} / {record.resolution} / {record.duration} 秒
                  </Typography.Text>
                  {record.errorMessage ? <Typography.Text type="danger">{record.errorMessage}</Typography.Text> : null}
                </Space>
              )
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
