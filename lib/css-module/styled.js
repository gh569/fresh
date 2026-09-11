/*  version = v2.8 */

import { h, cloneElement } from 'preact'

/**
 * @param {string} arr 样式字符串
 * @param {string} value 样式变量
 * @returns {function} 组件函数
 * @example
 * const MyComponent = styled`.div { color: red; }`;
 * <MyComponent>Styled Component</MyComponent>
 */
function styled(arr, ...value) {
	return _styled(arr, value)
}

// 返回样式名称
function generateUniqueString() {
	const randomNum = Math.floor(Math.random() * 10000);
	const randomNum2 = Math.floor(Math.random() * 10000);
	return 'css_' + randomNum.toString(36) + randomNum2.toString(36);
}

// 将css内容添加到文档中
function addStyleToDocument(css) {
	const _id = 'style_preact'
	let style = document.getElementById(_id) || createStyle(_id)
	style.appendChild(document.createTextNode(css));
}

// 在文档中创建样式标签
function createStyle(_id) {
	var style = document.createElement('style');
	style.type = 'text/css';
	style.id = _id
	document.head.appendChild(style);
	return style
}

// 通过递归添加类名到所有子元素中
function addClassToChildren(children, attr) {
	if ((typeof children !== 'object') || (children === null)) return children
	if (Array.isArray(children)) {
		return children.map(child => addClassToChildren(child, attr))
	}
	if (typeof children === 'object') {
		if (typeof children.props.children == 'object' && children.props.children !== null) {
			children.props.children = addClassToChildren(children.props.children, attr)
		}
		return cloneElement(children, {	[attr]: '' })
	}
}

// 创建样式函数
function _styled(arr, value, com) {
	let css = arr[0]
	for (let i = 0; i < value.length; i++) {
		css += value[i] + arr[i + 1]
	}
	let cssKey = generateUniqueString()
	let newCss = css.replace(/[&]?[ |\t|\n|\r]*\{/g, v =>
		(/&/).test(v) ? v.replace(/&/, '.' + cssKey) : ('[' + cssKey + ']' + v)
	)
	addStyleToDocument(newCss)
	const res = (props) => h('div', { className: com ? (cssKey + ' ' + com.className) : cssKey }, addClassToChildren(props
		.children, cssKey))
	res.className = cssKey
	return res
}

// 创建全局样式 
styled.createGlobal = function(arr, ...value) {
	let css = arr[0]
	for (let i = 0; i < value.length; i++) {
		css += value[i] + arr[i + 1]
	}
	addStyleToDocument(css)
}

// 样式继承
styled.extend = function(com) {
	return (arr, ...value) => _styled(arr, value, com)
}

export { styled, styled as default }