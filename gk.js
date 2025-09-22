
// 检测是否为移动设备（全局变量，所有函数都可访问）
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 自定义倒计时相关变量
let customCountdownInterval = null;
let customCountdownActive = false;
let customEndTime = null;

// 背景相关变量（全局，供setBackgroundImage和setBackgroundVideo函数使用）
let backgroundContainer;
let backgroundVideo;

// 效果控制变量
let rippleEnabled = true; // 默认启用波纹效果

// 字体大小配置
const fontSizeSettings = {
    small: 0.8,
    medium: 1.0,
    large: 1.2,
    'x-large': 1.4
};

// 初始化设置功能
function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const modalClose = document.querySelector('.close-btn');
    const bgImageUrlInput = document.getElementById('bgImageUrl');
    const presetImages = document.querySelectorAll('.preset-grid .preset-item');
    const presetVideos = document.querySelectorAll('.preset-videos .preset-item');
    const clearBgBtn = document.getElementById('clearBgBtn');
    const applyBgBtn = document.getElementById('applyBgBtn');
    const customCountdownBtn = document.getElementById('customCountdownBtn');
    
    // 初始化背景元素（使用全局变量）
    backgroundContainer = document.querySelector('.background-container');
    backgroundVideo = document.getElementById('backgroundVideo');
    
    // 标签页相关元素
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-pane');

    // 检查本地存储中是否有保存的背景
    const savedBgType = localStorage.getItem('customBackgroundType');
    const savedBgUrl = localStorage.getItem('customBackground');
    
    if (savedBgUrl) {
        if (savedBgType === 'video') {
            setBackgroundVideo(savedBgUrl);
        } else {
            setBackgroundImage(savedBgUrl);
        }
    } else {
        // 默认使用图片背景
        backgroundContainer.style.backgroundImage = `url(./stsr.png)`;
    }
    
    // 移动设备适配：显示设置按钮
    if (isMobile) {
        // 对于移动设备，直接显示按钮，不隐藏
        settingsBtn.classList.add('visible');
        customCountdownBtn.classList.add('visible');
        settingsBtn.style.opacity = '0.7'; // 在移动设备上按钮更明显
    } else {
        // 桌面设备的原有鼠标检测逻辑
        let hideTimer;
        document.addEventListener('mousemove', (e) => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const cornerAreaWidth = 200; // 右下角区域宽度
            const cornerAreaHeight = 200; // 右下角区域高度
            
            // 清除之前的隐藏定时器
            if (hideTimer) {
                clearTimeout(hideTimer);
            }

            // 当鼠标移动到右下角特定区域时显示按钮
            if (mouseX > windowWidth - cornerAreaWidth && mouseY > windowHeight - cornerAreaHeight) {
                settingsBtn.classList.add('visible');
                customCountdownBtn.classList.add('visible');
            } else {
                // 鼠标离开右下角区域后延迟隐藏按钮
                hideTimer = setTimeout(() => {
                    // 获取当前鼠标位置（更准确的方式）
                    const iconRect = settingsBtn.getBoundingClientRect();
                    const countdownBtnRect = customCountdownBtn.getBoundingClientRect();
                    
                    const isMouseOverIcon = document.elementFromPoint(e.clientX, e.clientY) === settingsBtn;
                    const isMouseOverCountdownBtn = document.elementFromPoint(e.clientX, e.clientY) === customCountdownBtn;
                    
                    if (!isMouseOverIcon && settingsBtn.classList.contains('visible')) {
                        settingsBtn.classList.remove('visible');
                    }
                    
                    if (!isMouseOverCountdownBtn && customCountdownBtn.classList.contains('visible')) {
                        customCountdownBtn.classList.remove('visible');
                    }
                }, 1000); // 增加延迟时间，使按钮停留更久
            }
        });
        
        // 鼠标悬停在按钮上时始终保持可见
        settingsBtn.addEventListener('mouseenter', () => {
            settingsBtn.classList.add('visible');
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
        });
        
        customCountdownBtn.addEventListener('mouseenter', () => {
            customCountdownBtn.classList.add('visible');
            if (hideTimer) {
                clearTimeout(hideTimer);
            }
        });
        
        // 鼠标离开按钮时，根据位置决定是否隐藏
        settingsBtn.addEventListener('mouseleave', () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const cornerAreaWidth = 200;
            const cornerAreaHeight = 200;
            
            // 获取鼠标当前位置（使用最新位置而非事件位置）
            let currentMouseX = 0;
            let currentMouseY = 0;
            
            document.addEventListener('mousemove', updateMousePosition, { once: true });
            
            function updateMousePosition(e) {
                currentMouseX = e.clientX;
                currentMouseY = e.clientY;
                
                // 检查鼠标是否还在右下角区域
                if (!(currentMouseX > windowWidth - cornerAreaWidth && currentMouseY > windowHeight - cornerAreaHeight)) {
                    hideTimer = setTimeout(() => {
                        settingsBtn.classList.remove('visible');
                    }, 300);
                }
            }
        });
        
        customCountdownBtn.addEventListener('mouseleave', () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const cornerAreaWidth = 200;
            const cornerAreaHeight = 200;
            
            // 获取鼠标当前位置（使用最新位置而非事件位置）
            let currentMouseX = 0;
            let currentMouseY = 0;
            
            document.addEventListener('mousemove', updateCountdownBtnMousePosition, { once: true });
            
            function updateCountdownBtnMousePosition(e) {
                currentMouseX = e.clientX;
                currentMouseY = e.clientY;
                
                // 检查鼠标是否还在右下角区域
                if (!(currentMouseX > windowWidth - cornerAreaWidth && currentMouseY > windowHeight - cornerAreaHeight)) {
                    hideTimer = setTimeout(() => {
                        customCountdownBtn.classList.remove('visible');
                    }, 300);
                }
            }
        });
    }

    // 点击按钮打开设置弹窗
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        // 阻止事件冒泡，避免立即隐藏按钮
        event.stopPropagation();
    });

    // 关闭设置弹窗
    function closeSettingsModal() {
        settingsModal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }

    // 点击关闭按钮关闭弹窗
    modalClose.addEventListener('click', closeSettingsModal);

    // 点击弹窗外部关闭弹窗
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    // 应用自定义背景
    applyBgBtn.addEventListener('click', () => {
        const bgUrl = bgImageUrlInput.value.trim();
        if (bgUrl) {
            // 检查URL是否指向视频文件
            if (bgUrl.match(/\.(mp4|webm|ogg|mov)$/i)) {
                setBackgroundVideo(bgUrl);
            } else {
                setBackgroundImage(bgUrl);
            }
            // 稍微延迟关闭，让用户看到应用成功的反馈
            setTimeout(() => {
                closeSettingsModal();
            }, 300);
        }
    });

    // 清除背景
    clearBgBtn.addEventListener('click', () => {
        // 清除本地存储
        localStorage.removeItem('customBackground');
        localStorage.removeItem('customBackgroundType');
        
        // 恢复默认背景
        backgroundVideo.style.display = 'none';
        backgroundContainer.style.backgroundImage = `url(./stsr.png)`;
        
        // 清空输入框
        bgImageUrlInput.value = '';
        
        // 更新动态颜色
        if (!useDynamicColor) {
            setAutoColor();
        }
        
        // 稍微延迟关闭，让用户看到应用成功的反馈
        setTimeout(() => {
            closeSettingsModal();
        }, 300);
    });

    // 文件上传功能
    const uploadBtn = document.getElementById('uploadBtn');
    const fileName = document.getElementById('fileName');

    // 点击上传按钮触发文件选择
    uploadBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('bgImageUpload');
        fileInput.click();
        // 重置文件输入，以便可以重复选择同一个文件
        fileInput.value = '';
    });

    // 监听文件选择变化
    document.getElementById('bgImageUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // 显示选中的文件名
            fileName.textContent = file.name;
            
            // 检查是否为图片或视频文件
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                // 获取大小限制开关状态
                const sizeLimitToggle = document.getElementById('sizeLimitToggle');
                const sizeLimitEnabled = sizeLimitToggle && sizeLimitToggle.checked;
                
                // 检查文件大小（限制为50MB）
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (sizeLimitEnabled && file.size > maxSize) {
                    alert('文件大小不能超过50MB！请选择较小的文件，或关闭大小限制开关。');
                    fileName.textContent = '';
                    return;
                }
                
                // 如果禁用了大小限制且文件很大，给用户一个警告
                if (!sizeLimitEnabled && file.size > maxSize) {
                    if (!confirm(`警告：您选择的文件大小超过了50MB（${(file.size / (1024 * 1024)).toFixed(2)}MB）。\n大文件可能会导致性能问题。\n确定要继续吗？`)) {
                        fileName.textContent = '';
                        return;
                    }
                }
                
                // 添加上传进度显示
                const progressContainer = document.createElement('div');
                progressContainer.className = 'upload-progress';
                progressContainer.innerHTML = '<div class="progress-bar"><div class="progress-fill"></div></div><span class="progress-text">0%</span>';
                
                // 找到文件上传头部后插入进度条
                const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
                if (fileUploadWrapper) {
                    fileUploadWrapper.appendChild(progressContainer);
                }
                
                const progressFill = progressContainer.querySelector('.progress-fill');
                const progressText = progressContainer.querySelector('.progress-text');
                
                // 确保进度条样式正确
                if (progressFill) progressFill.style.width = '0%';
                
                const reader = new FileReader();
                
                // 上传进度事件
                reader.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        if (progressFill) progressFill.style.width = percent + '%';
                        if (progressText) progressText.textContent = percent + '%';
                    }
                };
                
                // 文件读取完成后处理
                reader.onload = (event) => {
                    try {
                        const mediaUrl = event.target.result; // 这是Data URL格式的数据
                        
                        if (file.type.startsWith('video/')) {
                            setBackgroundVideo(mediaUrl);
                        } else {
                            setBackgroundImage(mediaUrl);
                        }
                        
                        // 移除进度条
                        setTimeout(() => {
                            if (progressContainer && progressContainer.parentNode) {
                                progressContainer.parentNode.removeChild(progressContainer);
                            }
                            closeSettingsModal();
                        }, 300);
                    } catch (error) {
                        console.error('设置背景时出错:', error);
                        alert('设置背景时出错，请重试！');
                        if (progressContainer && progressContainer.parentNode) {
                            progressContainer.parentNode.removeChild(progressContainer);
                        }
                    }
                };
                
                // 处理读取错误
                reader.onerror = () => {
                    console.error('文件读取失败');
                    alert('文件读取失败，请重试！');
                    if (progressContainer && progressContainer.parentNode) {
                        progressContainer.parentNode.removeChild(progressContainer);
                    }
                };
                
                // 以Data URL格式读取文件
                try {
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('读取文件时发生异常:', error);
                    alert('读取文件时发生异常，请重试！');
                    if (progressContainer && progressContainer.parentNode) {
                        progressContainer.parentNode.removeChild(progressContainer);
                    }
                }
            } else {
                alert('请选择图片或视频文件！');
                fileName.textContent = '';
            }
        } else {
            fileName.textContent = '';
        }
    });

    // 选择预设背景图片
    presetImages.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const bgUrl = img.getAttribute('data-url');
            bgImageUrlInput.value = bgUrl;
            setBackgroundImage(bgUrl);
            // 稍微延迟关闭，让用户看到选择成功的反馈
            setTimeout(() => {
                closeSettingsModal();
            }, 300);
        });
    });
    
    // 选择预设视频背景
    presetVideos.forEach(item => {
        item.addEventListener('click', () => {
            const videoUrl = item.querySelector('.video-url').value;
            bgImageUrlInput.value = videoUrl;
            setBackgroundVideo(videoUrl);
            // 稍微延迟关闭，让用户看到选择成功的反馈
            setTimeout(() => {
                closeSettingsModal();
            }, 300);
        });
    });

    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.style.display === 'flex') {
            closeSettingsModal();
        }
    });

    // 设置背景图片并保存到本地存储
    function setBackgroundImage(url) {
        // 隐藏视频，显示图片
        backgroundVideo.style.display = 'none';
        backgroundContainer.style.backgroundImage = `url(${url})`;
        
        // 保存到本地存储
        localStorage.setItem('customBackground', url);
        localStorage.setItem('customBackgroundType', 'image');
        
        // 更新动态颜色
        if (!useDynamicColor) {
            setAutoColor();
        }
    }
    
    // 设置背景视频并保存到本地存储
    function setBackgroundVideo(url) {
        // 显示视频，隐藏图片
        backgroundContainer.style.backgroundImage = 'none';
        backgroundVideo.src = url;
        backgroundVideo.style.display = 'block';
        
        // 保存到本地存储
        localStorage.setItem('customBackground', url);
        localStorage.setItem('customBackgroundType', 'video');
        
        // 更新动态颜色
        if (!useDynamicColor) {
            setAutoColor();
        }
    }
    
    // 初始化字体大小设置
    function initFontSizeSettings() {
        const fontSizeBtns = document.querySelectorAll('.size-btn');
        const customFontSizeSlider = document.getElementById('customFontSize');
        const fontSizeValue = document.querySelector('.current-size');
        const contentElement = document.querySelector('.content');
        
        // 从本地存储加载保存的字体大小，如果没有则使用默认值
        const savedFontSize = localStorage.getItem('customFontSize');
        let currentFontSize = savedFontSize ? parseFloat(savedFontSize) : 1.0;
        
        // 设置初始字体大小
        function setFontSize(size) {
            // 更新内容元素的字体大小（使用CSS变量或直接设置transform）
            document.documentElement.style.setProperty('--font-scale', size);
            
            // 同时应用transform scale以获得更好的缩放效果
            contentElement.style.transform = `scale(${size})`;
            
            // 应用字体大小调整到自定义倒计时显示
            const customCountdownDisplay = document.getElementById('customCountdownDisplay');
            if (customCountdownDisplay) {
                customCountdownDisplay.style.transform = `scale(${size})`;
            }
            
            // 更新滑块值
            customFontSizeSlider.value = size;
            
            // 更新显示的字体大小百分比
            fontSizeValue.textContent = `${Math.round(size * 100)}%`;
            
            // 更新活动按钮样式
            fontSizeBtns.forEach(btn => {
                if (parseFloat(btn.getAttribute('data-size')) === size) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // 保存到本地存储
            localStorage.setItem('customFontSize', size);
        }
        
        // 初始化设置
        setFontSize(currentFontSize);
        
        // 按钮点击事件
        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseFloat(btn.getAttribute('data-size'));
                setFontSize(size);
            });
        });
        
        // 滑块事件
        customFontSizeSlider.addEventListener('input', () => {
            const size = parseFloat(customFontSizeSlider.value);
            setFontSize(size);
        });
    }
    
    // 切换标签页 - 优化动画效果
    function switchTab(tabName) {
        // 移除所有标签按钮的激活状态
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // 移除所有标签内容的激活状态
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 找到对应的按钮和内容
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(tabName);
        
        // 先激活按钮
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // 使用setTimeout延迟内容显示，使按钮激活动画先开始
        setTimeout(() => {
            if (tabContent) {
                tabContent.classList.add('active');
            }
        }, 100);
    }
    

    // 初始化一言边框设置
    function initHitokotoBorderSettings() {
        const hitokotoBorderToggle = document.getElementById('hitokotoBorderToggle');
        const hitokotoElement = document.getElementById('hitokoto');
        const hitokotoWrapper = document.querySelector('.hitokoto-wrapper');
        
        // 从本地存储加载保存的边框设置，默认为启用
        const savedBorderSetting = localStorage.getItem('hitokotoBorderEnabled');
        const isBorderEnabled = savedBorderSetting !== null ? savedBorderSetting === 'true' : true;
        
        // 设置初始状态
        hitokotoBorderToggle.checked = isBorderEnabled;
        updateHitokotoBorder(isBorderEnabled);
        
        // 监听开关变化
        hitokotoBorderToggle.addEventListener('change', () => {
            const enabled = hitokotoBorderToggle.checked;
            updateHitokotoBorder(enabled);
            localStorage.setItem('hitokotoBorderEnabled', enabled.toString());
        });
        
        // 更新一言边框显示的函数
        function updateHitokotoBorder(enabled) {
            if (enabled) {
                // 启用边框效果
                hitokotoElement.classList.remove('no-border');
                hitokotoWrapper.classList.remove('no-border');
            } else {
                // 禁用边框效果
                hitokotoElement.classList.add('no-border');
                hitokotoWrapper.classList.add('no-border');
            }
        }
    }

    // 绑定标签页事件
    function bindTabEvents() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                if (tabName) {
                    switchTab(tabName);
                }
            });
        });
    }
    
    // 初始化字体大小设置
    initFontSizeSettings();
    
    // 初始化一言边框设置
    initHitokotoBorderSettings();
    
    // 绑定标签页事件
    bindTabEvents();
    
    // 初始化显示第一个标签页
    switchTab('background');
}

// 初始化自定义倒计时功能
function initCustomCountdown() {
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
        
        // 验证输入
        if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            alert('请输入有效的分钟和秒数（0-59）');
            return;
        }
        
        // 确保总时间大于0
        if (minutes === 0 && seconds === 0) {
            alert('请至少设置1秒的倒计时');
            return;
        }
        
        // 计算结束时间
        const totalSeconds = minutes * 60 + seconds;
        customEndTime = new Date(Date.now() + totalSeconds * 1000);
        
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
    
    // 显示取消文字的函数 - 添加渐变动画
    function showCancelText() {
        if (isTransitioning || !customCountdownActive) return;
        isTransitioning = true;
        
        // 确保两个元素都可见以实现渐变效果
        countdownCancel.style.display = 'block';
        
        // 添加淡出效果
        countdownTime.style.opacity = '0';
        
        // 添加淡入效果
        countdownCancel.style.opacity = '1';
        
        // 等待动画完成
        setTimeout(() => {
            // 隐藏时间显示元素，但保持取消元素可见
            countdownTime.style.display = 'none';
            isTransitioning = false;
        }, 300);
    }
    
    // 恢复时间显示的函数 - 添加渐变动画
    function showTimeText() {
        if (isTransitioning || !customCountdownActive) return;
        isTransitioning = true;
        
        // 确保两个元素都可见以实现渐变效果
        countdownTime.style.display = 'flex';
        
        // 添加淡出效果
        countdownCancel.style.opacity = '0';
        
        // 添加淡入效果
        countdownTime.style.opacity = '1';
        
        // 等待动画完成
        setTimeout(() => {
            // 隐藏取消显示元素，但保持时间元素可见
            countdownCancel.style.display = 'none';
            isTransitioning = false;
        }, 300);
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
        if (!customCountdownActive) return;
        
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

// 选择启用动态取色功能或自动颜色调整
const useDynamicColor = true; // 若不需要动态取色，改为 false
const useLocalTime = true; // 若要使用本地时间，改为 true；否则使用服务器时间

function fetchServerTime() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://worldtimeapi.org/api/timezone/Asia/Shanghai', true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      var response = JSON.parse(xhr.responseText);
      var serverTime = new Date(response.utc_datetime);
      updateCountdown(serverTime);
    } else {
      console.error('Error fetching server time:', xhr.status);
    }
  };
  xhr.send();
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

// 考试类型配置
const exams = [
    { name: "调研考", year: 2025, month: 7, day: 21 },
    { name: "零模", year: 2025, month: 11, day: 23 },
    { name: "一模", year: 2026, month: 2, day: 19 },
    { name: "二模", year: 2026, month: 3, day: 21 },
    { name: "高考", year: 2026, month: 5, day: 7 }
];

// 自动选择最近的一次大考
function selectNearestExam() {
    const today = new Date();
    let nearestExamIndex = 0;
    let minDaysDifference = Infinity;

    for (let i = 0; i < exams.length; i++) {
        const examDate = new Date(exams[i].year, exams[i].month, exams[i].day);
        const timeDiff = examDate - today;
        const daysDifference = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // 只考虑未来的考试
        if (daysDifference >= 0 && daysDifference < minDaysDifference) {
            minDaysDifference = daysDifference;
            nearestExamIndex = i;
        }
    }

    return nearestExamIndex;
}

// 初始显示高考 (找到exams数组中名称包含'高考'的项的索引)
let currentExamIndex = exams.findIndex(exam => exam.name.includes('高考'));

// 定义显示模式：'gaokao'表示显示高考，'nearest'表示显示最近的大考
let displayMode = 'gaokao';

function updateCountdown(time) {
    var today = time || new Date();
    // 获取当前选中的考试配置
    const currentExam = exams[currentExamIndex];
    var currentYear = currentExam.year; // 使用考试配置中的年份
    var examDateStart = new Date(currentYear, currentExam.month, currentExam.day);
    var examDateEnd = new Date(currentYear, currentExam.month, currentExam.day, 18, 0, 0);

    // 更新考试类型显示
    document.getElementById("examType").textContent = currentExam.name;

    if (today >= examDateStart && today <= examDateEnd) {
        document.getElementById("countdown").style.display = "none";
        document.getElementById("greeting").style.display = "block";
        document.getElementById("greeting").innerText = `今天是${currentExam.name}日，祝考试顺利！`;
    } else {
        document.getElementById("greeting").style.display = "none";
        document.getElementById("countdown").style.display = "block";
        var timeDiff = examDateStart - today;
        // 移除年份自动递增逻辑
        var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        var hours = padZero(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        var minutes = padZero(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
        var seconds = padZero(Math.floor((timeDiff % (1000 * 60)) / 1000));

        document.getElementById("days").innerText = days;
        document.getElementById("hours").innerText = hours;
        document.getElementById("minutes").innerText = minutes;
        document.getElementById("seconds").innerText = seconds;
        document.getElementById("year").innerText = currentYear;
    }
}

function fetchHitokoto(retryCount = 0) {
  // 更新为更稳定的一言API地址
  const apiUrl = 'https://v1.hitokoto.cn/';
  const hitokotoElement = document.getElementById("hitokoto");
  const contentElement = document.getElementById("hitokoto-content");
  const sourceElement = document.getElementById("hitokoto-source");
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiUrl, true);
  
  // 设置超时，防止请求卡住
  xhr.timeout = 5000;
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var response = JSON.parse(xhr.responseText);
        contentElement.innerText = response.hitokoto;
        sourceElement.innerText = response.from ? " —— " + response.from : "";
      } catch (e) {
        console.error('Error parsing hitokoto response:', e);
        contentElement.innerText = "奋斗是青春最亮丽的底色！";
        sourceElement.innerText = "";
      }
    } else {
      console.error('Error fetching hitokoto:', xhr.status);
      // 设置默认文本，避免显示空白
      contentElement.innerText = "奋斗是青春最亮丽的底色！";
      sourceElement.innerText = "";
    }
  };
  
  // 处理网络错误
  xhr.onerror = function() {
    console.error('Network error when fetching hitokoto');
    contentElement.innerText = "努力是梦想与现实之间的桥梁！";
    sourceElement.innerText = "";
  };
  
  // 处理超时
  xhr.ontimeout = function() {
    console.error('Timeout when fetching hitokoto, retry count:', retryCount);
    
    // 如果重试次数小于2，则重试
    if (retryCount < 2) {
      console.log('Retrying hitokoto request...');
      // 稍微延迟后重试，避免立即重试
      setTimeout(() => {
        fetchHitokoto(retryCount + 1);
      }, 1000);
    } else {
      // 重试次数已达上限，显示错误信息
      contentElement.innerText = "坚持就是胜利！";
      sourceElement.innerText = "";
    }
  };
  
  xhr.send();
}

function setAutoColor() {
  const elements = document.querySelectorAll('.auto-color');
  elements.forEach(el => {
    const rgb = getAverageRGB(document.body);
    const yiq = ((rgb.r*299)+(rgb.g*587)+(rgb.b*114))/1000;
    el.style.color = (yiq >= 128) ? 'black' : 'white';
  });
}

function getAverageRGB(imgEl) {
  var blockSize = 5, // 取样间隔
      defaultRGB = {r:255,g:255,b:255}, // 默认白色
      canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height,
      i = -4,
      length,
      rgb = {r:0,g:0,b:0},
      count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch(e) {
    return defaultRGB;
  }

  length = data.data.length;

  while ( (i += blockSize * 4) < length ) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i+1];
    rgb.b += data.data[i+2];
  }

  rgb.r = ~~(rgb.r/count);
  rgb.g = ~~(rgb.g/count);
  rgb.b = ~~(rgb.b/count);

  return rgb;
}

function initCountdown() {
  if (useLocalTime) {
    updateCountdown(new Date());
    setInterval(() => updateCountdown(new Date()), 1000);
  } else {
    fetchServerTime();
    setInterval(fetchServerTime, 1000);
  }
}

// 显示自定义倒计时
function showCustomCountdown() {
    // 清除之前的倒计时
    if (customCountdownInterval) {
        clearInterval(customCountdownInterval);
    }
    
    // 显示倒计时区域，不隐藏主内容
    document.getElementById('customCountdownDisplay').style.display = 'block';
    
    // 设置倒计时状态为活动
    customCountdownActive = true;
    
    // 更新倒计时
    updateCustomCountdown();
    
    // 每秒更新一次
    customCountdownInterval = setInterval(updateCustomCountdown, 1000);
}

// 更新自定义倒计时
function updateCustomCountdown() {
    const now = new Date();
    const timeDiff = customEndTime - now;
    
    // 检查是否倒计时结束
    if (timeDiff <= 0) {
        hideCustomCountdown();
        showCheerMessage('倒计时结束！🎉');
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
function hideCustomCountdown() {
    // 清除倒计时
    if (customCountdownInterval) {
        clearInterval(customCountdownInterval);
        customCountdownInterval = null;
    }
    
    // 隐藏自定义倒计时显示区域
    document.getElementById('customCountdownDisplay').style.display = 'none';
    
    // 设置倒计时状态为非活动
    customCountdownActive = false;
    
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
function showCheerMessage(customMessage = null) {
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
                cheerMessage.innerHTML = `<div class="cheer-text">${currentExam.name}加油！！！！！</div><div class="cheer-emoji">ヾ(≧ ▽ ≦)ゝ</div>`;
            } else {
                // 默认加油消息，确保总是能显示正确的内容
                cheerMessage.innerHTML = `<div class="cheer-text">加油！！！！！</div><div class="cheer-emoji">ヾ(≧ ▽ ≦)ゝ</div>`;
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

// 添加点击波纹特效
function createRipple(e, scaleFactor, delay = 0) {
  // 在移动设备上减少波纹效果的复杂度以提升性能
  if (isMobile) {
    scaleFactor = 0.8; // 移动设备上波纹更小
  }
  
  const ripple = document.createElement('div');
  ripple.classList.add('ripple');
  // 随机大小变化 (80-140px)
  const size = Math.random() * 60 + 80 * scaleFactor;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  // 计算点击位置
  const x = e.clientX - size / 2;
  const y = e.clientY - size / 2;
  // 设置波纹位置和样式
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.animationDelay = `${delay}s`;
  
  // 使用HSL颜色模型创建蓝绿色系渐变 (更准确的颜色控制)
  const hue = Math.random() * 60 + 180; // 180-240 蓝绿色系
  
  if (isMobile) {
    // 移动设备上使用更简单的颜色，减少性能消耗
    ripple.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 80%, 0.3) 0%, hsla(${hue}, 100%, 80%, 0.1) 100%)`;
  } else {
    // 桌面设备上使用完整效果
    ripple.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 70%, 0.4) 0%, hsla(${hue}, 100%, 70%, 0.1) 100%)`;
  }
  
  document.body.appendChild(ripple);
  
  // 动画结束后移除元素
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}

// 确保DOM加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主倒计时
    initCountdown();
    
    // 获取一言
    fetchHitokoto();
    setInterval(fetchHitokoto, 3600000);

    // 动态设置字体颜色
    if (!useDynamicColor) {
        setAutoColor();
    }
    
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
            currentExamIndex = selectNearestExam();
        } else {
            // 从最近的大考切换回高考
            displayMode = 'gaokao';
            currentExamIndex = exams.findIndex(exam => exam.name.includes('高考'));
        }
        updateCountdown(new Date());
    });

    // 移动端触摸事件支持
    let touchStartTime = 0;
    let lastTouchTime = 0;
    const DOUBLE_TAP_TIME = 300; // 双击时间间隔阈值
    let isTouchProcessing = false; // 防止事件重复处理
    let longPressTimer = null; // 长按检测定时器
    
    // 移动端触摸开始处理
    document.addEventListener('touchstart', function(e) {
        // 防止事件重复处理
        if (isTouchProcessing) return;
        isTouchProcessing = true;
        
        // 记录触摸开始时间
        const currentTime = new Date().getTime();
        const tapInterval = currentTime - lastTouchTime;
        
        // 判断是否是双击 (快速点击两次)
        if (tapInterval > 0 && tapInterval < DOUBLE_TAP_TIME) {
            // 双击事件
            showCheerMessage();
            lastTouchTime = 0; // 重置双击检测
        } else {
            // 单击事件，记录时间用于长按检测和双击判断
            touchStartTime = currentTime;
            lastTouchTime = currentTime;
            
            // 长按检测：设置定时器，只有当长按超过1000毫秒才显示加油消息
            longPressTimer = setTimeout(() => {
                const touchEndTime = new Date().getTime();
                // 只有在没有触发双击且确实长按的情况下才显示加油消息
                if (lastTouchTime === currentTime && touchEndTime - touchStartTime > 2000) {
                    showCheerMessage();
                }
            }, 1100);
        }
        
        // 允许后续事件处理
        setTimeout(() => {
            isTouchProcessing = false;
        }, 50);
    });
    
    // 添加触摸结束事件处理，清除长按定时器
    document.addEventListener('touchend', function(e) {
        // 清除长按检测定时器，防止普通点击被误认为长按
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });
    
    // 点击波纹特效处理函数
    function handleClickRipple(e) {
      if (!rippleEnabled) return;
      
      // 创建主波纹
      createRipple(e, 1);
      
      // 创建次级波纹，增加层次感
      setTimeout(() => {
        createRipple(e, 0.7, 0.2);
      }, 100);
    }
    
    // 触摸波纹特效处理函数（移动设备）
    function handleTouchRipple(e) {
      if (!rippleEnabled) return;
      
      const touch = e.touches[0];
      // 创建主波纹
      createRipple({clientX: touch.clientX, clientY: touch.clientY}, 1);
      
      // 创建次级波纹，增加层次感
      setTimeout(() => {
        createRipple({clientX: touch.clientX, clientY: touch.clientY}, 0.7, 0.2);
      }, 100);
    }
    
    // 添加点击波纹特效事件监听
    document.addEventListener('click', handleClickRipple);
    document.addEventListener('touchstart', handleTouchRipple);
    
    // 初始化点击波纹开关
    const enableRippleToggle = document.getElementById('enableRippleToggle');
    if (enableRippleToggle) {
      // 从本地存储加载保存的设置，如果没有则使用默认值
      const savedRippleSetting = localStorage.getItem('enableRipple');
      if (savedRippleSetting !== null) {
        rippleEnabled = savedRippleSetting === 'true';
        enableRippleToggle.checked = rippleEnabled;
      }
      
      // 添加开关的change事件监听
      enableRippleToggle.addEventListener('change', function() {
        rippleEnabled = this.checked;
        localStorage.setItem('enableRipple', rippleEnabled.toString());
      });
    }
    
    // 双击背景显示加油鼓励动画和文字效果
    document.addEventListener('dblclick', function(e) {
      showCheerMessage();
    });
    
    // 初始化设置功能
    initSettings();
    
    // 初始化自定义倒计时功能
    initCustomCountdown();
    
    // 添加背景随鼠标轻微移动的视差效果
    const backgroundContainer = document.querySelector('.background-container');
    let maxMove = 15; // 视差移动最大距离，使效果更明显
    let parallaxEnabled = true; // 默认启用视差效果
    
    // 获取开关元素
    const enableParallaxToggle = document.getElementById('disableParallaxToggle');
    // 获取视差强度滑块和控制容器
    const parallaxIntensitySlider = document.getElementById('parallaxIntensity');
    const parallaxValueDisplay = document.getElementById('parallaxValue');
    const parallaxIntensityControl = document.getElementById('parallaxIntensityControl');
    
    // 函数：根据视差状态显示或隐藏强度控制（带动画效果）
    function toggleParallaxControlVisibility() {
        // 确保添加了控制过渡动画类
        parallaxIntensityControl.classList.add('control-transition');
        
        if (parallaxEnabled) {
            // 显示视差强度控制（带动画）
            parallaxIntensityControl.classList.remove('hidden');
        } else {
            // 隐藏视差强度控制（带动画）
            parallaxIntensityControl.classList.add('hidden');
        }
    }
    
    // 从本地存储读取设置
    const storedEnabledValue = localStorage.getItem('parallaxEnabled');
    const storedIntensityValue = localStorage.getItem('parallaxIntensity');
    
    // 检查是否有保存的设置，如果没有则默认启用
    if (storedEnabledValue !== null) {
        parallaxEnabled = storedEnabledValue === 'true';
        enableParallaxToggle.checked = parallaxEnabled;
    } else {
        // 默认启用视差效果
        parallaxEnabled = true;
        enableParallaxToggle.checked = true;
        localStorage.setItem('parallaxEnabled', 'true');
    }
    
    // 检查是否有保存的视差强度设置
    if (storedIntensityValue !== null) {
        maxMove = parseInt(storedIntensityValue);
        parallaxIntensitySlider.value = maxMove;
    } else {
        // 默认视差强度
        maxMove = 15;
        parallaxIntensitySlider.value = 15;
        localStorage.setItem('parallaxIntensity', '15');
    }
    
    // 更新视差强度显示值
    parallaxValueDisplay.textContent = `当前: ${maxMove}px`;
    
    // 初始化时根据视差状态显示或隐藏强度控制
    toggleParallaxControlVisibility();
    
    // 添加视差强度滑块事件监听
    parallaxIntensitySlider.addEventListener('input', function() {
        maxMove = parseInt(this.value);
        parallaxValueDisplay.textContent = `当前: ${maxMove}px`;
        localStorage.setItem('parallaxIntensity', maxMove.toString());
    });
    
    // 添加开关事件监听
    enableParallaxToggle.addEventListener('change', function() {
        // 当开关被选中时，表示启用视差效果
        parallaxEnabled = this.checked;
        
        // 保存设置到本地存储
        localStorage.setItem('parallaxEnabled', parallaxEnabled.toString());
        
        // 如果禁用视差，重置背景位置
        if (!parallaxEnabled) {
            backgroundContainer.style.transform = 'translate(0px, 0px)';
        }
        
        // 根据视差状态显示或隐藏强度控制
        toggleParallaxControlVisibility();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (parallaxEnabled) {
            // 获取鼠标在视口中的位置
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 计算鼠标位置相对于窗口中心的偏移量 (范围: -1 到 1)
            const xOffset = (e.clientX / windowWidth - 0.5) * 2;
            const yOffset = (e.clientY / windowHeight - 0.5) * 2;
            
            // 计算背景移动的实际像素值
            const translateX = xOffset * maxMove;
            const translateY = yOffset * maxMove;
            
            // 应用变换效果，使用transform属性以获得更好的性能
            backgroundContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
    });
    
    // 为移动设备添加触摸移动支持
    document.addEventListener('touchmove', (e) => {
        // 检查是否在设置弹窗或自定义背景弹窗内滑动
        const isInModal = e.target.closest('.settings-modal') || e.target.closest('.custom-bg-modal') || e.target.closest('.custom-countdown-modal');
        
        if (parallaxEnabled && e.touches.length > 0 && !isInModal) {
            const touch = e.touches[0];
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // 计算触摸位置相对于窗口中心的偏移量
            const xOffset = (touch.clientX / windowWidth - 0.5) * 2;
            const yOffset = (touch.clientY / windowHeight - 0.5) * 2;
            
            // 计算背景移动的实际像素值
            const translateX = xOffset * maxMove;
            const translateY = yOffset * maxMove;
            
            // 应用变换效果
            backgroundContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
            
            // 只有在非弹窗区域才阻止默认滚动行为
            e.preventDefault();
        }
    }, { passive: false });
    
    // 为背景容器添加平滑过渡效果
    backgroundContainer.style.transition = 'transform 0.15s ease-out';
    
    // 初始化鼠标跟随效果
    const mouseFollower = document.getElementById('mouse-follower');
    const followerCircle = document.querySelector('.follower-circle');
    const enableMouseFollowerToggle = document.getElementById('enableMouseFollowerToggle');
    
    // 从本地存储加载设置
    const savedMouseFollowerState = localStorage.getItem('enableMouseFollower');
    if (savedMouseFollowerState !== null) {
        enableMouseFollowerToggle.checked = savedMouseFollowerState === 'true';
    }
    
    // 移动设备上减少效果的复杂度以提升性能
    if (isMobile) {
        // 设置移动设备上的样式
        followerCircle.style.width = '20px';
        followerCircle.style.height = '20px';
    }
    
    // 处理开关状态变化
    enableMouseFollowerToggle.addEventListener('change', () => {
        localStorage.setItem('enableMouseFollower', enableMouseFollowerToggle.checked);
        if (!enableMouseFollowerToggle.checked) {
            mouseFollower.style.opacity = '0';
        }
    });
    
    // 鼠标移动事件 - 跟随鼠标移动
    document.addEventListener('mousemove', (e) => {
        // 在移动设备上隐藏鼠标跟随效果
        if (isMobile) {
            mouseFollower.style.opacity = '0';
            return;
        }
        
        // 检查开关状态
        if (enableMouseFollowerToggle.checked) {
            // 显示跟随效果
            mouseFollower.style.opacity = '1';
            
            // 设置跟随元素的位置
            followerCircle.style.left = `${e.clientX}px`;
            followerCircle.style.top = `${e.clientY}px`;
        }
    });
    
    // 鼠标点击效果
    document.addEventListener('mousedown', () => {
        if (!isMobile && enableMouseFollowerToggle.checked) {
            mouseFollower.classList.add('click');
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (!isMobile) {
            mouseFollower.classList.remove('click');
        }
    });
    
    // 鼠标离开页面时隐藏跟随效果
    document.addEventListener('mouseleave', () => {
        mouseFollower.style.opacity = '0';
    });
    
    // 点击toggle-setting区域直接切换开关
    document.querySelectorAll('.toggle-setting').forEach(toggleSetting => {
        toggleSetting.addEventListener('click', function(e) {
            // 如果点击的不是开关本身，才触发切换
            if (!e.target.closest('.switch')) {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    // 触发change事件
                    checkbox.dispatchEvent(new Event('change'));
                }
            }
        });
    });
    
});