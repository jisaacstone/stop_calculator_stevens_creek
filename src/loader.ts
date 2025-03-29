export const hide = () => {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) {
    loaderEl.hidden = true;
  }
}

export const withLoader = (fn: () => Promise<object | void | undefined>) => {
  const loaderEl = document.getElementById('loader');
  if (loaderEl) {
    loaderEl.hidden = false;
    console.log('loading');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(fn().finally(() => {
          console.log('hiding');
          loaderEl.hidden = true;
        }));
      }, 10);
    });
  }
}
