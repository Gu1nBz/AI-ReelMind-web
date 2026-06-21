# ReelMind MVP 后端接口交付清单

## 1. 文档目的

这份文档基于以下来源整理：

- `/Users/shiqiao/bz/AI-ReelMind-web/video-generation-mvp.md`
- 当前前端页面与交互
- 当前前端中已经出现但还未接真实接口的按钮、表单、筛选、表格操作

目标不是写 Swagger 成品，而是先把后端必须实现的接口、字段、权限和异步处理点一次列清楚，方便后端直接拆分开发。

---

## 2. 结论先说

当前后端需要覆盖三类内容：

1. 用户端接口  
   登录注册、模型列表、价格试算、素材上传、创建任务、任务记录、兑换码充值、积分流水、个人中心

2. 管理后台接口  
   控制台、模型管理、上游供应商、提示词字段、积分套餐、兑换码、用户、任务、积分流水

3. 非页面直连但必须有的后台能力  
   上游回调、服务端轮询、超时处理、失败退款、结果转存、7 天过期清理

---

## 3. 推荐技术栈与部署约定

这部分建议直接作为后端开工口径使用，不只是参考。

### 3.1 推荐技术栈

建议后端统一采用：

- `Go 1.26.x`
- `Gin` 作为 HTTP API 框架
- `PostgreSQL` 作为主数据库
- `sqlc` 作为数据库访问层
- `golang-migrate` 管理数据库迁移
- `Redis` 处理验证码、限流、缓存和任务协调
- `Asynq` 处理异步任务和 worker
- `MinIO` 作为统一对象存储
- `JWT + Refresh Token` 处理用户和管理员登录态
- `Swagger / OpenAPI` 输出接口文档
- `Docker Compose` 作为基础部署和联调方式

### 3.2 选择这套栈的原因

- 这个项目的后端核心是异步任务系统，不只是给前端喂数据。
- 重点链路包括：创建任务、扣费、调用上游、轮询或回调、失败退款、结果转存、过期清理。
- `Go + PostgreSQL + Redis + Asynq` 很适合把这条链路做稳。
- `sqlc` 比较适合积分余额、积分流水、兑换码状态这类强事务场景，关键 SQL 更容易控。

### 3.3 仓库和服务建议

不和前端放在一个仓库，直接独立后端仓库即可，例如：

```text
AI-ReelMind-server/
  cmd/api
  cmd/worker
  internal/auth
  internal/users
  internal/models
  internal/tasks
  internal/redeem
  internal/billing
  internal/providers
  internal/storage
  internal/jobs
  migrations
  docs
```

建议至少拆成两个进程：

1. `api`
   - 提供前台接口、后台接口、上游回调接口

2. `worker`
   - 处理上游轮询、超时处理、失败退款、结果转存、文件过期清理

### 3.4 MinIO 统一约定

当前阶段统一约定如下：

- 不区分本地和生产的对象存储方案
- 本地和生产都统一使用 `MinIO`
- 后续如果业务上确实需要 `OSS` 或其他对象存储，再单独补适配

也就是说，这一版后端里所有对象存储相关能力，都按 `S3 兼容接口 + MinIO` 来设计和实现。

### 3.5 MinIO 使用范围

`MinIO` 负责以下内容：

- 用户上传的图片、视频、音频参考素材
- 上游返回成功后转存的视频结果
- 转存后的封面图
- 任务相关临时文件

建议最少准备两个 bucket：

- `reelmind-assets`
- `reelmind-results`

建议对象 key 结构：

```text
assets/{user_id}/{yyyy}/{mm}/{dd}/{asset_id}-{filename}
results/{user_id}/{task_id}/video.mp4
results/{user_id}/{task_id}/cover.jpg
```

### 3.6 环境变量建议

```text
APP_ENV=production
APP_PORT=8080

POSTGRES_DSN=postgres://user:pass@postgres:5432/reelmind?sslmode=disable
REDIS_ADDR=redis:6379

JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET_ASSETS=reelmind-assets
MINIO_BUCKET_RESULTS=reelmind-results
MINIO_PUBLIC_BASE_URL=https://files.example.com
```

### 3.7 后端设计硬要求

- 积分扣减和任务创建必须放在同一个事务里
- 失败退款必须幂等
- 回调处理必须幂等
- 任务状态流转必须可追踪
- 所有上传和结果文件都统一走 `MinIO`
- 不长期依赖上游返回的临时文件地址

---

## 4. 接口通用约定

### 4.1 路径前缀

```text
/api/v1
```

除上游回调接口外，所有业务接口都放在 `/api/v1` 下。文档中页面映射表为了可读性会省略 `/api/v1` 前缀，真实接口以各章节标题为准。

### 4.2 字段命名

- HTTP 请求和响应 JSON 字段统一使用 `snake_case`
- TypeScript 前端内部可以继续用 `camelCase`，在 API client 层做字段转换
- 时间字段统一返回 ISO 8601 字符串，例如 `2026-06-21T10:08:00+08:00`
- 金额和积分都用整数，不使用浮点数
- 空列表返回 `[]`，空对象返回 `{}`，不返回 `null`

### 4.3 成功返回结构

所有 JSON 成功响应都使用统一 envelope：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "req_xxx"
}
```

示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "task_001",
    "status": "pending"
  },
  "request_id": "req_20260621142030_ab12cd"
}
```

### 4.4 分页返回结构

分页接口的 `data` 统一为：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 120,
      "total_pages": 6
    }
  },
  "request_id": "req_xxx"
}
```

分页参数统一：

- `page`：从 `1` 开始，默认 `1`
- `page_size`：默认 `20`，最大 `100`
- `sort_by`：只允许接口声明过的字段
- `sort_order`：`asc` 或 `desc`

### 4.5 错误返回结构

所有业务错误、校验错误和系统错误都使用同一个 envelope。HTTP 状态码表达错误大类，`code` 表达业务细分。

```json
{
  "code": 400001,
  "message": "参数校验失败",
  "data": null,
  "request_id": "req_xxx",
  "errors": [
    {
      "field": "email",
      "reason": "邮箱格式不正确"
    }
  ]
}
```

约定：

- 成功时 `code = 0`
- 失败时 `code != 0`
- `message` 用于前端展示，必须是可读中文或可配置的本地化文案
- `request_id` 必须贯穿网关、API、worker、上游请求和日志
- `errors` 只在字段校验失败或批量操作部分失败时返回
- 生产环境不要把堆栈、SQL、上游密钥、MinIO key 等敏感信息放进 `message` 或 `errors`

### 4.6 HTTP 状态码

| HTTP 状态码 | 使用场景 |
| --- | --- |
| `200` | 查询、编辑、状态切换等成功 |
| `201` | 创建成功，例如任务、模型、兑换码 |
| `202` | 异步操作已受理，例如手动重试、批量生成 |
| `204` | 删除成功且无响应体；MVP 尽量少用，优先返回统一 envelope |
| `400` | 参数格式错误、字段校验失败 |
| `401` | 未登录、token 无效或过期 |
| `403` | 已登录但无权限 |
| `404` | 资源不存在，或用户访问不属于自己的资源 |
| `409` | 状态冲突，例如兑换码已使用、任务已退款 |
| `422` | 业务规则不满足，例如模型不可用、积分不足、素材不符合模型规则 |
| `429` | 触发限流 |
| `500` | 未预期服务端错误 |
| `502` | 上游供应商错误 |
| `503` | 服务维护、依赖不可用 |
| `504` | 上游或异步处理超时 |

### 4.7 错误码

错误码使用 6 位整数，前 3 位代表模块，后 3 位代表具体错误。建议第一版固定下面这些，后续只追加不复用。

| 错误码 | HTTP | 含义 |
| --- | --- | --- |
| `0` | `2xx` | 成功 |
| `400001` | `400` | 参数校验失败 |
| `400002` | `400` | JSON 格式错误 |
| `400003` | `400` | 查询参数不合法 |
| `400004` | `400` | 上传文件格式不支持 |
| `400005` | `400` | 上传文件超过大小限制 |
| `401001` | `401` | 未登录 |
| `401002` | `401` | access token 无效 |
| `401003` | `401` | access token 已过期 |
| `401004` | `401` | refresh token 无效或已过期 |
| `403001` | `403` | 无权限 |
| `403002` | `403` | 管理员权限不足 |
| `404001` | `404` | 资源不存在 |
| `404002` | `404` | 接口不存在 |
| `409001` | `409` | 资源状态冲突 |
| `409101` | `409` | 邮箱已注册 |
| `409401` | `409` | 兑换码已使用 |
| `409402` | `409` | 兑换码已禁用 |
| `409403` | `409` | 兑换码已过期 |
| `409601` | `409` | 任务已完成，不能重复操作 |
| `409602` | `409` | 任务已退款，不能重复退款 |
| `422101` | `422` | 验证码错误或已过期 |
| `422102` | `422` | 邮箱或密码错误 |
| `422201` | `422` | 模型不可用 |
| `422202` | `422` | 模型不支持该输入类型组合 |
| `422203` | `422` | 模型不支持该比例、清晰度或时长 |
| `422301` | `422` | 积分不足 |
| `422401` | `422` | 兑换码不存在 |
| `422501` | `422` | 素材不存在或不属于当前用户 |
| `422502` | `422` | 素材数量不符合模型规则 |
| `429001` | `429` | 请求过于频繁 |
| `429101` | `429` | 邮箱验证码发送过于频繁 |
| `500001` | `500` | 服务端内部错误 |
| `500002` | `500` | 数据库错误 |
| `500003` | `500` | Redis 错误 |
| `500004` | `500` | 对象存储错误 |
| `502001` | `502` | 上游供应商请求失败 |
| `502002` | `502` | 上游返回无法解析 |
| `503001` | `503` | 服务维护中 |
| `504001` | `504` | 上游供应商超时 |

### 4.8 认证与请求头

- 用户端接口使用 `Authorization: Bearer <access_token>`
- 管理后台接口也使用 Bearer token，但 token 中必须有管理员身份和角色信息
- 推荐所有请求支持 `X-Request-Id`；如果前端不传，后端生成
- 涉及创建、兑换、扣费、退款、批量生成的接口建议支持 `Idempotency-Key`

### 4.9 文件和下载响应

- 上传接口返回统一 JSON envelope
- 预览和下载接口优先返回短期有效的签名 URL，不直接透出 MinIO 私有地址
- CSV 导出接口可以返回文件流；响应头必须包含 `Content-Type: text/csv; charset=utf-8` 和 `Content-Disposition`
- 如果导出任务可能很慢，改成 `202 + export_task_id`，再由前端轮询导出任务状态

### 4.10 权限分类

权限建议分三类：

- `public`：游客可访问
- `user`：普通用户登录后访问
- `admin`：管理员登录后访问

### 4.11 MVP 枚举口径

第一版接口里的状态、类型字段先固定下面这些枚举。后续新增只能追加，不要改旧值含义。

| 字段 | 枚举值 | 说明 |
| --- | --- | --- |
| `model.status` | `available` `maintenance` `coming_soon` `closed` | `closed` 只在后台可见；用户端公共模型接口不返回关闭模型 |
| `model.billing_type` | `per_second` `per_generation` | 按秒计费 / 按次计费 |
| `input_type` | `text` `image` `video` `audio` | 文本、图片、视频、音频素材 |
| `prompt_mode` | `basic` `advanced` | 基础提示词 / 高级提示词 |
| `task.status` | `pending` `submitted` `processing` `succeeded` `failed` `refunded` | 任务完整生命周期 |
| `redeem_code.status` | `unused` `used` `disabled` | 兑换码状态；过期由 `expires_at` 判断，也可以在筛选时映射为 expired |
| `credit_transaction.type` | `redeem` `generation` `refund` | 积分入账、任务扣费、失败退款 |
| `provider.status` | `enabled` `disabled` | 上游供应商配置状态 |
| `provider.update_mode` | `callback` `polling` `both` | 上游状态更新方式 |
| `package.status` | `visible` `hidden` | 用户端套餐展示状态 |
| `prompt_field.control_type` | `input` `textarea` `select` | 高级提示词字段控件类型 |

---

## 5. 页面到接口的映射

### 5.1 用户前台

| 页面 | 可见功能 | 需要接口 |
| --- | --- | --- |
| `/` 工作台 | 获取模型、提示词字段、价格试算、上传素材、创建任务、查看最近任务；保存草稿为 P1 可选 | `GET /public/models` `GET /public/prompt-fields` `POST /public/generation/estimate` `POST /user/uploads` `POST /user/tasks` `GET /user/tasks`；P1 `POST /user/task-drafts` |
| `/history` 历史 | 任务列表、搜索、筛选、排序、详情、预览、下载 | `GET /user/tasks` `GET /user/tasks/{id}` `GET /user/tasks/{id}/preview` `GET /user/tasks/{id}/download` |
| `/pricing` 定价 | 积分套餐列表、跳转支付 | `GET /public/packages` |
| `/redeem` 兑换 | 兑换码校验与兑换、最近兑换记录 | `POST /user/redeem-codes/redeem` `GET /user/redeem-records` |
| `/profile` 个人中心 | 个人资料、积分余额、积分流水 | `GET /user/me` `GET /user/credit-transactions` |
| `/auth` 登录注册 | 密码登录、验证码登录、注册、发送验证码、忘记密码、重置密码 | 见“认证接口” |

### 5.2 管理后台

| 页面 | 可见功能 | 需要接口 |
| --- | --- | --- |
| `/admin` 控制台 | 汇总指标、最近任务、最近积分变化 | `GET /admin/overview` |
| `/admin/models` | 模型列表、新增、编辑、状态切换、参数配置 | `GET/POST/PATCH /admin/models` |
| `/admin/providers` | 供应商列表、新增、编辑、映射配置、健康检查 | `GET/POST/PATCH /admin/providers` |
| `/admin/prompt-fields` | 字段列表、新增、编辑、启停、排序 | `GET/POST/PATCH /admin/prompt-fields` |
| `/admin/packages` | 套餐列表、新增、编辑、展示/隐藏、排序 | `GET/POST/PATCH /admin/packages` |
| `/admin/redeem-codes` | 列表、筛选、单个创建、批量生成、禁用、导出 CSV | `GET /admin/redeem-codes` `POST /admin/redeem-codes` `POST /admin/redeem-codes/batch` `PATCH /admin/redeem-codes/{id}` `GET /admin/redeem-codes/export` |
| `/admin/users` | 用户列表、查看任务、查看流水、生成补偿兑换码 | `GET /admin/users` `GET /admin/users/{id}` `GET /admin/users/{id}/tasks` `GET /admin/users/{id}/transactions` `POST /admin/users/{id}/redeem-codes` |
| `/admin/tasks` | 任务列表、筛选、详情、手动标记失败 | `GET /admin/tasks` `GET /admin/tasks/{id}` `POST /admin/tasks/{id}/mark-failed` |
| `/admin/transactions` | 流水列表、筛选 | `GET /admin/credit-transactions` |

### 5.3 本轮复查结论

基于当前前端页面和 `video-generation-mvp.md`，建议第一版后端按以下口径实现：

- 用户端兑换页右侧正式版应展示“我的兑换记录”，不能暴露全量兑换码池
- 工作台“保存草稿”不阻塞 P0 闭环，放到 P1；如果前端保留按钮，P0 阶段可以先提示“即将支持”
- 用户端公共模型接口只返回 `available` `maintenance` `coming_soon`，不返回 `closed`
- 只有 `available` 模型允许创建任务；`maintenance` 和 `coming_soon` 可以展示但不可生成
- 套餐外链支付不接平台支付回调，积分入账只通过兑换码完成
- 下载/预览按 PRD 可不做防盗链；但为了不暴露 MinIO 私有地址，后端仍建议返回平台签发的可访问 URL
- 后台操作日志是 MVP 要求，后端需要为新增、编辑、禁用、标记失败、批量生成、导出等关键操作记录审计日志

---

## 6. 认证接口

### 6.1 普通用户认证

#### `POST /api/v1/auth/email-code/send`

- 权限：`public`
- 用途：发送邮箱验证码
- 请求：

```json
{
  "email": "user@example.com",
  "scene": "login"
}
```

- `scene` 建议支持：`login` `register` `reset_password`
- 规则：
  - 同一邮箱 60 秒限流
  - 验证码 10 分钟有效

#### `POST /api/v1/auth/login/code`

- 权限：`public`
- 用途：邮箱验证码登录；首次登录自动注册
- 请求：

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

- 返回：

```json
{
  "access_token": "xxx",
  "refresh_token": "xxx",
  "user": {
    "id": "u_001",
    "email": "user@example.com",
    "credit_balance": 268
  }
}
```

#### `POST /api/v1/auth/register`

- 权限：`public`
- 用途：邮箱 + 密码注册
- 请求：

```json
{
  "email": "user@example.com",
  "password": "******",
  "email_code": "123456"
}
```

#### `POST /api/v1/auth/login/password`

- 权限：`public`
- 用途：邮箱密码登录

#### `POST /api/v1/auth/password/reset/request`

- 权限：`public`
- 用途：忘记密码时发送验证码

#### `POST /api/v1/auth/password/reset/confirm`

- 权限：`public`
- 用途：提交验证码和新密码完成重置

#### `POST /api/v1/auth/refresh`

- 权限：`public`
- 用途：刷新 token

#### `POST /api/v1/auth/logout`

- 权限：`user`
- 用途：退出登录

#### `GET /api/v1/user/me`

- 权限：`user`
- 用途：获取当前登录用户信息
- 返回字段建议：
  - `id`
  - `email`
  - `credit_balance`
  - `total_recharge_credits`
  - `total_consumed_credits`
  - `member_since`
  - `last_login_at`

### 6.2 管理员认证

#### `POST /api/v1/admin/auth/login`

- 权限：`public`
- 用途：管理员后台登录

#### `POST /api/v1/admin/auth/logout`

- 权限：`admin`

#### `GET /api/v1/admin/auth/me`

- 权限：`admin`
- 用途：获取管理员信息与登录态

---

## 7. 用户端公共浏览接口

### 7.1 `GET /api/v1/public/models`

- 权限：`public`
- 用途：工作台模型列表
- 只返回用户端可见模型：`available` `maintenance` `coming_soon`
- 不返回 `closed` 模型
- 返回字段建议：
  - `id`
  - `name`
  - `provider_name`
  - `badge`
  - `description`
  - `status`
  - `billing_type`
  - `price_per_second`
  - `price_per_generation`
  - `supported_input_types`
  - `supported_input_combinations`
  - `aspect_ratio_options`
  - `supported_resolutions`
  - `duration_options`
  - `default_duration_seconds`
  - `input_asset_rules`
  - `resolution_price_rules`
  - `input_price_rules`
  - `sort_order`

### 7.2 `GET /api/v1/public/models/{id}`

- 权限：`public`
- 用途：获取单个模型完整配置

### 7.3 `GET /api/v1/public/prompt-fields`

- 权限：`public`
- 用途：获取高级提示词字段配置
- 只返回 `is_enabled = true` 的字段

### 7.4 `POST /api/v1/public/generation/estimate`

- 权限：`public`
- 用途：实时计算预计消耗积分
- 请求：

```json
{
  "model_id": "grok-video",
  "prompt_mode": "advanced",
  "input_types": ["text", "image"],
  "aspect_ratio": "9:16",
  "resolution": "720p",
  "duration_seconds": 8
}
```

- 返回：

```json
{
  "credit_cost": 192,
  "billing_type": "per_second",
  "billing_detail": {
    "base_price": 16,
    "duration_seconds": 8,
    "resolution_multiplier": 1.5,
    "input_combo_multiplier": 1
  }
}
```

### 7.5 `GET /api/v1/public/packages`

- 权限：`public`
- 用途：积分套餐列表
- 只返回 `status = visible` 的套餐
- 返回外链支付配置字段：`payment_provider` `payment_url` `button_text`
- 平台不处理支付成功回调，支付后的积分入账只能通过兑换码完成

---

## 8. 用户素材上传接口

### 8.1 `POST /api/v1/user/uploads`

- 权限：`user`
- 用途：上传图片、视频、音频素材
- 建议支持 `multipart/form-data`
- 上传后的文件统一存到 `MinIO`
- 请求字段：
  - `file`
  - `asset_type`：`image` `video` `audio`
  - `model_id`

- 返回字段：
  - `asset_id`
  - `asset_type`
  - `file_name`
  - `file_size`
  - `mime_type`
  - `url`
  - `expires_at`

- 规则：
  - 上传前按模型规则校验格式、大小、数量
  - 游客不能上传

备注：如果你们采用 `MinIO` 直传，也可以拆成两步：

- `POST /user/uploads/presign`
- `POST /user/uploads/confirm`

---

## 9. 用户任务接口

### 9.1 `POST /api/v1/user/tasks`

- 权限：`user`
- 用途：创建视频生成任务
- 请求：

```json
{
  "model_id": "grok-video",
  "prompt_mode": "advanced",
  "prompt": "拼接后的最终提示词",
  "advanced_prompt_json": {
    "subject": "一位短发女导演",
    "action": "回头看向镜头"
  },
  "input_types": ["text", "image"],
  "input_assets": [
    {
      "asset_id": "asset_001",
      "asset_type": "image",
      "url": "https://..."
    }
  ],
  "aspect_ratio": "9:16",
  "resolution": "720p",
  "duration_seconds": 8,
  "seed": 12345
}
```

- 返回：

```json
{
  "task_id": "task_001",
  "status": "pending",
  "credit_cost": 192,
  "credit_balance_after": 268
}
```

- 后端必须做的校验：
  - 用户已登录
  - 模型存在
  - 模型状态可用
  - 输入类型组合受支持
  - 素材格式/数量/大小合法
  - 比例/清晰度/时长合法
  - 提示词合法
  - 积分充足

### 9.2 `GET /api/v1/user/tasks`

- 权限：`user`
- 用途：任务列表
- 支持查询参数：
  - `page`
  - `page_size`
  - `keyword`
  - `status`
  - `sort_by=created_at|credit_cost`
  - `sort_order=desc|asc`

### 9.3 `GET /api/v1/user/tasks/{id}`

- 权限：`user`
- 用途：任务详情
- 只能查看自己的任务
- 返回字段建议：
  - 基础任务信息
  - 输入参数快照
  - 计费快照
  - 上游状态快照
  - `video_url`
  - `cover_url`
  - `storage_expires_at`
  - `error_message`

### 9.4 `GET /api/v1/user/tasks/{id}/preview`

- 权限：`user`
- 用途：获取预览地址
- 仅成功且未过期任务可用
- 返回建议：`preview_url` `expires_at`

### 9.5 `GET /api/v1/user/tasks/{id}/download`

- 权限：`user`
- 用途：获取下载地址
- 仅成功且未过期任务可用
- 返回建议：`download_url` `expires_at`

### 9.6 `POST /api/v1/user/task-drafts`

- 权限：`user`
- 用途：保存草稿
- 优先级：P1，可不阻塞 P0

说明：当前前端有“保存草稿”按钮，但 PRD 没把草稿写进 MVP 必需闭环。P0 可以先不实现；如果前端保留按钮，建议先做不可用提示。P1 如果实现，至少还需要：

- `GET /api/v1/user/task-drafts`
- `GET /api/v1/user/task-drafts/{id}`
- `PATCH /api/v1/user/task-drafts/{id}`
- `DELETE /api/v1/user/task-drafts/{id}`

---

## 10. 兑换码、积分、个人中心接口

### 10.1 `POST /api/v1/user/redeem-codes/redeem`

- 权限：`user`
- 用途：兑换码充值
- 请求：

```json
{
  "code": "REEL-GROWTH-77Q1"
}
```

- 返回：

```json
{
  "redeem_code_id": "rc_001",
  "credits_added": 500,
  "credit_balance_after": 768,
  "transaction_id": "txn_001"
}
```

- 后端必须校验：
  - 兑换码存在
  - 未使用
  - 未禁用
  - 未过期

### 10.2 `GET /api/v1/user/redeem-records`

- 权限：`user`
- 用途：查看自己的兑换记录
- 支持分页：`page` `page_size`
- 返回字段建议：
  - `id`
  - `code_masked`
  - `credits`
  - `channel`
  - `redeemed_at`
  - `transaction_id`

注意：  
当前前端兑换页右侧的 mock 表格像是在展示“兑换码状态预览”。  
正式后端不能把整个兑换码池暴露给普通用户。用户端最多只能看：

- 自己的兑换记录
- 自己最近成功/失败的兑换尝试

### 10.3 `GET /api/v1/user/credit-transactions`

- 权限：`user`
- 用途：个人积分流水
- 支持筛选：
  - `transaction_type=redeem|generation|refund`
  - `page`
  - `page_size`
  - `date_from`
  - `date_to`

---

## 11. 管理后台总览接口

### 11.1 `GET /api/v1/admin/overview`

- 权限：`admin`
- 用途：控制台首页
- 返回建议包含：
  - `total_users`
  - `available_models`
  - `processing_tasks`
  - `today_credit_consumption`
  - `recent_tasks`
  - `recent_transactions`

---

## 12. 管理后台模型接口

### 12.1 `GET /api/v1/admin/models`

- 权限：`admin`
- 用途：模型列表
- 支持筛选：
  - `status=available|maintenance|coming_soon|closed`
  - `provider_id`
  - `billing_type`
  - `keyword`

### 12.2 `POST /api/v1/admin/models`

- 权限：`admin`
- 用途：新增模型
- 请求字段建议：
  - `name`
  - `provider_name`
  - `model_key`
  - `description`
  - `badge`
  - `status`
  - `billing_type`
  - `price_per_second`
  - `price_per_generation`
  - `duration_options`
  - `default_duration_seconds`
  - `supported_input_types`
  - `supported_input_combinations`
  - `input_asset_rules`
  - `aspect_ratio_options`
  - `supported_resolutions`
  - `resolution_price_rules`
  - `input_price_rules`
  - `upstream_provider_id`
  - `upstream_model_id`
  - `upstream_default_params`
  - `upstream_param_mapping`
  - `sort_order`

### 12.3 `GET /api/v1/admin/models/{id}`

- 权限：`admin`
- 用途：模型详情

### 12.4 `PATCH /api/v1/admin/models/{id}`

- 权限：`admin`
- 用途：编辑模型

### 12.5 `PATCH /api/v1/admin/models/{id}/status`

- 权限：`admin`
- 用途：切换状态
- 请求：

```json
{
  "status": "maintenance"
}
```

说明：  
不建议做物理删除。模型下线用 `closed` 状态。`closed` 模型不在用户端公共模型接口返回，但历史任务仍可查看。

---

## 13. 管理后台上游供应商接口

### 13.1 `GET /api/v1/admin/providers`

- 权限：`admin`

### 13.2 `POST /api/v1/admin/providers`

- 权限：`admin`
- 用途：新增供应商
- 请求字段建议：
  - `name`
  - `adapter_key`
  - `api_base_url`
  - `auth_type`
  - `credentials`
  - `update_mode`
  - `callback_secret`
  - `polling_interval_seconds`
  - `max_wait_seconds`
  - `max_retry_count`
  - `status`

### 13.3 `GET /api/v1/admin/providers/{id}`

- 权限：`admin`

### 13.4 `PATCH /api/v1/admin/providers/{id}`

- 权限：`admin`

### 13.5 `PATCH /api/v1/admin/providers/{id}/status`

- 权限：`admin`
- 请求字段：`status=enabled|disabled`

### 13.6 `POST /api/v1/admin/providers/{id}/health-check`

- 权限：`admin`
- 用途：手动健康检查

### 13.7 `GET /api/v1/admin/providers/{id}/mappings`

- 权限：`admin`
- 用途：查看参数映射、状态映射、枚举映射

### 13.8 `PUT /api/v1/admin/providers/{id}/mappings`

- 权限：`admin`
- 用途：保存映射配置

---

## 14. 管理后台高级提示词字段接口

### 14.1 `GET /api/v1/admin/prompt-fields`

- 权限：`admin`

### 14.2 `POST /api/v1/admin/prompt-fields`

- 权限：`admin`
- 用途：新增字段
- 请求字段：
  - `field_key`
  - `label`
  - `description`
  - `placeholder`
  - `control_type`
  - `options`
  - `allow_custom_value`
  - `is_required`
  - `is_enabled`
  - `sort_order`

### 14.3 `GET /api/v1/admin/prompt-fields/{id}`

- 权限：`admin`

### 14.4 `PATCH /api/v1/admin/prompt-fields/{id}`

- 权限：`admin`

### 14.5 `PATCH /api/v1/admin/prompt-fields/{id}/status`

- 权限：`admin`
- 请求字段：`is_enabled=true|false`

### 14.6 `PATCH /api/v1/admin/prompt-fields/reorder`

- 权限：`admin`
- 用途：调整排序

---

## 15. 管理后台积分套餐接口

### 15.1 `GET /api/v1/admin/packages`

- 权限：`admin`

### 15.2 `POST /api/v1/admin/packages`

- 权限：`admin`
- 用途：新增套餐
- 请求字段：
  - `title`
  - `description`
  - `credits`
  - `price_label`
  - `payment_provider`
  - `payment_url`
  - `button_text`
  - `is_recommended`
  - `status`
  - `sort_order`

### 15.3 `GET /api/v1/admin/packages/{id}`

- 权限：`admin`

### 15.4 `PATCH /api/v1/admin/packages/{id}`

- 权限：`admin`

### 15.5 `PATCH /api/v1/admin/packages/{id}/status`

- 权限：`admin`
- 请求字段：`status=visible|hidden`

### 15.6 `PATCH /api/v1/admin/packages/reorder`

- 权限：`admin`

---

## 16. 管理后台兑换码接口

### 16.1 `GET /api/v1/admin/redeem-codes`

- 权限：`admin`
- 支持筛选：
  - `keyword`
  - `status=unused|used|disabled|expired`
  - `batch_no`
  - `channel`
  - `used_by`
  - `date_from`
  - `date_to`

### 16.2 `POST /api/v1/admin/redeem-codes`

- 权限：`admin`
- 用途：单个创建兑换码
- 请求字段：
  - `code`（可选，允许后端自动生成）
  - `credits`
  - `batch_no`
  - `channel`
  - `note`
  - `expires_at`

### 16.3 `POST /api/v1/admin/redeem-codes/batch`

- 权限：`admin`
- 用途：批量生成兑换码
- 请求字段：
  - `count`
  - `credits`
  - `batch_no`
  - `channel`
  - `note`
  - `expires_at`
  - `prefix`（可选）

- 返回：
  - `batch_no`
  - `generated_count`

### 16.4 `GET /api/v1/admin/redeem-codes/{id}`

- 权限：`admin`

### 16.5 `PATCH /api/v1/admin/redeem-codes/{id}`

- 权限：`admin`
- 用途：修改备注、过期时间、渠道，或禁用状态

### 16.6 `PATCH /api/v1/admin/redeem-codes/{id}/disable`

- 权限：`admin`
- 规则：已使用兑换码不能禁用；未使用且未过期兑换码可以禁用

### 16.7 `GET /api/v1/admin/redeem-codes/export`

- 权限：`admin`
- 用途：导出 CSV
- 支持按筛选条件导出

---

## 17. 管理后台用户接口

### 17.1 `GET /api/v1/admin/users`

- 权限：`admin`
- 支持筛选：
  - `keyword`
  - `date_from`
  - `date_to`

### 17.2 `GET /api/v1/admin/users/{id}`

- 权限：`admin`
- 返回字段建议：
  - 用户基础资料
  - 当前余额
  - 累计充值
  - 累计消耗
  - 最近登录
  - 注册时间

### 17.3 `GET /api/v1/admin/users/{id}/tasks`

- 权限：`admin`
- 用途：查看指定用户任务

### 17.4 `GET /api/v1/admin/users/{id}/transactions`

- 权限：`admin`
- 用途：查看指定用户积分流水

### 17.5 `POST /api/v1/admin/users/{id}/redeem-codes`

- 权限：`admin`
- 用途：给指定用户生成补偿/赠送兑换码
- 请求字段：
  - `credits`
  - `note`
  - `channel`
  - `expires_at`

备注：  
MVP 不允许管理员直接改余额，这个接口是必须的，因为 PRD 规定补偿通过“生成兑换码”完成。

---

## 18. 管理后台任务接口

### 18.1 `GET /api/v1/admin/tasks`

- 权限：`admin`
- 支持筛选：
  - `keyword`
  - `status=pending|submitted|processing|succeeded|failed|refunded`
  - `model_id`
  - `user_id`
  - `date_from`
  - `date_to`

### 18.2 `GET /api/v1/admin/tasks/{id}`

- 权限：`admin`
- 返回内容建议比用户端详情更完整：
  - 平台任务参数
  - 素材信息
  - 计费快照
  - 上游请求快照
  - 上游响应快照
  - 重试次数
  - 错误原因
  - 退款信息

### 18.3 `POST /api/v1/admin/tasks/{id}/mark-failed`

- 权限：`admin`
- 用途：管理员手动标记失败
- 请求：

```json
{
  "reason": "上游长时间无响应"
}
```

- 规则：
  - 幂等
  - 如果任务已退款，不能重复退款
  - 标记失败后自动触发退款流水

### 18.4 `POST /api/v1/admin/tasks/{id}/retry-submit`

- 权限：`admin`
- 用途：管理员异常处理时手动重投上游任务
- 优先级：P1

说明：  
PRD 没强制写这个，但真实运营里很常用。  
如果某任务停留在 `pending` 或 `submitted` 异常状态，管理员可能需要手动重投。

---

## 19. 管理后台积分流水接口

### 19.1 `GET /api/v1/admin/credit-transactions`

- 权限：`admin`
- 支持筛选：
  - `user_id`
  - `transaction_type`
  - `related_id`
  - `date_from`
  - `date_to`
  - `keyword`

### 19.2 `GET /api/v1/admin/credit-transactions/{id}`

- 权限：`admin`
- 用途：查看单笔流水详情

---

## 20. 上游回调接口

### 20.1 `POST /api/v1/webhooks/providers/{provider_key}`

- 权限：外部上游调用
- 用途：接收上游任务回调
- 后端要求：
  - 验签或来源校验
  - 幂等
  - 状态映射
  - 保存原始回调报文
  - 成功时更新任务状态
  - 失败时触发退款

---

## 21. 后台操作日志

后台关键操作必须记录操作日志，保留 90 天。日志不一定需要第一版做复杂查询页面，但数据必须落库。

### 21.1 建议记录的操作

- 管理员登录、退出
- 新增、编辑、切换模型状态
- 新增、编辑、切换供应商状态
- 新增、编辑、启停提示词字段
- 新增、编辑、展示或隐藏积分套餐
- 单个创建、批量生成、禁用、导出兑换码
- 查看用户详情、生成补偿兑换码
- 手动标记任务失败、手动重试任务

### 21.2 字段建议

- `id`
- `admin_id`
- `admin_email`
- `action`
- `resource_type`
- `resource_id`
- `request_id`
- `ip`
- `user_agent`
- `before_json`
- `after_json`
- `created_at`

---

## 22. 不一定暴露成 HTTP，但必须实现的后台任务

这些不一定给前端直接调，但后端必须做：

### 22.1 上游状态轮询任务

- 扫描 `submitted` / `processing` 的任务
- 调上游查询接口
- 更新平台状态

### 22.2 任务超时处理

- 超过 `max_wait_seconds` 仍未成功
- 标记失败
- 自动退款

### 22.3 结果文件转存

- 上游成功后转存视频和封面到 `MinIO`
- 更新 `video_url` `cover_url`
- 写入 `storage_expires_at`

### 22.4 结果文件过期清理

- 7 天后删除 `MinIO` 中的结果文件
- 更新 `storage_deleted_at`
- 保留任务记录

### 22.5 失败退款幂等处理

- 保证同一任务只退一次
- 保证同一任务只生成一条退款流水

---

## 23. 当前前端已经露出，但 P0 不一定要做的接口

这几项前端里已经有交互入口或运营价值，但不阻塞 P0 闭环：

### 23.1 保存草稿

- 前端已有按钮
- P0 可以不实现，前端先提示“即将支持”
- P1 实现任务草稿接口

### 23.2 用户端任务预览地址

- 前端有“预览”“下载”按钮
- P0 保留 `/preview` `/download` 接口
- 即使视频 URL 可公开访问，也建议由后端返回平台可控 URL

### 23.3 用户端兑换页右侧状态表

- 当前 mock 像“兑换码状态预览”
- 正式版不能让普通用户看到全量兑换码池
- P0 改成“我的兑换记录”

### 23.4 管理员重试任务

- 前端还没有按钮
- P1 推荐实现

---

## 24. 明确不需要后端接口的内容

以下内容目前可以先不做：

- 视频示例管理
- 图片生成、聊天、语音等非视频能力
- 用户主动删除任务
- 用户主动删除视频文件
- 支付成功回调入账
- 真正支付订单系统
- 管理员直接修改用户积分余额

---

## 25. 建议后端优先级

### P0 第一批必须先做

1. 用户认证
2. 管理员认证
3. 模型列表
4. 提示词字段列表
5. 价格试算
6. 素材上传
7. 创建任务
8. 用户任务列表 / 详情
9. 套餐列表
10. 兑换码兑换
11. 用户信息 / 积分流水
12. 后台模型 CRUD
13. 后台兑换码 CRUD + 批量生成 + 导出
14. 后台用户列表
15. 后台任务列表 / 详情 / 标记失败
16. 后台积分流水列表
17. 上游回调
18. 轮询、超时、退款、转存

### P1 第二批补齐

1. 后台供应商完整配置
2. 后台提示词字段 CRUD
3. 后台套餐 CRUD
4. 后台控制台聚合接口
5. 用户草稿能力
6. 管理员重试任务

---

## 26. 最后一句实话

你说得对，当前前端已经把很多“壳子和入口”做出来了，但像新增、编辑、批量生成、导出、状态切换、异常处理这些，真正落地都依赖后端接口。

所以后端同学不能只按页面表格字段做，需要按这份清单把：

- 页面接口
- 异步任务接口
- 管理操作接口
- 幂等与退款逻辑
- 上游回调与轮询

一起实现，MVP 才算真的闭环。
