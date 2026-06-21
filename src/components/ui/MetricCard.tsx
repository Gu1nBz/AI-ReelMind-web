import { Card, Space, Typography } from "antd";

interface MetricCardProps {
  title: string;
  value: string;
  delta?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, delta, icon }: MetricCardProps) {
  return (
    <Card bordered={false} className="rm-card-hover">
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Typography.Text className="rm-muted">{title}</Typography.Text>
          <span className="rm-badge">{icon}</span>
        </Space>
        <Typography.Title level={2} style={{ margin: 0 }}>
          {value}
        </Typography.Title>
        {delta ? <Typography.Text type="secondary">{delta}</Typography.Text> : null}
      </Space>
    </Card>
  );
}
