# 8005-agv-protocol

WIRE_TO_GATE MVP 的共享可执行协议契约。本文是 agent 在本仓库工作时的指令。

## 改本仓库：不需要事先批准，但必须事后通知

**决定权归 Zhengyu Shao 一个人**（2026-09-02 定，此前要求 Zhengyu Shao 与 Kun Wang
双人事先批准的门控已取消）。

代替事先批准的是**事后通知**。协议是 Kun Wang 那一端据以实现的契约，而改动会作废他的
门禁证据，所以他必须知道每一次改动：

- **每次推送后，在本仓库开一个 issue @`SocialKKKK`**，写清三件事：改了什么、影响哪些
  `W2G-IS-*` 切片、他的 `ONBOARD_HMI_G2` 证据是否作废。
- **通知和推送要在同一次工作里完成**，不能拖到以后。这是本仓库唯一的硬性流程要求。

`main` 分支开了保护：**禁止 force push、禁止删除分支**，但不要求 PR，可以直接推。

**发布（打 tag）是例外，仍然需要双人签名**——见下面「发布很贵」一节。

## 协作工作流

项目由两个人推进：Kun Wang（GitHub `SocialKKKK`）负责 `8005-agv-onboard-hmi` 与
`slots-simulator`；Zhengyu Shao 负责 `8005-agv-control-server`；本仓库共同维护。
完整说明在 `8005---AGV/docs/collaboration-workflow.md`（Zhengyu Shao 的治理仓库）。

- **本仓库是协作节奏的中心。**`integration-slices/index.json` 定义了 `W2G-IS-00` 到
  `W2G-IS-07`，每个带 `sequence` 与 `prerequisites`；每个切片的 `gates` 就是分工：
  `G1` 双方共用、`CONTROL_SERVER_G2` Zhengyu Shao、`ONBOARD_HMI_G2` Kun Wang、
  `G3` 两人一起。进度看板也在本仓库。
- **契约的歧义和错误在这里提 issue**，附上触发它的 `vectorId` 和双方各自的理解。
  实现不符合契约的问题**不在这里提**，去对方仓库并附 G3 证据。
- **改动不需要事先批准，但推送后必须开 issue @`SocialKKKK` 通知**（见上一节）。
- **发布需要双人签名。**完成的 attestation 不进 git，作为 GitHub Release Asset 上传。
  **AI 和 CI 不能批准。**详见 `docs/release-governance.md`。

## 发布很贵，改动要攒批次

`docs/release-governance.md`：补丁发布 *"invalidates affected G1/G2/G3 evidence"*。

**本仓库一发新版，两边的 G2 证据全部作废，都要重跑。**已经发生过一次：`W2G-IS-01` 在
`protocol-v0.1.1` 里被重新映射到 `CV-DEMAND-ACCEPT-TO-PICKUP`，旧 `v0.1.0` 的 G2 证据
不能继承。

所以**协议改动必须攒批次发**，不要零敲碎打——每一次小改都在让两边重跑整套门禁。

发布顺序是固定的，见 `docs/release-governance.md`：冻结并推送内容 commit → 针对该
commit 和 manifest 生成外部 attestation → 带 `PROTOCOL_APPROVAL_ATTESTATION` 跑 G1 →
建指向该 commit 的 annotated tag `protocol-v<SemVer>`（tag message 里记两个哈希）→
把同一份 attestation 作为 release asset 发布。

## 什么是 breaking

required / type / enum / 含义 / 方向 / 投递 / 去重 / 持久化 / 恢复 / 错误 / 副作用的
改动都是 breaking，要递增 ProtocolVersion 和 release major。

一致性索引或轨迹的修正可以走 patch，**仅当**它恢复的是已批准的职责边界、不改任何消息
Schema 或线上语义、且双方都批准这个兼容性分类。即便如此它仍然改变 manifest / vector
身份，并作废受影响的 G1/G2/G3 证据。

## 权威性

机器可读的部分是权威：JSON Schema、消息 manifest、错误注册表、有效与无效示例、
确定性轨迹、runner / result 契约、集成切片索引。**Markdown 只是解释性的。**

`manifest/release.json` 是审批中立的内容快照，它哈希除自身、`attestations/`、`.git/`、
`node_modules/` 和生成的 `evidence/` 之外的全部受管内容。

历史红色证据和已发布的身份不可变。

## 语言约定

写进 GitHub 的东西用中文：README、文档正文、issue 与 PR 的标题和正文、commit message
正文。

保持英文：commit 的 conventional 前缀（`feat:` `fix:` `docs:` `chore:`）、标识符、
路径、命令、环境变量、错误码、门禁与切片名（`G1`、`W2G-IS-00`）、**协议消息名、
schema 字段、`vectorId`、错误码——它们是契约本身，绝对不能改**。引用报错和测试输出时
先贴英文原文，再用中文解释。不回溯改旧的。

本仓库是 public，将来若要对外，README 可能需要双语。

## 脚本基线

PowerShell 7。不写 Windows PowerShell 5.1 兼容代码，不加版本探测或降级分支，不调
`powershell.exe` —— 用 `pwsh`。新建 `.ps1` 以 `#Requires -Version 7` 开头。
