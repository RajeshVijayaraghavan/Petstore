import { defineConfig } from 'orval'

export default defineConfig({
  petstore: {
    input: {
      target: 'https://petstore3.swagger.io/api/v3/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/model',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
