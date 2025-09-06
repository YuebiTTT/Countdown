// 检测是否为移动设备（全局变量，所有函数都可访问）
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 自定义倒计时相关变量
export let customCountdownInterval = null;
export let customCountdownActive = false;
export let customEndTime = null;

// 背景相关变量（全局，供setBackgroundImage和setBackgroundVideo函数使用）
export let backgroundContainer;
export let backgroundVideo;

// 效果控制变量
export let rippleEnabled = true; // 默认启用波纹效果

// 字体大小配置
export const fontSizeSettings = {
    small: 0.8,
    medium: 1.0,
    large: 1.2,
    'x-large': 1.4
};

// 选择启用动态取色功能或自动颜色调整
export const useDynamicColor = true; // 若不需要动态取色，改为 false
export const useLocalTime = true; // 若要使用本地时间，改为 true；否则使用服务器时间

// 考试类型配置
export const exams = [
    { name: "调研考", year: 2025, month: 7, day: 21 },
    { name: "零模", year: 2025, month: 11, day: 23 },
    { name: "一模", year: 2026, month: 2, day: 19 },
    { name: "二模", year: 2026, month: 3, day: 21 },
    { name: "高考", year: 2026, month: 5, day: 7 }
];

// 初始显示高考 (找到exams数组中名称包含'高考'的项的索引)
export let currentExamIndex = exams.findIndex(exam => exam.name.includes('高考'));

// 定义显示模式：'gaokao'表示显示高考，'nearest'表示显示最近的大考
export let displayMode = 'gaokao';

// 确保DOM加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主倒计时
    import('./countdown.js').then(module => {
        module.initCountdown();
    });
    
    // 初始化设置功能
    import('./settings.js').then(module => {
        module.initSettings();
    });
    
    // 初始化自定义倒计时功能
    import('./customCountdown.js').then(module => {
        module.initCustomCountdown();
    });
    
    // 初始化效果功能
    import('./effects.js').then(module => {
        module.initEffects();
    });
    
    // 获取一言
    import('./utils.js').then(module => {
        module.fetchHitokoto();
        setInterval(() => {
            module.fetchHitokoto();
        }, 3600000);
    });

    // 动态设置字体颜色
    import('./utils.js').then(module => {
        if (!useDynamicColor) {
            module.setAutoColor();
        }
    });
    
    // 隐藏自定义倒计时显示区域
    const customCountdownDisplay = document.getElementById('customCountdownDisplay');
    if (customCountdownDisplay) {
        customCountdownDisplay.style.display = 'none';
    }

    // 考试类型切换点击事件 - 实现点击切换功能
    document.getElementById("examType").addEventListener("click", () => {
        if (displayMode === 'gaokao') {
            // 从高考切换到最近的大考
            displayMode = 'nearest';
            import('./countdown.js').then(module => {
                currentExamIndex = module.selectNearestExam();
                module.updateCountdown(new Date());
            });
        } else {
            // 从最近的大考切换回高考
            displayMode = 'gaokao';
            currentExamIndex = exams.findIndex(exam => exam.name.includes('高考'));
            import('./countdown.js').then(module => {
                module.updateCountdown(new Date());
            });
        }
    });

    // 移动端触摸事件支持 - 仅保留长按功能
    let touchStartTime = 0;
    
    // 移动端长按显示加油消息
    document.addEventListener('touchstart', function(e) {
        // 记录触摸开始时间用于长按检测
        touchStartTime = new Date().getTime();
        
        // 长按检测
        setTimeout(() => {
            const touchEndTime = new Date().getTime();
            if (touchEndTime - touchStartTime > 500) { // 长按超过500毫秒
                import('./customCountdown.js').then(module => {
                    module.showCheerMessage();
                });
            }
        }, 600);
    });

    // 双击背景显示加油鼓励动画和文字效果
    document.addEventListener('dblclick', function(e) {
        import('./customCountdown.js').then(module => {
            module.showCheerMessage();
        });
    });
});