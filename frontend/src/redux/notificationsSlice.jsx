import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  conversations: [],
  messages: []
}

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state,action) => {

      state.conversations = action.payload.conversations
      state.messages = action.payload.messages
    },

    addNotification: (state, action) => {
      var foundConversation = false
      for(let i=0; i< state.conversations.length;i++){
        if(state.conversations[i] == action.payload.conversationId){
          console.log("we got here at least")
          state.conversations = [...state.conversations]
          state.messages = [...state.messages,action.payload.message]
          foundConversation = true
          break;
        }
      }
      if(!foundConversation){
        state.conversations.push(action.payload.conversationId)
        state.messages.push(action.payload.message)
      }
    },

    removeAllNotificationsFromConversation: (state,action) => {
      var newConversations = []
      var newMessages = []
      for(let i=0; i< state.conversations.length;i++){
        if(state.conversations[i] != action.payload.conversationId){
            newConversations.push(state.conversations[i])
        }
      }
      for(let i=0;i< state.messages.length;i++){
        if(state.messages[i].conversationId != action.payload.conversationId){
          newMessages.push(state.messages[i])
        }
      }
      state.conversations = [...newConversations]
      state.messages = [...newMessages]
    },

    removeAllNotifications: (state) => {
      state.conversations = []
      state.messages = []
    },
  },
})

// Action creators are generated for each case reducer function
export const { addNotification, removeAllNotifications, setNotifications, removeAllNotificationsFromConversation } = notificationsSlice.actions

export default notificationsSlice.reducer