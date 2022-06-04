const dummyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at risus eu odio fermentum dignissim id sed ante. Mauris non lorem eget dui commodo ullamcorper. In volutpat, nulla quis tempus auctor, libero ex auctor sem, vitae tempus eros metus ac quam. Nullam ut ultricies libero. Donec at purus aliquam, mollis arcu vitae, laoreet lectus. Nam sit amet egestas augue, vitae viverra nisi. Pellentesque id nisi interdum, sagittis enim vel, ultricies lorem. Mauris lacinia justo eget sem commodo condimentum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nullam commodo faucibus dictum. Nam interdum, lacus vitae interdum cursus, tortor nisi viverra metus, sit amet euismod dolor orci ac augue. Vestibulum velit ligula, eleifend sit amet nibh a, facilisis lacinia enim. Donec metus justo, tristique quis dolor ut, sagittis rhoncus lorem. Vestibulum vulputate, leo in pulvinar accumsan, ante est iaculis lacus, vitae pulvinar lorem magna vitae sapien. Morbi molestie velit id risus vulputate pulvinar. Vestibulum aliquet elementum augue, auctor tincidunt mi maximus eget.';

function fetchData(pageSize) {
  for (let i = 0; i < pageSize; i++) {
    const dataItem = dummyText.substring(0, Math.round(20 + Math.random() * dummyText.length) * 0.3);
    const length = data.push(dataItem);
    renderItem(dataItem, length - 1);
  }
}

const virtualScroller = new VirtualScroller({
  element: '#virtual-scroller',
  height: '80vh',
  rowHeight: 60, // px
  pageSize: 100,
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