import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

/**
 * 高阶组件，为组件添加样式作用域
 * @param {Function} Component - 要包装的组件
 * @returns {Function} - 包装后的组件
 */
function withScopedStyles(Component) {
  return function StyledComponent(props) {
    const state = useScopedStylesState();
    
    // 组件卸载时移除样式元素
    useStyleCleanup(state.current.styleElement);

    const processVNode = useCallback((node) => {
      if (!node?.type) return node;

      if (node.type === "style" && node.props?.children) {
        state.current.styleContent = node.props.children;
        return null;
      }
      
      if (node.type.toString().includes("JSXStyle")) {
        state.current.hasStyledJSX = true;
        return null;
      }

      return processNodeWithClass(node, state.current.uniqueClass, processVNode);
    }, [state]);

    const vnode = Component(props);
    
    useInjectStyles(state);
    
    if (state.current.hasStyledJSX) return h(Component, props);
    
    return processVNode(vnode);
  };
}

// 提取状态管理
function useScopedStylesState() {
  return useRef({
    styleContent: "",
    styleElement: null,
    hasStyledJSX: false,
    uniqueClass: generateUniqueId(),
    isTransitioning: false
  });
}

// 提取清理逻辑
function useStyleCleanup(styleElement) {
  useEffect(() => () => {
    styleElement?.parentNode?.removeChild(styleElement);
  }, [styleElement]);
}

// 提取样式注入逻辑
function useInjectStyles(state) {
  useEffect(() => {
    if (state.current.styleContent && !state.current.isTransitioning) {
      const processedStyles = processStyles(state.current.styleContent, state.current.uniqueClass);
      state.current.styleElement = injectStyles(processedStyles);
      state.current.isTransitioning = true;
    }
  }, [state]);
}

// 优化节点处理
function processNodeWithClass(node, uniqueClass, processVNode) {
  const newProps = { ...node.props };
  
  // 给根元素添加唯一类名
  newProps.className = newProps.className 
    ? `${newProps.className} ${uniqueClass}`
    : uniqueClass;
    
  if (newProps.children) {
    newProps.children = Array.isArray(newProps.children) 
      ? newProps.children.map(processVNode)
      : processVNode(newProps.children);
  }

  return h(node.type, newProps, newProps.children);
}

// 优化唯一ID生成
function generateUniqueId() {
  return `scoped-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// 优化样式处理
function processStyles(content, uniqueClass) {
  if (typeof document === "undefined" || !content) return "";
  
  return content.replace(/([^{]+)(\{[^}]*\})/g, (match, selectors, rules) => {
    const processedSelectors = selectors.split(',').map(selector => {
      const trimmed = selector.trim();
      return trimmed.startsWith(':') 
        ? `${trimmed}.${uniqueClass}`
        : `${trimmed}.${uniqueClass}`;
    }).join(', ');
    
    return `${processedSelectors}${rules}`;
  });
}

// 简化样式注入
function injectStyles(content) {
  if (typeof document === "undefined") return null;
  
  const styleElement = document.createElement("style");
  styleElement.textContent = content;
  document.head.appendChild(styleElement);
  return styleElement;
}

export default withScopedStyles;