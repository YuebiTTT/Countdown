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
    { name: "高考", year: 2026, month: 5, day: 7 },
    { name: "调研考", year: 2025, month: 7, day: 21 }
];
let currentExamIndex = 0;

function updateCountdown(time) {
    var today = time || new Date();
    // 获取当前选中的考试配置
    const currentExam = exams[currentExamIndex];
    var currentYear = currentExam.year || today.getFullYear(); // 使用考试配置中的年份或当前年份
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

    // 考试类型切换点击事件
    document.getElementById("examType").addEventListener("click", () => {
        currentExamIndex = (currentExamIndex + 1) % exams.length;
        updateCountdown(new Date());
    });

    // 双击背景弹出加油模态框
    document.querySelector('.overlay').addEventListener('dblclick', function() {
        const modal = document.getElementById('cheerModal');
        modal.classList.add('active');
        // 3秒后自动关闭
        setTimeout(() => {
            modal.classList.remove('active');
        }, 3000);
    });
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