# 项目结构

本项目的目录结构经过精心设计，以区分游戏逻辑、编辑器扩展和打包工具，便于团队协作和维护。

```
/
├── editor_dev/         # Unity 编辑器扩展开发目录
│   └── ...
├── game_dev/           # 核心游戏项目目录 (Unity Project)
│   ├── Assets/
│   ├── Packages/
│   └── ProjectSettings/
├── packing_tool/       # 打包和构建工具
│   └── ...
└── wiki/               # 项目文档
    ├── GETTING_STARTED.md
    ├── HOME.md
    └── PROJECT_STRUCTURE.md
```

## 目录详解

- **`game_dev/`**
  - 这是主要的 Unity 项目目录。所有游戏逻辑、美术资源、场景等都存放在这里。开发游戏时，主要的工作目录就是这里。

- **`editor_dev/`**
  - 用于存放和开发**自定义 Web 编辑页面**的相关文件（例如 `editor.html`、JavaScript、CSS 等）。此目录下的内容会在执行构建脚本时，被自动复制到最终的 `build` 目录中，作为游戏配套的编辑工具一同发布。

- **`packing_tool/`**
  - 存放用于自动化构建、打包和部署的工具和脚本。例如，可能包含用于打不同渠道包、管理资源版本等的脚本。

- **`wiki/`**
  - 存放项目相关的文档，帮助新成员快速了解项目。 