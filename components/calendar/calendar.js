// components/calendar/calendar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 选择模式：single（单选）、range（范围选择）、multiple（多选）
    mode: {
      type: String,
      value: 'single',
      observer: function(newVal) {
        if (!['single', 'range', 'multiple'].includes(newVal)) {
          console.warn('Invalid mode, defaulting to "single"');
          this.setData({ mode: 'single' });
        } else {
          this.initSelectedDates();
          this.updateCalendar();
        }
      }
    },
    // 最小可选日期，格式：YYYY-MM-DD
    minDate: {
      type: String,
      value: '1990-01-01',
      observer: function() {
        this.updateCalendar();
      }
    },
    // 最大可选日期，格式：YYYY-MM-DD，默认值为当日
    maxDate: {
      type: String,
      value: new Date().toISOString().split('T')[0],
      observer: function() {
        this.updateCalendar();
      }
    },
    // 范围选择时的最大天数限制
    maxRange: {
      type: Number,
      value: 0, // 0 表示无限制
      observer: function() {
        if (this.data.mode === 'range') {
          this.updateCalendar();
        }
      }
    },
    // 默认选中的日期
    defaultDate: {
      type: [String, Array],
      value: '',
      observer: function(newVal) {
        this.initSelectedDates();
        this.updateCalendar();
      }
    },
    // 自定义禁用日期的函数
    disabledDate: {
      type: Function,
      value: null
    },
    // 自定义日期显示格式的函数
    formatter: {
      type: Function,
      value: null
    },
    // 是否显示日历弹窗
    isShowCalendar: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        if (newVal) {
          this._openCalendar();
        } else {
          this._closeCalendar();
        }
      }
    },
    // 标题文案
    titleText: {
      type: String,
      value: '选择日期'
    },
    // 取消按钮文案
    cancelText: {
      type: String,
      value: '取消'
    },
    // 确定按钮文案
    confirmText: {
      type: String,
      value: '确定'
    },
    // 自定义样式
    headerStyle: String,
    cancelStyle: String,
    confirmStyle: String,
    titleStyle: String,
    maskStyle: String,
    calendarStyle: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 当前显示的年份和月份
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    // 日历数据
    calendarData: [],
    // 选中的日期
    selectedDates: [],
    // 范围选择的开始日期
    rangeStartDate: null,
    // 日历是否打开
    isOpen: false,
    // 滑动相关
    touchStartY: 0,
    touchMoveY: 0,
    touchEndY: 0
  },

  /**
   * 组件初始化完成时调用
   */
  ready: function() {
    this.initSelectedDates();
    this.updateCalendar();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化选中的日期
    initSelectedDates: function() {
      const { mode, defaultDate } = this.properties;
      let selectedDates = [];
      let rangeStartDate = null;

      if (mode === 'single' && typeof defaultDate === 'string') {
        selectedDates = [defaultDate];
      } else if (mode === 'range' && Array.isArray(defaultDate) && defaultDate.length === 2) {
        selectedDates = defaultDate;
        rangeStartDate = defaultDate[0];
      } else if (mode === 'multiple' && Array.isArray(defaultDate)) {
        selectedDates = defaultDate.filter(date => this.isValidDate(date));
      }

      this.setData({
        selectedDates: selectedDates,
        rangeStartDate: rangeStartDate
      });
    },

    // 验证日期格式是否正确
    isValidDate: function(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') return false;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) return false;

      const date = new Date(dateStr);
      return date instanceof Date && !isNaN(date) && dateStr === date.toISOString().split('T')[0];
    },

    // 更新日历数据
    updateCalendar: function() {
      const { currentYear, currentMonth } = this.data;
      const { minDate, maxDate, mode, maxRange, rangeStartDate } = this.properties;
      const calendarData = this.generateCalendarData(currentYear, currentMonth);

      this.setData({
        calendarData: calendarData
      });
    },

    // 生成指定年月的日历数据
    generateCalendarData: function(year, month) {
      const calendarData = [];
      const firstDay = new Date(year, month - 1, 1).getDay(); // 0-6，0表示星期日
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

      // 生成星期标题
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      calendarData.push({
        type: 'weekday',
        days: weekDays
      });

      // 生成日历数据
      const monthData = [];

      // 添加上个月的日期
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dateStr = this.formatDate(new Date(year, month - 2, day));
        monthData.push({
          year: year,
          month: month - 1,
          day: day,
          dateStr: dateStr,
          isCurrentMonth: false,
          isSelected: false,
          isDisabled: true,
          isToday: false
        });
      }

      // 添加当月的日期
      const today = new Date().toISOString().split('T')[0];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month - 1, i);
        const dateStr = this.formatDate(date);

        // 判断是否选中
        let isSelected = false;
        if (this.data.mode === 'single') {
          isSelected = this.data.selectedDates[0] === dateStr;
        } else if (this.data.mode === 'range') {
          isSelected = this.data.selectedDates.includes(dateStr);
        } else if (this.data.mode === 'multiple') {
          isSelected = this.data.selectedDates.includes(dateStr);
        }

        // 判断是否禁用
        let isDisabled = false;
        if (!this.isDateInRange(date, this.properties.minDate, this.properties.maxDate)) {
          isDisabled = true;
        } else if (this.properties.disabledDate) {
          try {
            isDisabled = this.properties.disabledDate(dateStr);
          } catch (error) {
            console.error('Error in disabledDate function:', error);
            isDisabled = false;
          }
        }

        // 在范围选择模式下，检查是否超过最大范围
        if (this.data.mode === 'range' && this.data.rangeStartDate && !isDisabled) {
          const startDate = new Date(this.data.rangeStartDate);
          const diffDays = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));

          if (this.properties.maxRange > 0 && diffDays > this.properties.maxRange - 1) {
            isDisabled = true;
          }
        }

        // 判断是否为今天
        const isToday = dateStr === today;

        // 判断是否在范围内（用于范围选择的背景）
        let isInRange = false;
        if (this.data.mode === 'range' && this.data.selectedDates.length === 2) {
          const startDate = new Date(this.data.selectedDates[0]);
          const endDate = new Date(this.data.selectedDates[1]);
          isInRange = date >= startDate && date <= endDate;
        }

        // 判断是否为范围的开始或结束
        let isRangeStart = this.data.selectedDates[0] === dateStr;
        let isRangeEnd = this.data.selectedDates[1] === dateStr;

        // 应用自定义格式化
        let dayText = i.toString();
        if (this.properties.formatter) {
          try {
            dayText = this.properties.formatter(dateStr, {
              year: year,
              month: month,
              day: day,
              isSelected: isSelected,
              isDisabled: isDisabled,
              isToday: isToday,
              isCurrentMonth: true
            }) || dayText;
          } catch (error) {
            console.error('Error in formatter function:', error);
          }
        }

        monthData.push({
          year: year,
          month: month,
          day: day,
          dateStr: dateStr,
          dayText: dayText,
          isCurrentMonth: true,
          isSelected: isSelected,
          isDisabled: isDisabled,
          isToday: isToday,
          isInRange: isInRange,
          isRangeStart: isRangeStart,
          isRangeEnd: isRangeEnd
        });
      }

      // 添加下个月的日期
      const remainingCells = 42 - monthData.length; // 6行x7列=42个单元格
      for (let i = 1; i <= remainingCells; i++) {
        const dateStr = this.formatDate(new Date(year, month, i));
        monthData.push({
          year: year,
          month: month + 1,
          day: i,
          dateStr: dateStr,
          isCurrentMonth: false,
          isSelected: false,
          isDisabled: true,
          isToday: false
        });
      }

      // 按周分组
      for (let i = 0; i < 6; i++) {
        const weekStartIndex = i * 7;
        calendarData.push({
          type: 'week',
          days: monthData.slice(weekStartIndex, weekStartIndex + 7)
        });
      }

      return calendarData;
    },

    // 检查日期是否在指定范围内
    isDateInRange: function(date, minDate, maxDate) {
      const targetDate = new Date(date);
      const min = new Date(minDate);
      const max = new Date(maxDate);

      // 设置时间为 00:00:00 以确保日期比较的准确性
      targetDate.setHours(0, 0, 0, 0);
      min.setHours(0, 0, 0, 0);
      max.setHours(0, 0, 0, 0);

      return targetDate >= min && targetDate <= max;
    },

    // 格式化日期为 YYYY-MM-DD 格式
    formatDate: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 切换到上一个月
    prevMonth: function() {
      let { currentYear, currentMonth } = this.data;
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }

      this.setData({
        currentYear: currentYear,
        currentMonth: currentMonth
      });

      this.updateCalendar();
      this.triggerEvent('month-change', {
        year: currentYear,
        month: currentMonth
      });
    },

    // 切换到下一个月
    nextMonth: function() {
      let { currentYear, currentMonth } = this.data;
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }

      this.setData({
        currentYear: currentYear,
        currentMonth: currentMonth
      });

      this.updateCalendar();
      this.triggerEvent('month-change', {
        year: currentYear,
        month: currentMonth
      });
    },

    // 跳转到今天
    jumpToToday: function() {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      this.setData({
        currentYear: currentYear,
        currentMonth: currentMonth
      });

      this.updateCalendar();
      this.triggerEvent('month-change', {
        year: currentYear,
        month: currentMonth
      });
    },

    // 点击日期
    tapDate: function(e) {
      const { date, isdisabled } = e.currentTarget.dataset;

      if (isdisabled) {
        return;
      }

      // 触发 select 事件
      this.triggerEvent('select', {
        date: date
      });

      const { mode } = this.properties;
      let selectedDates = [...this.data.selectedDates];
      let rangeStartDate = this.data.rangeStartDate;

      // 根据不同模式处理选中逻辑
      if (mode === 'single') {
        selectedDates = [date];
        this.setData({
          selectedDates: selectedDates
        });
        this.updateCalendar();
        // 单选模式下直接触发确认事件
        this.confirmSelection();
      } else if (mode === 'range') {
        if (!rangeStartDate) {
          // 选择开始日期
          selectedDates = [date];
          rangeStartDate = date;
        } else if (rangeStartDate === date) {
          // 取消选择开始日期
          selectedDates = [];
          rangeStartDate = null;
        } else {
          // 选择结束日期
          if (new Date(date) < new Date(rangeStartDate)) {
            // 如果选择的日期早于开始日期，则交换它们
            selectedDates = [date, rangeStartDate];
          } else {
            selectedDates = [rangeStartDate, date];
          }
          // 范围选择完成，触发确认事件
          this.setData({
            selectedDates: selectedDates,
            rangeStartDate: null
          });
          this.updateCalendar();
          this.confirmSelection();
          return;
        }

        this.setData({
          selectedDates: selectedDates,
          rangeStartDate: rangeStartDate
        });
        this.updateCalendar();
      } else if (mode === 'multiple') {
        // 多选模式
        const index = selectedDates.indexOf(date);
        if (index > -1) {
          // 取消选中
          selectedDates.splice(index, 1);
        } else {
          // 添加选中
          selectedDates.push(date);
        }

        this.setData({
          selectedDates: selectedDates
        });
        this.updateCalendar();
      }
    },

    // 确认选择
    confirmSelection: function() {
      const { selectedDates, mode } = this.data;
      const { formatter } = this.properties;

      // 格式化返回的日期
      let result = selectedDates;
      if (formatter && typeof formatter === 'function') {
        try {
          if (mode === 'single' && selectedDates.length > 0) {
            result = formatter(selectedDates[0]);
          } else if (mode === 'range' && selectedDates.length === 2) {
            result = [formatter(selectedDates[0]), formatter(selectedDates[1])];
          } else if (mode === 'multiple') {
            result = selectedDates.map(date => formatter(date));
          }
        } catch (error) {
          console.error('Error in formatter function:', error);
        }
      }

      // 触发 confirm 事件
      this.triggerEvent('confirm', {
        date: result
      });

      // 关闭日历
      this.setData({
        isOpen: false
      });

      // 重置范围选择的开始日期（如果是范围模式）
      if (mode === 'range') {
        this.setData({
          rangeStartDate: null
        });
      }
    },

    // 取消选择
    cancelSelection: function() {
      // 触发 cancel 事件
      this.triggerEvent('cancel');

      // 关闭日历
      this.setData({
        isOpen: false
      });

      // 重置选中状态
      this.initSelectedDates();
      this.updateCalendar();
    },

    // 打开日历
    _openCalendar: function() {
      this.setData({
        isOpen: true
      });
      // 确保日历数据是最新的
      this.updateCalendar();
    },

    // 关闭日历
    _closeCalendar: function() {
      this.setData({
        isOpen: false
      });
    },

    // 点击遮罩层
    tapMask: function() {
      this._closeCalendar();
      this.cancelSelection();
    },

    // 触摸开始事件
    touchStart: function(e) {
      this.setData({
        touchStartY: e.touches[0].clientY
      });
    },

    // 触摸移动事件
    touchMove: function(e) {
      this.setData({
        touchMoveY: e.touches[0].clientY
      });
    },

    // 触摸结束事件
    touchEnd: function(e) {
      this.setData({
        touchEndY: e.changedTouches[0].clientY
      });

      const { touchStartY, touchEndY } = this.data;
      const deltaY = touchStartY - touchEndY;

      // 判断滑动方向和距离，决定是否切换月份
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // 向上滑动，切换到下一个月
          this.nextMonth();
        } else {
          // 向下滑动，切换到上一个月
          this.prevMonth();
        }
      }
    },

    // 格式化输出日期（用于confirm事件的返回值）
    formatOutputDate: function(dateStr, format) {
      if (!dateStr || !format) return dateStr;

      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return format
        .replace(/YYYY/g, year)
        .replace(/yyyy/g, year)
        .replace(/MM/g, String(month).padStart(2, '0'))
        .replace(/DD/g, String(day).padStart(2, '0'))
        .replace(/M/g, month)
        .replace(/D/g, day);
    }
  }
});
