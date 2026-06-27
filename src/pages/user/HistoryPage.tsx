import { Card, Col, Input, message, Modal, Row, Select, Space } from "antd";
import { Search } from "lucide-react";
import { UserLayout } from "@/components/layout/UserLayout";
import { TaskList } from "@/components/sections/TaskList";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GenerationTask } from "@/types/domain";
import { getTaskDownload, getTaskPreview, listUserTasks } from "@/api/user";
import { listPublicModels } from "@/api/public";
import { toGenerationTask, toVideoModel } from "@/api/adapters";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "@/hooks/useAuth";

export function HistoryPage() {
  const ref = useAnimeEntrance("[data-animate-item]");
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("latest");
  const [previewUrl, setPreviewUrl] = useState("");
  const { user } = useAuth();

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const [taskResult, modelResult] = await Promise.all([listUserTasks(1, 100), listPublicModels()]);
      const modelMap = new Map(modelResult.list.map(toVideoModel).map((model) => [model.id, model.name]));
      setTasks(taskResult.list.map((item) => toGenerationTask(item, modelMap)));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    const result = tasks.filter((task) => {
      const matchesKeyword =
        !value ||
        task.id.toLowerCase().includes(value) ||
        task.prompt.toLowerCase().includes(value) ||
        task.modelName.toLowerCase().includes(value);
      const matchesStatus = status === "all" || task.status === status;
      return matchesKeyword && matchesStatus;
    });
    if (sort === "credit") {
      return [...result].sort((a, b) => b.cost - a.cost);
    }
    return result;
  }, [keyword, sort, status, tasks]);

  const handlePreview = async (task: GenerationTask) => {
    try {
      const result = await getTaskPreview(task.id);
      const url = result.preview_url || task.videoUrl;
      if (!url) {
        message.warning("当前任务暂无可预览视频");
        return;
      }
      setPreviewUrl(url);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleDownload = async (task: GenerationTask) => {
    try {
      const result = await getTaskDownload(task.id);
      const url = result.download_url || task.videoUrl;
      if (!url) {
        message.warning("当前任务暂无可下载视频");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

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
                <Input prefix={<Search size={16} />} placeholder="搜索任务 ID、提示词或模型名" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
              </Col>
              <Col span={12} md={7}>
                <Select
                  style={{ width: "100%" }}
                  value={status}
                  onChange={setStatus}
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
                  value={sort}
                  onChange={setSort}
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
          <TaskList
            tasks={filteredTasks}
            loading={loading}
            title="全部生成记录"
            onPreview={handlePreview}
            onDownload={handleDownload}
          />
        </div>
      </div>
      <Modal
        open={Boolean(previewUrl)}
        title="视频预览"
        footer={null}
        width={860}
        destroyOnClose
        onCancel={() => setPreviewUrl("")}
      >
        {previewUrl ? <video controls src={previewUrl} style={{ width: "100%", borderRadius: 12, background: "#000" }} /> : null}
      </Modal>
    </UserLayout>
  );
}
