import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  Modal,
  Input,
  message,
  Row,
  Select,
  Space,
  Tag,
  Typography
} from "antd";
import {
  CreditCard,
  ImageIcon,
  Info,
  Lock,
  Mic,
  Sparkles,
  WandSparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { ModelSelector } from "@/components/forms/ModelSelector";
import { PromptModeFields } from "@/components/forms/PromptModeFields";
import { ComparisonShowcase } from "@/components/ui/ComparisonShowcase";
import { MetricCard } from "@/components/ui/MetricCard";
import { TaskList } from "@/components/sections/TaskList";
import { SectionHeader } from "@/components/common/SectionHeader";
import {
  advancedPromptFields,
  comparisons,
  models,
  quickGuides,
  userProfile
} from "@/mock/data";
import { useAnimeEntrance } from "@/hooks/useAnimeEntrance";
import type { PromptMode } from "@/mock/types";
import { formatCredits } from "@/utils/format";

const { useBreakpoint } = Grid;

export function UserWorkspacePage() {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<PromptMode>("advanced");
  const [selectedModelId, setSelectedModelId] = useState(models[0].id);
  const [guideOpen, setGuideOpen] = useState(false);
  const entranceRef = useAnimeEntrance("[data-animate-item]");

  const selectedModel = useMemo(
    () => models.find((item) => item.id === selectedModelId) ?? models[0],
    [selectedModelId]
  );

  const estimatedCost = useMemo(() => {
    const resolution = form.getFieldValue("resolution") ?? selectedModel.resolutions[0];
    const duration = Number(form.getFieldValue("duration") ?? selectedModel.durations[0] ?? selectedModel.defaultDuration ?? 0);
    const base =
      selectedModel.billingType === "per_second"
        ? selectedModel.price * duration
        : selectedModel.price;

    return resolution === "720p" ? Math.round(base * 1.2) : base;
  }, [form, selectedModel]);

  const capabilityLabels = selectedModel.inputCapabilities.map((item) => item.label);
  const pricingText =
    selectedModel.billingType === "per_second"
      ? `${selectedModel.price} 积分 / 秒`
      : `${selectedModel.price} 积分 / 次`;

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
                      余额 {formatCredits(userProfile.credits)}
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
                initialValues={{
                  ratio: selectedModel.aspectRatios[0],
                  resolution: selectedModel.resolutions[0],
                  duration: selectedModel.defaultDuration ?? selectedModel.durations[0]
                }}
                onValuesChange={() => {
                  void estimatedCost;
                }}
                onFinish={() => message.success("任务已创建")}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24} xl={14}>
                    <Form.Item label="当前模型" style={{ marginBottom: 0 }}>
                      <Input value={selectedModel.name} readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={24} sm={12} xl={5}>
                    <Form.Item label="图像参考">
                      <Button block>上传图片</Button>
                    </Form.Item>
                  </Col>
                  <Col span={24} sm={12} xl={5}>
                    <Form.Item label="音频参考">
                      <Button block disabled={!selectedModel.inputCapabilities.some((item) => item.key === "audio")}>
                        上传音频
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>

                <PromptModeFields
                  mode={mode}
                  onModeChange={setMode}
                  fields={advancedPromptFields}
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
                      value={userProfile.credits.toString()}
                      icon={<CreditCard size={16} />}
                    />
                  </Col>
                  <Col span={24} md={8}>
                    <MetricCard
                      title="预计消耗"
                      value={estimatedCost.toString()}
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
                      value={userProfile.credits >= estimatedCost ? "可提交" : "积分不足"}
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
                      <Button size="large">保存草稿</Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        disabled={selectedModel.status !== "available" || userProfile.credits < estimatedCost}
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
            <ComparisonShowcase items={comparisons} />
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
                <Typography.Text className="rm-muted">{selectedModel.description}</Typography.Text>
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
                        提示词支持基础输入和高级字段组织，说明里不再分模块，直接按一次完整创作描述来理解就可以。
                      </Typography.Text>
                    </Space>
                    <Space align="start" size={10}>
                      <ImageIcon size={16} color="#2f6bff" style={{ marginTop: 2 }} />
                      <Typography.Text className="rm-muted">
                        图片参考按当前模型能力启用，用来稳定人物、商品或场景视觉。
                      </Typography.Text>
                    </Space>
                    <Space align="start" size={10}>
                      <Mic size={16} color="#7c3aed" style={{ marginTop: 2 }} />
                      <Typography.Text className="rm-muted">
                        音频参考仅在支持的模型下可用，适合卡点和节奏控制。
                      </Typography.Text>
                    </Space>
                  </Space>
                </div>
              </Space>
            </Card>
          </div>
        </div>

        <div data-animate-item>
          <TaskList />
        </div>
      </div>

      <Modal
        open={guideOpen}
        title="说明"
        footer={null}
        onCancel={() => setGuideOpen(false)}
      >
        <Typography.Paragraph style={{ margin: 0, lineHeight: 1.9 }}>
          {quickGuides[0].detail}
        </Typography.Paragraph>
      </Modal>
    </UserLayout>
  );
}
