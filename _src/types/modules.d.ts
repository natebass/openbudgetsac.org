declare module '@axe-core/react' {
  import type * as ReactNamespace from 'react';

  const enableAxe: (
    react: typeof ReactNamespace,
    reactDom: unknown,
    timeout?: number,
  ) => void;

  export default enableAxe;
}
