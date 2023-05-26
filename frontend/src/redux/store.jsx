import {configureStore} from '@reduxjs/toolkit'
import notificationsReducer from './notificationsSlice'

export default configureStore({
    reducer: {
        notifications: notificationsReducer
    },
})