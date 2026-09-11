import { useMemo } from 'preact/hooks';
import { cloneElement } from 'preact';

// 替换 import { isVNode } from 'preact/compat';
const isVNode = (vnode) => typeof vnode === 'object' && vnode !== null && 'type' in vnode && 'props' in vnode;


/**
 * Preact Hook：处理CSS Modules类名映射
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
 * import { useCssModule } from './use-css-module';
 * 
 * function App() {
 *   const processVNode = useCssModule(styles);
 *   
 *   return processVNode(
 *     <div className="container">
 *       <div className="text">Hello World</div>
 *     </div>
 *   );
 * }
 * 
 * // 或者更简洁的写法：
 * function App() {
 *   const processVNode = useCssModule(styles);
 *   const element = (
 *     <div className="container">
 *       <div className="text">Hello World</div>
 *     </div>
 *   );
 *   return processVNode(element);
 * }
 * 
 * // 组件将被渲染为：
 * // <div class="button_container__abc123">
 * //   <div class="button_text__def456">Hello World</div>
 * // </div>
 * ```
 * 
 * @param {Object} styles - CSS Modules导入对象（import styles from './xxx.module.css'）
 * @returns {Function} processVNode - 处理虚拟节点的函数，传入JSX即可自动映射className
 */
export function useCssModule(styles) {
  // 缓存类名转换逻辑，避免重复计算
  const transformClassName = useMemo(() => {
    return (className) => {
      if (!className) return '';
      return className
        .split(/\s+/)
        .filter(cls => cls)
        .map(cls => {
          // 短横线转驼峰，适配CSS类名
          const camelCls = cls.replace(/-(\w)/g, (_, c) => c.toUpperCase());
          // 映射到CSS Modules哈希类名，无则保留原始类名
          return styles[camelCls] || cls;
        })
        .join(' ');
    };
  }, [styles]);

  // 递归处理虚拟节点及子节点的className
  const processVNode = useMemo(() => {
    const handleVNode = (vnode) => {
      if (!vnode || !isVNode(vnode)) return vnode;

      // 只处理 DOM 元素（字符串类型的 type），避免处理自定义组件
      if (typeof vnode.type !== 'string') {
        // 对于自定义组件，我们只处理根节点，不递归处理其子节点
        return vnode;
      }

      // 处理当前节点className
      const { className, children, ...restProps } = vnode.props;
      const processedClassName = transformClassName(className);

      // 递归处理子节点
      const processedChildren = Array.isArray(children)
        ? children.map(child => handleVNode(child))
        : handleVNode(children);

      // 克隆节点并替换属性
      return cloneElement(vnode, {
        ...restProps,
        className: processedClassName,
      }, processedChildren);
    };
    return handleVNode;
  }, [transformClassName]);

  return processVNode;
}

export default useCssModule;