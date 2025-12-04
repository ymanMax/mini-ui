// pages/timepicker-demo/timepicker-demo.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowPicker: false,
    pickerConfig: {
      type: 'datetime',
      minDate: null,
      maxDate: null,
      formatter: 'YYYY-MM-DD HH:mm',
      titleText: '选择时间'
    },
    selectedDatetime: '',
    selectedDate: '',
    selectedTime: '',
    selectedYear: '',
    selectedYearMonth: '',
    selectedLimitedDate: '',
    selectedCustomFormat: ''
  },

  /**
   * 展示日期时间选择器
   */
  showDatetimePicker() {
    this.setData({
      pickerConfig: {
        type: 'datetime',
        minDate: null,
        maxDate: null,
        formatter: 'YYYY-MM-DD HH:mm',
        titleText: '选择日期时间'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示日期选择器
   */
  showDatePicker() {
    this.setData({
      pickerConfig: {
        type: 'date',
        minDate: null,
        maxDate: null,
        formatter: 'YYYY-MM-DD',
        titleText: '选择日期'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示时间选择器
   */
  showTimePicker() {
    this.setData({
      pickerConfig: {
        type: 'time',
        minDate: null,
        maxDate: null,
        formatter: 'HH:mm',
        titleText: '选择时间'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示年份选择器
   */
  showYearPicker() {
    this.setData({
      pickerConfig: {
        type: 'year',
        minDate: null,
        maxDate: null,
        formatter: 'YYYY',
        titleText: '选择年份'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示年月选择器
   */
  showYearMonthPicker() {
    this.setData({
      pickerConfig: {
        type: 'year-month',
        minDate: null,
        maxDate: null,
        formatter: 'YYYY-MM',
        titleText: '选择年月'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示带日期范围限制的选择器
   */
  showLimitedDatePicker() {
    this.setData({
      pickerConfig: {
        type: 'date',
        minDate: '1990-01-01',
        maxDate: '2005-12-31',
        formatter: 'YYYY-MM-DD',
        titleText: '选择出生日期 (1990-2005)'
      },
      isShowPicker: true
    })
  },

  /**
   * 展示自定义格式的时间选择器
   */
  showCustomFormatPicker() {
    this.setData({
      pickerConfig: {
        type: 'datetime',
        minDate: null,
        maxDate: null,
        formatter: 'YYYY年MM月DD日 HH时mm分',
        titleText: '选择时间 (自定义格式)'
      },
      isShowPicker: true
    })
  },

  /**
   * 选择器取消事件
   */
  onPickerCancel() {
    this.setData({
      isShowPicker: false
    })
    console.log('选择器取消')
  },

  /**
   * 选择器确认事件
   */
  onPickerConfirm(e) {
    const { formattedDate, date } = e.detail
    const { type } = this.data.pickerConfig

    // 根据不同的type更新对应的选中值
    switch (type) {
      case 'datetime':
        this.setData({
          selectedDatetime: formattedDate
        })
        break
      case 'date':
        this.setData({
          selectedDate: formattedDate
        })
        break
      case 'time':
        this.setData({
          selectedTime: formattedDate
        })
        break
      case 'year':
        this.setData({
          selectedYear: formattedDate
        })
        break
      case 'year-month':
        this.setData({
          selectedYearMonth: formattedDate
        })
        break
    }

    // 处理自定义格式的特殊情况
    if (this.data.pickerConfig.formatter === 'YYYY年MM月DD日 HH时mm分') {
      this.setData({
        selectedCustomFormat: formattedDate
      })
    }

    // 关闭选择器
    this.setData({
      isShowPicker: false
    })

    // 打印选择结果
    console.log(`选择的${type}时间:`, formattedDate)
    console.log('原始Date对象:', date)
  },

  /**
   * 页面加载完成
   */
  onLoad() {
    console.log('时间选择器示例页面加载完成')
  },

  /**
   * 页面显示
   */
  onShow() {
    // 可以在这里做一些页面显示时的处理
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '时间选择器示例',
      path: '/pages/timepicker-demo/timepicker-demo'
    }
  }
})
