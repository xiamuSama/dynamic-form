import { createContext } from 'react';
import { IContextValue } from './types';

const Context = createContext<IContextValue>({ enums: {} });

export default Context;
