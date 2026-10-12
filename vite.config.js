import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    // The first test in a file pays for cold module imports (main.js pulls in
    // the whole app); under a full parallel run that can exceed the 5s default.
    testTimeout: 15000,
    environmentOptions: {
      // Unit tests never touch the network: rendered iframes (map embeds),
      // scripts (Amplitude CDN) and stylesheets stay unloaded.
      happyDOM: {
        url: 'http://localhost:5198/',
        settings: {
          disableIframePageLoading: true,
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableCSSFileLoading: true,
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    // happy-dom reports each skipped map iframe; that's expected noise.
    onConsoleLog: (log) => !log.includes('Iframe page loading is disabled'),
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      reporter: ['text', 'html'],
    },
  },
})
