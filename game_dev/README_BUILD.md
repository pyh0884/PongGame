# Arkapong - Unity游戏构建发布系统

## 项目概述

Arkapong 是一个 Unity 2D 游戏项目，已经配置为标准化的构建发布系统，支持自动化打包和平台发布。

## 项目结构

```
Arkapong/
├── game_dev/              # Unity游戏项目
│   ├── Assets/           # 游戏资源和脚本
│   ├── ProjectSettings/  # Unity项目设置
│   └── ...
├── packing_tool/         # 构建和打包工具
│   ├── build.bat        # Windows构建脚本
│   ├── build.sh         # Linux/Mac构建脚本
│   ├── build_html5.bat  # HTML5构建辅助脚本
│   └── packing_rule.json # 打包配置文件
├── build/               # 构建输出目录
│   └── README.md       # 构建说明
├── editor_dev/          # Web编辑器开发 (预留)
├── wiki/                # 项目文档 (预留)
├── CLAUDE.md           # 项目说明
└── README_BUILD.md     # 本文件
```

## 快速开始

### 前提条件

1. **Unity 2022.3.62f1** - 确保安装正确版本
2. **WebGL构建支持** - Unity需要安装WebGL构建模块

### Windows用户

1. 修改 `packing_tool/build.bat` 中的Unity路径:
   ```batch
   set "UNITY_PATH=C:\Program Files\Unity\Hub\Editor\2022.3.62f1\Editor\Unity.exe"
   ```

2. 运行构建:
   ```cmd
   cd packing_tool
   build.bat          # 开发模式
   build.bat release  # 发布模式
   ```

### Linux/Mac用户

1. 修改 `packing_tool/build.sh` 中的Unity路径:
   ```bash
   # macOS
   UNITY_PATH="/Applications/Unity/Hub/Editor/2022.3.62f1/Unity.app/Contents/MacOS/Unity"
   
   # Linux  
   UNITY_PATH="/opt/Unity/Editor/Unity"
   ```

2. 运行构建:
   ```bash
   cd packing_tool
   ./build.sh          # 开发模式
   ./build.sh release  # 发布模式
   ```

## 构建输出

构建成功后会生成:

- `build/` 目录包含WebGL构建文件
- 项目根目录生成ZIP包 `Arkapong_[mode]_[date].zip`
- ZIP包可直接上传到游戏发布平台

## 配置文件

### packing_rule.json

包含构建配置、平台要求、验证规则等设置。主要配置项:

- **Unity版本**: 2022.3.62f1
- **目标平台**: WebGL
- **压缩格式**: Gzip
- **内存设置**: 256MB
- **支持的浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 开发模式 vs 发布模式

### 开发模式 (develop)
- 包含调试信息
- 快速压缩
- 保留构建日志
- 适合开发和测试

### 发布模式 (release)  
- 优化构建
- 最大压缩
- 移除调试信息
- 适合正式发布

## 故障排除

### 常见问题

1. **Unity路径错误**
   - 检查并修改构建脚本中的 `UNITY_PATH`
   - 确保Unity版本为 2022.3.62f1

2. **WebGL模块未安装**
   - 在Unity Hub中为对应版本安装WebGL构建支持

3. **构建失败**
   - 查看 `build/unity_build.log` 日志文件
   - 确保所有场景都在构建设置中

4. **权限问题 (Linux/Mac)**
   ```bash
   chmod +x packing_tool/build.sh
   ```

### 验证构建

1. 检查 `build/WebGL/index.html` 是否存在
2. 确认ZIP包大小合理 (通常1-100MB)
3. 在本地HTTP服务器测试游戏运行

## 平台发布

生成的ZIP包包含:
- WebGL游戏文件
- 构建配置信息  
- 平台兼容性说明

可直接上传到支持WebGL的游戏发布平台。

## 技术支持

- Unity版本: 2022.3.62f1
- WebGL版本: 2.0
- 最低浏览器要求: 详见 `packing_rule.json`
- 内存要求: 1GB RAM推荐

---

更新日期: 2025-07-12
版本: 1.0.0