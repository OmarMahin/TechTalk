import { createSlice } from '@reduxjs/toolkit'

export const activeChatUser = createSlice({
  name: 'activeChat',
  initialState: {
    user: '404',
  },
  reducers: {
    activeChat: (state, action) => {
      state.user = action.payload
    },
  },
})

export const { activeChat} = activeChatUser.actions

export default activeChatUser.reducer