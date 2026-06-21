import { Button, Card, List, Space, Typography } from "antd";
import { Download, PlayCircle } from "lucide-react";
import { tasks } from "@/mock/data";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCredits } from "@/utils/format";

export function TaskList() {
  return (
    <Card bordered={false} className="rm-page-section">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          最近生成记录
        </Typography.Title>
        <List
          itemLayout="vertical"
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              key={task.id}
              style={{ paddingInline: 0 }}
              actions={[
                <StatusTag key="status" status={task.status} />,
                <Typography.Text key="cost">{formatCredits(task.cost)}</Typography.Text>,
                task.status === "succeeded" ? (
                  <Space key="actions">
                    <Button icon={<PlayCircle size={16} />}>预览</Button>
                    <Button icon={<Download size={16} />}>下载</Button>
                  </Space>
                ) : null
              ]}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={task.thumbnail}
                    alt={task.modelName}
                    style={{ width: 112, height: 72, borderRadius: 16, objectFit: "cover" }}
                  />
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
                      {task.aspectRatio} · {task.resolution} · {task.duration} 秒 · {task.inputTypes.join(" / ")}
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
