function debounce(fn, wait) {
  let timer;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  }
}

class VirtualScroller {
  constructor({
    element,
    height,
    rowHeight,
    pageSize,
    renderItem,
    loadMore
  }) {
    if (typeof element === 'string') {
      this.scroller = document.querySelector(element);
    } else if (element instanceof HTMLElement) {
      this.scroller = element;
    }

    if (!this.scroller) {
      throw new Error('Invalid element');
    }

    if (!height || (typeof height !== 'number' && typeof height !== 'string')) {
      throw new Error('invalid height value');
    }

    if (!rowHeight || typeof rowHeight !== 'number') {
      throw new Error('rowHeight should be a number');
    }

    if (typeof renderItem !== 'function') {
      throw new Error('renderItem is not a function');
    }

    if (typeof loadMore !== 'function') {
      throw new Error('renderItem is not a function');
    }

    // set props
    this.height = height;
    this.rowHeight = rowHeight;
    this.pageSize = pageSize;
    this.renderItem = renderItem;
    this.loadMore = loadMore;
    this.data = [];

    // create content box
    const contentBox = document.createElement('div');
    this.contentBox = contentBox;
    this.scroller.append(contentBox);

    this.scroller.style.height = typeof height === 'number' ? height + 'px' : height;

    this.#loadInitData();
    this.scroller.addEventListener('scroll', debounce(this.#handleScroll, 200));
  }

  #loadInitData() {
    const scrollerRect = this.scroller.getBoundingClientRect();
    const minCount = Math.ceil(scrollerRect.height / this.rowHeight);
    const page = Math.ceil(minCount / this.pageSize);
    const newData = this.loadMore(page * this.pageSize);
    this.data.push(...newData);
    this.#renderNewData(newData);
  }

  #renderNewData(newData) {
    newData.forEach(item => {
      const rowContent = this.renderItem(item);
      const row = document.createElement('div');
      row.style.height = this.rowHeight + 'px';
      row.appendChild(rowContent)
      this.contentBox.append(row);
    });
  }

  #handleScroll = (e) => {
    const { clientHeight, scrollHeight, scrollTop } = e.target;
    if (scrollHeight - (clientHeight + scrollTop) < 40) {
      const newData = this.loadMore(this.pageSize);
      this.data.push(...newData);
      this.#renderNewData(newData);
    }
  }
}