import { Button, Card, Table } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { packages } from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";

export function AdminPackagesPage() {
  const ref = useAnimeEntrance("[data-animate-item]");

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="积分套餐"
            title="积分套餐"
            extra={<Button type="primary">新增套餐</Button>}
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            pagination={false}
            dataSource={packages}
            columns={[
              { title: "套餐名称", dataIndex: "title", key: "title" },
              { title: "展示价格", dataIndex: "priceLabel", key: "priceLabel" },
              { title: "积分数", dataIndex: "credits", key: "credits" },
              { title: "支付页面", dataIndex: "paymentProvider", key: "paymentProvider" },
              {
                title: "推荐",
                dataIndex: "recommended",
                key: "recommended",
                render: (value: boolean) => (value ? "是" : "否")
              }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
