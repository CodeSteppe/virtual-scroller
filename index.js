const virtualScroller = new VirtualScroller({
  element: '#virtual-scroller',
  height: '80vh',
  rowHeight: 60, // px
  pageSize: 100,
  buffer: 10,
  renderItem: function (dataItem) {
    const div = document.createElement('div');
    div.classList.add('row-content');
    div.textContent = dataItem;
    return div;
  },
  loadMore: function (pageSize) {
    const data = [];
    for (let i = 0; i < pageSize; i++) {
      const dataItem = `I'm number ${this.data.length + i}`;
      data.push(dataItem);
    }
    return data;
  }
});

const areaSelector = new AreaSelector({
  element: document.querySelector('#virtual-scroller'),
  selectableTargetSelector: '.row',
  dataSetKeyForSelection: 'index',
  onSelectionChange: (selectedIds) => {
    console.log('selectedIds', selectedIds);
  }
});