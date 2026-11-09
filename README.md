# LivLiv 直播形象

基于 [LivLiv Player](https://github.com/livliv-dev/player)（Apache-2.0）的二次修改：把网页角色播放器做成一个适合直播的**透明虚拟形象工具**——摄像头跟脸、麦克风口型、切换角色与表情，OBS 直接采集，不用绿幕、不用裁窗。

## 能做什么

- 自带上自己的角色：`avatars/` 里放 `.vrm`（VRoid 等）或一张张嘴/闭嘴的 PNG 图片，控制台和托盘里直接选
- 动作：点头、摇头、歪头、跳一下、害羞（托盘菜单、控制台按钮，或直播页按 `1`–`5`）
- 透明、无边框、无 UI 的形象窗口；OBS 窗口采集勾「允许透明度」即为真透明叠加
- 摄像头面部追踪：转头、点头、歪头、眨眼、眼神、嘴型、微笑
- 麦克风实时口型；摄像头被别的程序占用时自动重试并提示
- 21 个精选角色，托盘里随时切换角色、表情、大小、置顶、鼠标穿透
- 直播控制台：选角色/表情/背景（透明、深色、棋盘、绿幕、任意色）、页面层隐藏 LivLiv 角标、复制 OBS 浏览器源地址
- 直播页支持 URL 参数，方便 OBS 或 iframe 直接引用

## 快速开始

已经装好 Node.js 的前提下：

1. 双击 **`直播形象.cmd`**（第一次会自动安装 Electron，需要几分钟）。
   - 本地服务会自动起在 `http://127.0.0.1:5173`
   - 右下角出现形象窗；托盘图标里可以换角色、表情、开关摄像头/麦克风、调大小
2. OBS：来源 `+` → **窗口采集** → 窗口选「LivLiv Live · 角色名」→ 采集方式选「Windows 10 (1903 及以上)」→ 勾「允许透明度」→ 右键来源 → 变换 → 适应屏幕
3. 想先调参数：双击 **`启动直播浏览器.cmd`** 打开直播控制台（这个 Chrome 配置关掉了后台节流，窗口被挡住也会继续渲染）

手动启动服务（可选）：`node serve.mjs 5173`，然后打开 `http://127.0.0.1:5173/example/live-console.html`。

## 页面

| 页面 | 用途 |
|---|---|
| `/example/live-console.html` | 直播控制台（推荐入口）：选角色、表情、背景、摄像头/麦克风，生成开播地址 |
| `/example/live.html` | 干净的直播页，给 OBS 或 iframe 用 |
| `/example/gallery.html` | 21 个角色的角色墙（点一个进入控制台） |
| `/example/demo.html` | 播放器演示：表情、动作、麦克风、摄像头，打开自己的 `.livliv` / VRM / PNG 文件 |

## 直播页参数

例：`http://127.0.0.1:5173/example/live.html?model=p02&bg=transparent&mark=0&cam=1&mic=1`

| 参数 | 说明 |
|---|---|
| `model=<id 或 路径>` | 角色 id（如 `p02`）或模型文件夹 / `.livliv` 地址；默认 `d03ft` |
| `vrm=<文件>` | `avatars/` 里的 `.vrm` 文件，例如 `vrm=me.vrm` |
| `png=<文件夹>` | `avatars/` 里的 PNGTuber 文件夹，例如 `png=小鱼` |
| `bg=transparent\|dark\|checker\|#rrggbb` | 背景；默认透明，`#00ff00` 可配合 OBS 色度键 |
| `cam=1`、`mirror=0\|1`、`smooth=0..1`、`follow=0..2` | 摄像头面捕与手感 |
| `mic=1` | 麦克风实时口型 |
| `expr=<id>` | 固定一个表情（如 `smile`），与追踪叠加 |
| `mark=0` | 页面层隐藏角色右下角 LivLiv 角标（不改角色文件，署名义务仍在） |
| `cursor=0` | 隐藏鼠标指针 |

按 `F` 全屏（形象窗模式除外）。直播页按 `1`–`5` 做动作：点头、摇头、歪头、跳一下、害羞；控制台里的动作按钮也能远程触发。

## 用自己的角色

把文件放进 `player/avatars/`，然后托盘 →「重新加载」，或在控制台刷新页面：

- **VRM（3D）**：直接放 `xxx.vrm`。VRoid Studio 导出的文件即可；需要联网加载 three.js（jsDelivr）。
- **PNGTuber（2D 图片）**：建一个子文件夹（名字随意），里面放
  `closed.png`（闭嘴）、`open.png`（张嘴），可选 `blink.png`（闭眼）、`blink-open.png`（闭眼张嘴）、`name.txt`（名字）。jpg / webp 也可以，文件名要对上。
- Live2D（`.model3.json`）不支持。用别人的模型前先确认许可允许直播使用。
- `avatars/` 里的内容不会同步到 GitHub（已加入 `.gitignore`）。

自己的 VRM 没有 LivLiv 的角色许可限制，适合当作频道长期形象；精选角色仍需按许可署名。

## OBS 的三种用法

1. **窗口采集（推荐，带面捕）**：采「直播形象」窗口，勾「允许透明度」。真透明、无需绿幕；OBS 里可以随意缩放、裁切、加滤镜。
2. **浏览器源（无追踪）**：来源选「浏览器」，粘贴 `live.html?bg=transparent&mark=0&model=...`。原生透明、不进窗口采集，但浏览器源拿不到摄像头和麦克风，只适合固定形象。
3. **绿幕（备选）**：直播页用 `bg=%2300ff00`，OBS 里加「色度键」。适合不依赖 alpha 的场景，头发边缘会有轻微绿边。

## 摄像头与网络

- **摄像头同一时间只能被一个程序使用。** OBS 里不要加「视频采集设备」；浏览器里也不要同时开摄像头预览，否则形象窗会拿不到设备。
- 被占用时，形象窗底部会显示提示并每 3 秒自动重试；对方释放后会自动接上，不用重启。
- 面捕依赖 MediaPipe：首次启动会从 jsDelivr 和 Google 下载运行库与人脸模型（约 17 MB，之后走浏览器缓存），运行时会向 Google 发送使用统计。**目前尚未本地化**，离线环境下面捕会起不来。

## 相对上游的改动

- 新增 `example/live.html`、`example/live-console.html`（支持精选角色、VRM、PNGTuber）
- 新增 `avatars/`：放自己的 `.vrm` / PNGTuber 图片，服务器提供 `avatars.json` 列表
- 新增 `desktop/`：Electron 透明窗口 + 托盘（角色、表情、动作、摄像头、麦克风）；`直播形象.cmd` 一键启动
- 新增 `serve.mjs`：零依赖静态服务器；`启动直播浏览器.cmd` 专用 Chrome 配置
- `example/gallery.html`、`example/demo.html` 增加「直播控制台」入口
- 隐藏角标仅在页面层（`mark=0`），`characters/` 里的角色文件未做任何修改

## 目录

```
characters/          21 个角色（模型、贴图、许可）
avatars/             你自己的角色（.vrm / PNGTuber，不同步到 GitHub）
dist/                构建产物（已提交，克隆即可运行）
src/                 播放器源码
example/             示例页与直播页
desktop/             Electron 透明窗口与托盘
serve.mjs            本地静态服务器
直播形象.cmd          启动形象窗
启动直播浏览器.cmd     启动控制台（独立 Chrome 配置）
```

## 构建（改源码时）

```sh
npm install
npm run build   # 重新生成 dist/
```

## 许可与署名（务必阅读）

- **代码**：Apache License 2.0，见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。本仓库包含对上游代码的修改。
- **角色**：不属于开源许可，见 [characters/LICENSE.md](characters/LICENSE.md) 与 [characters/CREDITS.md](characters/CREDITS.md)。
  - 精选角色：个人直播/视频可免费使用（平台广告分成、打赏也算非商业），需署名「角色：LivLiv（livliv.ai）」；不可商用、不可单独分发或出售角色文件、不可用于训练 AI。Nana（`d03`、`d03ft`）是 LivLiv 吉祥物，不能当作你自己或你频道的形象。
  - Kujira（`p01`）、Kujira Q（`p02`）：采用 CC BY-NC-SA 4.0，需署名「Kujira：上善无形、ZipZipPipe（CC BY-NC-SA 4.0）；模型：LivLiv」；有收入的直播建议改用精选角色。
  - Pen（`p03`）：LivLiv 不持有也未授予任何权利，请勿使用。
- 在页面层隐藏角标后，请继续在简介或画面上署名。

LivLiv 的名称与标志不在任何开源许可范围内；本项目与 LivLiv 官方无隶属关系，不代表其认可。
