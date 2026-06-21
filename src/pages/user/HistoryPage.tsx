import { Card, Col, Input, Row, Select, Space } from "antd";
import { Search } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { TaskList } from "@/components/sections/TaskList";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function HistoryPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <SectionHeader
              eyebrow="任务记录"
              title="生成历史"
            />
            <Row gutter={[16, 16]}>
              <Col span={24} md={10}>
                <Input prefix={<Search size={16} />} placeholder="搜索任务 ID、提示词或模型名" />
              </Col>
              <Col span={12} md={7}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue="all"
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "processing", label: "生成中" },
                    { value: "succeeded", label: "已成功" },
                    { value: "failed", label: "生成失败" },
                    { value: "refunded", label: "已退款" }
                  ]}
                />
              </Col>
              <Col span={12} md={7}>
                <Select
                  style={{ width: "100%" }}
                  defaultValue="latest"
                  options={[
                    { value: "latest", label: "最近创建" },
                    { value: "credit", label: "积分消耗最多" }
                  ]}
                />
              </Col>
            </Row>
          </Space>
        </Card>

        <div data-animate-item>
          <TaskList />
        </div>
      </div>
    </UserLayout>
  );
}
