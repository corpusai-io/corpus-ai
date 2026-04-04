(function () {
  'use strict';

  // Find the script tag to read config attributes
  var scripts = document.querySelectorAll('script[data-chatbot-id]');
  var script = scripts[scripts.length - 1];
  if (!script) return;

  var chatbotId = script.getAttribute('data-chatbot-id');
  if (!chatbotId) return;

  // Resolve the widget iframe URL from the script src origin
  var scriptSrc = script.getAttribute('src') || '';
  var origin = '';
  try {
    var url = new URL(scriptSrc);
    origin = url.origin;
  } catch (_) {
    // Fallback: assume same origin
    origin = window.location.origin;
  }

  // The widget page is served by the dashboard app under /dashboard/widget/
  // In production, use the same origin. In dev, the proxy at port 3000 routes to dashboard.
  var widgetPageUrl = origin + '/dashboard/widget/' + chatbotId + '?embed=true';

  // Allow custom override via data attribute
  var customBaseUrl = script.getAttribute('data-widget-url');
  if (customBaseUrl) {
    widgetPageUrl = customBaseUrl + '/' + chatbotId;
  }

  // Configurable position
  var position = script.getAttribute('data-position') || 'right';

  // Create the iframe container (hidden by default, shown on bubble click)
  var container = document.createElement('div');
  container.id = 'corpusai-widget-container';
  container.style.cssText =
    'position:fixed;bottom:24px;' +
    (position === 'left' ? 'left:24px;' : 'right:24px;') +
    'z-index:2147483647;font-family:sans-serif;';

  // Chat bubble button
  var bubble = document.createElement('button');
  bubble.id = 'corpusai-widget-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.style.cssText =
    'width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;' +
    'background:linear-gradient(135deg,#FC5990,#AC5DE6);' +
    'box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;' +
    'justify-content:center;transition:transform 0.2s,box-shadow 0.2s;';
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  bubble.onmouseenter = function () {
    bubble.style.transform = 'scale(1.08)';
    bubble.style.boxShadow = '0 6px 24px rgba(0,0,0,0.3)';
  };
  bubble.onmouseleave = function () {
    bubble.style.transform = 'scale(1)';
    bubble.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
  };

  // Iframe (chat window)
  var iframeWrapper = document.createElement('div');
  iframeWrapper.id = 'corpusai-widget-frame';
  iframeWrapper.style.cssText =
    'display:none;position:absolute;bottom:72px;' +
    (position === 'left' ? 'left:0;' : 'right:0;') +
    'width:400px;height:600px;max-height:calc(100vh - 120px);' +
    'border-radius:16px;overflow:hidden;' +
    'box-shadow:0 8px 40px rgba(0,0,0,0.2);';

  var iframe = document.createElement('iframe');
  iframe.src = widgetPageUrl;
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
  iframe.title = 'Chat widget';
  iframeWrapper.appendChild(iframe);

  // Mobile responsive
  var mq = window.matchMedia('(max-width: 480px)');
  function applyMobile(e) {
    if (e.matches) {
      iframeWrapper.style.width = 'calc(100vw - 32px)';
      iframeWrapper.style.height = 'calc(100vh - 120px)';
      iframeWrapper.style.right = '-8px';
      iframeWrapper.style.bottom = '72px';
    } else {
      iframeWrapper.style.width = '400px';
      iframeWrapper.style.height = '600px';
      iframeWrapper.style.right = position === 'left' ? '' : '0';
      iframeWrapper.style.left = position === 'left' ? '0' : '';
      iframeWrapper.style.bottom = '72px';
    }
  }
  mq.addEventListener('change', applyMobile);
  applyMobile(mq);

  // Toggle open/close
  var isOpen = false;
  var chatIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>';
  var closeIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function toggleWidget(forceClose) {
    isOpen = forceClose ? false : !isOpen;
    iframeWrapper.style.display = isOpen ? 'block' : 'none';
    bubble.innerHTML = isOpen ? closeIcon : chatIcon;
  }

  bubble.onclick = function () { toggleWidget(); };

  // Listen for close message from the iframe (WidgetChat X button)
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'corpusai:close') {
      toggleWidget(true);
    }
  });

  // Assemble
  container.appendChild(iframeWrapper);
  container.appendChild(bubble);
  document.body.appendChild(container);
})();
