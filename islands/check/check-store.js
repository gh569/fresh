import checkData from './check-data.js'
// 定义默认的总体总结值常量
const DEFAULT_GENERAL_SUMMARY = '您好'

class CheckStore {
  constructor() {
    this.selectedItems = []
    this.checkData = {}
    this.generalSummary = DEFAULT_GENERAL_SUMMARY
    // 添加新的selectedHeader属性，用于存储选中的header
    this.selectedHeader = []
    this.observers = []
    this.initializeData()
    this.notifyObservers()
  }

    /**
   * 从localStorage加载数据
   */
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('checkStoreData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        this.selectedItems = parsedData.selectedItems || []
        this.generalSummary = parsedData.generalSummary || DEFAULT_GENERAL_SUMMARY
        // 加载selectedHeader数组
        this.selectedHeader = parsedData.selectedHeader || []
        
        // 如果localStorage中的checkData存在，且header和数据数组长度都不为0，则使用它
        if (parsedData.checkData && 
            Array.isArray(parsedData.checkData.header) && 
            parsedData.checkData.header.length > 0 &&
            Array.isArray(parsedData.checkData.data) && 
            parsedData.checkData.data.length > 0) {
          this.checkData = parsedData.checkData
          return true // 表示成功从localStorage加载了有效数据
        }
      }
    } catch (e) {
      console.warn('Failed to load data from localStorage:', e)
    }
    return false // 表示没有从localStorage加载数据
  }

  /**
   * 保存数据到localStorage
   */
  saveToLocalStorage() {
    try {
      const dataToSave = {
        selectedItems: this.selectedItems,
        generalSummary: this.generalSummary,
        checkData: this.checkData,
        // 保存selectedHeader数组
        selectedHeader: this.selectedHeader
      }
      localStorage.setItem('checkStoreData', JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Failed to save data to localStorage:', e)
    }
  }

    /**
   * 清理localStorage中的数据
   */
  clearLocalStorage() {
    try {
      localStorage.removeItem('checkStoreData')
      localStorage.removeItem('checkSelectionData')
      // 重置generalSummary为默认值
      this.generalSummary = DEFAULT_GENERAL_SUMMARY
      // 如果也需要清除其他数据，也可以在这里添加
      this.selectedItems = []
      this.selectedHeader = []
      this.checkData = {}
      this.notifyObservers()
    } catch (e) {
      console.warn('Failed to clear data from localStorage:', e)
    }
  }

  /**
   * 添加观察者
   * @param {Function} callback - 数据变化时调用的回调函数
   */
  subscribe(callback) {
    this.observers.push(callback)
    // 返回取消订阅函数
    return () => {
      this.observers = this.observers.filter(observer => observer !== callback)
    }
  }

  /**
   * 通知所有观察者数据已更新
   */
  notifyObservers() {
    this.observers.forEach(callback => callback())
    // 每次数据更新时自动保存到localStorage
    this.saveToLocalStorage()
  }

  /**
   * 设置选中项
   * @param {Array} items - 选中的项目列表
   */
  setSelectedItems(items) {
    this.selectedItems = Array.isArray(items) ? [...items] : []
    this.notifyObservers()
  }

  /**
   * 获取选中项
   * @returns {Array} 选中的项目列表
   */
  getSelectedItems() {
    return [...this.selectedItems]
  }

  /**
   * 清除选中项
   */
  clearSelectedItems() {
    this.selectedItems = []
    this.notifyObservers()
  }

  /**
   * 设置总体总结
   * @param {string} summary - 总结内容
   */
  setGeneralSummary(summary) {
    this.generalSummary = summary || DEFAULT_GENERAL_SUMMARY
    this.notifyObservers()
  }

  /**
   * 获取总体总结
   * @returns {string} 总结内容
   */
  getGeneralSummary() {
    return this.generalSummary
  }

  /**
   * 清除总体总结
   */
  clearGeneralSummary() {
    this.generalSummary = DEFAULT_GENERAL_SUMMARY
    this.notifyObservers()
  }

  /**
   * 初始化数据
   * @param {Object} data - 原始数据
   */
  initializeData(data = checkData) {
    // 只有在没有从localStorage加载数据时才初始化checkData
    const loadedFromStorage = this.loadFromLocalStorage()
    if (!loadedFromStorage) {
      this.checkData = this.processData(data)
    } else {
      // 如果从localStorage加载了数据，需要验证和同步原始空间数据
      this.syncWithOriginalData(data)
    }
  }

  /**
   * 同步localStorage中的数据与原始数据
   * 确保原始空间的数据与check.json保持一致，同时保留自定义空间
   * @param {Object} originalData - 原始check.json数据
   */
  syncWithOriginalData(originalData) {
    // 获取当前localStorage中的自定义空间
    const customSpaces = this.checkData.header.filter(header => header.isCustom)
    
    // 重新处理原始数据，获取最新的原始空间
    const processedOriginalData = this.processData(originalData)
    
    // 保留原始空间的选中状态
    const originalSpaceStates = {}
    this.checkData.header
      .filter(header => !header.isCustom)
      .forEach(header => {
        originalSpaceStates[header.title] = {
          checked: header.checked,
          selectedHeaderIndex: this.selectedHeader.indexOf(header.title)
        }
      })
    
    // 更新原始空间数据，保留选中状态
    processedOriginalData.header.forEach(header => {
      if (originalSpaceStates[header.title]) {
        header.checked = originalSpaceStates[header.title].checked
      }
    })
    
    // 合并原始空间和自定义空间
    this.checkData.header = [
      ...processedOriginalData.header,
      ...customSpaces
    ]
    
    // 保留所有项目的选中状态
    const itemStates = {}
    this.checkData.data.forEach(item => {
      const key = `${item.空间}-${item.项目}`;
      itemStates[key] = {
        checked: item.checked,
        说明: item.说明
      }
    })
    
    // 合并原始数据和自定义空间的数据项
    // 保留原始数据项和自定义空间的数据项
    const customSpaceNames = customSpaces.map(space => space.title)
    const customSpaceItems = this.checkData.data.filter(
      item => customSpaceNames.includes(item.空间)
    )
    
    this.checkData.data = [
      ...processedOriginalData.data,
      ...customSpaceItems
    ]
    
    // 恢复项目的选中状态和说明
    this.checkData.data.forEach(item => {
      const key = `${item.空间}-${item.项目}`;
      if (itemStates[key]) {
        item.checked = itemStates[key].checked;
        item.说明 = itemStates[key].说明;
      }
    })
    
    // 更新selectedHeader，保持原始空间的顺序和选中状态
    const newSelectedHeader = []
    this.selectedHeader.forEach(title => {
      // 如果是原始空间且仍然存在，或者自定义空间，保留它
      if ((!processedOriginalData.header.find(h => h.title === title) ||
           originalSpaceStates[title]) || 
          customSpaceNames.includes(title)) {
        newSelectedHeader.push(title)
      }
    })
    this.selectedHeader = newSelectedHeader
  }

  /**
   * 处理原始数据
   * @param {Object} data - 原始数据
   * @returns {Object} 处理后的数据
   */
  processData(data) {
    if (!data || !data.header || !data.data) {
      return { header: [], data: [] }
    }

    const result = {}

    // 提取表头信息（跳过前3列和最后1列）
    result.header = data.header.slice(3, -1).map(title => ({
      title,
      checked: false // 默认不选中所有空间
    }))

    // 处理数据项
    result.data = []
    result.header.forEach(headerItem => {
      const items = data.data
        .filter(item => item[headerItem.title])
        .map(item => ({
          空间: headerItem.title,
          分类: item['分类'] || '',
          项目: item['项目'] || '',
          说明: item['说明'] || '',
          checked: false
        }))
      result.data = result.data.concat(items)
    })

    return result
  }

  /**
   * 获取处理后的数据
   * @returns {Object} 处理后的数据
   */
  getData() {
    return { ...this.checkData }
  }

    /**
   * 更新selectedHeader数组
   * @param {string} headerTitle - header标题
   * @param {boolean} isChecked - 是否被选中
   */
  updateHeaderArray(headerTitle, isChecked) {
    if (isChecked) {
      // 如果header被选中，先从数组中移除（如果存在），然后添加到末尾
      const index = this.selectedHeader.indexOf(headerTitle)
      if (index > -1) {
        this.selectedHeader.splice(index, 1)
      }
      this.selectedHeader.push(headerTitle)
    } else {
      // 如果header被取消选中，则从列表中移除
      const index = this.selectedHeader.indexOf(headerTitle)
      if (index > -1) {
        this.selectedHeader.splice(index, 1)
      }
    }
  }

  /**
   * 切换表头选中状态
   * @param {number} index - 表头索引
   */
  toggleHeaderChecked(index) {
    if (this.checkData.header[index]) {
      this.checkData.header[index].checked = !this.checkData.header[index].checked
      // 更新selectedHeader数组
      this.updateHeaderArray(
        this.checkData.header[index].title,
        this.checkData.header[index].checked
      )
      this.notifyObservers()
    }
  }

  /**
   * 切换单项选中状态
   * @param {Object} targetItem - 目标项目
   */
  toggleItemChecked(targetItem) {
    const item = this.checkData.data.find(item => 
      item.空间 === targetItem.空间 && 
      item.项目 === targetItem.项目
    )
    if (item) {
      item.checked = !item.checked
      this.notifyObservers()
    }
  }

  /**
   * 更新项目说明
   * @param {Object} targetItem - 目标项目
   * @param {string} description - 新的说明
   */
  updateItemDescription(targetItem, description) {
    const item = this.checkData.data.find(item => 
      item.空间 === targetItem.空间 && 
      item.项目 === targetItem.项目
    )
    if (item) {
      item.说明 = description
      this.notifyObservers()
    }
  }

  /**
   * 更新项目名称
   * @param {Object} targetItem - 目标项目
   * @param {string} name - 新的项目名称
   */
  updateItemName(targetItem, name) {
    if (!name || name.trim() === '') return
    
    const item = this.checkData.data.find(item => 
      item.空间 === targetItem.空间 && 
      item.项目 === targetItem.项目
    )
    if (item) {
      item.项目 = name.trim()
      this.notifyObservers()
    }
  }

  /**
   * 添加新项目
   * @param {string} space - 空间名称
   * @param {string} projectName - 项目名称
   */
  addNewItem(space, projectName) {
    if (projectName && projectName.trim() !== '') {
      const newItem = {
        空间: space,
        分类: '',
        项目: projectName.trim(),
        说明: '',
        checked: false
      }
      this.checkData.data.push(newItem)
      this.notifyObservers()
    }
  }

  /**
   * 获取选中的表头
   * @returns {Array} 选中的表头列表
   */
  getCheckedHeaders() {
    return this.checkData.header.filter(item => item.checked)
  }

  /**
   * 根据空间名称获取数据
   * @param {string} space - 空间名称
   * @returns {Array} 对应空间的数据列表
   */
  getDataBySpace(space) {
    return this.checkData.data.filter(item => item.空间 === space)
  }

  /**
   * 计算选中项数量
   * @returns {number} 选中项数量
   */
  getSelectedCount() {
    return this.checkData.data.filter(item => item.checked).length
  }

  /**
   * 保存选中项数据到localStorage（用于在页面间传递数据）
   */
  saveSelectionToLocalStorage() {
    try {
      const dataToSave = {
        selectedItems: this.selectedItems,
        checkData: this.checkData,
        generalSummary: this.generalSummary
      }
      localStorage.setItem('checkSelectionData', JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Failed to save selection data to localStorage:', e)
    }
  }
  
  /**
   * 获取选中的header列表
   * @returns {Array} 选中的header列表
   */
  getHeaderList() {
    return [...this.selectedHeader]
  }
  
  /**
   * 添加自定义空间
   * @param {Object} customSpace - 自定义空间对象
   * @returns {boolean} 是否添加成功
   */
  addCustomSpace(customSpace) {
    // 检查是否已存在同名空间
    const existingSpace = this.checkData.header.find(
      header => header.title === customSpace.title
    );
    
    if (existingSpace) {
      // 如果已存在同名空间，提示用户更换名称
      alert('空间名称已存在，请更换其他名称');
      return false; // 返回false表示添加失败
    }
    
    // 否则添加新的自定义空间
    this.checkData.header.push(customSpace);
    
    // 为自定义空间创建对应的数据项
    // 这里我们根据原始空间中的数据来创建自定义空间的数据项
    customSpace.originalSpaces.forEach(originalSpace => {
      const originalItems = this.checkData.data.filter(
        item => item.空间 === originalSpace
      );
      
      originalItems.forEach(originalItem => {
        // 检查是否已经存在相同项目
        const exists = this.checkData.data.some(
          item => item.空间 === customSpace.title && 
                 item.项目 === originalItem.项目
        );
        
        // 如果不存在，则添加到自定义空间中
        if (!exists) {
          const newItem = {
            空间: customSpace.title,
            分类: originalItem.分类,
            项目: originalItem.项目,
            说明: originalItem.说明,
            checked: false
          };
          this.checkData.data.push(newItem);
        }
      });
    });
    
    // 更新selectedHeader数组
    this.updateHeaderArray(customSpace.title, customSpace.checked);
    
    this.notifyObservers();
    return true; // 返回true表示添加成功
  }
}

// 创建单例实例
const checkStore = new CheckStore()

export default checkStore