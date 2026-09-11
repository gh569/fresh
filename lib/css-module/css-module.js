/**
 * 零依赖 CSS Module 函数：支持多类名、哈希隔离、样式去重、动态变量
 * @param {TemplateStringsArray} template - CSS 模板字符串
 * @param  {...any} values - 动态变量（可选）
 * @returns {Object|null} 原始类名 → 哈希类名映射，错误时返回 null
 */
function cssModule(template, ...values) {
  // 存储已注入的 CSS 哈希，用于去重
  const injectedHashes = new Set();

  try {
    // 1. 拼接模板字符串（支持动态变量插值）
    const cssContent = template.reduce((acc, part, idx) => {
      return acc + part + (values[idx] || '');
    }, '');

    // 2. 生成 CSS 内容哈希（用于去重，基于 CRC32 简化算法）
    const contentHash = generateHash(cssContent).slice(0, 8);
    if (injectedHashes.has(contentHash)) {
      console.warn(`⚠️ CSS 已存在（哈希：${contentHash}），跳过重复注入`);
      return null;
    }

    // 3. 提取原始类名（匹配所有 .className 形式，包括伪类等复杂选择器）
    const classReg = /\.([a-zA-Z0-9_-]+)/g;
    const classNames = new Set();
    let match;
    while ((match = classReg.exec(cssContent)) !== null) {
      classNames.add(match[1]);
    }
    const classList = Array.from(classNames);
    if (classList.length === 0) {
      throw new Error('❌ 未提取到有效类名，请检查 CSS 格式（如 .className{...}）');
    }

    // 4. 生成原始类名 → 哈希类名映射（基于类名+内容哈希，确保唯一性）
    const classMap = {};
    classList.forEach(name => {
      const uniqueStr = `${name}-${contentHash}`;
      classMap[name] = `css-${generateHash(uniqueStr).slice(0, 6)}`;
    });

    // 5. 替换原始类名为哈希类名，生成最终 CSS
    let processedCss = cssContent;
    // 先替换最具体的类名（带伪类等的选择器）
    processedCss = processedCss.replace(
      /\.([a-zA-Z0-9_-]+)(:[a-zA-Z0-9_-]+)?(?=[\s,{])/g,
      (_, name, pseudo) => {
        if (classMap[name]) {
          return `.${classMap[name]}${pseudo || ''}`;
        }
        return _;
      }
    );
    
    // 再替换剩余的基本类名
    processedCss = processedCss.replace(
      /\.([a-zA-Z0-9_-]+)(?![a-zA-Z0-9:_-])/g,
      (_, name) => {
        if (classMap[name]) {
          return `.${classMap[name]}`;
        }
        return _;
      }
    );

    // 6. 注入 CSS 到页面（创建 style 标签，添加去重标识）
    injectCss(processedCss, contentHash);
    injectedHashes.add(contentHash);

    return classMap;
  } catch (error) {
    console.error('cssModule 执行失败：', error.message);
    return null;
  }

  /**
   * 辅助函数：生成字符串哈希（简化 CRC32 算法，确保唯一性）
   * @param {string} str - 输入字符串
   * @returns {string} 16 进制哈希值
   */
  function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // 转为 32 位整数
    }
    return (hash >>> 0).toString(16); // 转为无符号 16 进制
  }

  /**
   * 辅助函数：注入 CSS 到页面 head
   * @param {string} css - 处理后的 CSS 内容
   * @param {string} hash - CSS 内容哈希（用于标识）
   */
  function injectCss(css, hash) {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = css;
    styleElement.setAttribute('data-css-module', hash); // 添加唯一标识
    document.head.appendChild(styleElement);
  }
}
export default cssModule;