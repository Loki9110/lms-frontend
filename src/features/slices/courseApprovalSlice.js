import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courseApproval: null,
  notifications: [],
};

const courseApprovalSlice = createSlice({
  name: 'courseApproval',
  initialState,
  reducers: {
    setCourseApproval: (state, action) => {
      state.courseApproval = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { setCourseApproval, addNotification, clearNotifications } = courseApprovalSlice.actions;
export default courseApprovalSlice.reducer; 