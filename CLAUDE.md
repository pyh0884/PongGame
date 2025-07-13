# Arkapong - Unity 游戏项目

## AI 助手规则
**永远使用中文回复**

## 项目概述
Arkapong 是一个 Unity 2D 游戏，融合了经典游戏"Arkanoid"（打砖块）和"Pong"（乒乓球）。这是一个竞技性双人游戏，玩家控制挡板打破砖块并相互竞争。

## 游戏模式
1. **乒乓球模式**：类似传统乒乓球游戏，但挡板可以被球击毁
2. **自杀模式**：玩家必须接球并摧毁自己的砖块，最先摧毁完所有砖块的玩家获胜

## 控制方式
- **玩家1**：W/S 键控制挡板上下移动
- **玩家2**：方向键（↑/↓）控制挡板上下移动

## 项目结构

### 核心脚本 (`Assets/Scripts/`)
- **GameManager.cs**：主游戏管理器，处理全局设置和参数
- **Ball.cs**：球的物理、移动和碰撞处理
- **ModeManager.cs**：游戏模式管理和胜负条件
- **LevelCreater.cs**：关卡生成和砖块放置

### 玩家系统 (`Assets/Scripts/Player/`)
- **PlayerMove.cs**：挡板移动和边界检查
- **PlayerLoadBlocks.cs**：玩家砖块加载和管理

### 砖块系统 (`Assets/Scripts/blocks/`)
- **Blocks.cs**：基础砖块类，包含护盾功能
- **SimpleBlocks.cs**：标准可摧毁砖块
- **MagneticBlocks.cs**：用磁力吸引球的砖块
- **ExplodeBlocks.cs**：爆炸并摧毁附近砖块的砖块
- **ShieldBlocks.cs**：带保护护盾的砖块
- **UnbreakableBlock.cs**：不可摧毁的砖块
- **BallBlocks.cs**：生成额外球的特殊砖块

### UI 系统 (`Assets/Scripts/UI/`)
- **MainMenu.cs**：主菜单功能
- **Pause.cs**：暂停菜单控制
- **EndMenu.cs**：游戏结束界面
- **Trans.cs**：场景过渡效果

### 音频系统 (`Assets/Scripts/Audio/`)
- **AudioManager.cs**：中央音频管理
- **Audio.cs**：音频片段处理
- **AudioMenu.cs**：音频设置界面

### 建造模式 (`Assets/Scripts/BuildingMode/`)
- **InstantiateController.cs**：建造模式中的砖块放置
- **CheckBoxController.cs**：UI 复选框控制
- **FunctionMemoryController.cs**：设置内存管理
- **NumberCheckerController.cs**：数字输入验证

## 游戏场景
- **_Logo.unity**：游戏启动 Logo 界面
- **_Main Menu.unity**：主菜单界面
- **Game Loop.unity**：主要游戏场景
- **Pong Mode.unity**：乒乓球模式专用场景
- **BuildingMode.unity**：自定义砖块布局的关卡编辑器

## 主要特性
- **基于物理的游戏玩法**：使用 Unity 2D 物理系统
- **多种砖块类型**：具有独特行为的各种砖块
- **粒子效果**：视觉反馈和特效
- **音频系统**：音效和背景音乐
- **关卡编辑器**：自定义砖块排列
- **双人本地多人游戏**

## 开发说明
- 使用 Unity (C#) 构建
- 使用 Unity 的 2D 物理系统
- 模块化砖块系统便于扩展
- GameManager 使用单例模式
- 使用对象池优化性能

## 构建说明
1. 在 Unity 编辑器中打开项目
2. 确保所有场景都添加到构建设置中
3. 设置目标平台（PC、Mac、Linux 独立版本）
4. 构建并运行

## 游戏参数（可在 GameManager 中配置）
- **球的速度**：球的移动速度
- **玩家速度**：挡板移动速度
- **角度约束**：球反弹角度限制
- **球的大小**：球的尺寸
- **玩家大小**：挡板尺寸
- **磁力强度**：磁性砖块的吸引力
- **爆炸半径**：爆炸砖块的影响范围