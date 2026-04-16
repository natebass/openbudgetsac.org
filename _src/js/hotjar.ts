/**
 * Loads Hotjar for production pages that opt into the legacy tracking snippet.
 */
(() => {
  const head = document.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  const state = window as Window & {
    hj?: (...args: Array<any>) => void;
    _hjSettings?: {hjid: number; hjsv: number};
  };

  state.hj =
    state.hj ||
    ((...args: Array<any>) => {
      const queueOwner = state.hj as ((...items: Array<any>) => void) & {
        q?: Array<IArguments | Array<any>>;
      };
      queueOwner.q = queueOwner.q || [];
      queueOwner.q.push(args);
    });
  state._hjSettings = {hjid: 1277223, hjsv: 6};

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://static.hotjar.com/c/hotjar-${state._hjSettings.hjid}.js?sv=${state._hjSettings.hjsv}`;
  head.appendChild(script);
})();
