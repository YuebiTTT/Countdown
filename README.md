# 高考倒计时

一个优雅的高考倒计时网页应用，显示距离高考的剩余时间，并提供多种自定义功能和视觉效果。本项目从原仓库[Gasolcloudteam/Countdown](https://github.com/Gasolcloudteam/Countdown) fork而来，并进行了功能增强、视觉优化和代码修复。

## 主要功能

- 显示距离高考的剩余天数、小时、分钟和秒数
- 支持多种考试类型切换（高考、调研考等）
- 点击页面任意位置触发波纹扩散特效
- 双击背景显示加油鼓励动画和文字效果
- 动态文字颜色变化，提升视觉体验
- 自动从背景提取颜色，确保文字可读性
- 随机名言警句展示，提供学习动力
- 响应式设计，适配各种屏幕尺寸
- 简洁美观的UI设计，带有平滑过渡动画
- 自定义背景功能（右下角透明图标控制）

## 界面预览

### 正常倒计时状态
显示距离选定考试的精确倒计时时间，背景使用自定义图片，文字带有动态颜色效果。

### 考试期间状态
考试当天会显示鼓励信息，替换倒计时显示。

### 点击波纹特效
点击页面任意位置会产生蓝绿色系的波纹扩散效果，每次点击的波纹大小和颜色略有不同，创造丰富的视觉体验。

### 双击加油效果
双击页面会触发模糊背景和大型鼓励文字动画，增强互动体验。

## 自定义配置

### 考试类型设置
在`gk.js`文件中修改`exams`数组，可以添加或修改考试类型

### 视觉效果控制
- 修改`useDynamicColor`变量控制是否启用动态颜色变化
- 修改`useLocalTime`变量选择使用本地时间或服务器时间
- 在`gk.css`中调整`ripple`相关样式可以修改点击波纹效果

### 背景图片修改

有两种方式修改背景图片：

1. **使用界面控制**：将鼠标移至右下角透明图标处，点击后在弹出的对话框中可选择预设背景或输入自定义图片URL

2. **直接修改代码**：替换`gk.css`中`.background-container`的`background-image`属性值：
```css
.background-container {
    background-image: url('https://tc-new.z.wiki/autoupload/f/psmpKOKkqNsLYQfgjt2XBmShhF5SO20rmYlH2FEEX4iyl5f0KlZfm6UsKj-HyTuv/20250810/55Td/3840X2160/stsr.png');
}
```

### 背景图标样式
右下角的自定义背景图标已修改为透明色，可在`gk.css`中调整：
```css
.custom-bg-icon {
    background-color: transparent;  /* 透明背景 */
    /* 其他样式 */
}
```

### 鼠标检测优化
为解决右下角图标显示不稳定的问题，已优化鼠标移动检测逻辑，增加了隐藏延迟并改进了位置检测算法。

## 使用方法

### 直接体验
访问[此处](https://yuebittt.github.io/Countdown/)即可

### 本地部署

1. 克隆本仓库：
```bash
git clone https://github.com/yourusername/Countdown.git
cd Countdown
```

2. 直接在浏览器中打开`index.html`文件即可运行，无需额外依赖

3. 如需修改配置，编辑`gk.js`和`gk.css`文件后刷新页面即可生效

## 📄 许可证

本项目基于MIT许可证开源 - 详见[LICENSE](LICENSE)文件

## 🙏 致谢

- 原项目作者：[Gasolcloudteam](https://github.com/Gasolcloudteam)
- 一言API提供随机名言功能
- 背景图片API服务
