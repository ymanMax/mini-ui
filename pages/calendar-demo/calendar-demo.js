// pages/calendar-demo/calendar-demo.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 日历组件配置
    calendarConfig: {
      mode: 'single', // 选择模式：single（单选）、range（范围选择）、multiple（多选）
      minDate: '1990-01-01', // 最小可选日期
      maxDate: new Date().toISOString().split('T')[0], // 最大可选日期，默认为当天
      maxRange: 7, // 范围选择时的最大天数限制
      defaultDate: '', // 默认选中的日期
      isShowCalendar: false, // 是否显示日历弹窗
      titleText: '选择日期', // 弹窗标题
      cancelText: '取消', // 取消按钮文案
      confirmText: '确定' // 确定按钮文案
    },

    // 示例数据
    selectedDate: '', // 单选模式下选中的日期
    selectedRange: [], // 范围模式下选中的日期范围
    selectedMultiple: [], // 多选模式下选中的日期
    currentMonth: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    }
  },

  /**
   * 页面加载完成
   */
  onLoad() {
    console.log('日历组件示例页面加载完成');
  },

  /**
   * 打开日历
   */
  openCalendar() {
    this.setData({
      'calendarConfig.isShowCalendar': true
    });
  },

  /**
   * 关闭日历
   */
  closeCalendar() {
    this.setData({
      'calendarConfig.isShowCalendar': false
    });
  },

  /**
   * 选择模式切换
   */
  changeMode(e) {
    const mode = e.currentTarget.dataset.mode;
    let defaultDate = '';

    // 根据不同模式设置不同的默认值
    if (mode === 'single') {
      defaultDate = this.data.selectedDate || '';
    } else if (mode === 'range') {
      defaultDate = this.data.selectedRange.length === 2 ? this.data.selectedRange : [];
    } else if (mode === 'multiple') {
      defaultDate = this.data.selectedMultiple.length > 0 ? this.data.selectedMultiple : [];
    }

    this.setData({
      'calendarConfig.mode': mode,
      'calendarConfig.defaultDate': defaultDate
    });
  },

  /**
   * 日历确认事件处理
   */
  onCalendarConfirm(e) {
    const { mode } = this.data.calendarConfig;
    const { date } = e.detail;

    console.log(`日历${mode}模式确认事件:`, date);

    // 根据不同模式处理返回数据
    if (mode === 'single') {
      this.setData({
        selectedDate: date,
        'calendarConfig.defaultDate': date
      });

      wx.showToast({
        title: `已选择日期: ${date}`,
        icon: 'none',
        duration: 2000
      });
    } else if (mode === 'range') {
      if (Array.isArray(date) && date.length === 2) {
        const startDate = date[0];
        const endDate = date[1];
        const days = this.calculateDaysBetween(startDate, endDate);

        this.setData({
          selectedRange: date,
          'calendarConfig.defaultDate': date
        });

        wx.showToast({
          title: `已选择日期范围: ${startDate} 至 ${endDate} (共${days}天)`,
          icon: 'none',
          duration: 3000
        });
      }
    } else if (mode === 'multiple') {
      if (Array.isArray(date) && date.length > 0) {
        this.setData({
          selectedMultiple: date,
          'calendarConfig.defaultDate': date
        });

        wx.showToast({
          title: `已选择 ${date.length} 个日期`,
          icon: 'none',
          duration: 2000
        });
      } else {
        this.setData({
          selectedMultiple: [],
          'calendarConfig.defaultDate': []
        });

        wx.showToast({
          title: '已清除所有选择',
          icon: 'none',
          duration: 2000
        });
      }
    }

    // 关闭日历
    this.closeCalendar();
  },

  /**
   * 日历取消事件处理
   */
  onCalendarCancel(e) {
    console.log('日历取消事件:', e.detail);

    wx.showToast({
      title: '已取消选择',
      icon: 'none',
      duration: 1500
    });

    // 关闭日历
    this.closeCalendar();
  },

  /**
   * 日期选择事件处理
   */
  onCalendarSelect(e) {
    const { date } = e.detail;
    const { mode } = this.data.calendarConfig;

    console.log(`日历${mode}模式选择事件:`, date);
  },

  /**
   * 月份切换事件处理
   */
  onCalendarMonthChange(e) {
    const { year, month } = e.detail;

    console.log('日历月份切换事件:', { year, month });

    this.setData({
      currentMonth: {
        year: year,
        month: month
      }
    });
  },

  /**
   * 自定义禁用日期函数
   */
  disabledDate(dateStr) {
    // 示例：禁用周末（星期六和星期日）
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 (星期日) 到 6 (星期六)

    // 禁用周末（星期六和星期日）
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // 可以添加更多禁用逻辑，例如：
    // 1. 禁用过去的日期
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // if (date < today) {
    //   return true;
    // }

    // 2. 禁用特定日期
    // const disabledDates = ['2023-12-25', '2023-12-31'];
    // if (disabledDates.includes(dateStr)) {
    //   return true;
    // }

    return false;
  },

  /**
   * 自定义日期格式化函数
   */
  dateFormatter(dateStr, info) {
    // 示例：为特定日期添加自定义文案
    const specialDates = {
      '2023-01-01': '元旦',
      '2023-02-14': '情人节',
      '2023-05-01': '劳动节',
      '2023-10-01': '国庆节',
      '2023-12-25': '圣诞节'
    };

    // 如果是特殊日期，则显示特殊文案，否则显示日期
    if (specialDates[dateStr]) {
      return specialDates[dateStr];
    }

    // 可以根据日期的不同状态返回不同的文案
    // 例如：如果是今天，则返回 "今天"
    // const today = new Date().toISOString().split('T')[0];
    // if (dateStr === today) {
    //   return '今天';
    // }

    return info.day;
  },

  /**
   * 计算两个日期之间的天数
   */
  calculateDaysBetween(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // 计算两个日期之间的毫秒数差
    const timeDifference = endDate.getTime() - startDate.getTime();

    // 转换为天数并取绝对值（防止日期顺序错误）
    const daysDifference = Math.abs(timeDifference / (1000 * 60 * 60 * 24));

    // 因为包含起始日期和结束日期，所以需要加1
    return daysDifference + 1;
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '日历组件示例',
      path: '/pages/calendar-demo/calendar-demo'
    };
  }
});
