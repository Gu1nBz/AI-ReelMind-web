# ReelMind 后端开工总说明

## 1. 文档定位

这份文档是当前阶段给后端团队使用的唯一开工说明文档。

目标是把下面几类信息合并到一处：

- 产品业务范围
- MVP 边界
- 前后端协作面
- 后端技术栈
- 核心数据模型
- 接口分组
- 异步任务处理链路
- 交付优先级

后端开发、建库、拆模块、写接口、做 worker，都以这份文档为直接依据。

---

## 2. 源文档与优先级

这份总说明由以下文档合并整理而来：

1. 业务需求主文档  
   `/Users/shiqiao/bz/AI-ReelMind-web/video-generation-mvp.md`

2. 后端接口与技术栈交接文档  
   `/Users/shiqiao/bz/AI-ReelMind-web/docs/backend-api-handoff.md`

3. 前端设计系统文档  
   `/Users/shiqiao/bz/AI-ReelMind-web/design-system/reelmind/MASTER.md`

优先级约定：

1. 业务功能和产品边界，以 `video-generation-mvp.md` 为准
2. 后端接口、技术栈、实施约定，以本总说明为准
3. 前端设计系统只作为页面结构和交互理解参考，不决定后端业务规则

---

## 3. 产品一句话

一个支持多模型、积分制、兑换码充值的视频生成平台。

主链路必须跑通：

```text
用户登录/注册
  ->
查看模型和参数
  ->
兑换码充值积分
  ->
提交视频生成任务
  ->
先扣积分
  ->
异步生成
  ->
成功返回结果 / 失败自动退款
  ->
用户查看历史记录和积分流水
```

---

## 4. MVP 范围

### 4.1 普通用户端

MVP 只做这些：

- 邮箱注册 / 登录
- 邮箱验证码登录
- 邮箱密码登录
- 忘记密码 / 重置密码
- 游客态浏览工作台
- 查看可用模型
- 选择模型参数
- 基础提示词 / 高级提示词
- 上传图片 / 视频 / 音频参考素材
- 实时查看预计积分消耗
- 兑换码充值
- 查看积分套餐并跳转外部支付页
- 创建视频生成任务
- 查看自己的生成历史
- 预览 / 下载成功结果
- 查看自己的积分流水

### 4.2 管理后台

MVP 只做这些：

- 管理员登录
- 控制台概览
- 模型管理
- 上游供应商配置
- 高级提示词字段配置
- 积分套餐配置
- 兑换码管理
- 用户列表查看
- 任务列表与任务处理
- 积分流水查看

### 4.3 明确不属于 MVP

以下内容当前不做：

- 图片生成
- AI 聊天
- 文本生成
- 语音生成工具
- API 开放平台
- 真实支付订单系统
- 支付完成后自动入账
- 视频示例管理后台
- 用户删除任务
- 用户删除视频文件
- 管理员直接修改用户积分余额

---

## 5. 用户角色与权限边界

### 5.1 角色

- `guest`：未登录游客
- `user`：普通用户
- `admin`：管理员

### 5.2 权限边界

- 游客可以浏览工作台、模型、套餐、提示词字段
- 游客不能上传素材、提交任务、兑换兑换码、看历史、看流水
- 普通用户只能看和操作自己的数据
- 普通用户绝不能访问后台接口
- 管理员只能通过后台登录入口进入后台
- 后台权限控制必须在后端实现，不能只靠前端隐藏

---

## 6. 前端页面与后端模块映射

前端当前页面结构已经固定，后端需要按它来提供数据和行为。

### 6.1 用户端页面

| 页面 | 用途 | 后端模块 |
| --- | --- | --- |
| `/` | 视频生成工作台 | models / prompt-fields / uploads / tasks / pricing |
| `/history` | 任务历史 | tasks |
| `/pricing` | 积分套餐 | packages |
| `/redeem` | 兑换码充值 | redeem / transactions |
| `/profile` | 用户信息与积分流水 | users / transactions |
| `/auth` | 登录注册 | auth |

### 6.2 管理端页面

| 页面 | 用途 | 后端模块 |
| --- | --- | --- |
| `/admin` | 控制台概览 | overview |
| `/admin/models` | 模型管理 | models |
| `/admin/providers` | 上游供应商 | providers |
| `/admin/prompt-fields` | 提示词字段 | prompt-fields |
| `/admin/packages` | 套餐管理 | packages |
| `/admin/redeem-codes` | 兑换码管理 | redeem-codes |
| `/admin/users` | 用户管理 | users |
| `/admin/tasks` | 任务管理 | tasks |
| `/admin/transactions` | 积分流水 | credit-transactions |

---

## 7. 后端技术栈定案

这一部分不是讨论稿，当前阶段直接按这个落地。

### 7.1 语言与框架

- `Go 1.26.x`
- `Gin`

### 7.2 数据与任务

- `PostgreSQL`
- `sqlc`
- `golang-migrate`
- `Redis`
- `Asynq`

### 7.3 文件与对象存储

- `MinIO`

统一约定：

- 本地使用 `MinIO`
- 生产也先使用 `MinIO`
- 后续如果业务需要 `OSS` 或其他对象存储，再追加适配层

当前版本不做：

- 本地 `MinIO` / 线上 `OSS` 双方案并存
- 多对象存储抽象层优先建设

### 7.4 鉴权与文档

- `JWT + Refresh Token`
- `Swagger / OpenAPI`

### 7.5 部署

- 独立后端仓库
- `Docker Compose` 作为本地和基础部署方式

---

## 8. 仓库与服务拆分

后端不和前端放在同一个仓库。

建议仓库结构：

```text
AI-ReelMind-service/
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
  internal/platform/httpx
  internal/platform/db
  internal/platform/queue
  internal/platform/minio
  migrations
  docs
  deploy
```

至少拆成两个进程：

### 8.1 `api`

负责：

- 用户端接口
- 管理端接口
- 上游回调接口
- 文件上传接口
- 鉴权

### 8.2 `worker`

负责：

- 上游状态轮询
- 任务超时处理
- 失败退款
- 结果转存到 MinIO
- 7 天后结果清理

---

## 9. MinIO 统一约定

### 9.1 MinIO 负责什么

- 用户上传素材
- 生成结果视频
- 生成结果封面
- 任务临时文件

### 9.2 bucket 建议

- `reelmind-assets`
- `reelmind-results`

### 9.3 对象 key 建议

```text
assets/{user_id}/{yyyy}/{mm}/{dd}/{asset_id}-{filename}
results/{user_id}/{task_id}/video.mp4
results/{user_id}/{task_id}/cover.jpg
```

### 9.4 文件规则

- 用户上传素材进入 `reelmind-assets`
- 上游成功结果必须转存到 `reelmind-results`
- 不长期依赖上游临时地址
- 生成结果有效期固定为 7 天
- 7 天后删除 MinIO 中的视频和封面，但保留任务记录

---

## 10. 核心业务规则

### 10.1 登录与注册

- 用户端使用邮箱账号体系
- 支持邮箱验证码注册
- 支持邮箱验证码登录
- 支持邮箱密码登录
- 首次验证码登录且邮箱不存在时，自动创建用户
- 忘记密码与重置密码属于 MVP
- 管理员账号与普通用户账号分表管理

### 10.2 模型展示

- 用户端只展示允许展示的模型
- `available`：可生成
- `maintenance`：可展示，不可生成
- `coming_soon`：可展示，不可生成
- `disabled`：用户端不展示

### 10.3 提示词模式

- `basic`
- `advanced`

高级提示词字段由后台配置，前端只渲染启用字段。

### 10.4 输入素材规则

平台统一支持输入类型：

- `text`
- `image`
- `video`
- `audio`

每个模型独立配置：

- 支持哪些输入类型
- 支持哪些输入组合
- 每种输入类型的格式、大小、数量限制

### 10.5 计费规则

每个模型只能有一种当前计费方式：

- `per_second`
- `per_generation`

同时需要支持：

- 不同清晰度价格倍率
- 不同输入组合价格倍率

### 10.6 充值规则

- 用户不能直接支付入账
- 用户点击套餐后跳到外部支付页
- 用户拿到兑换码后回到平台兑换积分
- 兑换成功必须写积分流水

### 10.7 任务扣费规则

- 提交任务成功时立即扣费
- 成功后不再额外扣费
- 失败自动退款
- 超时自动退款
- 每个失败任务最多只退一次

---

## 11. 任务状态机

建议统一使用：

- `pending`
- `submitted`
- `processing`
- `succeeded`
- `failed`
- `refunding`
- `refunded`
- `timed_out`

状态流转建议：

```text
pending
  -> submitted
  -> processing
  -> succeeded

pending/submitted/processing
  -> failed
  -> refunding
  -> refunded

pending/submitted/processing
  -> timed_out
  -> refunding
  -> refunded
```

要求：

- 状态更新必须幂等
- 退款必须幂等
- 回调重复到达不能重复退款

---

## 12. 上游供应商处理方式

系统内部一律使用平台统一参数，不让前端碰上游原始字段。

### 12.1 平台统一参数

- `model_id`
- `prompt`
- `prompt_mode`
- `input_types`
- `input_assets`
- `aspect_ratio`
- `resolution`
- `duration_seconds`
- `seed`
- `callback_url`

### 12.2 上游模式

每个 provider 可配置：

- `callback`
- `polling`
- `both`

### 12.3 后端职责

- 平台任务参数校验
- 读取模型绑定的 provider
- 将平台参数映射到上游参数
- 提交上游任务
- 保存上游任务 ID
- 轮询或等待回调
- 更新平台任务状态
- 失败时退款

---

## 13. 核心数据模型

以下是 MVP 阶段必须落地的表。

### 13.1 用户与认证

- `users`
- `admins`
- `email_verification_codes`
- `user_refresh_tokens`
- `admin_refresh_tokens`

### 13.2 视频生成业务

- `video_models`
- `advanced_prompt_fields`
- `video_tasks`
- `uploaded_assets`

### 13.3 积分与兑换

- `credit_packages`
- `redeem_codes`
- `credit_transactions`

### 13.4 上游配置

- `upstream_providers`
- `upstream_model_mappings`

### 13.5 审计与运维

- `admin_operation_logs`

---

## 14. 数据库设计硬要求

### 14.1 事务要求

以下必须在事务里完成：

- 扣减积分 + 创建任务 + 写扣费流水
- 使用兑换码 + 增加积分 + 标记兑换码已使用 + 写充值流水
- 失败退款 + 更新任务状态 + 写退款流水

### 14.2 唯一约束建议

- `users.email`
- `admins.account` 或 `admins.email`
- `redeem_codes.code`

### 14.3 幂等建议

至少保证这些幂等：

- 上游回调
- 失败退款
- 管理员手动标记失败
- 管理员手动退款

---

## 15. 接口分组总览

### 15.1 公共接口

- `GET /api/v1/public/models`
- `GET /api/v1/public/models/{id}`
- `GET /api/v1/public/packages`
- `GET /api/v1/public/prompt-fields`
- `POST /api/v1/public/generation/estimate`

### 15.2 用户认证接口

- `POST /api/v1/auth/email-code/send`
- `POST /api/v1/auth/login/code`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login/password`
- `POST /api/v1/auth/password/reset/request`
- `POST /api/v1/auth/password/reset/confirm`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/user/me`

### 15.3 管理员认证接口

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`

### 15.4 用户业务接口

- `POST /api/v1/user/uploads`
- `POST /api/v1/user/tasks`
- `GET /api/v1/user/tasks`
- `GET /api/v1/user/tasks/{id}`
- `GET /api/v1/user/tasks/{id}/preview`
- `GET /api/v1/user/tasks/{id}/download`
- `POST /api/v1/user/redeem-codes/redeem`
- `GET /api/v1/user/redeem-codes/records`
- `GET /api/v1/user/credit-transactions`

### 15.5 后台接口

- `GET /api/v1/admin/overview`
- `GET/POST/PATCH /api/v1/admin/models`
- `GET/POST/PATCH /api/v1/admin/providers`
- `GET/POST/PATCH /api/v1/admin/prompt-fields`
- `GET/POST/PATCH /api/v1/admin/packages`
- `GET/POST/PATCH /api/v1/admin/redeem-codes`
- `POST /api/v1/admin/redeem-codes/batch`
- `GET /api/v1/admin/redeem-code-exports`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{id}`
- `GET /api/v1/admin/users/{id}/tasks`
- `GET /api/v1/admin/users/{id}/transactions`
- `POST /api/v1/admin/users/{id}/redeem-codes`
- `GET /api/v1/admin/tasks`
- `GET /api/v1/admin/tasks/{id}`
- `POST /api/v1/admin/tasks/{id}/mark-failed`
- `GET /api/v1/admin/credit-transactions`

### 15.6 回调接口

- `POST /api/v1/webhooks/providers/{provider_key}`

---

## 16. 用户提交任务的后端处理流程

```text
校验登录
  ->
校验模型
  ->
校验输入组合
  ->
校验素材
  ->
校验比例/清晰度/时长
  ->
计算价格
  ->
校验积分余额
  ->
事务内扣费 + 创建任务 + 写扣费流水
  ->
投递异步任务
  ->
worker 调上游
  ->
轮询或等待回调
  ->
成功则转存 MinIO
  ->
失败则退款
```

---

## 17. 后台异步任务清单

这些不一定暴露成 HTTP，但必须实现：

### 17.1 上游状态轮询

- 轮询 `submitted` / `processing` 任务
- 读取 provider 轮询配置
- 更新任务状态

### 17.2 任务超时处理

- 超过 `max_wait_seconds`
- 标记 `timed_out`
- 自动退款

### 17.3 结果转存

- 下载上游结果
- 上传到 `MinIO`
- 写入平台结果地址

### 17.4 文件过期清理

- 到期删除 `MinIO` 里的视频和封面
- 更新记录但保留任务

### 17.5 清理任务

- 清理过期验证码
- 清理失效 refresh token
- 清理过久的后台操作日志

---

## 18. 环境变量建议

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

---

## 19. 开发优先级

### P0 第一批必须先做

1. 用户认证
2. 管理员认证
3. 模型列表
4. 提示词字段列表
5. 价格试算
6. 素材上传到 MinIO
7. 创建任务
8. 用户任务列表 / 详情
9. 套餐列表
10. 兑换码兑换
11. 用户信息 / 积分流水
12. 后台模型 CRUD
13. 后台兑换码 CRUD + 批量生成 + 导出
14. 后台用户列表
15. 后台任务列表 / 详情 / 标记失败
16. 后台积分流水
17. 上游回调
18. 轮询、超时、退款、转存、过期清理

### P1 第二批补齐

1. 后台供应商映射和健康检查
2. 后台提示词字段完整配置
3. 后台套餐完整配置
4. 管理员重试任务
5. 更完整的后台筛选、搜索、排序

---

## 20. 验收标准

至少满足以下结果，才算后端 MVP 完成：

### 20.1 用户主链路

- 用户能注册 / 登录
- 用户能看到模型和提示词字段
- 用户能上传素材
- 用户能创建任务
- 创建任务后积分立即扣除
- 任务成功后能返回结果地址
- 任务失败后能自动退款
- 用户能看到自己的任务历史和积分流水

### 20.2 管理后台链路

- 管理员能登录后台
- 能管理模型
- 能管理套餐
- 能管理兑换码
- 能看用户列表
- 能看任务
- 能标记失败并触发退款
- 能看积分流水

### 20.3 系统一致性

- 同一任务不会重复退款
- 同一兑换码不能重复使用
- 上游回调重复到达不会重复处理
- MinIO 中结果文件 7 天后会被清理

---

## 21. 当前不建议做的事

为了不把范围做散，当前阶段不建议：

- 一开始就做微服务
- 一开始就做 Kafka 之类更重的队列系统
- 同时支持多个对象存储实现
- 把所有配置做成过度抽象的平台化能力
- 在没有真实上游前先过度设计 provider SDK

先把 MVP 闭环做稳，比抽象做漂亮更重要。

---

## 22. 最后的执行口径

后端团队现在可以直接按下面顺序开工：

1. 建后端独立仓库
2. 起 `api + worker + PostgreSQL + Redis + MinIO`
3. 先建表和迁移
4. 先打通认证、模型、兑换码、任务
5. 再接异步任务、退款、MinIO 转存
6. 最后补后台完整管理能力

如果某条实现与旧文档冲突，以这份总说明和 `video-generation-mvp.md` 的业务边界为准。
