import { h, render } from 'preact';

class Dialog {
  constructor() {
    this._container = null;
    this._isVisible = false;
    this._handlePopState = this._handlePopState.bind(this);
  }

  /**
   * 获取或创建容器 DOM
   * @private
   */
  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      
      // 简化样式：全屏固定定位，默认隐藏
      // 背景色设为 #fff (白色) 以覆盖底层内容，如果希望完全透明可改为 'transparent'
      Object.assign(this._container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#fff', // 全屏白色背景，无遮罩感
        zIndex: '9999',
        display: 'none',
        overflow: 'auto', // 允许内容滚动
      });
      
      document.body.appendChild(this._container);
    }
    return this._container;
  }

  /**
   * 处理浏览器返回按钮事件
   * @private
   */
  _handlePopState() {
    if (this._isVisible) {
      this.close();
    }
  }

  /**
   * 显示对话框
   * @param {import('preact').VNode} content - 要显示的 JSX 内容
   * @public
   */
  show(content) {
    if (this._isVisible) return;

    this._isVisible = true;
    const container = this._getContainer();

    // 1. 推入历史状态
    history.pushState({ dialog: true }, '', null);
    
    // 2. 添加监听
    window.addEventListener('popstate', this._handlePopState);

    // 3. 直接渲染内容到容器
    // 因为容器已经是全屏白色背景，直接渲染内容即可布满平面
    render(content, container);

    // 4. 显示
    container.style.display = 'block';
  }

  /**
   * 关闭对话框
   * @public
   */
  close() {
    if (!this._isVisible || !this._container) return;

    this._isVisible = false;
    const container = this._container;

    // 1. 移除监听
    window.removeEventListener('popstate', this._handlePopState);

    // 2. 清空内容
    render(null, container);

    // 3. 隐藏
    container.style.display = 'none';

    // 4. 回退历史
    if (history.state && history.state.dialog) {
      history.back();
    }
  }
}

export const dialog = new Dialog();
export default dialog;