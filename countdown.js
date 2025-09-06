import { exams, currentExamIndex, useLocalTime } from './main.js';

// 自动选择最近的一次大考
export function selectNearestExam() {
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

export function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 更新倒计时
export function updateCountdown(time) {
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

// 获取服务器时间
export function fetchServerTime() {
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

// 初始化倒计时
export function initCountdown() {
  if (useLocalTime) {
    updateCountdown(new Date());
    setInterval(() => updateCountdown(new Date()), 1000);
  } else {
    fetchServerTime();
    setInterval(fetchServerTime, 1000);
  }
}