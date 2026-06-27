import { Card, Table, message } from "antd";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SectionHeader } from "@/components/common/SectionHeader";
import { formatAmount, formatCredits, titleCaseStatus } from "@/utils/format";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useEffect, useState } from "react";
import type { TransactionRecord } from "@/types/domain";
import { listAdminTransactions } from "@/api/admin";
import { toTransaction } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";

export function AdminTransactionsPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listAdminTransactions(1, 100)
      .then((result) => setTransactions(result.list.map(toTransaction)))
      .catch((error) => message.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="rm-stack" ref={ref}>
        <Card bordered={false} className="rm-page-section" data-animate-item>
          <SectionHeader
            eyebrow="积分流水"
            title="积分流水"
          />
        </Card>

        <Card bordered={false} className="rm-page-section" data-animate-item>
          <Table
            rowKey="id"
            pagination={false}
            scroll={{ x: 960 }}
            loading={loading}
            dataSource={transactions}
            columns={[
              { title: "时间", dataIndex: "createdAt", key: "createdAt" },
              {
                title: "业务类型",
                dataIndex: "type",
                key: "type",
                render: (value: string) => titleCaseStatus(value)
              },
              {
                title: "变动积分",
                dataIndex: "amount",
                key: "amount",
                render: (value: number) => formatAmount(value)
              },
              {
                title: "变化后余额",
                dataIndex: "balanceAfter",
                key: "balanceAfter",
                render: (value: number) => formatCredits(value)
              },
              { title: "备注", dataIndex: "note", key: "note" }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
