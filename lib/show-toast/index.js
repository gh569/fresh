function showToast(message, duration = 1500) {
	// 样式管理 (单例模式)
	if (!document.querySelector('style[data-toast-css]')) {
		const style = document.createElement('style');
		style.setAttribute('data-toast-css', '');
		style.textContent = `
      [data-toast] {
        position: fixed;
        z-index: 9999;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px 20px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        border-radius: 8px;
        text-align: center;
        min-width: 80px;
        max-width: 80vw;
        opacity: 0;
        pointer-events: none;
        font-family: system-ui, sans-serif;
        will-change: opacity;
      }
    `;
		document.head.appendChild(style);
	}

	// 清理已有 toast
	const existing = document.querySelector('[data-toast]');
	if (existing) existing.remove();

	// 创建容器
	const toast = document.createElement('div');
	toast.setAttribute('data-toast', '');
	toast.textContent = message;
	document.body.appendChild(toast);

	// 动画控制器
	let currentAnimations = [];

	// 淡入动画
	const fadeIn = toast.animate(
		[{ opacity: 0 }, { opacity: 0.9 }], { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
	);
	currentAnimations.push(fadeIn);

	// 自动关闭逻辑
	fadeIn.finished
		.then(() => {
			// 等待 duration
			const delay = toast.animate([], { duration });
			currentAnimations.push(delay);
			return delay.finished;
		})
		.then(() => {
			// 淡出动画
			const fadeOut = toast.animate(
				[{ opacity: 0.9 }, { opacity: 0 }], { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
			);
			currentAnimations.push(fadeOut);
			return fadeOut.finished;
		})
		.then(() => toast.remove())
		.catch(() => {}); // 防止取消动画报错

	// 返回手动关闭方法
	return () => {
		currentAnimations.forEach(anim => anim.cancel());
		toast.remove();
	};
}

export { showToast, showToast as default };