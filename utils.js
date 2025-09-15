// 一言API调用函数
export function fetchHitokoto() {
    const hitokotoElement = document.getElementById('hitokoto');
    if (!hitokotoElement) return;
    
    // 定义一言API地址列表（包含备用地址）
    const apiUrls = [
        'https://v1.hitokoto.cn/?c=a',
        'https://international.v1.hitokoto.cn/?c=a',
        'https://api.imjad.cn/hitokoto/?c=a'
    ];
    
    // 设置最大重试次数
    const maxRetries = 3;
    
    // 实现重试逻辑
    function attemptFetch(retryCount = 0, currentUrlIndex = 0) {
        if (retryCount >= maxRetries) {
            // 如果重试次数用完，使用默认文本
            console.error('多次尝试获取一言失败，使用默认文本');
            hitokotoElement.textContent = '好好学习，天天向上！';
            return;
        }
        
        // 选择API地址（循环使用备用地址）
        const apiUrl = apiUrls[currentUrlIndex % apiUrls.length];
        
        // 使用fetch API调用一言接口
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // 更新一言文本
                hitokotoElement.textContent = data.hitokoto || data.content || '好好学习，天天向上！';
                
                // 添加淡入效果
                hitokotoElement.style.opacity = '0';
                hitokotoElement.style.transform = 'translateY(10px)';
                
                // 使用requestAnimationFrame确保样式应用后再进行动画
                requestAnimationFrame(() => {
                    hitokotoElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    hitokotoElement.style.opacity = '1';
                    hitokotoElement.style.transform = 'translateY(0)';
                });
            })
            .catch(error => {
                console.error(`获取一言失败（尝试${retryCount + 1}/${maxRetries}）:`, error);
                // 延迟1秒后重试，换一个API地址
                setTimeout(() => {
                    attemptFetch(retryCount + 1, currentUrlIndex + 1);
                }, 1000);
            });
    }
    
    // 开始首次尝试
    attemptFetch();
}

// 自动颜色设置函数
export function setAutoColor() {
    // 获取背景容器
    const backgroundContainer = document.querySelector('.background-container');
    if (!backgroundContainer) return;
    
    // 创建一个临时的canvas用于处理背景图像
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 检查背景是图片还是视频
    const backgroundImage = backgroundContainer.style.backgroundImage;
    const backgroundVideo = document.getElementById('backgroundVideo');
    
    if (backgroundImage && backgroundImage !== 'none') {
        // 处理图片背景
        const img = new Image();
        
        // 提取背景图片URL
        const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (!urlMatch) return;
        
        const imgUrl = urlMatch[1];
        
        // 设置图片加载完成后的回调
        img.onload = function() {
            // 设置canvas尺寸为图像的尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 在canvas上绘制图像
            ctx.drawImage(img, 0, 0);
            
            // 获取图像的平均RGB值
            const rgb = getAverageRGB(canvas);
            
            // 根据平均RGB值计算适合的文字颜色
            updateTextColor(rgb);
        };
        
        // 处理Data URL（避免跨域问题）
        if (imgUrl.startsWith('data:')) {
            img.src = imgUrl;
        } else {
            // 对于普通URL，添加随机参数以避免缓存
            img.src = imgUrl + '?' + new Date().getTime();
            
            // 处理可能的跨域问题
            img.crossOrigin = 'anonymous';
            
            // 如果加载失败，使用默认颜色
            img.onerror = function() {
                updateTextColor({ r: 128, g: 128, b: 128 }); // 灰色背景的默认颜色
            };
        }
    } else if (backgroundVideo && backgroundVideo.style.display !== 'none') {
        // 处理视频背景
        canvas.width = backgroundVideo.videoWidth;
        canvas.height = backgroundVideo.videoHeight;
        
        // 绘制当前视频帧
        ctx.drawImage(backgroundVideo, 0, 0, canvas.width, canvas.height);
        
        // 获取当前帧的平均RGB值
        const rgb = getAverageRGB(canvas);
        
        // 根据平均RGB值计算适合的文字颜色
        updateTextColor(rgb);
    } else {
        // 使用默认颜色（适用于纯色背景）
        updateTextColor({ r: 0, g: 0, b: 0 }); // 默认为暗色背景
    }
}

// 获取图像的平均RGB值函数
export function getAverageRGB(canvas) {
    const ctx = canvas.getContext('2d');
    
    try {
        // 获取canvas的图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let pixelCount = 0;
        
        // 为了提高性能，我们可以跳过一些像素
        const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4) / 50)); // 每50x50像素取一个样本
        
        // 遍历图像数据，计算平均RGB值
        for (let i = 0; i < data.length; i += 4 * step) {
            // 跳过完全透明的像素
            if (data[i + 3] > 10) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                pixelCount++;
            }
        }
        
        // 计算平均值
        if (pixelCount > 0) {
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);
        }
        
        return { r, g, b };
    } catch (error) {
        console.error('获取图像平均颜色失败:', error);
        // 如果出错，返回默认颜色
        return { r: 128, g: 128, b: 128 };
    }
}

// 更新文字颜色函数
function updateTextColor(rgb) {
    // 计算颜色的亮度（使用WCAG公式）
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    
    // 计算颜色的对比度（与白色）
    const whiteContrast = (Math.max(rgb.r, rgb.g, rgb.b) + 0.05) / (Math.min(rgb.r, rgb.g, rgb.b) + 0.05);
    
    // 判断应该使用黑色还是白色文字
    const useWhiteText = brightness < 128 || whiteContrast < 1.6;
    
    // 设置根元素的CSS变量
    document.documentElement.style.setProperty('--text-color', useWhiteText ? '#fff' : '#000');
    document.documentElement.style.setProperty('--text-shadow-color', useWhiteText ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)');
    
    // 更新所有文本元素的样式
    const textElements = document.querySelectorAll('.content, .hitokoto, .custom-countdown-display');
    textElements.forEach(element => {
        element.style.color = useWhiteText ? '#fff' : '#000';
        element.style.textShadow = `0 0 8px ${useWhiteText ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}`;
    });
    
    // 更新设置按钮样式
    const settingsButtons = document.querySelectorAll('.settings-btn');
    settingsButtons.forEach(button => {
        button.style.color = useWhiteText ? '#fff' : '#000';
        button.style.backgroundColor = useWhiteText ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
        button.style.borderColor = useWhiteText ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    });
}

// 显示加油消息函数
export function showCheerMessage() {
    // 定义加油消息数组
    const cheerMessages = [
        "加油！你一定能行！",
        "坚持就是胜利！",
        "每一步都在接近目标！",
        "相信自己，你是最棒的！",
        "胜利就在眼前！",
        "付出总会有回报！",
        "你已经做得很好了！",
        "继续保持，未来可期！",
        "今天的努力，明天的成功！",
        "不要放弃，梦想就在前方！"
    ];
    
    // 随机选择一条消息
    const randomMessage = cheerMessages[Math.floor(Math.random() * cheerMessages.length)];
    
    // 创建加油消息元素
    const cheerMessage = document.createElement('div');
    cheerMessage.className = 'cheer-message';
    cheerMessage.textContent = randomMessage;
    
    // 设置样式
    cheerMessage.style.position = 'fixed';
    cheerMessage.style.top = '50%';
    cheerMessage.style.left = '50%';
    cheerMessage.style.transform = 'translate(-50%, -50%)';
    cheerMessage.style.fontSize = '2.5rem';
    cheerMessage.style.fontWeight = 'bold';
    cheerMessage.style.color = '#fff';
    cheerMessage.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8)';
    cheerMessage.style.zIndex = '9999';
    cheerMessage.style.pointerEvents = 'none';
    cheerMessage.style.opacity = '0';
    
    // 添加到页面
    document.body.appendChild(cheerMessage);
    
    // 添加背景模糊效果
    document.body.style.backdropFilter = 'blur(5px)';
    document.body.style.webkitBackdropFilter = 'blur(5px)';
    
    // 触发动画
    requestAnimationFrame(() => {
        cheerMessage.style.transition = 'opacity 0.5s ease, transform 1.5s ease-out';
        cheerMessage.style.opacity = '1';
        cheerMessage.style.transform = 'translate(-50%, -60%) scale(1.2)';
    });
    
    // 动画结束后移除元素
    setTimeout(() => {
        cheerMessage.style.opacity = '0';
        document.body.style.backdropFilter = 'none';
        document.body.style.webkitBackdropFilter = 'none';
        
        setTimeout(() => {
            cheerMessage.remove();
        }, 500);
    }, 2000);
}

// 播放提示音
function playNotificationSound() {
    try {
        // 创建音频上下文
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建振荡器
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 连接节点
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音频参数 - 增大音量并使用更明显的声音类型
        oscillator.type = 'square'; // 方波（更明显）
        oscillator.frequency.value = 1000; // 频率 (Hz) - 略微提高
        gainNode.gain.value = 0.6; // 音量 - 大幅增加
        
        // 播放音频
        oscillator.start();
        
        // 先保持高音量
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        
        // 0.5秒后开始降低音量
        gainNode.gain.exponentialRampToValueAtTime(
            0.001, audioContext.currentTime + 1.5
        );
        
        // 添加频率变化使声音更明显
        oscillator.frequency.exponentialRampToValueAtTime(
            500, audioContext.currentTime + 1.5
        );
        
        // 1.5秒后停止
        setTimeout(() => {
            oscillator.stop();
        }, 1500);
    } catch (error) {
        console.error('播放提示音失败:', error);
    }
}

// 数字补零函数
export function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 格式化时间函数
export function formatTime(hours, minutes, seconds) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
}

// 服务器时间获取函数（可根据需要调用）
export function fetchServerTime() {
    // 定义几个备用的获取时间的API
    const timeAPIs = [
        'https://worldtimeapi.org/api/timezone/Asia/Shanghai',
        'https://api.mcsrvstat.us/2/time',
        'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai'
    ];
    
    // 随机选择一个API
    const apiUrl = timeAPIs[Math.floor(Math.random() * timeAPIs.length)];
    
    return new Promise((resolve, reject) => {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                let serverTime;
                
                // 根据不同API的响应格式提取时间
                if (data.datetime) {
                    serverTime = new Date(data.datetime);
                } else if (data.timestamp) {
                    serverTime = new Date(data.timestamp);
                } else if (data.currentLocalTime) {
                    serverTime = new Date(data.currentLocalTime);
                } else {
                    throw new Error('无法解析时间数据');
                }
                
                resolve(serverTime);
            })
            .catch(error => {
                console.error('获取服务器时间失败:', error);
                // 如果获取失败，使用本地时间作为备选
                resolve(new Date());
            });
    });
}