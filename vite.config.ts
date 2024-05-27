import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 1339,
    open: true,
  },
  build: {
    target: 'es2017',
  },
  plugins: [
    tsConfigPaths(),
    ...VitePluginNode({
      adapter: 'nest',
      appPath: './src/main.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
    }),
  ],
  // ssr: {
  //   //server side rendering config
  //   noExternal: ['reflect-metadata/*'], // Prevent listed dependencies from being externalized for SSR.
  // },
  optimizeDeps: {
    // Vite does not work well with optionnal dependencies,
    // mark them as ignored for now
    exclude: [
      '@nestjs/microservices',
      '@nestjs/websockets',
      'cache-manager',
      'class-transformer',
      'class-validator',
      'fastify-swagger',
      'aws-sdk',
      'nock',
      'mock-aws-s3',
    ],
  },
});
