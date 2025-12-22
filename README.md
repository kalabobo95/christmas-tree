# 霓虹圣诞树项目调整指南

本项目是一个基于 React, Three.js (React Three Fiber) 和 MediaPipe 手势识别的交互式 3D 圣诞树。本文档旨在指导开发者如何调整装饰模块、修改图片展示逻辑以及配置固定图片。

## 1. 核心概念：展示模块 (TreeModuleData)

圣诞树由多个“模块”组成。每个模块在 `types.ts` 中定义，包含以下属性：
- `id`: 唯一标识符。
- `type`: 形状类型 (`sphere`, `box`, `cone`, `photo`, `dodecahedron`, `torus`)。
- `initialPos`: 在树上的初始 3D 坐标 `[x, y, z]`。
- `color`: 模块颜色。
- `imageUrl`: 仅当 `type` 为 `photo` 时使用。
- `scale`: 缩放比例。

## 2. 如何更换展示模块 (装饰物)

### 修改形状与颜色
在 `components/Scene.tsx` 的 `TreeModule` 组件中，`Geometry` 子组件负责根据 `type` 返回几何体。
- **添加新形状**：在 `Geometry` 的 `switch` 语句中添加新 case，并确保在 `types.ts` 的 `type` 定义中包含它。
- **调整材质**：目前的逻辑是：非照片模块使用 `meshStandardMaterial` 并开启高强度 `emissive`（自发光），从而产生霓虹效果。

### 修改初始化生成逻辑
在 `App.tsx` 的 `useState<TreeModuleData[]>` 初始化块中：
- **数量控制**：通过 `MODULE_COUNT` (在 `constants.ts` 修改) 控制基础装饰物数量。
- **布局逻辑**：使用圆锥体公式计算坐标，使模块分布在圣诞树的侧面上：
  ```typescript
  const h = Math.random() * TREE_HEIGHT;
  const r = (TREE_RADIUS * (TREE_HEIGHT - h)) / TREE_HEIGHT; // 随高度增高半径减小
  const theta = Math.random() * Math.PI * 2;
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;
  ```

## 3. 图片展示逻辑

### 自动识别与交互
- **定位逻辑**：当手势为 `pointing` (食指指向) 时，程序会计算当前树旋转角度下，哪张照片离观察者最近（`worldZ` 最大）。
- **聚焦效果**：被选中的照片会从树上飞到镜头前，并自动旋转对准相机。

### 切换为固定图片 (不使用上传)
如果希望项目启动时就展示一组固定的图片，请按以下步骤操作：

1. **准备图片数组**：在 `App.tsx` 中定义一个 URL 数组。
   ```typescript
   const FIXED_IMAGES = [
     'https://example.com/image1.jpg',
     'https://example.com/image2.jpg',
     // ... 更多图片
   ];
   ```

2. **修改初始化 State**：在 `App.tsx` 的 `setModules` 初始逻辑中，遍历该数组并生成 `photo` 类型的模块。
   ```typescript
   FIXED_IMAGES.forEach((url, index) => {
     initial.push({
       id: `fixed-photo-${index}`,
       type: 'photo',
       imageUrl: url,
       // 参考 handleFileUpload 中的坐标计算逻辑
       initialPos: [/* ...计算出的坐标... */],
       color: '#ffffff',
       scale: 1.2
     });
   });
   ```

3. **移除上传 UI**：在 `App.tsx` 的返回值中删除 `<label>` 上传按钮及其对应的 `handleFileUpload` 函数。

## 4. 视觉调整

- **霓虹强度**：在 `components/Scene.tsx` 的 `Bloom` 组件中调整 `intensity`。
- **旋转速度**：在 `components/Scene.tsx` 的 `Scene` 组件中修改 `rotationSpeed.current` 的初始值。
- **渐进显现**：`revealedCount` 变量控制了模块一个接一个“砰”地跳出来的动画效果，可以在 `useEffect` 中调整 `revealDelayRef` 的递减速率。

## 5. 常数调整
请优先修改 `constants.ts`：
- `TREE_HEIGHT`: 树的高度。
- `TREE_RADIUS`: 树底部的半径。
- `COLORS`: 全局调色板（红球、绿块、蓝锥的具体 Hex 值）。

## 6. 移动端打包 (iOS / Android)

本项目支持打包成 iOS 和 Android 原生应用！

### 快速开始

1. **安装 Node.js**（如果还没有）
   - 访问 https://nodejs.org/ 下载安装

2. **运行自动化打包脚本**
   ```bash
   ./build-mobile.sh
   ```
   
   脚本会自动：
   - 安装所有依赖
   - 构建 Web 应用
   - 配置 Capacitor
   - 添加 iOS/Android 平台
   - 打开对应的 IDE

3. **查看详细文档**
   - 完整打包指南：[MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md)
   - iOS 权限配置：[ios-permissions.md](./ios-permissions.md)
   - Android 权限配置：[android-permissions.md](./android-permissions.md)

### 前置要求

**iOS 打包需要：**
- macOS 系统
- Xcode 14+
- Apple Developer 账号

**Android 打包需要：**
- Android Studio
- Java JDK 17+

### 常用命令

```bash
# 构建并同步到移动端
npm run build:mobile

# 打开 iOS 项目
npm run cap:open:ios

# 打开 Android 项目
npm run cap:open:android
```

### 移动端特性

✅ 完整的 3D 渲染支持  
✅ 手势识别（需要相机权限）  
✅ 照片上传功能  
✅ 触摸交互  
✅ 横屏/竖屏自适应  

### 性能优化建议

移动设备性能有限，建议：
- 减少装饰物数量（修改 `constants.ts` 中的 `MODULE_COUNT`）
- 降低后处理效果强度
- 优化图片大小（建议不超过 1MB）

---

## 7. 服务器部署

本项目支持多种服务器部署方案！

### 🚀 快速部署

运行自动化部署脚本：
```bash
./deploy.sh
```

选择部署方式：
1. **仅构建** - 生成生产版本
2. **本地预览** - 构建并预览
3. **Docker 部署** - 容器化部署
4. **Node.js 部署** - Express 服务器
5. **生成部署包** - 打包成 tar.gz

### 📦 手动构建

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build:prod

# 本地预览
npm run serve
```

### 🌐 部署方案

**Nginx 部署（推荐）:**
- 高性能静态文件服务
- 配置文件: `nginx.conf`

**Docker 部署:**
```bash
docker-compose up -d
```

**Node.js 部署:**
```bash
pm2 start server.js --name christmas-tree
```

**云平台部署:**
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod --dir=dist`
- GitHub Pages: `gh-pages -d dist`

### 📚 详细文档

- **完整部署指南**: [SERVER_DEPLOYMENT_GUIDE.md](./SERVER_DEPLOYMENT_GUIDE.md)
- **快速参考**: [SERVER_QUICK_REFERENCE.md](./SERVER_QUICK_REFERENCE.md)

### 🔧 部署文件

- `Dockerfile` - Docker 镜像配置
- `docker-compose.yml` - Docker Compose 配置
- `nginx.conf` - Nginx 配置文件
- `server.js` - Node.js 服务器
- `deploy.sh` - 自动化部署脚本
- `ecosystem.config.json` - PM2 配置

### ⚙️ 环境变量

复制 `.env.production.example` 为 `.env.production` 并配置：
```bash
VITE_API_URL=https://api.your-domain.com
GEMINI_API_KEY=your-api-key
```

### 🌍 访问地址

- **本地开发**: http://localhost:3000
- **生产预览**: http://localhost:4173
- **服务器**: http://your-domain.com

---
