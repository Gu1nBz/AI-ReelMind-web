# ReelMind 图片生成接入 PRD

状态：稳定草案，已确认第一版图片上游、分辨率和初始计费  
日期：2026-06-30  
适用范围：ReelMind 现有视频生成平台新增图片生成能力

## 1. 背景

当前 ReelMind 已完成视频生成 MVP 闭环：

- 用户登录 / 验证码登录 / 自动注册
- 积分余额、兑换码充值、积分流水
- 视频模型展示、参数试算、创建任务
- 异步任务、上游提交、轮询、失败退款、结果回存 MinIO
- 用户历史、预览、下载
- 后台模型、供应商、任务、兑换码、用户、流水管理

历史 PRD 明确排除了图片生成。因此本次需求属于产品边界升级：从「视频生成平台」扩展为「AI 视觉生成平台」，第一阶段新增图片生成，但不推翻现有视频链路。

### 1.1 已确认决策

以下决策已按当前沟通固化，后续开工默认遵守：

1. 不重构现有视频表。  
   保留 `video_models` / `video_tasks` 及现有视频生成链路。

2. 图片生成新增独立数据表。  
   新增 `image_models` / `image_tasks`，避免影响已上线视频业务。

3. 图片生成不作为独立主入口。  
   不新增独立一级导航，用户仍进入现有「工作室」，通过 Tab 切换「视频生成 / 图片生成」。

4. 截图只参考结构。  
   只参考顶部能力切换、左侧表单、右侧示例 / 预览、底部记录这类大体布局，不照搬竞品具体功能、供应商、营销文案或 UI 细节。

5. 积分、兑换码、登录、MinIO、失败退款体系全部复用现有平台能力。

6. 创建任务后不允许用户取消。  
   只有失败、超时或后台确认失败时才退款。

7. 图片生成只做工作室内能力切换。  
   URL 可以用 query 保持当前 Tab 状态，但第一版不做独立图片生成产品页，也不在主导航新增图片生成入口。

8. 文生图是第一版必做能力。  
   图生图 / 参考图也要做真实链路。用户只负责上传图片，后端负责接收、转格式、存储，并把可被上游访问的公网 URL 传给上游，不做 mock。

9. 第一版图片上游使用 Right Codes Draw。  
   基础地址为 `https://www.right.codes/draw`，接口为 `POST /v1/images/generations`。

10. 图片模型费用由后台按模型维度配置。  
    不在前端写死价格，用户端只展示后端试算结果。

## 2. 一句话定位

在现有积分制和异步任务体系上，新增可由后台配置模型和计费规则的 AI 图片生成能力。

## 3. 产品目标

1. 用户可以使用积分生成图片。
2. 图片生成复用现有登录、积分、兑换码、任务历史和 MinIO 存储体系。
3. 后台可以独立管理图片生成模型、供应商、价格和启停状态。
4. 图片生成失败必须自动退款。
5. 图片结果必须回存 MinIO，前端展示平台自己的结果 URL。
6. 第一版只做图片生成闭环，不做社区、图库广场、真实支付和复杂编辑器。

## 4. MVP 范围

### 4.1 用户端

MVP 需要支持：

- 在工作室切换到图片生成 Tab
- 查看可用图片模型
- 输入提示词
- 选择图片比例
- 选择图片尺寸或清晰度
- 选择生成张数
- 当模型支持时上传参考图
- 查看预计积分消耗
- 提交图片生成任务
- 查看图片生成历史
- 点击缩略图查看大图
- 下载生成图片
- 失败任务自动退款并展示失败原因

### 4.2 管理后台

MVP 需要支持：

- 图片模型管理
- 图片模型启用 / 维护 / 即将开放 / 禁用
- 图片模型计费配置
- 图片模型输入能力配置
- 图片任务列表
- 图片任务详情
- 图片任务失败标记
- 图片任务退款
- 复用现有供应商体系，新增图片模型绑定和图片 adapter 能力
- 后台概览增加图片任务统计

### 4.3 明确不做

第一版不做：

- 图片编辑器
- 局部重绘 / 蒙版编辑
- 多轮图片编辑
- 图片广场 / 社区
- 用户公开作品
- 收藏夹
- 团队空间
- 图片风格市场
- 图片自动审核后台
- 支付订单闭环
- 用户主动取消任务
- 用户删除任务
- 用户删除 MinIO 文件

### 4.4 第一版能力边界表

| 能力 | 第一版处理方式 | 说明 |
| --- | --- | --- |
| 文生图 | 必做 | 图片生成的最小闭环 |
| 图生图 | 必做，按模型能力打开 | 用户上传图片，后端标准化后传给上游 |
| 多参考图 | 必做可配置 | `image` 字段统一按 URL 数组传给上游，数量由后台模型配置限制，平台第一版最多 10 张 |
| 负向提示词 | 预留 | Right Codes Draw 当前参数未明确提供，第一版不默认展示 |
| seed | 预留 | 只有模型能力声明支持时展示 |
| style / quality | 预留 | 只有模型能力声明支持时展示 |
| 同步上游 | 支持 | 后端 adapter 统一包装成平台异步任务 |
| 异步上游 | 支持 | worker 提交和轮询 |
| 用户取消任务 | 不做 | 创建成功后不能取消 |
| 失败退款 | 必做 | 失败、超时、后台确认失败都必须退款 |

## 5. 用户角色

沿用现有角色：

- `guest`：可以浏览工作室图片生成 Tab 和图片模型，不能上传、试算、提交。
- `user`：可以试算、提交任务、查看自己的图片历史；当模型支持参考图时，可以上传参考图。
- `admin`：可以管理图片模型、供应商、任务和流水。

## 6. 用户端页面调整

### 6.1 工作室入口

本次不新增独立一级导航入口作为主方案，也不把 `/` 从视频生成直接改成图片生成。用户仍然进入现有「工作室」，在工作室内部通过 Tab 切换生成类型。

工作室顶部增加生成类型 Tab：

| Tab | 说明 |
| --- | --- |
| 视频生成 | 默认保留现有视频生成能力和表单 |
| 图片生成 | 新增图片生成表单、模型、参数和结果列表 |

路由建议：

| 路径 | 说明 |
| --- | --- |
| `/` | 现有工作室，默认打开视频生成 Tab |
| `/?type=image` | 工作室打开图片生成 Tab，可选，用于分享或内部跳转 |
| `/history` | 历史页增加视频 / 图片筛选或 Tab |
| `/pricing` | 复用积分套餐 |
| `/redeem` | 复用兑换码 |
| `/profile` | 复用用户信息和积分流水 |

第一版推荐只使用 `/?type=image` 表示当前 Tab，避免新增 `/workspace/image` 后被误解成独立产品页。  
如果后续 SEO、分享链接或运营入口确实需要更清晰路径，再评估是否增加别名路由，但页面组件仍复用同一个工作室。

### 6.2 图片生成工作台

图片生成放在工作室图片 Tab 内。参考用户提供的竞品截图时，只参考大概结构，不参考具体功能或营销内容。

可参考的结构：

1. 顶部生成类型切换：视频生成 / 图片生成。
2. 左侧主表单：模型、提示词、比例、尺寸、张数；模型支持时再展示参考图、高级参数。
3. 右侧结果预览 / 最近任务区域，用来降低工作台空白感。
4. 底部最近生成记录。

不参考、不实现的竞品内容：

- AI 聊天入口
- API 菜单
- 状态页
- 注册营销按钮
- 包月促销横幅
- 示例轮播里的具体图片和文案
- 供应商横向营销标签
- 免费模型标签

ReelMind 第一版图片生成仍按现有产品风格实现：专业、清晰、操作优先，保持和当前视频工作台一致的卡片、颜色、字体、按钮和动效。

核心表单字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `model_id` | 是 | 图片模型 ID |
| `prompt` | 是 | 图片提示词 |
| `negative_prompt` | 否 | 负向提示词，仅模型支持时展示 |
| `aspect_ratio` | 是 | 例如 `1:1`、`16:9`、`9:16`、`4:3`、`3:4` |
| `resolution` | 是 | 支持 `1024x1024`、`1536x1024`、`1024x1536`、`3840x2160`、`2160x3840`、`2880x2880`、`auto` |
| `n` | 是 | 生成张数，第一版默认 1 张；后台可按模型配置，平台硬上限 10 张 |
| `input_assets` | 否 | 用户上传的参考图，后端标准化处理后传上游，仅模型支持时展示 |
| `seed` | 否 | 随机种子，仅模型支持时展示 |
| `style` | 否 | 风格参数，仅模型支持时展示 |
| `quality` | 否 | 质量参数，仅模型支持时展示 |

图片生成 Tab 的基础交互顺序：

1. 页面加载公共图片模型。
2. 默认选中第一个 `available` 模型。
3. 根据模型能力展示参数控件。
4. 用户修改模型、比例、尺寸、张数或参考图后重新试算积分。
5. 未登录用户点击上传、试算或生成时触发登录引导。
6. 登录用户提交后立即创建任务，最近任务区域开始轮询。
7. 成功后列表展示缩略图，点击后打开大图预览。
8. 失败、超时或后台确认失败后展示失败原因，积分由后端自动退款。

### 6.3 历史页面

建议历史页新增类型筛选：

- 全部
- 视频
- 图片

图片任务列表字段：

- 缩略图
- 模型
- 提示词
- 比例 / 尺寸 / 张数
- 消耗积分
- 状态
- 创建时间
- 失败原因
- 预览
- 下载

图片预览不需要像视频一样延迟加载播放器，但需要避免一次性加载大图。列表只展示缩略图，点击后打开大图预览。

## 7. 后台页面调整

### 7.1 模型管理

建议后台模型管理增加类型：

- 视频模型
- 图片模型

图片模型字段：

| 字段 | 说明 |
| --- | --- |
| `name` | 展示名 |
| `model_key` | 平台内部模型标识 |
| `upstream_model_id` | 上游模型 ID |
| `provider_id` | 供应商 |
| `status` | available / maintenance / coming_soon / disabled |
| `is_visible` | 用户端是否可见 |
| `billing_type` | per_generation / per_image |
| `price_per_generation` | 按次计费 |
| `price_per_image` | 按张计费 |
| `aspect_ratio_options` | 支持比例 |
| `supported_resolutions` | 支持尺寸 |
| `max_n` | 最大生成张数 |
| `supported_input_types` | text / image |
| `supported_input_combinations` | 允许的输入组合，例如 `[["text"], ["text", "image"]]` |
| `capabilities` | negative_prompt / seed / style / quality 等能力开关 |
| `input_asset_rules` | 参考图数量、大小、类型限制 |
| `response_format` | 第一版固定 `url` |
| `upstream_default_params` | 上游默认参数 |
| `upstream_param_mapping` | 上游字段映射 |
| `sort_order` | 排序 |

`capabilities` 示例：

```json
{
  "negative_prompt": false,
  "seed": false,
  "style": false,
  "quality": false,
  "image_to_image": true,
  "multi_reference_image": true
}
```

`input_asset_rules` 示例：

```json
{
  "max_images": 10,
  "max_size_mb": 20,
  "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"]
}
```

### 7.2 任务管理

后台任务管理建议增加类型筛选：

- 视频任务
- 图片任务

图片任务详情需要展示：

- 用户
- 模型
- 提示词
- 参数快照
- 扣费金额
- 上游供应商
- 上游任务 ID
- 上游请求快照
- 上游响应快照
- 结果图片 URL
- MinIO bucket / object key
- 状态流转时间
- 失败原因
- 退款状态

## 8. 业务规则

### 8.1 任务状态

图片任务复用现有任务状态语义：

- `pending`：平台任务已创建，等待 worker 提交
- `submitted`：已提交上游
- `processing`：上游处理中
- `succeeded`：成功
- `failed`：失败
- `refunding`：退款处理中，预留状态
- `timed_out`：超时
- `refunded`：已退款

图片任务状态需要和现有视频任务枚举保持一致，避免前端、后台筛选和 worker 状态机出现两套文案。第一版如果退款是同步事务完成，可以很少进入 `refunding`，但数据库和接口仍保留该状态。

### 8.2 扣费规则

第一版建议支持两种计费：

1. `per_generation`  
   每次提交固定扣费，不随图片张数变化。

2. `per_image`  
   按生成张数扣费，公式：

```text
credit_cost = price_per_image * n * resolution_multiplier * input_multiplier
```

第一版为了简单，可以先使用：

```text
credit_cost = price_per_image * n
```

高级规则后续补：

- 高清尺寸加价
- 参考图加价
- 特定模型加价
- 加急通道加价

### 8.3 扣费与退款

沿用视频任务规则：

- 创建任务和扣积分必须在同一数据库事务内完成。
- 一旦任务创建成功，不支持用户取消。
- 只有失败、超时、后台确认失败时才退款。
- 退款必须幂等。
- 失败退款需要写入积分流水。

### 8.4 文件存储

图片生成结果必须回存 MinIO。

建议对象 key：

```text
results/{user_id}/images/{task_id}/{index}.png
results/{user_id}/images/{task_id}/{index}.webp
results/{user_id}/images/{task_id}/thumb-{index}.webp
```

第一版至少需要：

- 原图 URL
- 缩略图 URL

如果上游只返回一个图片 URL，后端必须下载并回存 MinIO。前端不长期依赖上游临时 URL。

### 8.5 参考图上传与标准化

参考图必须走平台后端处理，不能让用户直接填写外链，也不能由前端直接把本地文件传给上游。

用户侧规则：

- 用户只需要上传本地图片文件。
- 第一版明确支持 `jpg`、`jpeg`、`png`、`webp`、`heic`、`avif`。
- 不在白名单内的格式直接提示不支持。
- 单张参考图最大 `20MB`。
- 单次任务最多上传 `10` 张参考图。
- 前端负责选择文件、展示预览、上传前压缩和调用平台上传接口。
- 前端上传前应尽量压缩图片，减少用户上传流量和服务端入口压力。
- 前端压缩不能作为安全边界，后端仍必须重新校验和标准化。
- 前端不关心上游 URL 生成和存储细节。
- 前端不保存 Right Codes API Key，也不直接请求 Right Codes。

后端处理规则：

1. 接收用户上传文件。
2. 校验文件大小、MIME、扩展名和真实图片头。
3. 解码图片，第一版支持 `jpg`、`jpeg`、`png`、`webp`、`heic`、`avif`。
4. 按平台规则转成上游稳定接受的标准格式，第一版建议转成 `jpeg` 或 `png`。
5. 服务端必须执行二次压缩和等比缩放兜底，避免上游拒绝、传输过慢或用户绕过前端压缩。
6. 上传标准化后的参考图到 MinIO assets bucket。
7. 生成浏览器和 Right Codes 上游都能访问的公网 URL。
8. 创建图片任务时，传给 Right Codes 的 `image` 字段一律使用标准化图片的公网 URL 数组。

对象 key 建议：

```text
assets/{user_id}/images/{yyyy}/{mm}/{dd}/{asset_id}/original
assets/{user_id}/images/{yyyy}/{mm}/{dd}/{asset_id}/normalized.jpg
assets/{user_id}/images/{yyyy}/{mm}/{dd}/{asset_id}/thumb.webp
```

资产记录至少保存：

```text
id
user_id
asset_type = image
original_filename
original_mime
normalized_mime
bucket
object_key_original
object_key_normalized
public_url
width
height
size_bytes
created_at
```

生产环境必须保证：

- `MINIO_PUBLIC_BASE_URL=https://reelmind.ylcmx.xyz/files`。
- `https://reelmind.ylcmx.xyz/files` 由 Nginx 反代到 MinIO results/assets bucket 的公开读取路径。
- 该地址可以被用户浏览器访问。
- 该地址也可以被 Right Codes 上游访问。
- 如果未来要支持非 URL 传法，也仍然要先保存标准化后的 MinIO 文件，方便审计、复用和排障；第一版统一只传 URL。

## 9. 后端设计建议

### 9.1 数据模型方案

当前后端表是 `video_models` 和 `video_tasks`，强绑定视频业务。图片生成有两种改法。

#### 方案 A：新增图片独立表，风险最低

新增：

```text
image_models
image_tasks
```

优点：

- 不破坏现有视频生成链路。
- 前后端改动边界清晰。
- 适合快速上线图片 MVP。

缺点：

- 视频和图片有重复字段。
- 后续多媒体生成能力增多后，管理后台可能出现重复模块。

#### 方案 B：重构为统一生成表，长期更优，但第一版不采用

新增或迁移为：

```text
generation_models
generation_tasks
```

核心字段增加：

```text
media_type = video | image
```

优点：

- 视频、图片、后续音频等任务可以统一管理。
- 后台模型、任务、供应商、积分流水可以更通用。

缺点：

- 当前视频链路已上线，迁移风险高。
- 需要重构较多后端、前端和 SQL。

#### 推荐

第一版采用方案 A：新增 `image_models` / `image_tasks`，快速跑通图片生成闭环。  
第一版明确不重构现有 `video_models` / `video_tasks`，也不迁移历史视频数据。  
后续当图片业务稳定后，再评估是否抽象为统一 `generation_*`。

### 9.2 建议新增表

#### image_models

关键字段：

```text
id
name
provider_name
model_key
description
badge
status
billing_type
price_per_generation
price_per_image
max_n
supported_input_types
supported_input_combinations
input_asset_rules
aspect_ratio_options
supported_resolutions
resolution_price_rules
input_price_rules
upstream_provider_id
upstream_model_id
upstream_default_params
upstream_param_mapping
capabilities
is_visible
sort_order
created_at
updated_at
```

#### image_tasks

关键字段：

```text
id
user_id
model_id
prompt
negative_prompt
input_types
input_assets
aspect_ratio
resolution
n
seed
style
quality
credit_cost
status
upstream_provider_id
upstream_task_id
upstream_request_json
upstream_response_json
result_images_json
error_message
requested_size
actual_width
actual_height
refunded_at
created_at
submitted_at
started_at
completed_at
updated_at
```

`result_images_json` 示例：

```json
[
  {
    "index": 0,
    "bucket": "reelmind-results",
    "object_key": "results/user/images/task/0.png",
    "url": "https://reelmind.ylcmx.xyz/files/results/...",
    "thumb_url": "https://reelmind.ylcmx.xyz/files/results/...",
    "requested_size": "1024x1536",
    "actual_width": 1024,
    "actual_height": 1536
  }
]
```

### 9.3 Worker 队列

新增队列类型：

```text
image:submit
image:poll
image:timeout
image:store_result
```

如果上游图片生成是同步返回结果，仍建议走 worker，保持任务体验一致：

```text
创建任务 -> 扣费 -> 入队 -> worker 调上游 -> 回存 MinIO -> 更新 succeeded
```

### 9.4 上游适配器

新增图片供应商 adapter：

```text
providers.ImageAdapter
```

需要统一输出：

```text
Submit(ctx, ImageSubmitRequest) -> ImageSubmitResult
Poll(ctx, upstreamTaskID) -> ImagePollResult
```

如果某个上游同步返回图片 URL，则 adapter 可以在 Submit 结果里直接返回 completed。

#### Right Codes Draw adapter

第一版图片生成上游使用 Right Codes Draw。

基础配置：

```text
base_url = https://www.right.codes/draw
endpoint = POST /v1/images/generations
auth = Authorization: Bearer <RIGHT_CODES_API_KEY>
response_format = url
```

请求字段：

| 平台字段 | 上游字段 | 说明 |
| --- | --- | --- |
| `upstream_model_id` | `model` | 例如 `gpt-image-2` |
| `prompt` | `prompt` | 提示词 |
| `normalized_input_image_urls[]` | `image` | 参考图 URL 数组，由后端标准化并上传 MinIO 后生成 |
| `resolution` | `size` | 例如 `1024x1024` |
| 固定值 | `response_format` | 第一版固定 `url` |

请求示例：

```json
{
  "model": "gpt-image-2",
  "prompt": "生成一张产品海报",
  "image": ["https://reelmind.ylcmx.xyz/files/assets/user/ref.png"],
  "size": "1024x1024",
  "response_format": "url"
}
```

响应示例：

```json
{
  "created": 1777689832,
  "data": [
    {
      "url": "https://file4.aitohumanize.com/file/dfa13fe60e7649e88f46037b968b54a3.png"
    }
  ],
  "usage": {
    "total_tokens": 6267,
    "input_tokens": 17,
    "output_tokens": 6250
  }
}
```

处理规则：

- 参考图必须来自用户上传后的平台资产，不接受用户在表单里直接填写外部 URL。
- 后端需要先把用户上传的参考图标准化并上传 MinIO，再生成上游可访问的 URL 数组。
- 传给 Right Codes 的 `image` 字段第一版一律使用 URL 数组。
- 上游返回 `data[].url` 后，worker 必须下载图片并回存 MinIO。
- 前端最终只展示 MinIO URL，不长期依赖上游 URL。
- `usage` 保存到 `upstream_response_json`，第一版不参与用户计费。
- Right Codes Draw 当前是同步返回 URL，但平台仍按异步任务体验处理。
- worker 下载图片后需要识别实际像素，保存 `requested_size`、`actual_width`、`actual_height`，因为上游不一定严格按请求 size 输出。

环境变量建议：

```text
RIGHT_CODES_BASE_URL=https://www.right.codes/draw
RIGHT_CODES_API_KEY=sk-xxxxx
```

### 9.5 图片任务状态流转

成功路径：

```text
pending -> submitted -> processing -> succeeded
```

同步上游成功路径：

```text
pending -> processing -> succeeded
```

失败退款路径：

```text
pending -> failed -> refunded
pending -> submitted -> processing -> failed -> refunded
pending -> submitted -> processing -> timed_out -> refunded
```

约束：

- `succeeded`、`refunded` 是终态，不允许 worker 再覆盖状态。
- 退款只能针对 `failed`、`timed_out` 或后台确认失败后的任务。
- 同一图片任务只能写入一条 refund 积分流水。
- worker 重启后需要补偿扫描 `submitted` / `processing` 的图片任务，避免永久卡住。

### 9.6 与视频任务一致的任务形态

图片生成不能做成前端同步直调上游，也不能由 API 请求长时间阻塞等待上游结果。第一版必须和现有视频任务一样，使用平台任务形态：

```text
用户提交
-> API 校验模型、size、参考图、余额
-> 数据库事务内创建 image_task 并扣积分
-> 入队 image:submit
-> worker 调 Right Codes Draw
-> 保存 upstream_request_json / upstream_response_json
-> 下载上游 data[].url
-> 回存 MinIO results bucket
-> 生成缩略图
-> 更新 image_task 为 succeeded
-> 前端轮询任务状态并展示缩略图
```

失败路径：

```text
上游报错 / 下载失败 / MinIO 回存失败 / 超时
-> image_task 标记 failed 或 timed_out
-> 后端执行幂等退款
-> 写入 refund 积分流水
-> 前端展示失败原因和已退款状态
```

前端只和 ReelMind 后端交互：

- 创建任务：`POST /api/v1/user/image-tasks`
- 查询任务：`GET /api/v1/user/image-tasks/{id}`
- 列表轮询：`GET /api/v1/user/image-tasks`
- 预览 / 下载：使用后端返回的 MinIO URL 或下载接口

前端不保存 Right Codes API Key，也不直接请求 `https://www.right.codes/draw`。

## 10. 后端 API

### 10.1 用户端接口

```http
GET /api/v1/public/image-models
```

获取可见图片模型。

响应 `data.list[]` 建议字段：

```json
{
  "id": "uuid",
  "name": "图片生成模型",
  "model_key": "image-generation-default",
  "description": "",
  "badge": "默认",
  "status": "available",
  "billing_type": "per_image",
  "price_per_image": 1,
  "price_per_generation": 0,
  "max_n": 1,
  "response_format": "url",
  "aspect_ratio_options": ["1:1", "3:2", "2:3", "16:9", "9:16", "auto"],
  "supported_resolutions": ["1024x1024", "1536x1024", "1024x1536", "3840x2160", "2160x3840", "2880x2880", "auto"],
  "supported_input_types": ["text", "image"],
  "supported_input_combinations": [["text"], ["text", "image"]],
  "capabilities": {
    "negative_prompt": false,
    "seed": false,
    "style": false,
    "quality": false,
    "image_to_image": true,
    "multi_reference_image": true
  },
  "input_asset_rules": {
    "max_images": 10,
    "max_size_mb": 20,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"]
  }
}
```

```http
POST /api/v1/public/image-generation/estimate
```

试算积分。

请求：

```json
{
  "model_id": "uuid",
  "input_types": ["text", "image"],
  "aspect_ratio": "1:1",
  "resolution": "1024x1024",
  "n": 1
}
```

响应：

```json
{
  "credit_cost": 5,
  "balance": 100,
  "enough": true,
  "billing_type": "per_image"
}
```

```http
POST /api/v1/user/image-tasks
```

创建图片任务。

说明：`input_asset_ids` 只能引用当前用户已上传并由后端标准化完成的图片资产。前端不传外部图片 URL、base64 或 data URL。

请求：

```json
{
  "model_id": "uuid",
  "prompt": "一张电影感产品海报",
  "negative_prompt": "",
  "aspect_ratio": "1:1",
  "resolution": "1024x1024",
  "n": 1,
  "input_asset_ids": ["uuid"],
  "seed": null,
  "style": null,
  "quality": null
}
```

响应：

```json
{
  "id": "uuid",
  "status": "pending",
  "credit_cost": 5,
  "created_at": "2026-06-30T12:00:00+08:00"
}
```

```http
GET /api/v1/user/image-tasks?page=1&page_size=20
```

获取自己的图片任务。

列表接口必须返回真实分页 `pagination.total`，不能用前端拉 100 条再本地分页。

```http
GET /api/v1/user/image-tasks/{id}
```

获取图片任务详情。

```http
GET /api/v1/user/image-tasks/{id}/preview
```

获取图片预览 URL。

```http
GET /api/v1/user/image-tasks/{id}/download
```

获取图片下载 URL。

### 10.2 后台接口

```http
GET /api/v1/admin/image-models
POST /api/v1/admin/image-models
PATCH /api/v1/admin/image-models/{id}
PATCH /api/v1/admin/image-models/{id}/status
```

图片模型管理。

```http
GET /api/v1/admin/image-tasks
GET /api/v1/admin/image-tasks/{id}
POST /api/v1/admin/image-tasks/{id}/mark-failed
POST /api/v1/admin/image-tasks/{id}/refund
```

图片任务管理。

后台列表必须支持：

- `page`
- `page_size`
- `status`
- `model_id`
- `user_id`
- `created_from`
- `created_to`

后台模型列表必须支持：

- `page`
- `page_size`
- `status`
- `keyword`
- `provider_id`

## 11. 前端实现范围

### 11.1 工作室 Tab 改造

```text
src/pages/user/UserWorkspacePage.tsx
src/components/workspace/GenerationTypeTabs.tsx
src/components/workspace/VideoGenerationPanel.tsx
src/components/workspace/ImageGenerationPanel.tsx
```

功能：

- 加载图片模型
- 选择图片模型
- 填写提示词
- 按模型能力展示参考图上传
- 参考图上传前压缩和预览
- 选择比例、尺寸、张数
- 试算积分
- 创建图片任务
- 轮询最近图片任务
- 预览 / 下载图片

注意：前端可以拆组件，但用户感知上仍是同一个工作室，不是单独跳到一个新产品页面。

### 11.2 历史页调整

`HistoryPage` 增加类型筛选：

- 视频
- 图片

第一版不建议新增独立图片历史入口。历史页通过类型筛选承载视频和图片任务。

### 11.3 API client

新增：

```text
src/api/image.ts
```

新增类型：

```text
ApiImageModel
ApiImageTask
ApiImageEstimateResponse
ApiImagePreviewResponse
```

新增 adapter：

```text
toImageModel
toImageTask
```

### 11.4 设计与动效约束

图片生成 Tab 延续当前 ReelMind 前端风格，不重新做一套视觉系统。

落地要求：

- 工作室仍是首屏核心，不做营销落地页。
- 视频生成和图片生成使用同一个工作室布局壳。
- Tab 切换要清晰，但不要把视频和图片做成两个割裂页面。
- 左侧优先放高频表单，右侧放结果预览、最近任务或空状态。
- 不使用竞品截图里的具体功能文案、供应商标签、促销模块。
- 图标继续使用 Lucide，不用 emoji 做正式 UI 图标。
- 移动端表单、参数区、历史卡片必须单列适配，不能横向滚动。
- Anime.js 只用于进入、切换、列表更新、弹窗等轻量动效，时长建议 150-300ms。
- 尊重 `prefers-reduced-motion`，减少动画用户不应被强行动效干扰。
- 图片列表只加载缩略图，点击后再加载大图，避免首屏一次性拉大图。

## 12. 默认模型配置建议

第一版图片模型使用 Right Codes Draw。

模型清单：

| 模型 | 上游模型 ID | 能力说明 | 分辨率 |
| --- | --- | --- | --- |
| GPT Image 2 VIP | `gpt-image-2-vip` | OpenAI 最新画图模型，官方直连 | 按后台 size 白名单配置 |
| GPT Image 2 | `gpt-image-2` | OpenAI 最新画图模型，特价版 | 按后台 size 白名单配置 |
| Nano Banana | `nano-banana` | 由 Gemini 2.5 Flash Image 封装 | 按后台 size 白名单配置 |
| Nano Banana 2 | `nano-banana-2` | 第二代绘图模型 | 按后台 size 白名单配置 |
| Nano Banana Pro | `nano-banana-pro` | 第二代绘图模型增强版 | 按后台 size 白名单配置 |

费用不在前端写死，后台按图片模型维度配置：

- `price_per_image`
- `max_n`
- `supported_sizes`
- `supported_input_types` / `supported_input_combinations`
- `capabilities`

第一版建议全部使用 `per_image`，所有图片模型初始价格都设置为 `1` 积分 / 张，后续由后台运营调整。

后台默认预置全部图片模型，但通过后台开关控制可见和可用：

- `gpt-image-2`
- `nano-banana`
- `nano-banana-2`
- `nano-banana-pro`
- `gpt-image-2-vip`

建议初始策略：

- 文生图冒烟成功的模型可以设为 `available`。
- 冒烟不稳定的模型可以先设为 `maintenance` 或可见但不可提交。
- `gpt-image-2-vip` 必须预置到后台，但第一版初始不打开开关，默认 `status=maintenance`、`is_visible=false`；用户端不允许提交该模型任务。
- 所有模型都允许后台随时切换 `available / maintenance / coming_soon / disabled`。

示例模型配置：

```json
{
  "name": "GPT Image 2",
  "model_key": "gpt-image-2",
  "upstream_model_id": "gpt-image-2",
  "provider_name": "Right Codes Draw",
  "status": "available",
  "is_visible": true,
  "billing_type": "per_image",
  "price_per_image": 1,
  "max_n": 1,
  "response_format": "url",
  "supported_input_types": ["text", "image"],
  "supported_input_combinations": [["text"], ["text", "image"]],
  "capabilities": {
    "negative_prompt": false,
    "seed": false,
    "style": false,
    "quality": false,
    "image_to_image": true,
    "multi_reference_image": true
  },
  "input_asset_rules": {
    "max_images": 10,
    "max_size_mb": 20,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"]
  },
  "aspect_ratio_options": ["1:1", "3:2", "2:3", "16:9", "9:16", "auto"],
  "supported_resolutions": ["1024x1024", "1536x1024", "1024x1536", "3840x2160", "2160x3840", "2880x2880", "auto"],
  "upstream_default_params": {
    "response_format": "url"
  }
}
```

第一版统一 size 白名单：

```text
1024x1024
1536x1024
1024x1536
3840x2160
2160x3840
2880x2880
auto
```

## 13. 验收标准

### 13.1 用户端

- 未登录用户可以在工作室图片生成 Tab 浏览模型。
- 未登录用户上传、试算、提交时引导登录。
- 登录用户可以提交图片任务。
- 提交成功后立即扣除积分。
- 图片任务出现在最近记录和历史页。
- 任务处理中自动刷新状态。
- 成功后展示缩略图。
- 点击缩略图可以查看大图。
- 可以下载生成图片。
- 失败或超时自动退款。
- 积分流水能看到扣费和退款记录。

### 13.2 后台

- 管理员可以新增图片模型。
- 管理员可以开关图片模型。
- 后台可以查看图片任务。
- 后台可以查看上游请求和响应快照。
- 后台可以对失败任务执行退款。
- 控制台能看到图片任务相关统计。

### 13.3 存储

- 当模型支持参考图时，所有用户上传参考图进入 MinIO。
- 所有生成结果图片回存 MinIO。
- 前端展示 MinIO 公网 URL，不展示上游临时 URL。

## 14. 分阶段计划

### Phase 1：PRD 与接口定稿

- 上游图片生成供应商已确认：Right Codes Draw。
- 第一版模型清单已确认：`gpt-image-2-vip`、`gpt-image-2`、`nano-banana`、`nano-banana-2`、`nano-banana-pro`。
- 第一版开放文生图和真实图生图。
- 第一版返回格式固定 `url`，后端下载并回存 MinIO。
- 费用由后台按模型维度配置。
- size 白名单已确认：`1024x1024`、`1536x1024`、`1024x1536`、`3840x2160`、`2160x3840`、`2880x2880`、`auto`。
- 所有图片模型初始价格设置为 `1` 积分 / 张。
- `MINIO_PUBLIC_BASE_URL` 生产设计为 `https://reelmind.ylcmx.xyz/files`。
- 用户上传图片第一版支持 `jpg/jpeg/png/webp/heic/avif`，单张最大 `20MB`。
- 单次任务最多 `10` 张参考图。
- 后台默认预置全部图片模型，通过模型状态控制可见和可用。
- `gpt-image-2-vip` 也要预置，但初始不开放给用户提交。

### Phase 2：后端基础能力

- 新增 `image_models` / `image_tasks` migration。
- 新增 SQL / sqlc。
- 新增用户端图片接口。
- 新增后台图片模型和任务接口。
- 新增图片任务 worker。
- 新增图片结果回存 MinIO。
- 新增失败退款。

### Phase 3：前端页面

- 工作室增加视频 / 图片 Tab。
- 新增图片生成面板组件。
- 新增图片任务列表组件。
- 历史页支持图片类型。
- 后台模型和任务页面支持图片类型。

### Phase 4：真实上游联调

- 接入真实图片模型。
- 测试文生图。
- 测试图生图 / 参考图。
- 测试失败退款。
- 测试 MinIO 回存和下载。

### Phase 5：上线

- 后台先设模型为 `maintenance` 或 `coming_soon`。
- 小范围测试成功后切为 `available`。
- 观察任务失败率、平均耗时、上游错误。

## 15. 关键风险

1. 上游图片接口可能同步返回，也可能异步任务返回。  
   解决：adapter 抽象必须同时支持同步完成和异步轮询。

2. 图片尺寸和张数会影响成本。  
   解决：第一版计费先简单，后台保留扩展字段。

3. 工作室内同时承载视频和图片，表单参数差异较大。  
   解决：工作室只负责 Tab 和公共布局，视频表单和图片表单拆成独立 panel，不把所有逻辑堆在一个文件里。

4. 历史页混合视频和图片后信息结构不同。  
   解决：列表按类型渲染卡片，不强行复用视频字段。

5. 现有表名和模块名都带 `video`。  
   解决：第一版新增图片独立表，避免重构上线视频链路。

6. 图片内容安全风险更直接。  
   解决：第一版依赖上游安全策略，后台保留失败原因；后续再接内容审核。

7. Right Codes Draw 同步返回 URL，但平台任务是异步体验。  
   解决：创建任务后由 worker 调上游、下载、回存 MinIO、更新任务状态；前端不直接请求上游。

8. 参考图必须由服务器标准化后再给上游。  
   解决：用户上传任意常见图片格式后，后端转成标准格式并保存 MinIO；传给上游时第一版统一使用 `MINIO_PUBLIC_BASE_URL` 下的公网 URL。

9. 上游 size 白名单必须严格校验。  
   解决：后端创建任务和试算都只允许后台模型配置中的 size，第一版全局白名单为 `1024x1024`、`1536x1024`、`1024x1536`、`3840x2160`、`2160x3840`、`2880x2880`、`auto`。

10. Right Codes 返回和传输稳定性需要平台兜底。  
    解决：adapter 保存上游原始响应；对 JSON 错误、纯文本 `error code: 502`、空响应、传输失败都统一映射为平台失败任务并退款。

11. 图生图能力需要按模型配置并做好失败兜底。  
    解决：第一版所有参考图给上游都统一使用 URL。不同模型和通道可能返回 `502` 或空响应；后端实现真实链路，后台按模型配置是否展示参考图入口，并保存上游原始错误用于排障。

12. 参考图数量和体积可能带来资源风险。  
    解决：第一版单次任务最多 `10` 张参考图、单张最大 `20MB`；后端仍必须限制单次请求总上传大小、并发上传数量、任务入队频率和 worker 处理超时。

13. `heic` / `avif` 转码依赖可能增加部署复杂度。  
    解决：后端实现时需要确认转码库和生产镜像依赖；转码失败时返回明确错误，不创建生成任务、不扣积分。

14. 上游可能存在更严格的参考图隐性限制。  
    解决：模型默认限制 `1` 张，平台硬上限 `10` 张；如果上游返回数量、体积或请求过大相关错误，平台按失败任务退款并保存原始响应，后续再由后台模型配置细化限制。

15. 只做前端压缩不可靠。  
    解决：前端上传前压缩用于减少流量；后端仍必须重新校验、解码、压缩、转格式和缩放，后端结果才是传给上游的唯一可信文件。

## 16. 待确认问题

### 16.0 当前上游接口探测记录

测试时间：2026-06-30  
测试接口：`POST https://www.right.codes/draw/v1/images/generations`

#### 鉴权与参数错误

| 场景 | HTTP 状态 | 响应 |
| --- | --- | --- |
| 不传 `Authorization` | `401` | `{"error":"缺少 API Key"}` |
| 传无效 API Key | `401` | `{"error":"无效的API Key"}` |
| `GET` 请求且不传 API Key | `401` | `{"error":"缺少 API Key"}` |
| malformed JSON 且不传 API Key | `401` | `{"error":"缺少 API Key"}` |
| 空 body 且不传 API Key | `401` | `{"error":"缺少 API Key"}` |
| 缺少 `model` | `400` | `{"error":"请求体中未提供model"}` |
| 缺少 `prompt` | `502` | `error code: 502` |
| 非法 `model` | `400` | `{"error":"端点/draw未配置模型not-a-real-image-model"}` |
| 非白名单 `size=999x999` | `200` | 返回了图片 URL |

#### size 探测

测试模型：`gpt-image-2-vip`  
说明：上游成功返回 URL 后下载图片，并用本地工具读取实际像素。

| 请求 size | 结果 | 实际像素 |
| --- | --- | --- |
| `1024x1024` | 成功 | `1254x1254` |
| `1536x1024` | 传输失败 | `curl: Empty reply from server` |
| `1024x1536` | 成功 | `1024x1536` |
| `3840x2160` | 成功 | `1672x941` |
| `2160x3840` | 成功 | `941x1672` |
| `2880x2880` | 成功 | `1254x1254` |
| `auto` | 传输失败 | `curl: Empty reply from server` |

#### 参考图探测

第一轮使用 1x1 data URL 和 dummyimage 公网 URL，`gpt-image-2` 返回 `502`。  
第二轮使用真实 512x512 JPEG 参考图，来源为可直接下载的公网图片 URL，并同时构造 raw base64 和 data URL。

| 场景 | 结果 |
| --- | --- |
| `gpt-image-2` + 公网图片 URL | 成功，实际像素 `1254x1254` |
| `nano-banana` + 公网图片 URL | 成功，实际像素 `1024x1024` |
| `nano-banana-2` + 公网图片 URL | 传输失败，`curl: Empty reply from server` |
| `nano-banana-pro` + 公网图片 URL | 传输失败，`curl: Empty reply from server` |
| `nano-banana` + raw base64 | 成功，实际像素 `1024x1024` |
| `nano-banana` + data URL | 成功，实际像素 `1024x1024` |
| `nano-banana-2` + raw base64 | 传输失败，`curl: Empty reply from server` |
| `nano-banana-2` + data URL | 传输失败，`curl: Empty reply from server` |
| `nano-banana-pro` + raw base64 | 成功，实际像素 `1024x1024` |
| `nano-banana-pro` + data URL | 成功，实际像素 `1024x1024` |

#### 模型冒烟测试

请求参数：`size=1024x1024`、文生图、无参考图。

| 模型 | 结果 | 实际像素 |
| --- | --- | --- |
| `gpt-image-2-vip` | 传输失败 | `curl: Empty reply from server` |
| `gpt-image-2` | 成功 | `1254x1254` |
| `nano-banana` | 成功 | `1024x1024` |
| `nano-banana-2` | 成功 | `1024x1024` |
| `nano-banana-pro` | 成功 | `1024x1024` |

#### 探测结论

- Right Codes 会先校验 API Key，再进入参数校验。
- 上游不一定严格校验 `size`，例如 `999x999` 也返回了图片 URL；平台后端必须自行做白名单校验。
- 上游不一定严格按请求 `size` 输出实际像素，后端必须保存 `requested_size` 和实际图片宽高。
- 真实公网图片 URL 已有成功案例；第一版图生图可以真实接入。
- raw base64 和 data URL 也测到过成功案例，但第一版不采用，统一只给上游传 URL。
- 不同模型对 URL 参考图的稳定性不同。`gpt-image-2`、`nano-banana` URL 成功，`nano-banana-2`、`nano-banana-pro` URL 测试出现空响应；后台不应简单判定为不支持参考图，而应按上游模型能力配置支持参考图，并保存上游原始错误用于排障。
- 上游错误结构不完全统一，既有 JSON `{"error":"..."}`，也有纯文本 `error code: 502`；adapter 需要兼容两种响应。
- 当前冒烟测试中，`gpt-image-2`、`nano-banana`、`nano-banana-2`、`nano-banana-pro` 文生图可用；`gpt-image-2-vip` 出现空响应，建议初始状态设为 `maintenance` 或不默认推荐。

### 16.1 必须由业务或上游信息确认

这些问题无法仅靠当前代码判断，需要在开工前确认：

1. 上游是否有请求频率、并发数或每日额度限制？
2. 其他图片模型是否能成功支持参考图输入？
3. `1536x1024` 和 `auto` 出现空响应是临时网络问题还是上游通道问题？

### 16.2 如无特别要求，建议采用的默认值

这些问题可以先按推荐默认值推进，后续再通过后台配置扩展：

| 问题 | 推荐默认值 |
| --- | --- |
| 第一版最大生成张数 | 默认 `1`，后台可配置，平台硬上限 `10` |
| 默认计费方式 | 按张计费 `per_image` |
| 默认价格 | 所有图片模型初始 `1` 积分 / 张 |
| 默认输入能力 | 文生图、图生图都做真实链路 |
| 默认比例 | `1:1`、`16:9`、`9:16`、`4:3`、`3:4` |
| 默认尺寸 | `1024x1024`、`1536x1024`、`1024x1536`、`3840x2160`、`2160x3840`、`2880x2880`、`auto` |
| 参考图格式 | `jpg/jpeg/png/webp/heic/avif` |
| 单张参考图大小 | `20MB` |
| 参考图数量 | 单次任务最多 `10` 张 |
| 上传前压缩 | 前端先压缩，后端二次压缩兜底 |
| MinIO 公网地址 | `https://reelmind.ylcmx.xyz/files` |
| 结果保存时长 | 沿用视频结果 7 天策略 |
| 历史页默认展示 | 默认展示全部，提供视频 / 图片筛选 |
| 图片文件格式 | 优先按上游原格式保存，缩略图建议 webp |
| 任务体验 | 异步任务体验，即使上游同步返回也经 worker 回存后完成 |

## 17. 当前推荐结论

推荐第一版这样做：

```text
现有工作室增加 视频生成 / 图片生成 Tab
新增 image_models / image_tasks
不重构现有 video_models / video_tasks
复用用户、积分、兑换码、上传、MinIO、供应商、worker、失败退款体系
图片模型和视频模型后台分 Tab 管理
历史页增加 视频 / 图片 筛选
第一版图片上游使用 Right Codes Draw
第一版支持文生图和真实图生图
第一版费用由后台按模型维度配置，前端只展示后端试算结果
生成结果必须回存 MinIO
```

## 18. PRD 收口状态

当前仍处于 PRD 阶段，以下内容不算产品决策缺口，而是后续实现阶段需要落地和验收的事项：

- 后端新增 `image_models` / `image_tasks` migration。
- 后端实现图片任务 API、worker、Right Codes adapter。
- 后端实现参考图上传、格式校验、转码、MinIO 保存和公网 URL 生成。
- 后端实现图片结果下载、缩略图生成、实际宽高识别和 MinIO 回存。
- 后端实现图片任务失败退款。
- 前端实现工作室图片生成 Tab。
- 前端接入图片模型、上传、试算、提交、轮询、预览、下载接口。
- 生产验证 `https://reelmind.ylcmx.xyz/files` 能被浏览器和 Right Codes 上游访问。

这些事项进入开发计划后逐项验收，不再阻塞 PRD 收口。

## 19. 开工拆解清单

### 19.1 后端优先级

1. 数据库 migration
   - 新增 `image_models`
   - 新增 `image_tasks`
   - 给 `image_tasks(user_id, created_at)`、`image_tasks(status, updated_at)`、`image_tasks(upstream_task_id)` 建索引

2. sqlc 查询
   - 图片模型公共列表
   - 图片模型后台 CRUD
   - 图片任务创建
   - 用户图片任务列表 / 详情
   - 后台图片任务列表 / 详情
   - worker 状态更新
   - 失败退款幂等更新

3. 用户端 API
   - `GET /public/image-models`
   - `POST /public/image-generation/estimate`
   - `POST /user/image-tasks`
   - `GET /user/image-tasks`
   - `GET /user/image-tasks/{id}`
   - `GET /user/image-tasks/{id}/preview`
   - `GET /user/image-tasks/{id}/download`

4. 后台 API
   - 图片模型列表 / 新增 / 编辑 / 状态切换
   - 图片任务列表 / 详情 / 标记失败 / 退款

5. Worker
   - `image:submit`
   - `image:poll`
   - 图片结果下载
   - 图片结果回存 MinIO
   - 缩略图生成
   - 失败自动退款
   - 超时自动退款

6. Seed
   - 新增一个图片模型占位配置，初始状态建议 `maintenance`
   - 上游未确认前不默认开放给用户提交

### 19.2 前端优先级

1. 工作室结构拆分
   - `UserWorkspacePage` 保留工作室壳
   - 抽出 `VideoGenerationPanel`
   - 新增 `ImageGenerationPanel`
   - 新增 `GenerationTypeTabs`

2. 图片生成面板
   - 图片模型加载
   - 提示词表单
   - 按模型能力展示参考图上传
   - 比例选择
   - 尺寸选择
   - 张数选择
   - 积分试算
   - 提交任务
   - 最近图片任务轮询

3. 历史页
   - 增加任务类型筛选
   - 视频卡片和图片卡片分类型渲染
   - 图片点击预览大图
   - 图片下载

4. 后台
   - 模型管理增加视频 / 图片类型切换
   - 任务管理增加视频 / 图片类型切换
   - 控制台增加图片任务统计

### 19.3 不应在第一版顺手做的事

- 不重构现有视频表
- 不把所有任务强行合并成一个统一任务表
- 不新增图片社区
- 不新增复杂图片编辑器
- 不新增真实支付订单
- 不做用户取消任务
- 不把竞品截图里的 API、聊天、状态页带进来
