import { transform } from 'sucrase';

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const { source } = await nextLoad(url, { ...context, format: 'module' });
    const code = typeof source === 'string' ? source : Buffer.from(source).toString('utf-8');
    const transformed = transform(code, {
      transforms: ['typescript', 'jsx'],
      jsxRuntime: 'automatic',
      filePath: url,
    }).code;
    return {
      format: 'module',
      shortCircuit: true,
      source: transformed,
    };
  }
  return nextLoad(url, context);
}
