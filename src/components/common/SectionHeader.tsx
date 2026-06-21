import { Space, Typography } from "antd";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  extra?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  extra
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap"
      }}
    >
      <Space direction="vertical" size={4}>
        {eyebrow ? <span className="rm-badge">{eyebrow}</span> : null}
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description ? (
          <Typography.Paragraph className="rm-muted" style={{ margin: 0 }}>
            {description}
          </Typography.Paragraph>
        ) : null}
      </Space>
      {extra}
    </div>
  );
}
