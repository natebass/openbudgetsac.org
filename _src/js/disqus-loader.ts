/**
 * Loads the Disqus embed script for pages that include a configured thread node.
 */
(() => {
  const thread = document.getElementById('disqus_thread');
  if (!thread) {
    return;
  }

  const shortname =
    thread.getAttribute('data-disqus-shortname') || 'openbudgetsac';
  const identifier = thread.getAttribute('data-disqus-identifier');
  const existing = document.querySelector('script[data-disqus-loader="true"]');
  if (existing) {
    return;
  }

  if (identifier) {
    (window as Window & {disqus_identifier?: string}).disqus_identifier =
      identifier;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://${shortname}.disqus.com/embed.js`;
  script.setAttribute('data-disqus-loader', 'true');
  (document.head || document.body).appendChild(script);
})();
