Page({
  data: {
    currentTab: 'lof',
    list: [],
    isRefreshing: false,
    sortType: 1 // 1:降序, 2:升序, 0:默认
  },

  onLoad() {
    this.fetchData();
  },

  // 1. 切换页签
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    console.log("切换到:", type);
    this.setData({ currentTab: type, list: [] }, () => {
      this.fetchData();
    });
  },

  // 2. 排序逻辑
  toggleSort() {
    const nextSort = (this.data.sortType + 1) % 3;
    this.setData({ sortType: nextSort }, () => this.applySort());
  },

  applySort() {
    if (!this.data.list || this.data.list.length === 0) return;
    let temp = [...this.data.list];
    if (this.data.sortType === 1) {
      temp.sort((a, b) => (b.premium_rate_pct || 0) - (a.premium_rate_pct || 0));
    } else if (this.data.sortType === 2) {
      temp.sort((a, b) => (a.premium_rate_pct || 0) - (b.premium_rate_pct || 0));
    }
    this.setData({ list: temp });
  },

  // 3. 核心请求
  fetchData() {
    if (!this.data.isRefreshing) wx.showLoading({ title: '正在同步数据...' });
    
    wx.request({
      url: `http://47.253.230.255:8000/api/data?type=${this.data.currentTab}`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        // 🛠️ 调试日志：如果页面还是空白，请看控制台打印的内容
        console.log("API 返回全量内容:", res.data);

        // 兼容处理：确保能拿到数组
        const dataArray = res.data && res.data.data ? res.data.data : [];
        
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          console.log(`成功获取 ${dataArray.length} 条数据`);
          this.setData({ list: dataArray }, () => {
            this.applySort();
          });
        } else {
          console.warn("收到的数据列表为空，请检查 Mac 端推送");
          this.setData({ list: [] });
        }
      },
      fail: (err) => {
        console.error("请求彻底失败，请检查是否开启了'不校验域名':", err);
        wx.showToast({ title: '网络连接失败', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isRefreshing: false });
      }
    });
  },

  onPullDownRefresh() {
    this.setData({ isRefreshing: true }, () => this.fetchData());
  },

  goToCalc(e) {
    const dataStr = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item));
    wx.navigateTo({ url: `/pages/calc/calc?data=${dataStr}` });
  }
})