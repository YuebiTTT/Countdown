
// 自定义背景相关功能
function initCustomBackground() {
    const customBgIcon = document.getElementById('customBgIcon');
    const customBgModal = document.getElementById('customBgModal');
    const closeBtn = document.querySelector('.close-btn');
    const applyBgBtn = document.getElementById('applyBgBtn');
    const bgImageUrlInput = document.getElementById('bgImageUrl');
    const presetImages = document.querySelectorAll('.image-grid img');
    const backgroundContainer = document.querySelector('.background-container');
    const backgroundVideo = document.getElementById('backgroundVideo');
    const presetVideos = document.querySelectorAll('.video-item');

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

    // 鼠标移动检测，显示/隐藏自定义背景图标
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

        // 当鼠标移动到右下角特定区域时显示图标
        if (mouseX > windowWidth - cornerAreaWidth && mouseY > windowHeight - cornerAreaHeight) {
            customBgIcon.classList.add('visible');
        } else {
            // 鼠标离开右下角区域后延迟隐藏图标
            hideTimer = setTimeout(() => {
                // 获取当前鼠标位置（更准确的方式）
                const iconRect = customBgIcon.getBoundingClientRect();
                const isMouseOverIcon = document.elementFromPoint(e.clientX, e.clientY) === customBgIcon;
                
                if (!isMouseOverIcon && customBgIcon.classList.contains('visible')) {
                    customBgIcon.classList.remove('visible');
                }
            }, 1000); // 增加延迟时间，使图标停留更久
        }
    });
    
    // 鼠标悬停在图标上时始终保持可见
    customBgIcon.addEventListener('mouseenter', () => {
        customBgIcon.classList.add('visible');
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
    });
    
    // 鼠标离开图标时，根据位置决定是否隐藏
    customBgIcon.addEventListener('mouseleave', () => {
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
                    customBgIcon.classList.remove('visible');
                }, 300);
            }
        }
    });

    // 点击图标打开弹窗
    customBgIcon.addEventListener('click', () => {
        customBgModal.classList.add('active');
        // 阻止事件冒泡，避免立即隐藏图标
        event.stopPropagation();
    });

    // 关闭弹窗函数，添加关闭动画 - 背景和内容动画同时开始
    function closeModalWithAnimation() {
        // 先添加closing类来触发关闭动画
        customBgModal.classList.add('closing');
        
        // 内容动画和背景动画现在同时开始
        // 内容动画持续0.35秒，背景模糊效果持续0.4秒
        // 500ms确保所有动画都能完整执行
        setTimeout(() => {
            customBgModal.classList.remove('active');
            // 移除closing类，以便下次打开时能正确触发动画
            setTimeout(() => {
                customBgModal.classList.remove('closing');
            }, 50);
        }, 500); // 匹配更新后的动画持续时间，确保所有动画完整执行
    }

    // 点击关闭按钮关闭弹窗
    closeBtn.addEventListener('click', () => {
        closeModalWithAnimation();
    });

    // 点击弹窗外部关闭弹窗
    customBgModal.addEventListener('click', (e) => {
        if (e.target === customBgModal) {
            closeModalWithAnimation();
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
                closeModalWithAnimation();
            }, 300);
        }
    });

    // 文件上传功能
    let uploadBtn = document.getElementById('uploadBtn');
    let bgImageUpload = document.getElementById('bgImageUpload');
    let fileName = document.getElementById('fileName');

    // 点击上传按钮触发文件选择
    uploadBtn.addEventListener('click', () => {
        bgImageUpload.click();
    });

    // 监听文件选择变化
    bgImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // 显示选中的文件名
            fileName.textContent = file.name;
            
            // 检查是否为图片或视频文件
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                // 检查文件大小（限制为50MB）
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    alert('文件大小不能超过50MB！请选择较小的文件。');
                    fileName.textContent = '';
                    return;
                }
                
                // 添加上传进度显示
                const progressContainer = document.createElement('div');
                progressContainer.className = 'upload-progress';
                progressContainer.innerHTML = '<div class="progress-bar"><div class="progress-fill"></div></div><span class="progress-text">0%</span>';
                
                // 找到文件上传头部后插入进度条
                const fileUploadHeader = document.querySelector('.file-upload-header');
                fileUploadHeader.parentNode.insertBefore(progressContainer, fileUploadHeader.nextSibling);
                
                const progressFill = progressContainer.querySelector('.progress-fill');
                const progressText = progressContainer.querySelector('.progress-text');
                
                const reader = new FileReader();
                
                // 上传进度事件
                reader.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        progressFill.style.width = percent + '%';
                        progressText.textContent = percent + '%';
                    }
                };
                
                // 文件读取完成后处理
                reader.onload = (event) => {
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
                        closeModalWithAnimation();
                    }, 300);
                };
                
                // 处理读取错误
                reader.onerror = () => {
                    alert('文件读取失败，请重试！');
                    if (progressContainer && progressContainer.parentNode) {
                        progressContainer.parentNode.removeChild(progressContainer);
                    }
                };
                
                // 以Data URL格式读取文件
                reader.readAsDataURL(file);
            } else {
                alert('请选择图片或视频文件！');
                fileName.textContent = '';
            }
        } else {
            fileName.textContent = '';
        }
    });

    // 选择预设背景图片
    presetImages.forEach(img => {
        img.addEventListener('click', () => {
            const bgUrl = img.getAttribute('data-url');
            bgImageUrlInput.value = bgUrl;
            setBackgroundImage(bgUrl);
            // 稍微延迟关闭，让用户看到选择成功的反馈
            setTimeout(() => {
                closeModalWithAnimation();
            }, 300);
        });
    });
    
    // 选择预设视频背景
    presetVideos.forEach(videoItem => {
        videoItem.addEventListener('click', () => {
            const videoUrl = videoItem.querySelector('.video-url').value;
            bgImageUrlInput.value = videoUrl;
            setBackgroundVideo(videoUrl);
            // 稍微延迟关闭，让用户看到选择成功的反馈
            setTimeout(() => {
                closeModalWithAnimation();
            }, 300);
        });
    });

    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && customBgModal.classList.contains('active')) {
            closeModalWithAnimation();
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
}

// 确保DOM加载完成后初始化自定义背景功能
document.addEventListener('DOMContentLoaded', initCustomBackground);

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

function fetchHitokoto() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://v1.hitokoto.cn/', true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      var response = JSON.parse(xhr.responseText);
      document.getElementById("hitokoto").innerText = response.hitokoto + " -- " + response.from;
    } else {
      console.error('Error fetching hitokoto:', xhr.status);
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

document.addEventListener("DOMContentLoaded", () => {
    // 获取时间并更新倒计时
    initCountdown();
    
    // 获取一言
    fetchHitokoto();
    setInterval(fetchHitokoto, 3600000);

    // 动态设置字体颜色
    if (!useDynamicColor) {
        setAutoColor();
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

    // 已在document双击事件中实现加油消息功能
  document.addEventListener('dblclick', function() {
      const currentExam = exams[currentExamIndex];
      const cheerMessage = document.getElementById('cheerMessage');
      const blurElements = document.querySelectorAll('.blur-target, .background-container');
      
      // 先应用模糊效果
      blurElements.forEach(el => el.classList.add('blur-background'));
      
      // 延迟0.5秒后显示加油消息
      setTimeout(() => {
          cheerMessage.textContent = `${currentExam.name}加油！！！！！ヾ(≧ ▽ ≦)ゝ`;
          cheerMessage.style.opacity = '1';
          
          // 2秒后恢复原状
          setTimeout(() => {
              cheerMessage.style.opacity = '0';
              blurElements.forEach(el => el.classList.remove('blur-background'));
          }, 2000);
      }, 500);
  });
});

// 添加点击波纹特效
document.addEventListener('click', function(e) {
  // 创建主波纹
  createRipple(e, 1);
  
  // 创建次级波纹，增加层次感
  setTimeout(() => {
    createRipple(e, 0.7, 0.2);
  }, 100);
});

function createRipple(e, scaleFactor, delay = 0) {
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
  ripple.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 70%, 0.4) 0%, hsla(${hue}, 100%, 70%, 0.1) 100%)`;
  document.body.appendChild(ripple);
  
  // 动画结束后移除元素
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
}