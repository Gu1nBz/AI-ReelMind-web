# ReelMind 前后端联调对接文档

复核日期：2026-06-27

## 1. 文档结论

本次复核以真实代码为准：

- 前端仓库：`/Users/shiqiao/bz/AI-ReelMind-web`
- 后端仓库：`/Users/shiqiao/bz/AI-ReelMind-service`
- `/Users/shiqiao/web/project-approval` 不是当前 ReelMind 后端，不纳入本项目联调。

当前状态：

- 后端 MVP 基础接口已经基本覆盖：登录注册、模型、提示词字段、套餐、上传、任务、兑换码、积分流水、后台管理等都有路由和基础实现。
- 前端当前仍是 mock 数据驱动，页面里没有统一 API client，也没有真实登录态、上传、提交任务、轮询任务和后台 CRUD 对接。
- 联调重点不是“后端还差很多普通接口”，而是前端要系统性把 `src/mock/data.tsx` 替换为接口数据，并补齐表单、弹窗、上传、提交、状态轮询和鉴权保护。
- 真实模型生成闭环第一版直接接入 NewAPI 视频生成接口，模型范围为 `sora-2`、`veo-3.1`、`veo-3.1-fast`；如果上游报错，后端按真实失败任务处理，前端展示错误原因。

## 2. 参考来源

前端文档与代码：

- `video-generation-mvp.md`
- `docs/backend-api-handoff.md`
- `docs/backend-kickoff-master.md`
- `design-system/reelmind/MASTER.md`
- `src/app/router.tsx`
- `src/mock/data.tsx`
- `src/mock/types.ts`
- `src/pages/user/*`
- `src/pages/admin/*`

后端文档与代码：

- `/Users/shiqiao/bz/AI-ReelMind-service/README.md`
- `/Users/shiqiao/bz/AI-ReelMind-service/docs/backend-api-gap-list.md`
- `/Users/shiqiao/bz/AI-ReelMind-service/docs/provider-model-integration-plan.md`
- `/Users/shiqiao/bz/AI-ReelMind-service/docs/backend-architecture-stability-review.md`
- `/Users/shiqiao/bz/AI-ReelMind-service/internal/app/app.go`
- `/Users/shiqiao/bz/AI-ReelMind-service/internal/modules/**/handler.go`
- `/Users/shiqiao/bz/AI-ReelMind-service/internal/modules/shared/*.go`

## 3. 联调基础约定

### 3.0 已确认事项

本节记录 2026-06-27 用户已明确确认的联调口径。

1. 后端服务拆分
   - `api` 指后端 HTTP 服务进程，对外提供 `/api/v1/**` 接口。
   - `worker` 指后端异步任务进程，处理视频提交、轮询、回存、封面生成、退款等后台任务。
   - 前端只直接请求 `api`，不直接请求 `worker`。

2. 管理员账号
   - 管理员邮箱：`gu1nbzn@gmail.com`
   - 管理员密码：`GBz123321`
   - 后端需要将该账号作为 seed / bootstrap admin 准备好。
   - 该账号用于本地和联调初始化；生产环境应通过环境变量配置初始密码，并在首次部署后及时修改，避免长期保留固定明文密码。

3. 生成链路
   - 第一版需要先接入真实视频生成链路。
   - 模型先接 `sora-2`、`veo-3.1`、`veo-3.1-fast`，其中 `veo3` 按上游实际模型 ID 拆为 `veo-3.1` 和 `veo-3.1-fast`。
   - 如果上游模型不可用、排队失败、通道报错或额度异常，后端按真实失败处理，前端展示后端返回的错误信息。
   - 前端不能假装生成成功；任务成功必须来自后端真实任务状态。

4. MinIO 访问
   - 生产环境 `MINIO_PUBLIC_BASE_URL` 必须能被浏览器访问。
   - 否则用户无法查看封面、预览视频或下载视频。
   - 本地联调也应尽量使用浏览器可访问的地址。

5. 分页
   - 列表需要真实分页，后端已补真实 `COUNT(*)`。
   - 前端表格分页必须以接口返回的真实 `pagination.total` 为准。

### 3.1 服务地址

本地建议：

```text
frontend: http://localhost:5173
backend:  http://localhost:8080
api base: http://localhost:8080/api/v1
health:   http://localhost:8080/health
```

前端新增环境变量：

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

后端 CORS 需要包含：

```text
APP_ALLOWED_ORIGINS=http://localhost:5173
```

### 3.2 鉴权

用户端和后台都使用：

```text
Authorization: Bearer <access_token>
```

前端建议保存：

```text
reelmind_user_access_token
reelmind_user_refresh_token
reelmind_admin_access_token
reelmind_admin_refresh_token
```

刷新接口：

```http
POST /api/v1/auth/refresh
```

退出接口：

```http
POST /api/v1/auth/logout
POST /api/v1/admin/auth/logout
```

### 3.3 响应结构

后端统一 envelope：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "req_xxx"
}
```

错误结构：

```json
{
  "code": 400001,
  "message": "参数校验失败",
  "data": null,
  "request_id": "req_xxx",
  "errors": []
}
```

前端处理规则：

- `code === 0` 才进入业务成功分支。
- `401` 时优先尝试 refresh token，失败后跳转登录。
- `403` 后台跳转后台登录或提示无权限。
- `409` 用于积分不足、模型不可用、兑换码已使用等业务冲突，直接展示 `message`。
- 所有错误日志需要带上 `request_id`，方便后端查日志。

### 3.4 字段命名

后端 JSON 使用 `snake_case`，前端 React 现有 mock 类型使用 `camelCase`。

建议做法：

- `src/api/types.ts` 保留后端原始 `snake_case` 类型。
- `src/api/adapters.ts` 统一转换为页面需要的 `camelCase` view model。
- 不要在每个页面里手写字段转换。

## 4. 前端需要新增的 API 结构

建议新增：

```text
src/api/
  client.ts
  types.ts
  adapters.ts
  auth.ts
  public.ts
  user.ts
  admin.ts
```

职责：

- `client.ts`：baseURL、token 注入、错误处理、refresh、文件下载。
- `types.ts`：后端接口 DTO。
- `adapters.ts`：后端 DTO 到现有页面 view model 的转换。
- `auth.ts`：登录、注册、验证码、刷新、退出。
- `public.ts`：公共模型、套餐、提示词字段、价格试算。
- `user.ts`：用户资料、上传、任务、兑换码、积分流水。
- `admin.ts`：后台全部管理接口。

## 5. 用户端页面对接表

| 前端页面 | 当前状态 | 需要接入接口 |
| --- | --- | --- |
| `/auth` | 只有 mock 成功提示 | `POST /auth/email-code/send`、`POST /auth/login/code`、`POST /auth/register`、`POST /auth/login/password`、`POST /auth/password/reset/request`、`POST /auth/password/reset/confirm` |
| `/` 工作台 | 模型、字段、余额、任务都是 mock | `GET /public/models`、`GET /public/prompt-fields`、`GET /user/me`、`POST /public/generation/estimate`、`POST /user/uploads`、`POST /user/tasks`、`GET /user/tasks` |
| `/history` | mock 列表和本地筛选 | `GET /user/tasks`、`GET /user/tasks/:id`、`GET /user/tasks/:id/preview`、`GET /user/tasks/:id/download` |
| `/pricing` | mock 套餐 | `GET /public/packages`，点击按钮打开 `payment_url` 外链 |
| `/redeem` | mock 兑换成功 | `POST /user/redeem-codes/redeem`、`GET /user/redeem-codes/records`、`GET /user/me` |
| `/profile` | mock 用户和流水 | `GET /user/me`、`GET /user/credit-transactions`、`GET /user/redeem-codes/records` |
| `/contact` | 静态内容 | 暂不需要接口 |

## 6. 后台页面对接表

| 前端页面 | 当前状态 | 需要接入接口 |
| --- | --- | --- |
| `/admin` | mock 概览 | `GET /admin/overview` |
| `/admin/models` | mock 表格，按钮无动作 | `GET /admin/models`、`POST /admin/models`、`GET /admin/models/:id`、`PATCH /admin/models/:id`、`PATCH /admin/models/:id/status` |
| `/admin/providers` | mock 表格，按钮无动作 | `GET /admin/providers`、`POST /admin/providers`、`GET /admin/providers/:id`、`PATCH /admin/providers/:id`、`PATCH /admin/providers/:id/status`、`POST /admin/providers/:id/health-check`、`GET /admin/providers/:id/mappings`、`PUT /admin/providers/:id/mappings` |
| `/admin/prompt-fields` | mock 表格，按钮无动作 | `GET /admin/prompt-fields`、`POST /admin/prompt-fields`、`GET /admin/prompt-fields/:id`、`PATCH /admin/prompt-fields/:id`、`PATCH /admin/prompt-fields/:id/status`、`PATCH /admin/prompt-field-orders` |
| `/admin/packages` | mock 表格，按钮无动作 | `GET /admin/packages`、`POST /admin/packages`、`GET /admin/packages/:id`、`PATCH /admin/packages/:id`、`PATCH /admin/packages/:id/status`、`PATCH /admin/package-orders` |
| `/admin/redeem-codes` | mock 表格，导出/生成无动作 | `GET /admin/redeem-codes`、`POST /admin/redeem-codes`、`POST /admin/redeem-codes/batch`、`GET /admin/redeem-codes/:id`、`PATCH /admin/redeem-codes/:id`、`PATCH /admin/redeem-codes/:id/disable`、`GET /admin/redeem-code-exports` |
| `/admin/users` | mock 表格 | `GET /admin/users`、`GET /admin/users/:id`、`GET /admin/users/:id/tasks`、`GET /admin/users/:id/transactions`、`POST /admin/users/:id/redeem-codes` |
| `/admin/tasks` | mock 表格，详情/标记失败无动作 | `GET /admin/tasks`、`GET /admin/tasks/:id`、`POST /admin/tasks/:id/mark-failed`、`POST /admin/tasks/:id/refund` |
| `/admin/transactions` | mock 表格 | `GET /admin/credit-transactions`、`GET /admin/credit-transactions/:id` |

后台登录保护需要补：

```http
POST /api/v1/admin/auth/login
GET  /api/v1/admin/auth/me
POST /api/v1/admin/auth/logout
```

## 7. 关键接口字段

### 7.1 登录返回

用户登录、注册、验证码登录成功返回：

```json
{
  "access_token": "xxx",
  "refresh_token": "xxx",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "credit_balance": 100,
    "total_recharge_credits": 500,
    "total_consumed_credits": 400,
    "member_since": "2026-06-27T10:00:00+08:00"
  }
}
```

后台登录成功返回：

```json
{
  "access_token": "xxx",
  "refresh_token": "xxx",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "status": "enabled"
  }
}
```

### 7.2 模型字段映射

| 后端字段 | 前端现有字段 |
| --- | --- |
| `provider_name` | `provider` |
| `billing_type` | `billingType` |
| `price_per_second` / `price_per_generation` | `price` |
| `duration_options` | `durations` |
| `default_duration_seconds` | `defaultDuration` |
| `supported_input_types` | `inputCapabilities` |
| `aspect_ratio_options` | `aspectRatios` |
| `supported_resolutions` | `resolutions` |

前端类型需要补齐：

- `ModelStatus` 增加 `disabled`。
- `TaskStatus` 增加 `refunding`、`timed_out`。
- 任务中 `cover_url` 对应现有 `thumbnail`。

### 7.3 上传素材

```http
POST /api/v1/user/uploads
Content-Type: multipart/form-data
```

字段：

```text
file: File
asset_type: image | video | audio
```

返回：

```json
{
  "asset_id": "uuid",
  "asset_type": "image",
  "file_name": "demo.png",
  "file_size": 102400,
  "mime_type": "image/png",
  "url": "http://localhost:9000/reelmind-assets/...",
  "bucket_name": "reelmind-assets",
  "object_key": "assets/..."
}
```

前端要求：

- 使用 Ant Design `Upload`，不要用普通按钮假上传。
- 上传成功后把 `asset_id` 放入创建任务请求。
- 图生视频传用户上传到 MinIO 后得到的公开 URL，但业务请求仍以 `asset_id` 为准，由后端二次校验归属。

### 7.4 价格试算

```http
POST /api/v1/public/generation/estimate
```

请求：

```json
{
  "model_id": "uuid",
  "prompt_mode": "advanced",
  "input_types": ["text", "image"],
  "aspect_ratio": "16:9",
  "resolution": "1280x720",
  "duration_seconds": 4
}
```

返回：

```json
{
  "credit_cost": 120,
  "billing_type": "per_second",
  "billing_detail": {
    "base_price": 120,
    "duration_seconds": 4,
    "resolution_multiplier": 1,
    "input_combo_multiplier": 1
  }
}
```

### 7.5 创建任务

```http
POST /api/v1/user/tasks
```

请求：

```json
{
  "model_id": "uuid",
  "prompt_mode": "advanced",
  "prompt": "一段完整的视频创作描述",
  "advanced_prompt_json": {
    "subject": "人物",
    "action": "转身看向镜头"
  },
  "input_types": ["text", "image"],
  "input_assets": [
    {
      "asset_id": "uuid",
      "asset_type": "image"
    }
  ],
  "aspect_ratio": "16:9",
  "resolution": "1280x720",
  "duration_seconds": 4,
  "seed": 123
}
```

返回：

```json
{
  "task_id": "uuid",
  "status": "pending",
  "credit_cost": 120,
  "credit_balance_after": 880
}
```

前端要求：

- 提交成功后立即刷新余额和任务列表。
- 新建任务后不提供取消按钮。
- 失败、超时、结果处理失败由后端退款，前端只展示退款状态。

### 7.6 任务列表和详情

```http
GET /api/v1/user/tasks?page=1&page_size=20
GET /api/v1/user/tasks/:id
```

核心返回字段：

```json
{
  "id": "uuid",
  "model_id": "uuid",
  "prompt": "string",
  "prompt_mode": "advanced",
  "input_types": ["text", "image"],
  "input_assets": [],
  "aspect_ratio": "16:9",
  "resolution": "1280x720",
  "duration_seconds": 4,
  "credit_cost": 120,
  "refunded_credit_cost": 0,
  "status": "processing",
  "video_url": "",
  "cover_url": "",
  "error_message": "",
  "created_at": "2026-06-27T10:00:00+08:00"
}
```

状态：

```text
pending
submitted
processing
succeeded
failed
refunding
refunded
timed_out
```

前端轮询策略：

- 创建任务后进入轮询。
- `pending`、`submitted`、`processing` 每 3 秒拉一次详情。
- 超过 2 分钟后可降为每 10 秒。
- 终态 `succeeded`、`failed`、`refunded`、`timed_out` 停止轮询。
- 列表和历史页默认展示 `cover_url`，不要批量加载 `video_url`。
- 用户点击预览时再请求 `GET /user/tasks/:id/preview`。
- 用户点击下载时再请求 `GET /user/tasks/:id/download`。

### 7.7 兑换码

兑换：

```http
POST /api/v1/user/redeem-codes/redeem
```

请求：

```json
{
  "code": "REEL-START-88A9"
}
```

返回：

```json
{
  "redeem_code_id": "uuid",
  "credits_added": 100,
  "credit_balance_after": 980,
  "transaction_id": "uuid"
}
```

后台导出：

```http
GET /api/v1/admin/redeem-code-exports
```

返回 CSV 文件，不是 envelope JSON。前端需要用 blob 下载。

## 8. 对接优先级

### P0：先跑通用户主链路

1. 新增统一 API client、token 管理、错误处理。
2. `/auth` 接真实登录、注册、验证码、刷新、退出。
3. `AppNavbar` 接真实用户余额和登录态。
4. 工作台接真实模型、提示词字段、价格试算。
5. 工作台上传图片/音频接 MinIO 上传接口。
6. 工作台创建任务接 `POST /user/tasks`，第一版模型先接 `sora-2`、`veo-3.1`、`veo-3.1-fast`。
7. `TaskList` 和 `/history` 接任务列表、详情轮询、预览、下载；上游报错时展示失败原因和退款状态。
8. `/redeem` 接兑换码兑换并刷新余额和流水。
9. `/profile` 接用户信息和积分流水。

### P1：后台基础运营闭环

1. 补后台登录页和后台路由守卫。
2. `/admin` 接概览。
3. 模型管理接列表、新增、编辑、状态切换。
4. 供应商管理接列表、新增、编辑、状态切换、健康检查、映射配置。
5. 兑换码管理接单个创建、批量生成、禁用、导出 CSV。
6. 任务管理接详情、标记失败、退款。
7. 用户管理接详情、用户任务、用户流水、补偿兑换码。

### P2：体验和效率补齐

1. 表格筛选、搜索、分页和空状态。
2. 后台操作日志页面可选接 `GET /admin/operation-logs`。
3. 上传前文件大小、格式校验。
4. 长任务轮询失败重试和网络恢复。
5. 移动端工作台上传、提交、任务卡片细节优化。

## 9. 风险点改进与闭环修复方案

本节用于后续执行修复计划。每个风险必须按“后端修复 -> 前端配合 -> 验收标准”闭环，不再停留在提醒或建议层面。

### 9.1 后端排序路由 wildcard 冲突风险已闭环

风险等级：P0

当前状态：已按本方案修复后端路由，旧 `/reorder` 路径不再作为联调目标。

问题背景：

- 兑换码导出冲突已经通过独立资源闭环：`GET /api/v1/admin/redeem-code-exports`。
- 修复前套餐排序、提示词字段排序曾放在资源集合下的 `reorder` 特殊路径，和 `/:id` 详情路由处于同一层级。

通俗解释：

- `:id` 是动态参数，表示“这里可以是任意 ID”。
- `reorder` 是固定单词，表示“排序操作”。
- 当 `/:id` 和 `/reorder` 放在同一层时，后续维护人员很容易把 `/reorder` 当成一个特殊 ID 或继续新增 `/export`、`/stats` 这类特殊路径，造成路由歧义或框架启动冲突。
- 即使当前 Gin 版本不一定立即报错，这也是不利于长期维护的路由设计。

风险原因：

- Gin/httprouter 对同一 HTTP method 下的静态段和动态段冲突比较敏感。
- 不建议只靠注册顺序解决，后续新增 `/stats`、`/summary`、`/export` 时容易再次踩坑。

闭环目标：

- 所有批量排序、导出、统计类接口都按独立资源命名，不和 `/:id` 详情路由共享同一层路径。

后端修复方案：

```text
PATCH /api/v1/admin/package-orders
PATCH /api/v1/admin/prompt-field-orders
```

请求体保持现有结构：

```json
{
  "items": [
    {
      "id": "uuid",
      "sort_order": 10
    }
  ]
}
```

代码调整：

- `packages.Handler` 新增 `RegisterAdminOrderRoutes(router gin.IRouter)`。
- `promptfields.Handler` 新增 `RegisterAdminOrderRoutes(router gin.IRouter)`。
- `internal/app/app.go` 中注册：

```go
packagesHandler.RegisterAdminRoutes(adminGroup.Group("/packages"))
packagesHandler.RegisterAdminOrderRoutes(adminGroup.Group("/package-orders"))

promptFieldsHandler.RegisterAdminRoutes(adminGroup.Group("/prompt-fields"))
promptFieldsHandler.RegisterAdminOrderRoutes(adminGroup.Group("/prompt-field-orders"))
```

- 已删除旧排序接口，前端不要再调用任何集合下的 `reorder` 路径。

前端配合方案：

- 套餐排序请求改为 `PATCH /admin/package-orders`。
- 提示词字段排序请求改为 `PATCH /admin/prompt-field-orders`。
- 前端不要再调用旧的 `/reorder` 路径。

验收标准：

- API 服务启动无 Gin wildcard panic。
- `PATCH /api/v1/admin/package-orders` 能完成套餐排序。
- `PATCH /api/v1/admin/prompt-field-orders` 能完成提示词字段排序。
- `PATCH /api/v1/admin/packages/:id` 只处理真实 UUID。
- `PATCH /api/v1/admin/prompt-fields/:id` 只处理真实 UUID。
- 文档、前端 API client、后端路由三处路径一致。

### 9.2 后台登录页和路由守卫缺失

风险等级：P0

问题：

- 前端目前 `/admin` 可以直接进入后台页面。
- 后台页面没有真实管理员登录态判断。
- 普通用户登录态和管理员登录态还没有在前端明确隔离。

闭环目标：

- 后台页面必须登录管理员后才能访问。
- 普通用户 token 不能访问后台页面和后台接口。
- 管理员退出后不能通过浏览器返回继续操作后台。

后端接口：

```http
POST /api/v1/admin/auth/login
GET  /api/v1/admin/auth/me
POST /api/v1/admin/auth/logout
```

前端修复方案：

- 新增后台登录页，建议路径：

```text
/admin/login
```

- 新增 `AdminRouteGuard`：
  - 进入 `/admin/*` 前读取 `reelmind_admin_access_token`。
  - 调用 `GET /admin/auth/me` 校验登录态。
  - 成功后渲染后台页面。
  - 失败后清理管理员 token 并跳转 `/admin/login`。

- 用户端和后台 token 分开存：

```text
reelmind_user_access_token
reelmind_user_refresh_token
reelmind_admin_access_token
reelmind_admin_refresh_token
```

- API client 按模块注入 token：
  - 用户接口注入 user token。
  - 后台接口注入 admin token。
  - 不允许后台接口复用 user token。

验收标准：

- 未登录访问 `/admin` 会跳转 `/admin/login`。
- 用户 token 访问后台接口返回 `401` 或 `403`，前端不能进入后台。
- 管理员登录后能访问后台。
- 管理员退出后 token 被清理，再访问后台会回到登录页。
- 后台刷新页面不会丢失有效登录态。

### 9.3 前端状态枚举不完整

风险等级：P0

问题：

前端 `TaskStatus` 当前缺少：

```text
refunding
timed_out
```

前端 `ModelStatus` 当前缺少：

```text
disabled
```

后端真实任务状态为：

```text
pending
submitted
processing
succeeded
failed
refunding
refunded
timed_out
```

后端真实模型状态为：

```text
available
maintenance
coming_soon
disabled
```

闭环目标：

- 前端所有状态枚举、状态标签、按钮禁用逻辑和后端保持一致。
- 不出现未知状态导致页面空白、按钮误启用、状态展示英文原值。

前端修复方案：

- 更新 API 类型和 view model 类型。
- `StatusTag` 增加完整状态映射：

```text
pending -> 排队中
submitted -> 已提交
processing -> 生成中
succeeded -> 已完成
failed -> 失败
refunding -> 退款中
refunded -> 已退款
timed_out -> 已超时
available -> 可用
maintenance -> 维护中
coming_soon -> 即将开放
disabled -> 已停用
```

- 工作台提交按钮禁用规则：
  - 只有 `available` 可以提交。
  - `maintenance`、`coming_soon`、`disabled` 都不可提交。

- 任务操作按钮规则：
  - 只有 `succeeded` 展示预览和下载。
  - `pending`、`submitted`、`processing` 展示处理中状态。
  - `failed`、`timed_out` 展示失败原因。
  - `refunding`、`refunded` 展示退款状态。
  - 不展示取消按钮。

验收标准：

- 后端返回任意合法状态，前端都能展示中文状态。
- 模型被后台停用后，用户端不能提交新任务。
- 失败、超时、退款中、已退款任务不会出现预览/下载按钮。
- TypeScript 类型检查通过。

### 9.4 分页 total 已修复，前端按真实分页对接

风险等级：P0

当前状态：后端已补真实 `COUNT(*)` 和统一分页结构，前端应直接使用接口返回的 `pagination.total`。

修复前问题背景：

部分列表曾用“当前页条数”当作 `total`，这会导致：

- 表格分页不准确。
- 后台运营无法判断真实总量。
- 翻页、筛选、导出范围容易误判。

闭环目标：

- 所有列表接口统一返回真实分页。
- 前端表格分页、筛选、刷新行为稳定。
- 本项目不接受用当前页条数伪造 `total`。

后端已修复范围：

已补这些列表的 `COUNT(*)`，前端统一按这些接口返回的 `pagination` 渲染：

```text
GET /api/v1/user/tasks
GET /api/v1/user/credit-transactions
GET /api/v1/user/redeem-codes/records
GET /api/v1/user/uploads
GET /api/v1/admin/users
GET /api/v1/admin/tasks
GET /api/v1/admin/redeem-codes
GET /api/v1/admin/credit-transactions
GET /api/v1/admin/operation-logs
```

统一分页结构：

```json
{
  "list": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 120,
    "total_pages": 6
  }
}
```

前端配合方案：

- Ant Design `Table` 使用后端 `pagination.total`。
- 翻页时带 `page`、`page_size` 重新请求。
- 筛选条件变化时回到第一页。
- 暂不自行在前端计算总数。

验收标准：

- 数据超过一页时，前端能正常翻页。
- 删除筛选条件后总数恢复正确。
- 用户端历史记录、后台任务、兑换码、流水列表分页一致。

### 9.5 真实模型生成闭环第一版对接范围

风险等级：P0

当前口径：

用户已确认：第一版必须接入真实模型调用。

第一版模型范围：

```text
sora-2
veo-3.1
veo-3.1-fast
```

其中 `veo3` 按上游实际模型 ID 拆为 `veo-3.1` 和 `veo-3.1-fast`。上游如果报错，按真实失败链路处理即可，不需要为了演示伪造成功。

后端需要按以下真实链路实现，不再把生成链路留空：

- NewAPI adapter。
- `video:submit` 调用真实 `POST /v1/video/generations`。
- `video:poll` 调用真实状态查询。
- 下载上游视频 URL。
- 回存 MinIO。
- 生成封面图。
- 失败、超时、结果处理失败自动退款。

闭环目标：

- 前端只接平台任务接口，不直接感知上游。
- 后端负责上游提交、轮询、结果下载、MinIO 回存、封面生成和退款。
- 用户列表默认展示封面，点击预览才加载视频。
- 上游失败时，任务进入失败或退款相关状态，前端展示真实错误原因。

后端修复方案：

任务提交：

```text
video_tasks.pending
-> worker video:submit
-> NewAPI POST /v1/video/generations
-> 保存 upstream_task_id / request / response
-> video_tasks.submitted
-> 入队 video:poll
```

任务轮询：

```text
submitted / processing
-> NewAPI GET /v1/video/generations/{task_id}
-> completed: 下载视频并回存 MinIO
-> failed: 标记失败并退款
-> timeout: 标记 timed_out 并退款
```

结果回存：

```text
上游 video url
-> 后端下载
-> 上传 MinIO results bucket
-> ffmpeg 截封面
-> 上传 cover.jpg
-> 写入 video_url / cover_url / result object key
```

退款规则：

- 用户不能取消任务。
- 只有失败、超时、结果处理失败才能退款。
- 退款必须幂等，不能重复加积分。
- 积分流水必须记录 `refund`。

前端配合方案：

- 创建任务后只展示平台 task id。
- 轮询 `GET /user/tasks/:id`。
- 列表和历史页默认使用 `cover_url`。
- 只有点击预览时才请求 `GET /user/tasks/:id/preview`。
- 只有点击下载时才请求 `GET /user/tasks/:id/download`。
- 上游返回错误时展示 `error_message`，不要吞掉错误，也不要改成假成功。
- 不展示用户取消任务入口。

验收标准：

- 成功任务最终有 `cover_url` 和可播放 `preview_url`。
- 历史列表不会批量加载多个视频文件。
- 上游失败后任务变为失败或已退款，余额恢复，流水出现退款记录。
- 超时任务不会永久卡在处理中。
- 任务刷新、关闭页面再回来后状态仍正确。

### 9.6 真实支付不做闭环，避免误接订单系统

风险等级：P1

问题：

MVP 明确不做真实支付和订单闭环，只做：

- 套餐展示。
- 外链支付页跳转。
- 兑换码兑换入账。

如果前端误做支付状态、订单、支付回调，会扩大范围并影响上线节奏。

闭环目标：

- 前端充值入口只展示套餐和外链支付按钮。
- 积分入账只通过兑换码。
- 后端不实现支付订单表、支付回调和自动入账。

后端边界：

- 保留套餐接口：

```http
GET /api/v1/public/packages
GET /api/v1/admin/packages
POST /api/v1/admin/packages
PATCH /api/v1/admin/packages/:id
PATCH /api/v1/admin/packages/:id/status
```

- 套餐中必须配置：

```text
payment_url
payment_provider
price_label
button_text
```

前端修复方案：

- `/pricing` 点击套餐按钮直接打开 `payment_url`。
- 不创建订单。
- 不轮询支付状态。
- 不展示“支付成功自动到账”。
- `/redeem` 作为唯一积分入账入口。

验收标准：

- 套餐可后台配置、前台展示、点击跳外链。
- 用户支付外链返回后不会自动加积分。
- 兑换码兑换成功后才增加积分。

### 9.7 后台模型测试接口不做，避免产生费用

风险等级：P1

问题：

后台模型测试生成会真实请求上游，可能产生费用，也可能因为上游排队导致后台体验不稳定。

闭环目标：

- 后台不提供“测试生成视频”按钮和接口。
- 只保留低成本健康检查。

后端保留接口：

```http
POST /api/v1/admin/providers/:id/health-check
```

健康检查范围：

- `api_base_url` 是否配置。
- provider 是否 enabled。
- 不创建视频任务。

当前后端返回字段：

```json
{
  "provider_id": "uuid",
  "healthy": true,
  "checked_at": "2026-06-27T10:00:00+08:00",
  "message": "MVP 阶段返回配置级健康检查结果"
}
```

后续可升级但当前不作为前端依赖：

- `api_key` 是否已配置，返回脱敏状态。
- 最近任务成功率、失败率、平均耗时。

前端修复方案：

- 供应商管理页保留“健康检查”按钮。
- 模型管理页不出现“测试生成”“试跑模型”按钮。
- 健康检查结果展示配置级状态，不承诺模型一定能出片。

验收标准：

- 点击健康检查不会产生上游生成费用。
- 后台 UI 没有测试生成入口。
- 健康检查失败时能展示明确原因。

### 9.8 Provider 密钥和回调密钥必须保持脱敏

风险等级：P0

当前状态：

- 后端已将 Provider 响应改为 `credential_status` / `credential_preview`。
- 后端已将 callback secret 响应改为 `callback_secret_status` / `callback_secret_preview`。

闭环目标：

- API Key 和 callback secret 不出现在浏览器、接口响应、操作日志和前端状态中。

后端修复要求：

- 所有 Provider GET / create / update 响应都只返回脱敏字段。
- 更新 Provider 时：
  - 未传 `credentials` 表示保留原密钥。
  - 传完整 `credentials` 才覆盖。
  - 不允许把 `sk-***xxxx` 这类脱敏字符串反写数据库。
- 操作日志不能记录完整 `credentials` 和 `callback_secret`。

前端配合方案：

- Provider 表格只展示 `credential_status` 和 `credential_preview`。
- 编辑弹窗中密钥输入框默认留空，用 placeholder 表示“留空则不修改”。
- 保存时，只有用户真的输入新密钥才提交 `credentials`。

验收标准：

- 浏览器 Network 面板看不到完整 API Key。
- Provider 编辑后如果不输入新密钥，原密钥仍可被 worker 使用。
- 操作日志没有完整密钥。

### 9.9 MinIO 公网可访问性和视频加载性能

风险等级：P0

问题：

- 图生视频依赖用户上传到 MinIO 后得到的公开 URL。
- 成功视频需要回存 MinIO。
- 如果 `MINIO_PUBLIC_BASE_URL` 浏览器或上游不可访问，会导致图生视频、封面、预览失败。
- 如果列表批量加载 `video_url`，页面会明显卡顿。

闭环目标：

- 上传素材 URL 可被上游访问。
- 结果视频和封面 URL 可被浏览器访问。
- 列表只加载封面，点击才加载视频。

后端修复方案：

- `MINIO_PUBLIC_BASE_URL` 配置为浏览器和上游都能访问的地址。
- 上传接口返回 `url`。
- 任务成功后写入 `cover_url` 和 `video_url`。
- `preview/download` 接口返回可访问 URL 或重定向/代理下载。

前端配合方案：

- 上传成功后保存 `asset_id` 和 `url`。
- 工作台提交时只传 `asset_id`，URL 展示用。
- 历史列表展示 `cover_url`。
- 预览弹窗打开后再请求 preview URL 并创建 video 标签。
- 关闭预览弹窗时销毁 video，避免后台继续占用带宽。

验收标准：

- 上传图片后浏览器能打开返回的 `url`。
- 图生视频任务能使用该素材提交。
- 成功任务列表有封面。
- 打开历史页不会同时加载多个视频文件。
- 点击预览后视频可以播放。

## 10. 联调验收清单

### 用户端

- 能注册、登录、刷新 token、退出。
- 未登录可以看模型、套餐、提示词字段。
- 未登录提交任务、上传、兑换时会跳转登录。
- 工作台模型来自后端，关闭模型后不可提交。
- 价格试算与创建任务扣费一致。
- 上传图片后能拿到 `asset_id` 和公开 URL。
- 创建任务后余额减少，任务进入列表。
- 任务处理中能轮询更新。
- 任务成功后列表只展示封面，点击预览才加载视频。
- 任务失败或超时后显示错误和退款状态。
- 兑换码成功后余额和流水刷新。

### 后台

- 后台登录和普通用户登录隔离。
- 模型新增、编辑、开关能影响用户侧可用模型。
- 供应商新增、编辑、开关能影响任务创建。
- 提示词字段新增、编辑、启停能影响工作台高级字段。
- 套餐新增、编辑、上下架能影响定价页。
- 兑换码能单个创建、批量生成、禁用、导出。
- 用户列表能查看用户任务和流水。
- 任务列表能查看详情，失败任务可退款，不能取消任务。
- 积分流水能按后台列表展示。

## 11. 前端开始改代码前的执行顺序

推荐按这个顺序做，减少返工：

1. 建 `src/api` 基础层和类型转换。
2. 接登录注册和用户态。
3. 接公共模型、字段、套餐。
4. 接工作台试算、上传、创建任务。
5. 接任务列表、轮询、预览、下载。
6. 接兑换码和个人中心。
7. 补后台登录守卫。
8. 接后台列表页。
9. 补后台新增、编辑、状态切换弹窗。
10. 补后台导出、详情、退款等操作。

## 12. 需要后端优先确认的点

前端正式对接前，建议后端先确认并处理：

1. 排序路由已改成独立资源：`PATCH /admin/package-orders`、`PATCH /admin/prompt-field-orders`；前端不要再调用旧 `/reorder` 路径。
2. 本地需要能启动 `api` 进程和 `worker` 进程，并完成数据库 migration。
3. 需要补 seed / bootstrap 数据：管理员账号 `gu1nbzn@gmail.com` / `GBz123321`，至少一个可展示套餐。
4. 真实生成链路第一版先接 `sora-2`、`veo-3.1`、`veo-3.1-fast`；上游报错就按失败任务展示真实错误。
5. `MINIO_PUBLIC_BASE_URL` 生产环境必须能被浏览器直接访问，本地也建议按可访问地址配置。
6. 列表分页已要求真实 `total` 和 `total_pages`，前端按后端分页字段渲染。
