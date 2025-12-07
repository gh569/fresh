import { useSignal, useSignalEffect } from '@preact/signals'
import checkStore from './check-store.js'
export default function Check() {
	const checkData = useSignal(checkStore.getData())
	const activeTab = useSignal('')
	const showHeader = useSignal(true)
	const editingItem = useSignal(null)
	const editedName = useSignal('')
	const showAddSpaceModal = useSignal(false) // 控制添加空间弹窗
	const newSpaceName = useSignal('') // 新空间名称
	const selectedOriginalSpaces = useSignal([]) // 选中的原始空间

	// 初始化激活的选项卡
	useSignalEffect(() => {
		if (!activeTab.value && checkData.value.header.length > 0) {
			const firstChecked = checkData.value.header.find(item => item.checked)
			activeTab.value = firstChecked ? firstChecked.title : ''
		}
	})

	// 订阅数据变化
	useSignalEffect(() => {
		const unsubscribe = checkStore.subscribe(() => {
			const previousEditingItem = editingItem.value
			const previousEditedName = editedName.value

			checkData.value = checkStore.getData()

			// 保持编辑状态
			if (previousEditingItem) {
				// 在新数据中找到对应的项目
				const newEditingItem = checkData.value.data.find(
					item => item.空间 === previousEditingItem.空间 &&
						item.项目 === previousEditingItem.项目
				)
				if (newEditingItem) {
					editingItem.value = newEditingItem
					editedName.value = previousEditedName
				}
			}

			// 如果当前激活的选项卡被取消选中，则切换到第一个选中的选项卡
			if (activeTab.value) {
				const isActiveTabChecked = checkData.value.header.some(
					header => header.title === activeTab.value && header.checked
				)
				if (!isActiveTabChecked) {
					const firstChecked = checkData.value.header.find(item => item.checked)
					activeTab.value = firstChecked ? firstChecked.title : ''
				}
			}
		})

		return unsubscribe
	})

	// 复制选中项到控制台
	function copy() {
		const selectedItems = checkStore.getData().data.filter(item => item.checked)
		checkStore.setSelectedItems(selectedItems)
		checkStore.saveSelectionToLocalStorage()
		window.location.href = '/copy'
	}

	// 切换表头选中状态
	const toggleHeader = (index) => {
		checkStore.toggleHeaderChecked(index)
	}

	// 切换单项选中状态
	const toggleItem = (item) => {
		const wasChecked = item.checked
		checkStore.toggleItemChecked(item)
		// 如果项目从选中变为未选中，并且正在编辑该项目，则取消编辑状态
		if (wasChecked && !item.checked && editingItem.value === item) {
			cancelEdit()
		}
	}

	// 更新项目说明
	const updateDescription = (item, value) => {
		checkStore.updateItemDescription(item, value)
	}

	// 切换选项卡
	const switchTab = (tabTitle) => {
		activeTab.value = tabTitle
	}

	// 切换header区域显示/隐藏
	const toggleHeaderVisibility = () => {
		showHeader.value = !showHeader.value
	}

	// 开始编辑项目名称
	const startEditProjectName = (item) => {
		editingItem.value = item
		editedName.value = item['项目']
	}

	// 保存编辑的项目名称
	const saveEditedName = (item) => {
		checkStore.updateItemName(item, editedName.value)
		editingItem.value = null
	}

	// 取消编辑
	const cancelEdit = () => {
		editingItem.value = null
	}

	// 处理键盘事件
	const handleKeyDown = (e, item) => {
		if (e.key === 'Enter') {
			saveEditedName(item)
		} else if (e.key === 'Escape') {
			cancelEdit()
		}
	}

	// 新增项目
	const addNewProject = (space) => {
		const projectName = prompt('请输入项目名称:')
		if (projectName !== null && projectName.trim() !== '') {
			// 先添加新项目
			checkStore.addNewItem(space, projectName)
			
			// 等待状态更新后再选中该项目
			setTimeout(() => {
				// 查找刚刚添加的项目并选中它
				const newItem = checkStore.getData().data.find(
					item => item.空间 === space && item.项目 === projectName.trim()
				)
				
				if (newItem) {
					// 选中该项目
					checkStore.toggleItemChecked(newItem)
				}
			}, 0)
		}
	}

	// 获取当前选项卡的数据
	const getCurrentTabData = (headerTitle) => {
		return checkStore.getDataBySpace(headerTitle)
	}

	// 获取选中的header项，按选择顺序排列
	const getCheckedHeaders = () => {
		const checkedHeaders = checkStore.getCheckedHeaders()
		const headerList = checkStore.getHeaderList()

		// 按照选择顺序对选中的header进行排序
		return checkedHeaders.sort((a, b) => {
			const indexA = headerList.indexOf(a.title)
			const indexB = headerList.indexOf(b.title)

			// 如果某个元素不在headerList中，将其放在最后
			if (indexA === -1) return 1
			if (indexB === -1) return -1

			return indexA - indexB
		})
	}

	// 计算选中项数量
	const getSelectedCount = () => {
		return checkStore.getSelectedCount()
	}

	// 显示添加空间弹窗
	const showAddSpace = () => {
		showAddSpaceModal.value = true
		newSpaceName.value = ''
		selectedOriginalSpaces.value = []
	}

	// 隐藏添加空间弹窗
	const hideAddSpace = () => {
		showAddSpaceModal.value = false
	}

	// 创建自定义空间
const createCustomSpace = () => {
  if (!newSpaceName.value.trim()) {
    alert('请输入空间名称')
    return
  }

  if (selectedOriginalSpaces.value.length === 0) {
    alert('请选择至少一个原始空间')
    return
  }

  // 创建一个新的header项来表示自定义空间（默认为多选）
  const newHeaderItem = {
    title: newSpaceName.value,
    checked: true,
    isCustom: true,
    selectionType: 'multiple', // 固定为多选
    originalSpaces: [...selectedOriginalSpaces.value]
  };

  // 尝试添加自定义空间
  const success = checkStore.addCustomSpace(newHeaderItem);
  
  if (success) {
    // 只有添加成功时才隐藏弹窗
    hideAddSpace()
  }
  // 如果添加失败（名称重复），弹窗保持打开状态，让用户重新输入名称
}

	// 切换原始空间选择
	const toggleOriginalSpaceSelection = (spaceTitle) => {
		// 多选模式，切换选择状态
		const isSelected = selectedOriginalSpaces.value.includes(spaceTitle)
		if (isSelected) {
			selectedOriginalSpaces.value = selectedOriginalSpaces.value.filter(title => title !== spaceTitle)
		} else {
			selectedOriginalSpaces.value = [...selectedOriginalSpaces.value, spaceTitle]
		}
	}

	return (
		<div className="container">
			{/* Header区域控制按钮 */}
			<button
				onClick={toggleHeaderVisibility}
				className="headerToggle"
			>
				<span>{showHeader.value ? '筛选条件' : '筛选条件'}</span>
				<span>{showHeader.value ? '▲ 收起' : '▼ 展开'}</span>
			</button>

			{/* 表头选择区域 - 可展开/隐藏 */}
			{showHeader.value && (
				<div className="headerSection">
					<div className="headerSectionHeader">
						<h3 className="sectionTitle">选择空间</h3>
						<button 
							onClick={showAddSpace}
							className="addButton"
						>
							+ 增加空间
						</button>
					</div>
					<div className="headerGrid">
						{checkData.value.header.map((headerItem, index) => (
							<label
								key={headerItem.title}
								className={`checkboxLabel ${headerItem.isCustom ? 'customSpace' : ''}`}
							>
								<input
									type="checkbox"
									checked={headerItem.checked}
									onChange={() => toggleHeader(index)}
									className="checkboxInput"
								/>
								<span className="spaceName">{headerItem.title}</span>
								{headerItem.isCustom && (
									<span className="customTag">自定义</span>
								)}
							</label>
						))}
					</div>

					{/* 总体总结区域 - 放在选择空间框架内 */}
					<div className="generalSummaryContainer">
						<h3 className="sectionTitle">总体总结</h3>
						<textarea
							value={checkStore.getGeneralSummary()}
							onInput={(e) => checkStore.setGeneralSummary(e.target.value)}
							placeholder="请输入总体总结..."
							className="generalSummaryInput"
						/>
					</div>
				</div>
			)}

			{/* 添加空间弹窗 */}
			{showAddSpaceModal.value && (
				<div className="modalOverlay">
					<div className="modalContent">
						<div className="modalHeader">
							<h3>创建自定义空间</h3>
							<button className="closeButton" onClick={hideAddSpace}>×</button>
						</div>
						
						<div className="formGroup">
							<label className="formLabel">空间名称:</label>
							<input
								type="text"
								value={newSpaceName.value}
								onInput={(e) => newSpaceName.value = e.target.value}
								placeholder="请输入自定义空间名称"
								className="inputField"
							/>
						</div>

						<div className="formGroup">
							<label className="formLabel">选择原始空间:</label>
							<p className="helpText">可多选，自定义空间将包含所选空间的所有项目</p>
							<div className="originalSpacesGrid">
								{checkData.value.header
								  .filter(headerItem => !headerItem.isCustom) // 过滤掉自定义空间，避免循环引用
								  .map((headerItem) => (
									<label 
										key={headerItem.title}
										className={`originalSpaceLabel ${
											selectedOriginalSpaces.value.includes(headerItem.title) 
												? 'selected' 
												: ''
										}`}
									>
										<input
											type="checkbox"
											checked={selectedOriginalSpaces.value.includes(headerItem.title)}
											onChange={() => toggleOriginalSpaceSelection(headerItem.title)}
											className="hiddenCheckbox"
										/>
										<span className="spaceItem">{headerItem.title}</span>
									</label>
								))}
							</div>
						</div>

						<div className="modalActions">
							<button onClick={createCustomSpace} className="primaryButton">
								确认创建
							</button>
							<button onClick={hideAddSpace} className="secondaryButton">
								取消
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 选项卡导航 - 固定在顶部 */}
			<div className="stickyContainer">
				{getCheckedHeaders().length > 0 && (
					<div className="tabContainer">
						{getCheckedHeaders().map(headerItem => (
							<button
								key={headerItem.title}
								onClick={() => switchTab(headerItem.title)}
								className={`tabButton ${activeTab.value === headerItem.title ? 'activeTab' : ''}`}
							>
								{headerItem.title}
							</button>
						))}
					</div>
				)}
			</div>

			{/* 主体内容区域 - 选项卡形式 */}
			<div>
				{getCheckedHeaders().map(headerItem => (
					<div
						key={headerItem.title}
						style={{ display: activeTab.value === headerItem.title ? 'block' : 'none' }}
					>
						<div className="contentSection">
							<div>
								{getCurrentTabData(headerItem.title).map((dataItem) => (
									<div
										key={`${dataItem['空间']}-${dataItem['项目']}`}
										className="itemContainer"
									>
										<label className="itemLabel">
											<input
												type="checkbox"
												checked={dataItem.checked}
												onChange={() => toggleItem(dataItem)}
												className="checkboxInput"
											/>
											{editingItem.value === dataItem ? (
												<input
													type="text"
													value={editedName.value}
													onInput={(e) => editedName.value = e.target.value}
													onBlur={() => saveEditedName(dataItem)}
													onKeyDown={(e) => handleKeyDown(e, dataItem)}
													autoFocus
													className="editInput"
												/>
											) : (
												<span
													style={{ fontWeight: dataItem.checked ? '600' : 'normal', cursor: 'pointer' }}
													onClick={() => startEditProjectName(dataItem)}
												>
													{dataItem['项目']}
												</span>
											)}
										</label>

										{dataItem.checked && (
											<div>
												<input
													type="text"
													value={dataItem.说明}
													placeholder="请输入说明..."
													onChange={(e) => updateDescription(dataItem, e.target.value)}
													className="descriptionInput"
												/>
											</div>
										)}
									</div>
								))}
								{/* 新增按钮 */}
								<div className="addItemContainer">
									<button
										onClick={() => addNewProject(headerItem.title)}
										className="addButton"
									>
										+ 新增项目
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* 悬浮复制按钮 - 固定在页面右上角 */}
			{getSelectedCount() > 0 && (
				<button
					onClick={copy}
					className="floatingButton"
					title={`复制 ${getSelectedCount()} 个选中项`}
				>
					📋<br />
					<span style={{ fontSize: '12px' }}>{getSelectedCount()}</span>
				</button>
			)}

		</div>
	)
}