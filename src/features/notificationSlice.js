import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courseApproval: null,
  showNotification: false,
  autoEnrollCountdown: 10,
  enrollmentComplete: false
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showCourseApproval: (state, action) => {
      state.courseApproval = action.payload;
      state.showNotification = true;
      state.autoEnrollCountdown = 10;
      state.enrollmentComplete = false;
    },
    updateCountdown: (state) => {
      if (state.autoEnrollCountdown > 0) {
        state.autoEnrollCountdown -= 1;
      }
    },
    setEnrollmentComplete: (state) => {
      state.enrollmentComplete = true;
    },
    hideNotification: (state) => {
      state.showNotification = false;
      state.courseApproval = null;
      state.autoEnrollCountdown = 10;
      state.enrollmentComplete = false;
    }
  }
});

export const { 
  showCourseApproval, 
  updateCountdown, 
  hideNotification,
  setEnrollmentComplete
} = notificationSlice.actions;

export default notificationSlice.reducer; 