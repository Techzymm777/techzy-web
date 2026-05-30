// Amplitude Analytics + Session Replay
// Loaded once client-side via CDN — do not import this server-side
(function () {
  // Prevent double-initialisation
  if (window._amplitudeInitialised) return;
  window._amplitudeInitialised = true;

  // Load Amplitude Browser SDK v2 from CDN
  var script = document.createElement('script');
  script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz';
  script.crossOrigin = 'anonymous';

  // Load Session Replay SDK
  var srScript = document.createElement('script');
  srScript.src = 'https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.14.1-min.js.gz';
  srScript.crossOrigin = 'anonymous';

  script.onload = function () {
    document.head.appendChild(srScript);
  };

  srScript.onload = function () {
    var sessionReplayTracking = window.sessionReplayPlugin.plugin();

    window.amplitude.add(sessionReplayTracking);

    window.amplitude.init('78e7be51a3d5672edae8cce7d6960b7e', {
      autocapture: true,
    });
  };

  document.head.appendChild(script);
})();
