/**
 * 将文本中的 URL 转换为 HTML 链接
 * @param {string} text - 需要处理的文本
 * @returns {string} - 处理后的文本，其中的 URL 已转换为 HTML 链接
 */
export default function urlsToLinks(text) {
  // 若输入不是字符串，直接返回空字符串
  if (typeof text !== "string") return "";

  // 匹配常见的 URL 格式（协议开头或 www 开头的域名）
  const urlRegex =
    /(https?:\/\/[^\s/$.?#].[^\s]*|ftp:\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*)/gi;

  return text.replace(urlRegex, (url) => {
    // 处理以 www 开头的 URL 自动添加协议
    const href = url.startsWith("www") ? `http://${url}` : url;
    return `<a href="${href}" target="_blank">${url}</a>`;
  });
}
