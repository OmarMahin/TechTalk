import { configureStore } from '@reduxjs/toolkit'
import activeChatUser from './Slice/activeChatUser'
import notificationSlice from './Slice/notificationSlice'

export default configureStore({
  reducer: {
    activeChat: activeChatUser  ,
    notification: notificationSlice
  },
})