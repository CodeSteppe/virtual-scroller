function throttle(fn, wait) {
  let lastTime = 0;
  let timer;
  return function (...args) {
    function run() {
      const now = new Date().valueOf();
      if (now - lastTime > wait) {
        fn.apply(this, args);
        lastTime = now;
      }
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(run, wait);
    run();
  }
}

class VirtualScroller {
  constructor({
    element,
    height,
    rowHeight,
    pageSize,
    buffer,
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
    this.pageSize = pageSize || 50;
    this.buffer = buffer || 10;
    this.renderItem = renderItem;
    this.loadMore = loadMore;
    this.data = [];

    // create content box
    const contentBox = document.createElement('div');
    this.contentBox = contentBox;
    this.scroller.append(contentBox);

    this.scroller.style.height = typeof height === 'number' ? height + 'px' : height;

    this.#loadInitData();
    this.scroller.addEventListener('scroll', throttle(this.#handleScroll, 150));
  }

  #topHiddenCount = 0;
  #bottomHiddenCount = 0;
  #scrollTop = 0;
  #paddingTop = 0;
  #paddingBottom = 0;
  #lastVisibleItemIndex = 0;

  #loadInitData() {
    const scrollerRect = this.scroller.getBoundingClientRect();
    const minCount = Math.ceil(scrollerRect.height / this.rowHeight);
    const page = Math.ceil(minCount / this.pageSize);
    const newData = this.loadMore(page * this.pageSize);
    this.data.push(...newData);
    this.#renderNewData(newData);
  }

  #renderRow(item) {
    const rowContent = this.renderItem(item);
    const row = document.createElement('div');
    row.dataset.index = item
    row.style.height = this.rowHeight + 'px';
    row.appendChild(rowContent)
    return row;
  }

  #renderNewData(newData) {
    newData.forEach(item => {
      this.contentBox.append(this.#renderRow(item));
    });
  }

  #handleScroll = (e) => {
    const { clientHeight, scrollHeight, scrollTop } = e.target;
    if (scrollHeight - (clientHeight + scrollTop) < 40) {
      console.log('load more');
      const newData = this.loadMore(this.pageSize);
      this.data.push(...newData);
    }
    const direction = scrollTop > this.#scrollTop ? 1 : -1;
    this.#toggleTopItems(direction);
    this.#toggleBottomItems(direction);
    this.#scrollTop = scrollTop;
    console.log({
      direction,
      topHiddenCount: this.#topHiddenCount,
      lastVisibleItemIndex: this.#lastVisibleItemIndex
    });
  }

  #toggleTopItems = (direction) => {
    const { scrollTop } = this.scroller;
    const firstVisibleItemIndex = Math.floor(scrollTop / this.rowHeight);
    const firstExistingItemIndex = Math.max(0, firstVisibleItemIndex - this.buffer);
    const rows = this.contentBox.children;
    // replace invisible top items with padding top
    if (direction === 1) {
      for (let i = this.#topHiddenCount; i < firstExistingItemIndex; i++) {
        if (rows[0]) rows[0].remove();
      }
    }
    // restore hidden top items
    if (direction === -1) {
      for (let i = this.#topHiddenCount - 1; i >= firstExistingItemIndex; i--) {
        const item = this.data[i];
        const row = this.#renderRow(item);
        this.contentBox.prepend(row);
      }
    }
    this.#topHiddenCount = firstExistingItemIndex;
    this.#paddingTop = this.#topHiddenCount * this.rowHeight;
    this.contentBox.style.paddingTop = this.#paddingTop + 'px';
  }

  #toggleBottomItems = (direction) => {
    const { scrollTop, clientHeight } = this.scroller;
    const lastVisibleItemIndex = Math.floor((scrollTop + clientHeight) / this.rowHeight);
    const lastExistingItemIndex = lastVisibleItemIndex + this.buffer;
    this.#lastVisibleItemIndex = lastVisibleItemIndex;
    const rows = [...this.contentBox.children];
    // replace invisible bottom items with padding bottom
    if (direction === -1) {
      for (let i = lastExistingItemIndex + 1; i <= this.data.length; i++) {
        const row = rows[i - this.#topHiddenCount];
        if (row) row.remove();
      }
    }
    // restore hidden bottom items
    if (direction === 1) {
      for (let i = this.#topHiddenCount + rows.length; i <= lastExistingItemIndex; i++) {
        const item = this.data[i];
        if (!item) break;
        const row = this.#renderRow(item);
        this.contentBox.append(row);
      }
    }
    this.#bottomHiddenCount = Math.max(0, this.data.length - (this.#topHiddenCount + this.contentBox.children.length) - this.buffer);
    this.#paddingBottom = this.#bottomHiddenCount * this.rowHeight;
    this.contentBox.style.paddingBottom = this.#paddingBottom + 'px';
  }
}