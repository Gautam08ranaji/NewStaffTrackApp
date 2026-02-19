// types/redux-persist.d.ts
declare module 'redux-persist/integration/react' {
  import { ComponentType, ReactNode } from 'react';
    import { Persistor } from 'redux-persist';

  interface PersistGateProps {
    loading?: ReactNode | null;
    persistor: Persistor;
    children?: ReactNode;
  }

  export const PersistGate: ComponentType<PersistGateProps>;
}
