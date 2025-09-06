import { isMobile } from './main.js';

// 点击波纹特效
export function createRipple(event, intensity = 1) {
    // 检查是否开启了点击波纹效果
    const rippleEnabled = localStorage.getItem('rippleEnabled') !== 'false';
    if (!rippleEnabled) return;
    
    const target = event.target;
    // 创建波纹元素
    const ripple = document.createElement('span');
    
    // 获取点击位置相对于目标元素的坐标
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 设置波纹位置和样式
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1000';
    
    // 添加波纹效果的类名
    ripple.classList.add('ripple');
    
    // 将波纹添加到目标元素
    target.appendChild(ripple);
    
    // 设置动画持续时间（根据强度调整）
    const animationDuration = 700 * intensity;
    
    // 开始波纹动画
    ripple.style.transition = `transform ${animationDuration}ms ease-out, opacity ${animationDuration}ms ease-out`;
    
    // 使用requestAnimationFrame确保样式应用后再进行动画
    requestAnimationFrame(() => {
        // 计算波纹大小（根据目标元素大小和强度调整）
        const size = Math.max(rect.width, rect.height) * 2 * intensity;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.transform = `scale(1)`;
        ripple.style.opacity = '0';
    });
    
    // 动画结束后移除波纹元素
    setTimeout(() => {
        ripple.remove();
    }, animationDuration);
}

// 初始化视差效果
export function initParallaxEffect() {
    // 检查是否开启了视差效果
    const parallaxEnabled = localStorage.getItem('parallaxEnabled') !== 'false';
    const parallaxIntensity = localStorage.getItem('parallaxIntensity') ? parseFloat(localStorage.getItem('parallaxIntensity')) : 5;
    
    // 设置开关按钮状态
    const parallaxToggle = document.getElementById('parallaxToggle');
    if (parallaxToggle) {
        parallaxToggle.checked = parallaxEnabled;
    }
    
    // 设置滑块值
    const parallaxSlider = document.getElementById('parallaxSlider');
    if (parallaxSlider) {
        parallaxSlider.value = parallaxIntensity;
    }
    
    // 视差效果实现
    function handleParallax(e) {
        if (!parallaxEnabled) return;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 计算偏移量（基于鼠标位置和视差强度）
        const xOffset = (mouseX - windowWidth / 2) / (windowWidth / 2) * parallaxIntensity;
        const yOffset = (mouseY - windowHeight / 2) / (windowHeight / 2) * parallaxIntensity;
        
        // 应用视差效果
        const backgroundContainer = document.querySelector('.background-container');
        if (backgroundContainer) {
            backgroundContainer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        }
    }
    
    // 监听鼠标移动事件
    document.addEventListener('mousemove', handleParallax);
    
    // 监听触摸移动事件（移动设备）
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleParallax(touch);
    }, { passive: true });
    
    // 监听视差开关变化
    if (parallaxToggle) {
        parallaxToggle.addEventListener('change', () => {
            const isEnabled = parallaxToggle.checked;
            localStorage.setItem('parallaxEnabled', isEnabled);
            
            // 如果关闭视差，重置背景位置
            if (!isEnabled) {
                const backgroundContainer = document.querySelector('.background-container');
                if (backgroundContainer) {
                    backgroundContainer.style.transform = 'translate(0, 0)';
                }
            }
        });
    }
    
    // 监听视差强度变化
    if (parallaxSlider) {
        parallaxSlider.addEventListener('input', () => {
            const intensity = parseFloat(parallaxSlider.value);
            localStorage.setItem('parallaxIntensity', intensity);
        });
    }
}

// 初始化鼠标跟随效果
export function initMouseFollowEffect() {
    // 检查是否开启了鼠标跟随效果
    const mouseFollowEnabled = localStorage.getItem('mouseFollowEnabled') !== 'false';
    
    // 设置开关按钮状态
    const mouseFollowToggle = document.getElementById('mouseFollowToggle');
    if (mouseFollowToggle) {
        mouseFollowToggle.checked = mouseFollowEnabled;
    }
    
    // 创建跟随元素
    let follower = document.createElement('div');
    follower.className = 'mouse-follower';
    follower.style.position = 'fixed';
    follower.style.width = '20px';
    follower.style.height = '20px';
    follower.style.borderRadius = '50%';
    follower.style.background = 'rgba(255, 255, 255, 0.5)';
    follower.style.pointerEvents = 'none';
    follower.style.zIndex = '9999';
    follower.style.transition = 'transform 0.1s ease-out, opacity 0.3s ease';
    follower.style.display = mouseFollowEnabled ? 'block' : 'none';
    follower.style.opacity = mouseFollowEnabled ? '1' : '0';
    follower.style.mixBlendMode = 'overlay';
    document.body.appendChild(follower);
    
    // 记录前一位置用于速度计算
    let prevX = 0;
    let prevY = 0;
    
    // 鼠标跟随逻辑
    function handleMouseFollow(e) {
        if (!mouseFollowEnabled) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 计算速度（用于动态调整大小或透明度）
        const deltaX = Math.abs(mouseX - prevX);
        const deltaY = Math.abs(mouseY - prevY);
        const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 更新前一位置
        prevX = mouseX;
        prevY = mouseY;
        
        // 根据速度调整跟随元素大小（速度越快，元素越小）
        const size = Math.max(10, 20 - speed * 0.2);
        follower.style.width = `${size}px`;
        follower.style.height = `${size}px`;
        
        // 调整跟随元素的位置（使其始终在鼠标下方）
        follower.style.transform = `translate(${mouseX - size/2}px, ${mouseY - size/2}px)`;
    }
    
    // 鼠标点击效果
    function handleMouseClick(e) {
        if (!mouseFollowEnabled) return;
        
        // 点击时扩大并淡出跟随元素
        const originalSize = follower.offsetWidth;
        follower.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
        follower.style.transform = `translate(${prevX - originalSize/2}px, ${prevY - originalSize/2}px) scale(3)`;
        follower.style.opacity = '0';
        
        // 然后恢复正常状态
        setTimeout(() => {
            if (mouseFollowEnabled) {
                follower.style.transition = 'transform 0.1s ease-out, opacity 0.3s ease';
                follower.style.opacity = '1';
            }
        }, 300);
    }
    
    // 注册鼠标移动和点击事件
    document.addEventListener('mousemove', handleMouseFollow);
    document.addEventListener('click', handleMouseClick);
    
    // 处理移动设备触摸事件
    if (isMobile) {
        // 在移动设备上，触摸时显示跟随元素
        document.addEventListener('touchstart', (e) => {
            if (!mouseFollowEnabled) return;
            
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // 更新位置
            prevX = touchX;
            prevY = touchY;
            
            // 显示跟随元素
            follower.style.display = 'block';
            follower.style.opacity = '1';
            follower.style.transform = `translate(${touchX - 10}px, ${touchY - 10}px)`;
            
            // 模拟点击效果
            setTimeout(() => {
                handleMouseClick({ clientX: touchX, clientY: touchY });
            }, 100);
        }, { passive: true });
        
        // 触摸移动时更新位置
        document.addEventListener('touchmove', (e) => {
            if (!mouseFollowEnabled) return;
            
            const touch = e.touches[0];
            handleMouseFollow(touch);
        }, { passive: true });
        
        // 触摸结束时隐藏跟随元素
        document.addEventListener('touchend', () => {
            if (!mouseFollowEnabled) return;
            
            follower.style.opacity = '0';
            setTimeout(() => {
                if (!document.elementFromPoint(prevX, prevY)) {
                    follower.style.display = 'none';
                }
            }, 300);
        });
    }
    
    // 监听鼠标跟随开关变化
    if (mouseFollowToggle) {
        mouseFollowToggle.addEventListener('change', () => {
            const isEnabled = mouseFollowToggle.checked;
            localStorage.setItem('mouseFollowEnabled', isEnabled);
            
            if (isEnabled) {
                follower.style.display = 'block';
                follower.style.opacity = '1';
            } else {
                follower.style.opacity = '0';
                setTimeout(() => {
                    follower.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // 窗口失去焦点时隐藏跟随元素
    window.addEventListener('blur', () => {
        if (mouseFollowEnabled) {
            follower.style.opacity = '0';
        }
    });
    
    // 窗口获得焦点时显示跟随元素
    window.addEventListener('focus', () => {
        if (mouseFollowEnabled) {
            follower.style.opacity = '1';
        }
    });
}

// 初始化双击背景显示加油消息效果
export function initDoubleClickCheer() {
    // 定义加油消息数组
    const cheerMessages = [
        "加油！胜利就在前方！",
        "你是最棒的！",
        "坚持就是胜利！",
        "每一天都在进步！",
        "相信自己，你能行！",
        "成功属于坚持不懈的人！",
        "努力付出，终将收获！",
        "每一步都很重要！",
        "你已经做得很好了！",
        "未来可期，继续加油！"
    ];
    
    // 双击背景显示加油消息
    document.addEventListener('dblclick', (e) => {
        // 仅当点击目标是背景容器或其直接子元素时触发
        const isBackground = e.target.classList.contains('background-container') || 
                            e.target.id === 'backgroundVideo';
        
        if (isBackground) {
            // 创建加油消息元素
            const cheerMessage = document.createElement('div');
            cheerMessage.className = 'cheer-message';
            
            // 随机选择一条消息
            const randomMessage = cheerMessages[Math.floor(Math.random() * cheerMessages.length)];
            cheerMessage.textContent = randomMessage;
            
            // 设置样式
            cheerMessage.style.position = 'fixed';
            cheerMessage.style.top = '50%';
            cheerMessage.style.left = '50%';
            cheerMessage.style.transform = 'translate(-50%, -50%)';
            cheerMessage.style.fontSize = '2rem';
            cheerMessage.style.color = '#fff';
            cheerMessage.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
            cheerMessage.style.zIndex = '9999';
            cheerMessage.style.pointerEvents = 'none';
            cheerMessage.style.opacity = '0';
            cheerMessage.style.transition = 'opacity 0.3s ease, transform 1s ease-out';
            
            // 添加到页面
            document.body.appendChild(cheerMessage);
            
            // 触发动画
            requestAnimationFrame(() => {
                cheerMessage.style.opacity = '1';
                cheerMessage.style.transform = 'translate(-50%, -60%)';
            });
            
            // 动画结束后移除元素
            setTimeout(() => {
                cheerMessage.style.opacity = '0';
                setTimeout(() => {
                    cheerMessage.remove();
                }, 300);
            }, 1500);
        }
    });
}

// 初始化所有视觉效果
export function initVisualEffects() {
    // 初始化点击波纹特效
    document.addEventListener('click', (e) => {
        // 排除特定元素，如设置弹窗内的按钮
        if (!e.target.closest('.modal') && !e.target.closest('.settings-btn')) {
            createRipple(e);
        }
    });
    
    // 初始化视差效果
    initParallaxEffect();
    
    // 初始化鼠标跟随效果
    initMouseFollowEffect();
    
    // 初始化双击背景显示加油消息效果
    initDoubleClickCheer();
}