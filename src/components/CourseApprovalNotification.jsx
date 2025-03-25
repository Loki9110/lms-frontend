import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CourseApprovalNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    courseApproval, 
    showNotification, 
    autoEnrollCountdown, 
    enrollmentComplete 
  } = useSelector(state => state.notifications);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (showNotification && autoEnrollCountdown > 0) {
      timer = setTimeout(() => {
        dispatch({ type: 'notifications/updateCountdown' });
      }, 1000);
    }
    
    if (autoEnrollCountdown === 0 && !enrollmentComplete) {
      dispatch({ type: 'notifications/setEnrollmentComplete' });
      
      // Navigate to course progress page
      if (courseApproval?.courseId) {
        setTimeout(() => {
          navigate(`/course/${courseApproval.courseId}/learn`);
          dispatch({ type: 'notifications/hideNotification' });
        }, 2000);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showNotification, autoEnrollCountdown, enrollmentComplete, dispatch, navigate, courseApproval]);

  // If no notification to show, render nothing
  if (!showNotification) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative animate-bounce-once">
        <div className="absolute -top-3 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-wave"></div>
        
        <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700">
          {enrollmentComplete ? 'Enrollment Complete!' : 'Congratulations!'}
        </h2>
        
        <div className="text-center mb-6">
          {!enrollmentComplete ? (
            <>
              <p className="text-gray-700 mb-2">
                You&apos;ve been approved for access to:
              </p>
              <p className="text-xl font-semibold text-indigo-600 mb-4">
                {courseApproval?.courseTitle}
              </p>
              <p className="text-gray-600">
                You&apos;ll be automatically enrolled in {autoEnrollCountdown} seconds...
              </p>
            </>
          ) : (
            <p className="text-gray-700">
              You&apos;ve been enrolled in <span className="font-semibold">{courseApproval?.courseTitle}</span>. 
              Redirecting to your course...
            </p>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => dispatch({ type: 'notifications/hideNotification' })}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition"
          >
            Dismiss
          </button>
          
          {!enrollmentComplete && (
            <button
              onClick={() => {
                dispatch({ type: 'notifications/setEnrollmentComplete' });
                navigate(`/course/${courseApproval.courseId}/learn`);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition"
            >
              Continue Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseApprovalNotification; 