// Amplitude Analytics + Session Replay — initialised once client-side
import * as amplitude from 'https://unpkg.com/@amplitude/unified@latest/dist/esm/index.js';

amplitude.initAll('78e7be51a3d5672edae8cce7d6960b7e', {
  analytics: { autocapture: true },
  sessionReplay: { sampleRate: 1 },
});
