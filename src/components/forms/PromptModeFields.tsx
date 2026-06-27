import { Col, Form, Input, Row, Select, Segmented, Space } from "antd";
import type { AdvancedPromptField, PromptMode } from "@/types/domain";

interface PromptModeFieldsProps {
  mode: PromptMode;
  onModeChange: (value: PromptMode) => void;
  fields: AdvancedPromptField[];
}

export function PromptModeFields({
  mode,
  onModeChange,
  fields
}: PromptModeFieldsProps) {
  return (
    <Space direction="vertical" size={18} style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Segmented
          options={[
            { label: "基础", value: "basic" },
            { label: "高级", value: "advanced" }
          ]}
          value={mode}
          onChange={(value) => onModeChange(value as PromptMode)}
        />
      </div>

      {mode === "basic" ? (
        <Form.Item
          label="提示词"
          name="prompt"
          required
          rules={[{ required: true, message: "请填写提示词" }]}
        >
          <Input.TextArea
            aria-label="视频提示词"
            rows={7}
            maxLength={600}
            placeholder="例如：雨夜街头，一位短发女导演在霓虹灯下回头看向镜头，风吹动衣摆，镜头缓慢推进。"
            showCount
          />
        </Form.Item>
      ) : (
        <Row gutter={[16, 16]}>
          {fields.map((field) => (
            <Col span={24} md={field.type === "textarea" ? 24 : 12} key={field.key}>
              <Form.Item
                label={field.label}
                name={["advanced", field.key]}
                required={field.required}
                rules={field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined}
                tooltip={field.description}
              >
                {field.type === "textarea" ? (
                  <Input.TextArea rows={4} placeholder={field.placeholder} />
                ) : field.type === "select" ? (
                  <Select
                    showSearch
                    allowClear
                    placeholder={field.placeholder}
                    options={(field.options ?? []).map((option) => ({
                      value: option,
                      label: option
                    }))}
                  />
                ) : (
                  <Input placeholder={field.placeholder} />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
      )}
    </Space>
  );
}
