import { Button, Card, Empty, Image, List, Space, Typography } from "antd";
import { Download, PlayCircle } from "lucide-react";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCredits } from "@/utils/format";
import type { GenerationTask } from "@/types/domain";

interface TaskListProps {
  tasks: GenerationTask[];
  loading?: boolean;
  title?: string;
  onPreview?: (task: GenerationTask) => void;
  onDownload?: (task: GenerationTask) => void;
}

export function TaskList({
  tasks,
  loading,
  title = "最近生成记录",
  onPreview,
  onDownload
}: TaskListProps) {
  return (
    <Card bordered={false} className="rm-page-section">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={tasks}
          locale={{ emptyText: <Empty description="暂无生成记录" /> }}
          renderItem={(task) => (
            <List.Item
              key={task.id}
              style={{ paddingInline: 0 }}
              actions={[
                <StatusTag key="status" status={task.status} />,
                <Typography.Text key="cost">{formatCredits(task.cost)}</Typography.Text>,
                task.status === "succeeded" ? (
                  <Space key="actions">
                    <Button icon={<PlayCircle size={16} />} onClick={() => onPreview?.(task)}>预览</Button>
                    <Button icon={<Download size={16} />} onClick={() => onDownload?.(task)}>下载</Button>
                  </Space>
                ) : null
              ]}
            >
              <List.Item.Meta
                avatar={
                  task.thumbnail ? (
                    <Image
                      src={task.thumbnail}
                      alt={task.modelName}
                      preview={false}
                      width={112}
                      height={72}
                      style={{ borderRadius: 16, objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: 112, height: 72, borderRadius: 16, background: "rgba(17,24,39,0.08)" }} />
                  )
                }
                title={
                  <Space wrap>
                    <Typography.Text strong>{task.modelName}</Typography.Text>
                    <Typography.Text type="secondary">{task.createdAt}</Typography.Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Text>{task.prompt}</Typography.Text>
                    <Typography.Text type="secondary">
                      {task.taskType === "image"
                        ? `${task.aspectRatio} · ${task.resolution} · ${task.imageCount ?? 1} 张 · ${task.inputTypes.join(" / ")}`
                        : `${task.aspectRatio} · ${task.resolution} · ${task.duration ?? 0} 秒 · ${task.inputTypes.join(" / ")}`}
                    </Typography.Text>
                    {task.errorMessage ? (
                      <Typography.Text type="danger">{task.errorMessage}</Typography.Text>
                    ) : null}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
