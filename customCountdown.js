import { exams, currentExamIndex, customCountdownInterval, customCountdownActive, customEndTime } from './main.js';
import { padZero } from './countdown.js';

let touchTimer;

// 初始化自定义倒计时功能
export function initCustomCountdown() {
    const customCountdownBtn = document.getElementById('customCountdownBtn');
    const customCountdownModal = document.getElementById('customCountdownModal');
    const closeBtn = customCountdownModal.querySelector('.close-btn');
    const startCountdownBtn = document.getElementById('startCountdownBtn');
    const minutesInput = document.getElementById('minutesInput');
    const secondsInput = document.getElementById('secondsInput');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customCountdownDisplay = document.getElementById('customCountdownDisplay');
    const cancelCountdownBtn = document.getElementById('cancelCountdownBtn');
    
    // 点击按钮打开弹窗
    customCountdownBtn.addEventListener('click', (event) => {
        customCountdownModal.classList.add('active');
        event.stopPropagation();
    });
    
    // 关闭弹窗函数
    function closeModal() {
        customCountdownModal.classList.remove('active');
    }
    
    // 点击关闭按钮关闭弹窗
    closeBtn.addEventListener('click', closeModal);
    
    // 点击弹窗外部关闭弹窗
    customCountdownModal.addEventListener('click', (e) => {
        if (e.target === customCountdownModal) {
            closeModal();
        }
    });
    
    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && customCountdownModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // 预设时间按钮点击事件
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.getAttribute('data-minutes'));
            const seconds = parseInt(btn.getAttribute('data-seconds'));
            
            minutesInput.value = minutes;
            secondsInput.value = seconds;
        });
    });
    
    // 开始倒计时
    startCountdownBtn.addEventListener('click', () => {
        let minutes = parseInt(minutesInput.value) || 0;
        let seconds = parseInt(secondsInput.value) || 0;
        
        // 输入验证已移除，根据用户要求不显示任何提示
        if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            return;
        }
        
        // 输入验证已移除，根据用户要求不显示任何提示
        if (minutes === 0 && seconds === 0) {
            return;
        }
        
        // 计算结束时间
        const totalSeconds = minutes * 60 + seconds;
        window.customEndTime = new Date(Date.now() + totalSeconds * 1000);
        
        // 关闭弹窗
        closeModal();
        
        // 显示倒计时
        showCustomCountdown();
    });
    
    // 为倒计时容器添加鼠标悬停和点击事件
    const countdownTextContainer = document.getElementById('countdownTextContainer');
    const countdownTime = document.querySelector('.countdown-time');
    const countdownCancel = document.querySelector('.countdown-cancel');
    
    // 标记是否正在处理过渡效果，防止事件频繁触发
    let isTransitioning = false;
    
    // 显示取消文字的函数 - 增强动画效果
    function showCancelText() {
        if (isTransitioning || !window.customCountdownActive) return;
        isTransitioning = true;
        
        // 确保两个元素都可见以实现动画效果
        countdownCancel.style.display = 'block';
        
        // 重置取消文字的样式
        countdownCancel.style.opacity = '0';
        countdownCancel.style.transform = 'translate(-50%, -50%) scale(0.4) rotate(-20deg)';
        countdownCancel.style.color = '#ff5722';
        countdownCancel.style.fontSize = '22px';
        countdownCancel.style.fontWeight = 'bold';
        countdownCancel.style.textShadow = 'none';
        
        // 添加时间文字的淡出动画
        countdownTime.style.opacity = '0';
        countdownTime.style.transform = 'translate(-50%, -50%) scale(1.4) rotate(20deg)';
        
        // 添加容器的高亮效果
        countdownTextContainer.style.backgroundColor = 'rgba(255, 87, 34, 0.2)';
        countdownTextContainer.style.boxShadow = '0 0 20px rgba(255, 87, 34, 0.5)';
        countdownTextContainer.style.transform = 'scale(1.05)';
        
        // 添加取消文字的入场动画
        setTimeout(() => {
            countdownCancel.style.opacity = '1';
            countdownCancel.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(5deg)';
            countdownCancel.style.color = '#ff6e40';
            countdownCancel.style.textShadow = '0 0 8px rgba(255, 110, 64, 0.6)';
            
            // 添加弹性弹跳效果
            setTimeout(() => {
                countdownCancel.style.transform = 'translate(-50%, -50%) scale(1.2) rotate(-2deg)';
                setTimeout(() => {
                    countdownCancel.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(1deg)';
                    setTimeout(() => {
                        countdownCancel.style.transform = 'translate(-50%, -50%) scale(1) rotate(0)';
                        countdownCancel.style.color = '#ff5722';
                    }, 100);
                }, 100);
            }, 200);
        }, 50);
        
        // 添加容器的呼吸效果
        let containerPulse = 0;
        const containerInterval = setInterval(() => {
            if (containerPulse % 2 === 0) {
                countdownTextContainer.style.transform = 'scale(1.08)';
                countdownTextContainer.style.boxShadow = '0 0 25px rgba(255, 87, 34, 0.6)';
            } else {
                countdownTextContainer.style.transform = 'scale(1.03)';
                countdownTextContainer.style.boxShadow = '0 0 15px rgba(255, 87, 34, 0.4)';
            }
            containerPulse++;
            if (containerPulse >= 4) {
                clearInterval(containerInterval);
                countdownTextContainer.style.transform = 'scale(1)';
            }
        }, 300);
        
        // 添加文字的彩色脉冲效果
        let textPulseCount = 0;
        const textPulseInterval = setInterval(() => {
            const colors = ['#ff5722', '#ff9800', '#ffc107', '#ff5722'];
            const shadows = ['0 0 8px rgba(255, 87, 34, 0.6)', '0 0 8px rgba(255, 152, 0, 0.6)', '0 0 8px rgba(255, 193, 7, 0.6)', '0 0 8px rgba(255, 87, 34, 0.6)'];
            
            countdownCancel.style.color = colors[textPulseCount];
            countdownCancel.style.textShadow = shadows[textPulseCount];
            
            textPulseCount++;
            if (textPulseCount >= colors.length) {
                clearInterval(textPulseInterval);
            }
        }, 250);
        
        // 等待动画完成
        setTimeout(() => {
            // 隐藏时间显示元素，但保持取消元素可见
            countdownTime.style.display = 'none';
            isTransitioning = false;
        }, 1200);
    }
    
    // 恢复时间显示的函数 - 增强动画效果
    function showTimeText() {
        if (isTransitioning || !window.customCountdownActive) return;
        isTransitioning = true;
        
        // 确保两个元素都可见以实现动画效果
        countdownTime.style.display = 'flex';
        
        // 重置时间文字的样式
        countdownTime.style.opacity = '0';
        countdownTime.style.transform = 'translate(-50%, -50%) scale(0.4) rotate(20deg)';
        countdownTime.style.color = '#4caf50';
        countdownTime.style.textShadow = 'none';
        
        // 添加取消文字的淡出动画
        countdownCancel.style.opacity = '0';
        countdownCancel.style.transform = 'translate(-50%, -50%) scale(1.4) rotate(-20deg)';
        
        // 容器效果过渡
        countdownTextContainer.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        countdownTextContainer.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.3)';
        countdownTextContainer.style.transform = 'scale(1.05)';
        
        // 添加时间文字的入场动画
        setTimeout(() => {
            countdownTime.style.opacity = '1';
            countdownTime.style.transform = 'translate(-50%, -50%) scale(1.3) rotate(-5deg)';
            countdownTime.style.color = '#66bb6a';
            countdownTime.style.textShadow = '0 0 8px rgba(102, 187, 106, 0.6)';
            
            // 添加弹性弹跳效果
            setTimeout(() => {
                countdownTime.style.transform = 'translate(-50%, -50%) scale(1.2) rotate(2deg)';
                setTimeout(() => {
                    countdownTime.style.transform = 'translate(-50%, -50%) scale(1.1) rotate(-1deg)';
                    setTimeout(() => {
                        countdownTime.style.transform = 'translate(-50%, -50%) scale(1) rotate(0)';
                        countdownTime.style.color = '#4caf50';
                        countdownTextContainer.style.backgroundColor = 'transparent';
                        countdownTextContainer.style.boxShadow = 'none';
                    }, 100);
                }, 100);
            }, 200);
        }, 50);
        
        // 添加容器的呼吸效果
        let containerPulse = 0;
        const containerInterval = setInterval(() => {
            if (containerPulse % 2 === 0) {
                countdownTextContainer.style.transform = 'scale(1.08)';
                countdownTextContainer.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.4)';
            } else {
                countdownTextContainer.style.transform = 'scale(1.03)';
                countdownTextContainer.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.2)';
            }
            containerPulse++;
            if (containerPulse >= 4) {
                clearInterval(containerInterval);
                countdownTextContainer.style.transform = 'scale(1)';
            }
        }, 300);
        
        // 等待动画完成
        setTimeout(() => {
            // 隐藏取消显示元素，但保持时间元素可见
            countdownCancel.style.display = 'none';
            isTransitioning = false;
        }, 1200);
    }
    
    // 鼠标悬浮事件 - 使用防抖
    let hoverTimer;
    countdownTextContainer.addEventListener('mouseenter', () => {
        // 小延迟，避免快速移动鼠标时的误触
        hoverTimer = setTimeout(showCancelText, 100);
    });
    
    // 鼠标离开事件
    countdownTextContainer.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        showTimeText();
    });
    
    // 点击事件 - 取消倒计时
    countdownTextContainer.addEventListener('click', () => {
        if (!window.customCountdownActive) return;
        
        // 添加取消倒计时的视觉反馈
        countdownTextContainer.classList.add('cancelled');
        
        // 显示取消成功的提示
        showCheerMessage('倒计时已取消');
        
        // 延迟隐藏，让用户看到视觉反馈
        setTimeout(() => {
            hideCustomCountdown();
            countdownTextContainer.classList.remove('cancelled');
        }, 300);
    });
    
    // 移动端触摸事件支持
    let touchStartX, touchStartY;
    let isTouching = false;
    
    // 触摸开始事件
    countdownTextContainer.addEventListener('touchstart', (e) => {
        isTouching = true;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // 触摸长按显示取消文字（适用于移动端）
        touchTimer = setTimeout(() => {
            if (isTouching) {
                showCancelText();
            }
        }, 300);
        
        // 防止事件冒泡和默认行为
        e.stopPropagation();
    });
    
    // 触摸移动事件 - 判断是否有明显滑动，避免滑动时触发取消
    countdownTextContainer.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const touch = e.touches[0];
        const diffX = Math.abs(touch.clientX - touchStartX);
        const diffY = Math.abs(touch.clientY - touchStartY);
        
        // 如果滑动超过10像素，则认为是滑动操作，取消长按检测
        if (diffX > 10 || diffY > 10) {
            clearTimeout(touchTimer);
        }
    });
    
    // 触摸结束事件
    countdownTextContainer.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
        isTouching = false;
        
        // 如果已经显示了取消文字，则执行取消操作
        if (countdownCancel.style.display === 'block') {
            setTimeout(() => {
                showTimeText();
            }, 500); // 短暂延迟后恢复时间显示
        }
    });
    
    // 确保初始状态正确
    countdownTime.style.opacity = '1';
}

// 显示自定义倒计时
export function showCustomCountdown() {
    // 清除之前的倒计时
    if (window.customCountdownInterval) {
        clearInterval(window.customCountdownInterval);
    }
    
    // 显示倒计时区域，不隐藏主内容
    document.getElementById('customCountdownDisplay').style.display = 'block';
    
    // 设置倒计时状态为活动
    window.customCountdownActive = true;
    
    // 更新倒计时
    updateCustomCountdown();
    
    // 每秒更新一次
    window.customCountdownInterval = setInterval(updateCustomCountdown, 1000);
}

// 更新自定义倒计时
export function updateCustomCountdown() {
    const now = new Date();
    const timeDiff = window.customEndTime - now;
    
    // 检查是否倒计时结束
    if (timeDiff <= 0) {
        hideCustomCountdown();
        showCheerMessage('倒计时结束！🎉');
        playNotificationSound();
        return;
    }
    
    // 计算剩余分钟和秒数
    const totalSeconds = Math.ceil(timeDiff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // 更新显示
    document.getElementById('customCountdownMinutes').textContent = padZero(minutes);
    document.getElementById('customCountdownSeconds').textContent = padZero(seconds);
}

// 隐藏自定义倒计时
export function hideCustomCountdown() {
    // 清除倒计时
    if (window.customCountdownInterval) {
        clearInterval(window.customCountdownInterval);
        window.customCountdownInterval = null;
    }
    
    // 隐藏自定义倒计时显示区域
    document.getElementById('customCountdownDisplay').style.display = 'none';
    
    // 设置倒计时状态为非活动
    window.customCountdownActive = false;
    
    // 确保倒计时按钮可见，以便用户可以再次点击开始新的倒计时
    // 特别是在移动设备上，需要保持按钮可见
    const customCountdownBtn = document.getElementById('customCountdownBtn');
    if (customCountdownBtn) {
        customCountdownBtn.classList.add('visible');
        
        // 增强按钮的可点击性，防止点击穿透到后面的时钟
        // 1. 确保按钮在最顶层
        customCountdownBtn.style.zIndex = '9999';
        
        // 2. 为了确保按钮点击事件正常工作，添加一个小的延时后重新设置可见性
        setTimeout(() => {
            customCountdownBtn.classList.add('visible');
        }, 100);
        
        // 3. 添加一个临时的额外层来增强点击体验
        if (!document.getElementById('countdownBtnHelper')) {
            const helperDiv = document.createElement('div');
            helperDiv.id = 'countdownBtnHelper';
            helperDiv.style.position = 'fixed';
            helperDiv.style.bottom = '30px';
            helperDiv.style.right = '20px';
            helperDiv.style.width = '60px';
            helperDiv.style.height = '60px';
            helperDiv.style.zIndex = '9998';
            helperDiv.style.pointerEvents = 'none';
            document.body.appendChild(helperDiv);
            
            // 3秒后移除辅助元素，避免长期存在
            setTimeout(() => {
                if (helperDiv.parentNode) {
                    helperDiv.parentNode.removeChild(helperDiv);
                }
            }, 3000);
        }
    }
}

// 显示加油消息
export function showCheerMessage(customMessage = null) {
    const cheerMessage = document.getElementById('cheerMessage');
    const blurElements = document.querySelectorAll('.blur-target, .background-container');
    
    // 先应用模糊效果
    blurElements.forEach(el => el.classList.add('blur-background'));
    
    // 延迟0.5秒后显示加油消息
    setTimeout(() => {
        if (customMessage) {
            cheerMessage.textContent = customMessage;
        } else {
            // 无论customCountdownActive是什么状态，双击时都显示加油消息
            // 只在倒计时真正结束时（通过updateCustomCountdown调用）才显示倒计时结束消息
            // 添加错误检查，确保显示正确的消息
            if (exams && exams.length > 0 && currentExamIndex >= 0 && currentExamIndex < exams.length && exams[currentExamIndex] && exams[currentExamIndex].name) {
                const currentExam = exams[currentExamIndex];
                cheerMessage.textContent = `${currentExam.name}加油！！！！！ヾ(≧ ▽ ≦)ゝ`;
            } else {
                // 默认加油消息，确保总是能显示正确的内容
                cheerMessage.textContent = '加油！！！！！ヾ(≧ ▽ ≦)ゝ';
            }
        }
        
        cheerMessage.style.opacity = '1';
        cheerMessage.style.zIndex = '1000'; // 确保显示时在正确层级
        
        // 2秒后恢复原状
        setTimeout(() => {
            cheerMessage.style.opacity = '0';
            cheerMessage.style.zIndex = '-1'; // 隐藏时设置z-index为-1，防止点击穿透
            cheerMessage.style.pointerEvents = 'none'; // 同时禁用点击事件
            blurElements.forEach(el => el.classList.remove('blur-background'));
        }, 2000);
    }, 500);
}