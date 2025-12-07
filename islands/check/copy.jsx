import checkStore from './check-store.js'
import { useSignal } from '@preact/signals'
import { useRef, useEffect } from 'preact/hooks'
import copyToClipboard from './copyToClipboard.js'

// 中文数字映射扩展到20
const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']

export default function Copy() {
	const data = useSignal(checkStore.getSelectedItems() || [])
	const copyButtonRef = useRef(null)
	const editableContent = useSignal('')
	
	// 生成格式化内容
	const generateContent = () => {
		if (data.value.length === 0) return ''
		
		// 按空间分组数据
		const groupedData = data.value.reduce((acc, item) => {
			const space = item.空间
			if (!acc[space]) {
				acc[space] = []
			}
			acc[space].push(item)
			return acc
		}, {})

		// 获取排序后的空间列表，按照checkStore中selectedHeader的顺序，并过滤掉不在selectedHeader中的空间
		const selectedHeader = checkStore.getHeaderList()
		const spaces = selectedHeader.filter(space => groupedData[space])
		
		// 生成内容文本
		let contentText = ''
		spaces.forEach((space, spaceIndex) => {
			const items = groupedData[space]
			if (items.length === 1) {
				// 只有一个子项的情况
				contentText += `${chineseNumbers[spaceIndex] || spaceIndex + 1}、${items[0].空间} ${items[0].项目}: ${items[0].说明}\n`
			} else {
				// 多个子项的情况
				contentText += `${chineseNumbers[spaceIndex] || spaceIndex + 1}、${space}\n`
				items.forEach((item, itemIndex) => {
					contentText += `  ${itemIndex + 1}. ${item.项目}: ${item.说明}\n`
				})
			}
			// 每个大类之间留空行
			contentText += '\n'
		})
		
		return contentText
	}
	
	// 初始化可编辑内容
	useEffect(() => {
		if (data.value.length > 0) {
			const summary = checkStore.getGeneralSummary() || ''
			editableContent.value = summary ? `${summary}\n\n${generateContent()}` : generateContent()
		}
	}, [data.value])

	// 复制功能
	const handleCopy = async () => {
		try {
			const textToCopy = editableContent.value
			await copyToClipboard(textToCopy)
			
			// 显示复制成功反馈
			const button = copyButtonRef.current
			if (button) {
				button.textContent = '✅'
				button.classList.add('success')
				
				// 2秒后恢复按钮原始状态并返回
				setTimeout(() => {
					button.textContent = '📋'
					button.classList.remove('success')
					checkStore.clearLocalStorage()
					checkStore.initializeData()
					// 将route('/check')改为history.back()
					window.location.href='/'
				}, 2000)
			}
		} catch (error) {
			console.error('复制失败:', error)
			alert('复制失败，请手动选择文本复制')
		}
	}

	// 处理文本内容变化
	const handleContentChange = (e) => {
		editableContent.value = e.target.value
	}
	
	// 检查是否有数据
	const hasData = () => {
		return data.value.length > 0
	}

	// 如果没有数据，显示提示信息
	if (!hasData()) {
		return (
			<div className="mainContent">
				<div className="emptyContainer">
					<h3>暂无数据</h3>
					<p>没有找到要复制的内容</p>
				</div>
			</div>
		)
	}

	return (
		<div>
			{/* 浮动按钮 - 固定在屏幕右上方 */}
			<div className="singleButtonGroup">
				<button 
					ref={copyButtonRef}
					onClick={handleCopy}
					className="floatingButton"
					title="复制到剪贴板"
				>
					📋
				</button>
			</div>
			
			{/* 主要内容 */}
			<div className="mainContent">
				<div className="container">
					<h2 className="title">📋 复制内容</h2>
					
					<textarea
						value={editableContent.value}
						onInput={handleContentChange}
						className="editableTextarea"
						placeholder="在此编辑要复制的内容..."
					/>
				</div>
			</div>
		</div>
	)
}