import path from 'path';

const config = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(import.meta.dirname, 'dist'),
    module: true,
  },
  mode: 'production',
  target: 'node20',
  experiments: {
    outputModule: true,
  },
};

export default config;
