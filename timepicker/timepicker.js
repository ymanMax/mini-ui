// timepicker/timepicker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 时间选择类型：datetime（年月日时分），time（时分），date（年月日），year（年），year-month（年月）
    type: {
      type: String,
      value: 'datetime',
      observer: function(newVal) {
        this._initData()
      }
    },
    // 最小日期，不传默认从1990年开始
    minDate: {
      type: String,
      observer: function(newVal) {
        this._initData()
      }
    },
    // 最大日期，不传默认为当日
    maxDate: {
      type: String,
      observer: function(newVal) {
        this._initData()
      }
    },
    // 时间格式，支持 YYYY/yyyy(年), MM(月), DD(日), HH(24小时制), hh(12小时制), mm(分), ss(秒)
    formatter: {
      type: String,
      value: 'YYYY-MM-DD HH:mm'
    },
    // 是否显示选择器
    isShowPicker: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal) {
          this._openPicker()
        } else {
          this._closePicker()
        }
      }
    },
    // 标题文案
    titleText: {
      type: String,
      value: '选择时间'
    },
    // 取消按钮文案
    cancelText: {
      type: String,
      value: '取消'
    },
    // 确定按钮文案
    sureText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isOpen: false,
    columnsData: [], // 选择器列数据
    value: [], // 当前选中的索引
    tempValue: [], // 临时选中的索引
    currentDate: null, // 当前选中的日期对象
    scrollEnd: true // 滚动是否结束
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached: function() {
      this._initData()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化数据
    _initData() {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const currentDate = now.getDate()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // 处理最小日期
      const minDate = this.properties.minDate ? new Date(this.properties.minDate) : new Date(1990, 0, 1)
      const minYear = minDate.getFullYear()
      const minMonth = minDate.getMonth() + 1
      const minDay = minDate.getDate()
      const minHour = minDate.getHours()
      const minMinute = minDate.getMinutes()

      // 处理最大日期
      const maxDate = this.properties.maxDate ? new Date(this.properties.maxDate) : now
      const maxYear = maxDate.getFullYear()
      const maxMonth = maxDate.getMonth() + 1
      const maxDay = maxDate.getDate()
      const maxHour = maxDate.getHours()
      const maxMinute = maxDate.getMinutes()

      // 根据type生成不同的列数据
      const columnsData = []
      const value = []

      switch (this.properties.type) {
        case 'datetime':
          // 年列
          columnsData.push(this._generateYearData(minYear, maxYear))
          value.push(columnsData[0].findIndex(item => item === currentYear))

          // 月列
          columnsData.push(this._generateMonthData())
          value.push(currentMonth - 1)

          // 日列
          columnsData.push(this._generateDayData(currentYear, currentMonth, minYear, minMonth, minDay, maxYear, maxMonth, maxDay))
          value.push(currentDate - 1)

          // 时列
          columnsData.push(this._generateHourData())
          value.push(currentHour)

          // 分列
          columnsData.push(this._generateMinuteData())
          value.push(currentMinute)
          break

        case 'date':
          // 年列
          columnsData.push(this._generateYearData(minYear, maxYear))
          value.push(columnsData[0].findIndex(item => item === currentYear))

          // 月列
          columnsData.push(this._generateMonthData())
          value.push(currentMonth - 1)

          // 日列
          columnsData.push(this._generateDayData(currentYear, currentMonth, minYear, minMonth, minDay, maxYear, maxMonth, maxDay))
          value.push(currentDate - 1)
          break

        case 'time':
          // 时列
          columnsData.push(this._generateHourData())
          value.push(currentHour)

          // 分列
          columnsData.push(this._generateMinuteData())
          value.push(currentMinute)
          break

        case 'year':
          // 年列
          columnsData.push(this._generateYearData(minYear, maxYear))
          value.push(columnsData[0].findIndex(item => item === currentYear))
          break

        case 'year-month':
          // 年列
          columnsData.push(this._generateYearData(minYear, maxYear))
          value.push(columnsData[0].findIndex(item => item === currentYear))

          // 月列
          columnsData.push(this._generateMonthData())
          value.push(currentMonth - 1)
          break
      }

      this.setData({
        columnsData,
        value,
        tempValue: [...value]
      })
    },

    // 生成年份数据
    _generateYearData(minYear, maxYear) {
      const yearData = []
      for (let year = minYear; year <= maxYear; year++) {
        yearData.push(year)
      }
      return yearData
    },

    // 生成月份数据
    _generateMonthData() {
      const monthData = []
      for (let month = 1; month <= 12; month++) {
        monthData.push(month)
      }
      return monthData
    },

    // 生成日期数据
    _generateDayData(year, month, minYear, minMonth, minDay, maxYear, maxMonth, maxDay) {
      const dayData = []
      const daysInMonth = new Date(year, month, 0).getDate()

      let startDay = 1
      let endDay = daysInMonth

      // 处理最小日期限制
      if (year === minYear && month === minMonth) {
        startDay = Math.max(startDay, minDay)
      }

      // 处理最大日期限制
      if (year === maxYear && month === maxMonth) {
        endDay = Math.min(endDay, maxDay)
      }

      for (let day = startDay; day <= endDay; day++) {
        dayData.push(day)
      }
      return dayData
    },

    // 生成小时数据
    _generateHourData() {
      const hourData = []
      for (let hour = 0; hour < 24; hour++) {
        hourData.push(hour)
      }
      return hourData
    },

    // 生成分钟数据
    _generateMinuteData() {
      const minuteData = []
      for (let minute = 0; minute < 60; minute++) {
        minuteData.push(minute)
      }
      return minuteData
    },

    // 打开选择器
    _openPicker() {
      this.setData({
        isOpen: true
      })
    },

    // 关闭选择器
    _closePicker() {
      this.setData({
        isOpen: false
      })
    },

    // 点击蒙层关闭
    tapModal() {
      this.properties.isShowPicker = false
      this._closePicker()
    },

    // 取消选择
    cancel() {
      this.triggerEvent('cancel')
      this._closePicker()
    },

    // 确认选择
    confirm() {
      const { scrollEnd, tempValue, columnsData } = this.data
      if (!scrollEnd) return

      // 根据选中的索引获取对应的时间值
      const selectedValues = tempValue.map((index, columnIndex) => columnsData[columnIndex][index])

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
      const formattedDate = this._formatDate(date, this.properties.formatter)

      // 触发确认事件
      this.triggerEvent('confirm', {
        date: date,
        formattedDate: formattedDate
      })

      this._closePicker()
    },

    // 格式化日期
    _formatDate(date, format) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()

      // 替换年份
      format = format.replace(/YYYY/g, year)
      format = format.replace(/yyyy/g, year)

      // 替换月份
      format = format.replace(/MM/g, this._padZero(month))

      // 替换日期
      format = format.replace(/DD/g, this._padZero(day))

      // 替换小时（24小时制）
      format = format.replace(/HH/g, this._padZero(hours))

      // 替换小时（12小时制）
      format = format.replace(/hh/g, this._padZero(hours % 12 || 12))

      // 替换分钟
      format = format.replace(/mm/g, this._padZero(minutes))

      // 替换秒
      format = format.replace(/ss/g, this._padZero(seconds))

      return format
    },

    // 补零函数
    _padZero(num) {
      return num < 10 ? '0' + num : num
    },

    // 选择器值改变事件
    _bindChange(e) {
      const val = e.detail.value
      const { columnsData, tempValue } = this.data

      // 更新临时选中值
      this.setData({
        tempValue: val,
        value: val
      })

      // 根据type处理联动逻辑（主要是年月日的联动）
      switch (this.properties.type) {
        case 'datetime':
        case 'date':
          this._handleDate联动(val)
          break
        case 'year-month':
          this._handleYearMonth联动(val)
          break
      }
    },

    // 处理年月日联动
    _handleDate联动(val) {
      const { columnsData, tempValue } = this.data
      const { minDate, maxDate } = this.properties

      // 处理最小日期
      const minDateObj = minDate ? new Date(minDate) : new Date(1990, 0, 1)
      const minYear = minDateObj.getFullYear()
      const minMonth = minDateObj.getMonth() + 1
      const minDay = minDateObj.getDate()

      // 处理最大日期
      const maxDateObj = maxDate ? new Date(maxDate) : new Date()
      const maxYear = maxDateObj.getFullYear()
      const maxMonth = maxDateObj.getMonth() + 1
      const maxDay = maxDateObj.getDate()

      let newColumnsData = [...columnsData]
      let newTempValue = [...tempValue]

      // 如果年份或月份改变，重新生成日期数据
      if (val[0] !== tempValue[0] || val[1] !== tempValue[1]) {
        const selectedYear = newColumnsData[0][val[0]]
        const selectedMonth = newColumnsData[1][val[1]]

        // 生成新的日期数据
        const newDayData = this._generateDayData(selectedYear, selectedMonth, minYear, minMonth, minDay, maxYear, maxMonth, maxDay)

        // 更新日期列数据
        newColumnsData[2] = newDayData

        // 调整日期选中索引（确保在新的日期范围内）
        newTempValue[2] = Math.min(newTempValue[2], newDayData.length - 1)
      }

      // 更新数据
      this.setData({
        columnsData: newColumnsData,
        tempValue: newTempValue,
        value: newTempValue
      })
    },

    // 处理年月联动
    _handleYearMonth联动(val) {
      // 年月联动相对简单，主要是处理最小最大日期限制
      // 这里可以根据需要添加逻辑
    },

    // 滚动开始事件
    _bindpickstart() {
      this.setData({
        scrollEnd: false
      })
    },

    // 滚动结束事件
    _bindpickend() {
      this.setData({
        scrollEnd: true
      })
    }
  }
})
