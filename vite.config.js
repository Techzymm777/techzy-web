import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
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
