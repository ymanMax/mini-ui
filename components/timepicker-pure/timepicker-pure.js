// timepicker-pure/timepicker-pure.js
Component({
  properties: {
    // 是否显示选择器
    show: {
      type: Boolean,
      value: false,
      observer: 'onShowChange'
    },
    // 时间选择类型
    type: {
      type: String,
      value: 'datetime', // datetime, date, time, year, year-month
      observer: 'onTypeChange'
    }
  },

  data: {
    // 内部显示状态
    isVisible: false,
    // 选择器列数据
    columns: [],
    // 当前选中的索引
    selectedIndex: [],
    // 滚动偏移量
    scrollOffset: [],
    // 选择器标题
    title: '选择时间'
  },

  // 触摸状态
  touchState: {},

  lifetimes: {
    attached() {
      this.initData()
    }
  },

  methods: {
    // 显示状态改变时的处理
    onShowChange(newVal) {
      if (newVal) {
        this.showPicker()
      } else {
        this.hidePicker()
      }
    },

    // 类型改变时的处理
    onTypeChange(newVal) {
      this.initData()
    },

    // 初始化数据
    initData() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const currentDate = now.getDate()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      let columns = []
      let selectedIndex = []

      // 根据类型生成不同的列数据
      switch (this.properties.type) {
        case 'datetime':
          // 年列
          columns.push(this.generateYearData(currentYear - 10, currentYear + 10))
          selectedIndex.push(columns[0].indexOf(currentYear))

          // 月列
          columns.push(this.generateMonthData())
          selectedIndex.push(currentMonth - 1)

          // 日列
          columns.push(this.generateDayData(currentYear, currentMonth))
          selectedIndex.push(currentDate - 1)

          // 时列
          columns.push(this.generateHourData())
          selectedIndex.push(currentHour)

          // 分列
          columns.push(this.generateMinuteData())
          selectedIndex.push(currentMinute)

          this.setData({
            title: '选择日期时间'
          })
          break

        case 'date':
          // 年列
          columns.push(this.generateYearData(currentYear - 10, currentYear + 10))
          selectedIndex.push(columns[0].indexOf(currentYear))

          // 月列
          columns.push(this.generateMonthData())
          selectedIndex.push(currentMonth - 1)

          // 日列
          columns.push(this.generateDayData(currentYear, currentMonth))
          selectedIndex.push(currentDate - 1)

          this.setData({
            title: '选择日期'
          })
          break

        case 'time':
          // 时列
          columns.push(this.generateHourData())
          selectedIndex.push(currentHour)

          // 分列
          columns.push(this.generateMinuteData())
          selectedIndex.push(currentMinute)

          this.setData({
            title: '选择时间'
          })
          break

        case 'year':
          // 年列
          columns.push(this.generateYearData(currentYear - 20, currentYear + 10))
          selectedIndex.push(columns[0].indexOf(currentYear))

          this.setData({
            title: '选择年份'
          })
          break

        case 'year-month':
          // 年列
          columns.push(this.generateYearData(currentYear - 10, currentYear + 10))
          selectedIndex.push(columns[0].indexOf(currentYear))

          // 月列
          columns.push(this.generateMonthData())
          selectedIndex.push(currentMonth - 1)

          this.setData({
            title: '选择年月'
          })
          break
      }

      // 在每列数据前后添加空白项，确保可以滚动到任意位置
      const blankItemCount = 3 // 前后各添加3个空白项
      columns = columns.map(column => {
        const blankItems = new Array(blankItemCount).fill('')
        return [...blankItems, ...column, ...blankItems]
      })

      // 调整选中索引，因为添加了空白项
      selectedIndex = selectedIndex.map(index => index + blankItemCount)

      // 初始化滚动偏移量
      const scrollOffset = selectedIndex.map(index => index * 80) // 每个选项高80rpx

      this.setData({
        columns,
        selectedIndex,
        scrollOffset
      })
    },

    // 生成年份数据
    generateYearData(minYear, maxYear) {
      const data = []
      for (let year = minYear; year <= maxYear; year++) {
        data.push(year)
      }
      return data
    },

    // 生成月份数据
    generateMonthData() {
      const data = []
      for (let month = 1; month <= 12; month++) {
        data.push(month)
      }
      return data
    },

    // 生成日期数据
    generateDayData(year, month) {
      const data = []
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        data.push(day)
      }
      return data
    },

    // 生成小时数据
    generateHourData() {
      const data = []
      for (let hour = 0; hour < 24; hour++) {
        data.push(hour)
      }
      return data
    },

    // 生成分钟数据
    generateMinuteData() {
      const data = []
      for (let minute = 0; minute < 60; minute++) {
        data.push(minute)
      }
      return data
    },

    // 显示选择器
    showPicker() {
      this.initData()
      this.setData({
        isVisible: true
      })
    },

    // 隐藏选择器
    hidePicker() {
      this.setData({
        isVisible: false
      })
      this.triggerEvent('close')
    },

    // 点击取消按钮
    onCancel() {
      this.hidePicker()
      this.triggerEvent('cancel')
    },

    // 点击确认按钮
    onConfirm() {
      const { columns, selectedIndex } = this.data

      // 获取选中的时间值
      const selectedValues = selectedIndex.map((index, columnIndex) => columns[columnIndex][index])

      // 构造日期对象
      let date
      switch (this.properties.type) {
        case 'datetime':
          date = new Date(selectedValues[0], selectedValues[1] - 1, selectedValues[2], selectedValues[3], selectedValues[4])
          break
        case 'date':
          date = new Date(selectedValues[0], selectedValues[1] - 1, selectedValues[2])
          break
        case 'time':
          const now = new Date()
          date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), selectedValues[0], selectedValues[1])
          break
        case 'year':
          date = new Date(selectedValues[0], 0, 1)
          break
        case 'year-month':
          date = new Date(selectedValues[0], selectedValues[1] - 1, 1)
          break
      }

      // 格式化日期
      const formattedDate = this.formatDate(date)

      // 触发确认事件
      this.triggerEvent('confirm', {
        date: date,
        formattedDate: formattedDate
      })

      this.hidePicker()
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()

      switch (this.properties.type) {
        case 'datetime':
          return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
        case 'date':
          return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
        case 'time':
          return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
        case 'year':
          return year + ''
        case 'year-month':
          return year + '-' + (month < 10 ? '0' + month : month)
        default:
          return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes)
      }
    },

    // 触摸开始事件
    onTouchStart(e) {
      const { columnIndex } = e.currentTarget.dataset
      const { clientY } = e.touches[0]

      // 清除之前的惯性滚动动画
      if (this.touchState[columnIndex] && this.touchState[columnIndex].animationFrame) {
        cancelAnimationFrame(this.touchState[columnIndex].animationFrame)
      }

      // 记录触摸开始状态
      this.touchState[columnIndex] = {
        startY: clientY,
        startOffset: this.data.scrollOffset[columnIndex],
        startTime: Date.now(),
        lastY: clientY,
        lastTime: Date.now(),
        velocity: 0
      }
    },

    // 触摸移动事件
    onTouchMove(e) {
      const { columnIndex } = e.currentTarget.dataset
      const { clientY } = e.touches[0]
      const touchState = this.touchState[columnIndex]

      if (!touchState) return

      const currentTime = Date.now()
      const deltaY = clientY - touchState.lastY
      const deltaTime = currentTime - touchState.lastTime

      // 计算速度
      if (deltaTime > 0) {
        touchState.velocity = deltaY / deltaTime // rpx/ms
      }

      // 更新最后状态
      touchState.lastY = clientY
      touchState.lastTime = currentTime

      // 计算新的滚动偏移量
      let newOffset = touchState.startOffset + (clientY - touchState.startY)

      // 更新滚动偏移量
      const newScrollOffset = [...this.data.scrollOffset]
      newScrollOffset[columnIndex] = newOffset

      this.setData({
        scrollOffset: newScrollOffset
      })
    },

    // 触摸结束事件
    onTouchEnd(e) {
      const { columnIndex } = e.currentTarget.dataset
      const touchState = this.touchState[columnIndex]

      if (!touchState) return

      // 开始惯性滚动
      this.startInertialScroll(columnIndex, touchState.velocity)
    },

    // 惯性滚动
    startInertialScroll(columnIndex, initialVelocity) {
      const friction = 0.98 // 摩擦系数
      const minVelocity = 0.1 // 最小速度
      const maxOffset = (this.data.columns[columnIndex].length - 1) * 80 // 最大滚动偏移量
      const itemHeight = 80 // 每个选项的高度

      let velocity = initialVelocity * 10 // 放大速度，提升惯性效果
      let currentOffset = this.data.scrollOffset[columnIndex]

      const animate = () => {
        // 应用摩擦
        velocity *= friction

        // 如果速度太小，停止动画
        if (Math.abs(velocity) < minVelocity) {
          // 调整到最近的选项位置
          this.snapToNearestItem(columnIndex, currentOffset)
          return
        }

        // 更新偏移量
        currentOffset += velocity

        // 限制偏移量范围
        currentOffset = Math.max(0, Math.min(maxOffset, currentOffset))

        // 更新滚动偏移量
        const newScrollOffset = [...this.data.scrollOffset]
        newScrollOffset[columnIndex] = currentOffset

        this.setData({
          scrollOffset: newScrollOffset
        })

        // 继续动画
        this.touchState[columnIndex].animationFrame = requestAnimationFrame(animate)
      }

      // 开始动画
      animate()
    },

    // 调整到最近的选项位置
    snapToNearestItem(columnIndex, currentOffset) {
      const itemHeight = 80 // 每个选项的高度
      const columnData = this.data.columns[columnIndex]

      // 计算最近的选项索引
      let nearestIndex = Math.round(currentOffset / itemHeight)

      // 限制索引范围
      nearestIndex = Math.max(0, Math.min(columnData.length - 1, nearestIndex))

      // 计算最终的滚动偏移量
      const finalOffset = nearestIndex * itemHeight

      // 更新滚动偏移量和选中索引
      const newScrollOffset = [...this.data.scrollOffset]
      newScrollOffset[columnIndex] = finalOffset

      const newSelectedIndex = [...this.data.selectedIndex]
      newSelectedIndex[columnIndex] = nearestIndex

      this.setData({
        scrollOffset: newScrollOffset,
        selectedIndex: newSelectedIndex
      })
    },

    // 点击选项事件
    onItemTap(e) {
      const { columnIndex, itemIndex } = e.currentTarget.dataset

      // 更新选中索引和滚动偏移量
      const newSelectedIndex = [...this.data.selectedIndex]
      newSelectedIndex[columnIndex] = itemIndex

      const newScrollOffset = [...this.data.scrollOffset]
      newScrollOffset[columnIndex] = itemIndex * 80

      this.setData({
        selectedIndex: newSelectedIndex,
        scrollOffset: newScrollOffset
      })
    }
  }
})
