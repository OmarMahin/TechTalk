import { configureStore } from '@reduxjs/toolkit'
import activeChatUser from './Slice/activeChatUser'

export default configureStore({
  reducer: {
    activeChat: activeChatUser  ,
  },
})