// pages/home/home.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    components: [
      {
        id: 'picker',
        name: '选择器组件',
        description: '通用选择器组件，支持联动选择和自定义数据',
        icon: '📋',
        path: '/pages/index/index'
      },
      {
        id: 'timepicker',
        name: '时间选择器',
        description: '多功能时间选择器，支持日期、时间等多种格式',
        icon: '⏰',
        path: '/pages/timepicker-demo/timepicker-demo'
      }
    ]
  },

  /**
   * 跳转到组件示例页面
   */
  goToComponent(e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({
      url: path,
      fail: (error) => {
        console.error('跳转失败:', error)
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 页面加载完成
   */
  onLoad() {
    console.log('首页加载完成')
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
      title: '组件库示例',
      path: '/pages/home/home'
    }
  }
})
