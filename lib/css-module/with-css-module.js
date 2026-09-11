import { h, cloneElement } from 'preact';

// 替换 import { isVNode } from 'preact/compat';
const isVNode = (vnode) => typeof vnode === 'object' && vnode !== null && 'type' in vnode && 'props' in vnode;

/**
 * Preact高阶组件：自动处理CSS Modules类名映射
 * 
 * 应用示例：
 * ```
 * // 定义样式文件 button.module.css
 * .container {
 *   padding: 16px 24px;
 *   background: #42b983;
 *   color: #fff;
 *   border-radius: 8px;
 * }
 * 
 * .text {
 *   font-size: 14px;
 *   color: red;
 * }
 * 
 * // 在组件中使用
 * import styles from './button.module.css';
 * import withCssModule from './with-css-module';
 * 
 * function App() {
 *   return (
 *     <div className="container">
 *       <div className="text">Hello World</div>
 *     </div>
 *   );
 * }
 * 
 * // 使用 withCssModule 包装组件
 * export default withCssModule(App, styles);
 * 
 * // 组件将被渲染为：
 * // <div class="button_container__abc123">
 * //   <div class="button_text__def456">Hello World</div>
 * // </div>
 * ```
 * 
 * @param {Preact.Component/Function} Component - 待处理的Preact组件
 * @param {Object} styles - CSS Modules导入对象（import styles from './xxx.module.css'）
 * @returns {Preact.Component} 处理后的组件，支持className="xxx"直接使用
 */
function withCssModule(Component, styles) {
  // 类名转换核心：字符串类名 → CSS Modules哈希类名
  const transformClassName = (className) => {
    if (!className) return '';
    return className
      .split(/\s+/)
      .filter(cls => cls)
      .map(cls => {
        // 短横线转驼峰（适配CSS user-avatar → styles.userAvatar）
        // const camelCls = cls.replace(/-(\w)/g, (_, c) => c.toUpperCase());
        // 优先使用模块化类名（局部隔离），无则保留原始类名（兼容全局）
        return styles[cls] || cls;
      })
      .join(' ');
  };

  // 处理虚拟节点及其子节点的className
  const processVNode = (vnode, deep = false) => {
    if (!vnode || !isVNode(vnode)) return vnode;

    // 只处理原生 DOM 元素（type 为字符串）
    if (typeof vnode.type === 'string') {
      const { className, children, ...restProps } = vnode.props || {};
      const processedClassName = transformClassName(className);

      // 递归处理子节点
      let processedChildren = children;
      if (children) {
        if (Array.isArray(children)) {
          processedChildren = children.map(child => processVNode(child));
        } else {
          processedChildren = processVNode(children);
        }
      }

      // 克隆节点并替换处理后的 className
      return cloneElement(vnode, {
        ...restProps,
        className: processedClassName,
      }, processedChildren);
    }
    
    // 对于自定义组件，如果deep为true，则尝试渲染它并处理其返回的虚拟DOM
    if (typeof vnode.type === 'function' && deep) {
      // 如果是函数组件，调用它获取虚拟DOM
      try {
        const result = vnode.type(vnode.props);
        return processVNode(result);
      } catch (e) {
        console.warn('Error processing functional component:', e);
        return vnode;
      }
    }

    // 对于其他类型的节点（如类组件、Portal等），直接返回
    return vnode;
  };

  // 包裹后的组件
  function WrappedComponent(props) {
    try {
      // 渲染原始组件得到虚拟节点
      const originalVNode = h(Component, props);
      // 处理所有节点的className
      return processVNode(originalVNode, true);
    } catch (error) {
      console.error('Error rendering component with CSS modules:', error);
      // 出错时返回原始组件以保证基本功能
      return h(Component, props);
    }
  }

  // 保留原始组件的静态属性和显示名称
  WrappedComponent.displayName = `withCssModule(${Component.displayName || Component.name || 'Component'})`;
  
  // 安全地复制组件属性，避免覆盖 WrappedComponent 上已有的属性
  Object.keys(Component).forEach(key => {
    if (!(key in WrappedComponent)) {
      WrappedComponent[key] = Component[key];
    }
  });

  return WrappedComponent;
}

export default withCssModule;
export { withCssModule };