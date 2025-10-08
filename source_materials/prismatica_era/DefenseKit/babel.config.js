/**
 * Babel configuration for DefenseKit Consciousness-Stealth Enterprise
 * ES modules support for Jest testing
 */

export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'auto'
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          },
          modules: 'commonjs'
        }]
      ]
    }
  }
};