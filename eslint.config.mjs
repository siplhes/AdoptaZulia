import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // your custom flat configs go here, for example:
  {
    // .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts
    files: [
      '**/*.vue',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
    ],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-unexpected-multiline': 'error',
      // Turn down Vue style warnings to 'warn' or 'off'
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/multi-word-component-names': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    ignores: ['**/public/'],
  }
  // {
  //   ...
  // }
)
