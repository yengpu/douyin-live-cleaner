// content.js - 抖音直播终极净化版（文字识别+全屏防扰）

console.log("抖音直播净化助手 - 视觉识别模式已加载");

// --- 状态记录变量 ---
let wasFullScreen = false;     // 上一次检查时是否全屏
let fullScreenStartTime = 0;   // 进入全屏的时间点

// --- 强力点击函数 ---
// 模拟鼠标的完整按下动作，比单纯的 click() 更能骗过防脚本机制
function forceClick(element) {
    if (!element) return;
    const eventOpts = { bubbles: true, cancelable: true, view: window };
    element.dispatchEvent(new MouseEvent('mousedown', eventOpts));
    element.dispatchEvent(new MouseEvent('mouseup', eventOpts));
    element.dispatchEvent(new MouseEvent('click', eventOpts));
}

// --- 核心清理逻辑 ---
function autoCleaner() {
    
    // ============================================================
    // 功能 1：全屏侧边栏（只在刚进入全屏的前 3 秒自动收起）
    // ============================================================
    
    // 1. 判断当前是否全屏
    const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    
    // 2. 如果之前不是全屏，现在是全屏 -> 说明刚刚进入全屏
    if (isFullScreen && !wasFullScreen) {
        fullScreenStartTime = Date.now();
        console.log("检测到进入全屏，启动侧边栏自动收起...");
    }
    
    // 更新状态供下一次对比
    wasFullScreen = isFullScreen;

    // 3. 执行收起逻辑（仅限进入全屏后的 3000 毫秒内）
    if (isFullScreen && (Date.now() - fullScreenStartTime < 3000)) {
        // 查找“收起”按钮。
        // 策略：找 .chatroom_close 类，或者 title 为“收起”的元素
        const sidebarCloseBtn = document.querySelector('.chatroom_close, [title="收起"]');
        if (sidebarCloseBtn) {
            console.log("自动收起侧边栏");
            forceClick(sidebarCloseBtn);
        }
    }

    // ============================================================
    // 功能 2：送礼/点亮/集星弹窗（基于文字识别的必杀技）
    // ============================================================
    
    // 1. 找到页面上所有的“提示框”容器
    // 根据你的截图，所有的弹窗都有 dylive-tooltip 这个类名，这很稳定
    const tooltips = document.querySelectorAll('.dylive-tooltip');
    
    tooltips.forEach(tip => {
        // 2. 检查这个提示框里的文字内容
        const text = tip.innerText || "";
        
        // 关键词库：只要弹窗包含这些字，就视为广告弹窗
        // 根据你的截图，增加了“集星”、“展馆”
        if (text.includes("点亮") || text.includes("送礼") || text.includes("集星") || text.includes("展馆")) {
            
            // 3. 找到里面的关闭按钮 (SVG)
            const closeBtn = tip.querySelector('svg');
            
            if (closeBtn) {
                // 确保它是可见的才处理
                const rect = closeBtn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    // console.log("发现广告弹窗，关键词匹配成功，正在移除...");
                    
                    // 手段 A: 模拟点击
                    forceClick(closeBtn);
                    
                    // 手段 B (双重保险): 如果点击没反应，直接把整个弹窗隐藏掉
                    // 这是“毁灭性打击”，不管能不能点，直接让它消失
                    tip.style.display = 'none'; 
                    tip.style.visibility = 'hidden';
                }
            }
        }
    });
}

// --- 启动定时器 ---
// 每 0.5 秒检查一次，既不卡顿也能迅速反应
setInterval(autoCleaner, 500);