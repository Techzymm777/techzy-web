// Amplitude Analytics + Session Replay
// Loaded once client-side via CDN — do not import this server-side
(function () {
  // Prevent double-initialisation
  if (window._amplitudeInitialised) return;
  window._amplitudeInitialised = true;

  // Load Amplitude Browser SDK v2 from CDN
  var script = document.createElement('script');
  script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz';
  script.type = 'text/javascript';

  script.onload = function () {
    // Init without Session Replay first to ensure core analytics fires
    window.amplitude.init('78e7be51a3d5672edae8cce7d6960b7e', {
      autocapture: {
        pageViews: true,
        sessions: true,
        formInteractions: true,
        fileDownloads: true,
        elementInteractions: true,
      },
      defaultTracking: true,
    });

    // Attempt to load Session Replay (non-blocking)
    var srScript = document.createElement('script');
    srScript.src = 'https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.6.22-min.js.gz';
    srScript.type = 'text/javascript';
    srScript.onload = function () {
      try {
        var sessionReplayTracking = window.sessionReplayPlugin.plugin({ sampleRate: 1 });
        window.amplitude.add(sessionReplayTracking);
      } catch (e) {
        console.warn('Amplitude Session Replay failed to load', e);
      }
    };
    document.head.appendChild(srScript);
  };

  document.head.appendChild(script);
})();
