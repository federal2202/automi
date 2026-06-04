'use client'

import { store } from '@/stores'
import { Provider } from 'react-redux'



export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
}