import path from 'path'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    path.join(path.dirname(require.resolve('coach-ui')), '**/*.{ts,tsx,js,jsx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
