import { createSlice } from '@reduxjs/toolkit'

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    amount: 0,
    refresh: true,
  },
  reducers: {
    notification: (state, action) => {
      state.amount = action.payload
    },
    pageReload: (state, action) => {
      state.refresh = action.payload
    },
  },
})

export const { notification, pageReload} = notificationSlice.actions

export default notificationSlice.reducer