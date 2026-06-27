import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  Modal,
  Input,
  message,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload
} from "antd";
import {
  CreditCard,
  ImageIcon,
  Info,
  Lock,
  Sparkles,
  Video,
  WandSparkles
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { ModelSelector } from "@/components/forms/ModelSelector";
import { PromptModeFields } from "@/components/forms/PromptModeFields";
import { MetricCard } from "@/components/ui/MetricCard";
import { TaskList } from "@/components/sections/TaskList";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import type { AdvancedPromptField, GenerationTask, PromptMode, VideoModel } from "@/types/domain";
import { formatCredits } from "@/utils/format";
import { estimateGeneration, listPublicModels, listPublicPromptFields } from "@/api/public";
import { assetToInputAsset, toGenerationTask, toPromptField, toVideoModel } from "@/api/adapters";
import { createUserTask, getTaskDownload, getTaskPreview, listUserTasks, uploadAsset } from "@/api/user";
import type { ApiUploadedAsset } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/errors";

const { useBreakpoint } = Grid;

const WORKSPACE_GUIDE =
  "先选择模型，再按当前需求一次性填写提示词、参考素材和生成参数即可；系统会根据所选模型自动显示真实可用输入项、通过后端接口试算预计积分，并在提交成功后立即创建任务，失败任务会自动退款。";

const ACTIVE_TASK_STATUSES = new Set(["pending", "submitted", "processing"]);

function getModelDefaultValues(model: VideoModel) {
  return {
    ratio: model.aspectRatios[0],
    resolution: model.resolutions[0],
    duration: model.defaultDuration ?? model.durations[0]
  };
}

export function UserWorkspacePage() {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<PromptMode>("advanced");
  const [models, setModels] = useState<VideoModel[]>([]);
  const [promptFields, setPromptFields] = useState<AdvancedPromptField[]>([]);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimateCost, setEstimateCost] = useState<number | null>(null);
  const [assets, setAssets] = useState<ApiUploadedAsset[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const entranceRef = useAnimeEntrance("[data-animate-item]");
  const { user, refreshUser } = useAuth();

  const selectedModel = useMemo<VideoModel | undefined>(
    () => models.find((item) => item.id === selectedModelId) ?? models[0],
    [models, selectedModelId]
  );
  const watchedResolution = Form.useWatch("resolution", form);
  const watchedDuration = Form.useWatch("duration", form);
  const watchedPrompt = Form.useWatch("prompt", form);
  const watchedAdvanced = Form.useWatch("advanced", form);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [modelResult, fieldResult] = await Promise.all([
        listPublicModels(),
        listPublicPromptFields()
      ]);
      const nextModels = modelResult.list.map(toVideoModel);
      const nextFields = fieldResult.list.map(toPromptField);
      setModels(nextModels);
      setSelectedModelId((current) => nextModels.some((item) => item.id === current) ? current : nextModels[0]?.id ?? "");
      setPromptFields(nextFields);
    } catch (error) {
      setModels([]);
      setPromptFields([]);
      message.warning(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!user) {
      setTasks([]);
      return;
    }
    try {
      const result = await listUserTasks(1, 8);
      const modelMap = new Map(models.map((item) => [item.id, item.name]));
      setTasks(result.list.map((item) => toGenerationTask(item, modelMap)));
    } catch (error) {
      if (!options.silent) {
        message.warning(getErrorMessage(error));
      }
    }
  }, [models, user]);

  useEffect(() => {
    void loadWorkspace();
    void refreshUser();
  }, [loadWorkspace, refreshUser]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const hasActiveTask = tasks.some((task) => ACTIVE_TASK_STATUSES.has(task.status));

  useEffect(() => {
    if (!user || !hasActiveTask) {
      return;
    }
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadTasks({ silent: true });
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [hasActiveTask, loadTasks, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadTasks({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadTasks]);

  useEffect(() => {
    if (selectedModel) {
      form.setFieldsValue(getModelDefaultValues(selectedModel));
      setAssets([]);
      setEstimateCost(null);
    }
  }, [form, selectedModel]);

  const estimatedCost = estimateCost ?? 0;
  const currentCredits = user?.credit_balance ?? 0;
  const capabilityLabels = selectedModel?.inputCapabilities.map((item) => item.label) ?? [];
  const pricingText = selectedModel
    ? selectedModel.billingType === "per_second"
      ? `${selectedModel.price} 积分 / 秒`
      : `${selectedModel.price} 积分 / 次`
    : "";
  const canSubmit =
    selectedModel !== undefined &&
    selectedModel.status === "available" &&
    Boolean(user) &&
    estimateCost !== null &&
    currentCredits >= estimatedCost &&
    estimatedCost > 0;

  const inputTypes = useMemo(() => {
    const types = new Set<string>(["text"]);
    assets.forEach((asset) => types.add(asset.asset_type));
    return Array.from(types);
  }, [assets]);

  useEffect(() => {
    if (!selectedModel) {
      return;
    }
    const duration = Number(watchedDuration ?? selectedModel.defaultDuration ?? selectedModel.durations[0] ?? 0);
    const resolution = watchedResolution ?? selectedModel.resolutions[0];
    const ratio = form.getFieldValue("ratio") ?? selectedModel.aspectRatios[0];
    if (!duration || !resolution || !ratio) {
      return;
    }
    setEstimateCost(null);
    const timer = window.setTimeout(() => {
      estimateGeneration({
        model_id: selectedModel.id,
        prompt_mode: mode,
        input_types: inputTypes,
        aspect_ratio: ratio,
        resolution,
        duration_seconds: duration
      })
        .then((result) => setEstimateCost(result.credit_cost))
        .catch(() => setEstimateCost(null));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [form, inputTypes, mode, selectedModel, watchedDuration, watchedResolution]);

  const handleUpload = async (file: File, assetType: "image" | "video" | "audio") => {
    if (!user) {
      Modal.confirm({
        title: "请先登录",
        content: "登录后可以上传参考素材并提交生成任务。",
        okText: "去登录",
        cancelText: "取消",
        onOk: () => {
          window.location.href = "/auth";
        }
      });
      return Upload.LIST_IGNORE;
    }
    try {
      const uploaded = await uploadAsset(file, assetType);
      setAssets((prev) => [...prev.filter((item) => item.asset_type !== assetType), uploaded]);
      message.success("素材已上传");
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    return Upload.LIST_IGNORE;
  };

  const buildPrompt = (values: { prompt?: string; advanced?: Record<string, string> }) => {
    if (mode === "basic") {
      return values.prompt?.trim() ?? "";
    }
    const advanced = values.advanced ?? {};
    return promptFields
      .map((field) => {
        const value = advanced[field.key];
        return value ? `${field.label}：${value}` : "";
      })
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = async (values: { prompt?: string; advanced?: Record<string, string>; ratio: string; resolution: string; duration: number }) => {
    if (!user) {
      Modal.confirm({
        title: "请先登录",
        content: "登录后才能提交生成任务。",
        okText: "去登录",
        cancelText: "取消",
        onOk: () => {
          window.location.href = "/auth";
        }
      });
      return;
    }
    if (!selectedModel) {
      return;
    }
    const prompt = buildPrompt(values);
    if (!prompt) {
      message.warning("请填写提示词");
      return;
    }
    setSubmitting(true);
    try {
      await createUserTask({
        model_id: selectedModel.id,
        prompt_mode: mode,
        prompt,
        advanced_prompt_json: values.advanced ?? {},
        input_types: inputTypes,
        input_assets: assets.map(assetToInputAsset),
        aspect_ratio: values.ratio,
        resolution: values.resolution,
        duration_seconds: Number(values.duration)
      });
      message.success("任务已创建");
      setAssets([]);
      await Promise.all([refreshUser(), loadTasks()]);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (task: GenerationTask) => {
    try {
      const result = await getTaskPreview(task.id);
      const url = result.preview_url || task.videoUrl;
      if (!url) {
        message.warning("当前任务暂无可预览视频");
        return;
      }
      setPreviewUrl(url);
      setPreviewOpen(true);
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

  if (!selectedModel) {
    return (
      <UserLayout>
        <div className="rm-page-shell">
          <Card bordered={false} className="rm-page-section">
            <Empty description={loading ? "正在加载真实模型配置" : "暂无可用模型，请稍后再试"} />
          </Card>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="rm-page-shell rm-stack" ref={entranceRef}>
        <div className="rm-grid-2" data-animate-item>
          <Card bordered={false} className="rm-page-section" style={{ padding: 10 }}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <SectionHeader
                eyebrow="工作台"
                title="直接开始生成视频"
                extra={
                  <Space>
                    <Button
                      icon={<Info size={16} />}
                      aria-label="查看说明"
                      onClick={() => setGuideOpen(true)}
                    />
                    <Button type="primary" icon={<CreditCard size={16} />}>
                      {user ? `余额 ${formatCredits(currentCredits)}` : "未登录"}
                    </Button>
                  </Space>
                }
              />

              <ModelSelector
                models={models}
                selectedId={selectedModelId}
                onSelect={setSelectedModelId}
              />

              <Form
                layout="vertical"
                form={form}
                initialValues={getModelDefaultValues(selectedModel)}
                onFinish={handleSubmit}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24} xl={14}>
                    <Form.Item label="当前模型" style={{ marginBottom: 0 }}>
                      <Input value={selectedModel.name} readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={24} sm={12} xl={5}>
                    <Form.Item label="图像参考">
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleUpload(file, "image")}
                        disabled={!selectedModel.inputCapabilities.some((item) => item.key === "image")}
                      >
                        <Button block disabled={!selectedModel.inputCapabilities.some((item) => item.key === "image")}>
                          {assets.some((item) => item.asset_type === "image") ? "已上传图片" : "上传图片"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={24} sm={12} xl={5}>
                    <Form.Item label="音频参考">
                      <Upload
                        accept="audio/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleUpload(file, "audio")}
                        disabled={!selectedModel.inputCapabilities.some((item) => item.key === "audio")}
                      >
                        <Button block disabled={!selectedModel.inputCapabilities.some((item) => item.key === "audio")}>
                          {assets.some((item) => item.asset_type === "audio") ? "已上传音频" : "上传音频"}
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>

                <PromptModeFields
                  mode={mode}
                  onModeChange={setMode}
                  fields={promptFields}
                />

                <Divider />

                <Row gutter={[16, 0]}>
                  <Col span={24} md={8}>
                    <Form.Item label="视频比例" name="ratio">
                      <Select
                        options={selectedModel.aspectRatios.map((item) => ({
                          value: item,
                          label: item
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item label="清晰度" name="resolution">
                      <Select
                        options={selectedModel.resolutions.map((item) => ({
                          value: item,
                          label: item
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item label="时长" name="duration">
                      <Select
                        disabled={selectedModel.billingType === "per_generation"}
                        options={(selectedModel.durations.length
                          ? selectedModel.durations
                          : [selectedModel.defaultDuration ?? 6]
                        ).map((item) => ({
                          value: item,
                          label: `${item} 秒`
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24} md={8}>
                    <MetricCard
                      title="当前积分"
                      value={user ? currentCredits.toString() : "未登录"}
                      icon={<CreditCard size={16} />}
                    />
                  </Col>
                  <Col span={24} md={8}>
                    <MetricCard
                      title="预计消耗"
                      value={estimateCost === null ? "待试算" : estimatedCost.toString()}
                      delta={
                        selectedModel.billingType === "per_second"
                          ? `${selectedModel.price} 积分 / 秒`
                          : `${selectedModel.price} 积分 / 次`
                      }
                      icon={<WandSparkles size={16} />}
                    />
                  </Col>
                  <Col span={24} md={8}>
                    <MetricCard
                      title="状态"
                      value={!user ? "需登录" : selectedModel.status !== "available" ? "模型不可用" : estimateCost === null ? "等待试算" : currentCredits >= estimatedCost ? "可提交" : "积分不足"}
                      icon={<Lock size={16} />}
                    />
                  </Col>
                </Row>

                <div
                  className="rm-page-section"
                  style={{
                    padding: 18,
                    background: "rgba(255,255,255,0.72)",
                    marginTop: 12
                  }}
                >
                  <Space
                    direction={screens.md ? "horizontal" : "vertical"}
                    size={18}
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Typography.Text strong>提交后立即扣费</Typography.Text>
                    <Space wrap>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={submitting}
                        disabled={!canSubmit}
                      >
                        立即生成
                      </Button>
                    </Space>
                  </Space>
                </div>
              </Form>
            </Space>
          </Card>

          <div className="rm-stack">
            <Card bordered={false} className="rm-page-section" style={{ padding: 18 }}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  当前模型信息
                </Typography.Title>
                <Space wrap size={[8, 8]}>
                  <Tag color="orange">{selectedModel.provider}</Tag>
                  <Tag>{selectedModel.status === "available" ? "可用" : selectedModel.status === "maintenance" ? "维护中" : "即将推出"}</Tag>
                  <Tag color="blue">{selectedModel.billingType === "per_second" ? "按秒计费" : "按次计费"}</Tag>
                </Space>
                <Typography.Text className="rm-muted">{selectedModel.description || "模型参数由后台配置，按当前可用能力提交。"}</Typography.Text>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div className="rm-side-panel">
                      <Typography.Text className="rm-muted">输入能力</Typography.Text>
                      <Space wrap size={[8, 8]} style={{ marginTop: 10 }}>
                        {capabilityLabels.map((label) => (
                          <span key={label} className="rm-badge">
                            {label}
                          </span>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="rm-side-panel">
                      <Typography.Text className="rm-muted">计费规则</Typography.Text>
                      <Typography.Title level={5} style={{ margin: "10px 0 0" }}>
                        {pricingText}
                      </Typography.Title>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="rm-side-panel">
                      <Typography.Text className="rm-muted">比例</Typography.Text>
                      <Typography.Title level={5} style={{ margin: "10px 0 0" }}>
                        {selectedModel.aspectRatios.join(" / ")}
                      </Typography.Title>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="rm-side-panel">
                      <Typography.Text className="rm-muted">清晰度与时长</Typography.Text>
                      <Typography.Title level={5} style={{ margin: "10px 0 0" }}>
                        {selectedModel.resolutions.join(" / ")} · {(
                          selectedModel.durations.length
                            ? selectedModel.durations
                            : [selectedModel.defaultDuration ?? 6]
                        ).join(" / ")} 秒
                      </Typography.Title>
                    </div>
                  </Col>
                </Row>
                <div className="rm-side-panel" style={{ padding: 16 }}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Typography.Text strong>本次提交内容</Typography.Text>
                    <Space align="start" size={10}>
                      <Sparkles size={16} color="#ff6a1a" style={{ marginTop: 2 }} />
                      <Typography.Text className="rm-muted">
                        {mode === "basic" ? (watchedPrompt || "填写一段完整提示词后即可提交。") : "高级字段会合并为一段完整提示词提交。"}
                      </Typography.Text>
                    </Space>
                    <Space align="start" size={10}>
                      <ImageIcon size={16} color="#2f6bff" style={{ marginTop: 2 }} />
                      <Typography.Text className="rm-muted">
                        {assets.length ? `已上传 ${assets.length} 个参考素材：${assets.map((item) => item.file_name).join("、")}` : "按当前模型能力上传参考素材。"}
                      </Typography.Text>
                    </Space>
                    <Space align="start" size={10}>
                      <Video size={16} color="#7c3aed" style={{ marginTop: 2 }} />
                      <Typography.Text className="rm-muted">
                        {watchedAdvanced ? "提交前会按真实接口试算积分。" : "生成结果只在点击预览时加载视频。"}
                      </Typography.Text>
                    </Space>
                  </Space>
                </div>
              </Space>
            </Card>
          </div>
        </div>

        <div data-animate-item>
          <TaskList tasks={tasks} loading={loading} onPreview={handlePreview} onDownload={handleDownload} />
        </div>
      </div>

      <Modal
        open={guideOpen}
        title="说明"
        footer={null}
        onCancel={() => setGuideOpen(false)}
      >
        <Typography.Paragraph style={{ margin: 0, lineHeight: 1.9 }}>
          {WORKSPACE_GUIDE}
        </Typography.Paragraph>
      </Modal>

      <Modal
        open={previewOpen}
        title="视频预览"
        footer={null}
        width={860}
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewUrl("");
        }}
        destroyOnClose
      >
        {previewUrl ? (
          <video controls src={previewUrl} style={{ width: "100%", borderRadius: 12, background: "#000" }} />
        ) : null}
      </Modal>
    </UserLayout>
  );
}
