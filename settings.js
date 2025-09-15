import { isMobile, backgroundContainer, backgroundVideo, fontSizeSettings, useDynamicColor } from './main.js';
// 动态导入utils.js，确保能正确访问到fetchHitokoto函数
let utilsModule;

// 初始化设置功能
export function initSettings() {
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
    window.backgroundContainer = document.querySelector('.background-container');
    window.backgroundVideo = document.getElementById('backgroundVideo');
    
    // 预先加载utils模块，确保函数可用
    import('./utils.js').then(module => {
        utilsModule = module;
        console.log('utils模块已成功加载');
    }).catch(error => {
        console.error('加载utils模块失败:', error);
    });
    
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
        window.backgroundContainer.style.backgroundImage = `url(./stsr.png)`;
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
        window.backgroundVideo.style.display = 'none';
        window.backgroundContainer.style.backgroundImage = `url(./stsr.png)`;
        
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

    // 初始化字体大小设置
    initFontSizeSettings();
    
    // 绑定标签页事件
    bindTabEvents();
    
    // 初始化显示第一个标签页
    switchTab('background');
    
    // 初始化更新一言按钮
    function initRefreshHitokotoBtn() {
        // 由于更新一言按钮在设置弹窗内部，我们需要等待设置弹窗创建后再绑定事件
        setTimeout(() => {
            console.log('尝试初始化更新一言按钮...');
            const refreshHitokotoBtn = document.getElementById('refreshHitokotoBtn');
            if (refreshHitokotoBtn) {
                console.log('找到更新一言按钮，绑定点击事件...');
                // 先移除可能存在的事件监听器，防止重复绑定
                const newButton = refreshHitokotoBtn.cloneNode(true);
                refreshHitokotoBtn.parentNode.replaceChild(newButton, refreshHitokotoBtn);
                
                newButton.addEventListener('click', () => {
                    console.log('点击了更新一言按钮');
                    // 为了确保函数调用成功，我们直接在按钮点击时更新文本
                    const hitokotoElement = document.getElementById('hitokoto');
                    if (hitokotoElement) {
                        hitokotoElement.textContent = '正在获取新的一言...';
                    }
                    
                    // 确保utils模块已加载
                    if (utilsModule && utilsModule.fetchHitokoto) {
                        console.log('使用utils模块中的fetchHitokoto函数');
                        utilsModule.fetchHitokoto();
                    } else {
                        console.log('utils模块尚未加载，尝试动态导入后再调用');
                        import('./utils.js').then(module => {
                            utilsModule = module;
                            module.fetchHitokoto();
                        }).catch(error => {
                            console.error('加载utils模块并调用fetchHitokoto失败:', error);
                            if (hitokotoElement) {
                                hitokotoElement.textContent = '获取一言失败，请稍后重试';
                            }
                        });
                    }
                });
            } else {
                console.log('未找到更新一言按钮');
            }
        }, 1000); // 1秒后再绑定事件，确保设置弹窗已经初始化
    }
    
    // 立即尝试初始化
    initRefreshHitokotoBtn();
    
    // 当设置弹窗打开时再尝试一次，确保DOM已完全加载
    settingsModal.addEventListener('click', function onModalOpen() {
        if (settingsModal.style.display === 'flex') {
            setTimeout(initRefreshHitokotoBtn, 100);
            // 移除这个事件监听器，避免重复调用
            settingsModal.removeEventListener('click', onModalOpen);
        }
    });
}

// 设置背景图片并保存到本地存储
export function setBackgroundImage(url) {
    // 隐藏视频，显示图片
    window.backgroundVideo.style.display = 'none';
    window.backgroundContainer.style.backgroundImage = `url(${url})`;
    
    // 保存到本地存储
    localStorage.setItem('customBackground', url);
    localStorage.setItem('customBackgroundType', 'image');
    
    // 更新动态颜色
    if (!useDynamicColor) {
        setAutoColor();
    }
}
    
// 设置背景视频并保存到本地存储
export function setBackgroundVideo(url) {
    // 显示视频，隐藏图片
    window.backgroundContainer.style.backgroundImage = 'none';
    window.backgroundVideo.src = url;
    window.backgroundVideo.style.display = 'block';
    
    // 保存到本地存储
    localStorage.setItem('customBackground', url);
    localStorage.setItem('customBackgroundType', 'video');
    
    // 更新动态颜色
    if (!useDynamicColor) {
        setAutoColor();
    }
}

// 初始化字体大小设置
export function initFontSizeSettings() {
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
export function switchTab(tabName) {
    // 移除所有标签按钮的激活状态
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 移除所有标签内容的激活状态
    const tabContents = document.querySelectorAll('.tab-pane');
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

// 绑定标签页事件
export function bindTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
}