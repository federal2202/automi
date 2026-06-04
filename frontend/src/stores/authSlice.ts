import {
    createSlice,
    createAsyncThunk,
    type PayloadAction
} from '@reduxjs/toolkit'

import { User } from '@/types/User'
import { api } from '@/api/axios'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    isInitialized: boolean
}

export const checkAuth = createAsyncThunk<User | null>(
    'auth/checkAuth',
     async () => {
        const response = await api.get<{ user: User | null }>('/auth/user')
        return response.data.user ?? null
  }
)


const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
}

export const syncDeviceTimezone = createAsyncThunk<
    User | null,
    void,
    { state: { auth: AuthState } }
  >('auth/syncDeviceTimezone', async (_, { getState }) => {
    const { user } = getState().auth
    if (!user) return null

    let deviceTz: string | undefined
    try {
      deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return null
    }
    if (!deviceTz || user.timezone === deviceTz) return null

    try {
      const response = await api.patch<User>('/me/timezone', { timezone: deviceTz })
      // Сливаем здесь, чтобы reducer получил уже готовый объект
      // и ничего не знал про логику слияния.
      return { ...user, ...response.data }
    } catch (err) {
      console.warn('Failed to sync device timezone', err)
      return null
    }
  })


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User | null>) {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },
        setIsAuthenticated(state, action: PayloadAction<boolean>) {
            state.isAuthenticated = action.payload
        },
        logout(state) {
            state.user = null
            state.isAuthenticated = false
        }
    },
    extraReducers: (builder) => {
    builder
        .addCase(checkAuth.pending, (state) => {
            state.isLoading = true
        })
        .addCase(checkAuth.fulfilled, (state, action) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
            state.isLoading = false
            state.isInitialized = true
        })
        .addCase(checkAuth.rejected, (state) => {
            state.user = null
            state.isAuthenticated = false
            state.isLoading = false
            state.isInitialized = true
        })
        .addCase(syncDeviceTimezone.fulfilled, (state, action) => {
            if(action.payload) {
                state.user = action.payload
            }
        })
}
})





export const { setUser, setIsAuthenticated, logout } = authSlice.actions
export const authReducer = authSlice.reducer