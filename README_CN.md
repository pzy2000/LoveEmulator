# Love Emulator 恋爱模拟器 💕

[English](./README.md) | [中文](#chinese)

<div id="chinese"></div>

## 项目简介

**恋爱模拟器（Love Emulator）** 是一款 AI 驱动的恋爱社交模拟游戏,将现实中玄学的恋爱过程转化为可计算的人生系统。游戏以上海为背景,玩家从社恐/普通人逐步成长为"社交王者",最终与"魔都顶配伴侣"达成长期承诺关系。

游戏将写实的资源约束(时间、金钱、情绪)与荒诞的随机事件(误会、修罗场、朋友圈舆论、离谱巧合)相结合,打造出独特的喜剧写实风格。

## 🎮 游戏特色

### 资源管理系统
- **硬资源**:时间、金钱、精力/健康、城市移动成本
- **软资源**:外在形象、沟通能力、情绪稳定、声誉/信用、边界感

### 动态角色系统
每个 NPC 具有多维度的关系参数:
- `attraction`(吸引) - 外在与气质匹配度
- `trust`(信任) - 是否觉得你靠谱(最重要)
- `comfort`(舒适度) - 相处是否轻松
- `respect`(尊重感) - 是否尊重边界与选择
- `investment`(投入) - 愿意为关系付出的程度
- `conflict_meter`(冲突度) - 近期矛盾累积
- `availability`(可约程度) - 日程与忙碌周期

### AI 驱动的事件与对话系统
- **两阶段生成**:结构化情境框架 + AI 叙事生成
- **安全校验**:基于同意的边界机制与内容过滤
- **意图驱动结算**:行动带有意图标签,由游戏引擎结算
- **确定性结果**:使用 RNG 种子确保游戏可复现

### 多种结局
- **纯爱结局**:低翻车率,高信任度
- **海王结局**:高社交影响力,高风险,高成本
- **自我成长结局**:把自己练成更好的人,关系只是副产品
- **翻车结局**:声誉崩盘、社交圈封杀、情绪系统崩坏

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/LoveEmulator.git
cd LoveEmulator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run preview
```

## 🏗️ 技术栈

- **前端框架**: React 19 + TypeScript
- **状态管理**: Zustand
- **动画效果**: Framer Motion
- **UI 组件**: Lucide React
- **构建工具**: Vite
- **AI 集成**: OpenAI API

## 📂 项目结构

```
LoveEmulator/
├── src/
│   ├── components/         # UI 组件
│   │   ├── ActionGrid.tsx
│   │   ├── CharacterList.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DialogueView.tsx
│   │   └── ...
│   ├── engine/            # 游戏引擎
│   │   ├── ActionSystem.ts
│   │   ├── EventEngine.ts
│   │   ├── DialogueManager.ts
│   │   ├── RelationshipManager.ts
│   │   └── types.ts
│   ├── data/              # 游戏数据
│   │   ├── characters.ts
│   │   ├── locales.ts
│   │   └── fallbackData.ts
│   ├── services/          # 外部服务
│   └── store/             # 状态管理
├── design.md              # 设计文档
└── package.json
```

## 🎯 游戏机制

### 核心循环
1. **选择行动** → 约会、自我提升、社交拓展、工作赚钱、休息回血
2. **资源变化** → 钱、精力、形象、沟通、声誉
3. **触发事件** → 随机 + 条件触发 + 事件链
4. **关系变化** → 信任、舒适度、尊重、投入、冲突
5. **解锁进阶** → 社交圈层、资源、更高品质的对象
6. **循环加速**

### 行动类型
- **自我提升类**:健身、穿搭、形象管理、沟通训练、心理建设
- **资源积累类**:工作、副业、社交活动
- **关系推进类**:约会、关键谈话、见朋友/见家长
- **风险行为类**:同时维护多线关系(声誉风险)、公开/隐私关系操作

### 社交圈层与地图
上海主题的地点系统,每个地点都有准入门槛:
- 校园 / 公司 / 健身房 / 音乐节 / 画廊 / 高端餐厅 / 朋友局 / 创业局

每个地点包含:
- 进入门槛(钱、形象、社交地位、人脉)
- 独特事件池
- 角色出现权重

## 🤖 AI 架构设计

### 分层系统
- **引擎层**(确定性):状态推进、资源消耗、数值结算、触发条件、概率采样、存档回放
- **AI 叙事层**(生成性):事件文案、NPC 台词、玩家选项、氛围与幽默、细节填充
- **AI 审核层**(约束性):结构校验、安全与同意约束、越界内容过滤、逻辑一致性检查
- **平衡层**(约束性):数值增益上限、风险惩罚下限、事件稀有度控制

### 事件生成流程
1. 引擎抽取**情境框架**(事件类型、角色、地点、强度、风险标签)
2. AI 生成**叙事内容**(标题、描述、2-4 个带意图标签的玩家选项)
3. **校验器**检查 JSON 结构、安全性、逻辑一致性
4. 引擎根据意图标签 + 关系状态 + 世界状态 + RNG **结算**结果

## 🛠️ 开发指南

### 环境配置

在项目根目录创建 `.env` 文件:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1  # 可选:自定义端点
```

### 运行测试

```bash
npm run lint
```

### 代码规范

本项目使用 ESLint 进行代码质量控制。提交代码前请运行:

```bash
npm run lint
```

## 📝 设计理念

**恋爱即可计算系统**:将现实中玄学的恋爱过程拆解为多目标优化问题,你永远缺一样资源(时间/金钱/精力/魅力/边界感/信誉/社交圈层/职业发展/情绪稳定)。

**写实约束 + 荒诞事件**:写实来自约束(钱、时间、情绪),荒诞来自事件(误会、修罗场、朋友圈舆论、偶遇贵人、离谱巧合)。

**NPC 是主体而非奖杯**:角色有偏好、有底线、有生活、有反应,能根据你的行为改变对你的判断,尤其是**信任/安全感**。

## 🤝 参与贡献

我们欢迎各种形式的贡献!请遵循以下步骤:

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 贡献方向
- 新的角色原型与对话
- 事件场景与故事线
- UI/UX 改进
- AI 提示词优化
- 本地化(更多语言支持)
- Bug 修复与性能优化

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 灵感来源于经典恋爱模拟游戏与人生模拟游戏
- 特别感谢开源社区的贡献

## 📬 联系方式

- **问题反馈**: [GitHub Issues](https://github.com/yourusername/LoveEmulator/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/yourusername/LoveEmulator/discussions)

---

**[English README](./README.md)** | 用 ❤️ 在上海制作
