import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRequestAccessMutation, useGetCourseDetailWithStatusQuery } from '../../features/api/purchaseApi';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const PaymentRequest = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { course: courseProp } = location.state || {};
  
  const { data: courseData, refetch: refetchStatus } = useGetCourseDetailWithStatusQuery(courseId, {
    skip: !courseId,
    pollingInterval: 5000 // Poll every 5 seconds for status updates
  });

  // Handle navigation for approved status using useEffect
  useEffect(() => {
    if (courseData?.status === 'approved') {
      // Show success toast and navigate to course detail
      toast.success('Course access granted!');
      // Add a small delay to ensure the toast is displayed before navigation
      const timer = setTimeout(() => {
        navigate(`/course/${courseId}`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [courseData?.status, courseId, navigate]);

  const [requestAccess] = useRequestAccessMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ADMIN_WHATSAPP = '+919613544999';

  // Use course data from API if not provided in location state
  const course = courseProp || courseData?.course;

  const handleRequestAccess = async () => {
    if (!courseId) {
      toast.error('Course information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await requestAccess({ courseId }).unwrap();
      if (result.success) {
        toast.success('Access request submitted successfully! Please wait for admin approval.');
        await refetchStatus();
        // Don't navigate away, let the status update handle the UI change
      }
    } catch (err) {
      console.error('Request access error:', err);
      const errorMessage = err?.data?.message || 'Failed to submit access request';
      toast.error(errorMessage);
      
      // If it's already pending, show the waiting page
      if (errorMessage.includes('pending request')) {
        await refetchStatus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hello, I would like to request access to the course: ${course?.courseTitle}\nPrice: ₹${course?.coursePrice}\n\nI have made the payment and attached the screenshot.`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (!course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="mt-2">Course information not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show waiting page for pending requests
  if (courseData?.status === 'pending') {
    // Get user name from localStorage or state
    const userName = JSON.parse(localStorage.getItem('user'))?.name || 'Student';
    
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          {/* Top wave decoration */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264.888-.14 1.24.78 1.854.494 2.454.494 1.184 0 2.788-.195 4.583-1.49.445-.76.89-.145 1.336-.21.447.065.893.134 1.338.213 1.796 1.295 3.4 1.49 4.583 1.49.6 0 1.214-.287 2.454-.494.17-.123.53-.257.887-.387l1.766 1.078c-2.435.983-4.9 1.486-6.616 1.486-1.806 0-3.47-.507-5.09-1.52-1.62 1.013-3.286 1.52-5.09 1.52-1.716 0-4.18-.503-6.615-1.486l1.766-1.078zm61.824-1.092c-.358.132-.722.264-.89.39-1.24.78-1.854.493-2.454.493-1.184 0-2.788-.195-4.583-1.49-.445-.075-.89-.143-1.336-.21-.447.066-.894.133-1.34.21-1.794 1.296-3.4 1.49-4.582 1.49-.6 0-1.214-.285-2.454-.492-.17-.123-.53-.26-.887-.39l-1.766 1.09c2.435.983 4.9 1.486 6.616 1.486 1.806 0 3.47-.507 5.09-1.52 1.62 1.013 3.285 1.52 5.09 1.52 1.717 0 4.182-.503 6.617-1.486l-1.767-1.09zm-55.606 1.092c-.358.132-.722.264-.89.39-1.24.78-1.854.493-2.454.493-1.184 0-2.788-.195-4.583-1.49-.445-.077-.89-.144-1.336-.21-.447.066-.894.133-1.34.21-1.794 1.296-3.4 1.49-4.582 1.49-.6 0-1.214-.285-2.454-.492-.17-.123-.53-.26-.887-.39l-1.766 1.09c2.435.983 4.9 1.486 6.616 1.486 1.806 0 3.47-.507 5.09-1.52 1.62 1.013 3.285 1.52 5.09 1.52 1.717 0 4.182-.504 6.617-1.488l-1.767-1.09zm9.968-5.25c-.357.132-.72.264-.89.39-1.238.78-1.852.494-2.452.494-1.184 0-2.788-.195-4.583-1.49-.445-.077-.89-.144-1.336-.212-.447.068-.892.135-1.338.213-1.796 1.295-3.4 1.49-4.583 1.49-.6 0-1.214-.286-2.454-.493-.17-.123-.53-.26-.887-.39L14.08 15.72c2.433.984 4.9 1.486 6.614 1.486 1.807 0 3.47-.505 5.09-1.518 1.62 1.013 3.286 1.518 5.092 1.518 1.716 0 4.18-.502 6.615-1.486L35.72 14.65zM21.184 9.91c-.357.132-.72.264-.89.39-1.238.78-1.852.493-2.452.493-1.184 0-2.788-.195-4.583-1.49-.445-.077-.89-.144-1.336-.21-.447.066-.892.133-1.338.21-1.796 1.296-3.4 1.49-4.583 1.49-.6 0-1.214-.285-2.454-.492-.17-.123-.53-.26-.887-.39L1.894 11c2.433.983 4.9 1.486 6.614 1.486 1.807 0 3.47-.507 5.09-1.52 1.62 1.013 3.286 1.52 5.092 1.52 1.716 0 4.18-.504 6.615-1.488L23.53 9.91zm61.824-1.092c-.358.132-.722.264-.89.39-1.24.78-1.854.493-2.454.493-1.184 0-2.788-.195-4.583-1.49-.445-.077-.89-.144-1.336-.21-.447.066-.894.133-1.34.21-1.794 1.296-3.4 1.49-4.582 1.49-.6 0-1.214-.285-2.454-.492-.17-.123-.53-.26-.887-.39l-1.766 1.09c2.435.983 4.9 1.486 6.616 1.486 1.806 0 3.47-.507 5.09-1.52 1.62 1.013 3.285 1.52 5.09 1.52 1.717 0 4.182-.504 6.617-1.488l-1.767-1.09zm-55.606 1.092c-.358.132-.722.264-.89.39-1.24.78-1.854.493-2.454.493-1.184 0-2.788-.195-4.583-1.49-.445-.077-.89-.144-1.336-.21-.447.066-.894.133-1.34.21-1.794 1.296-3.4 1.49-4.582 1.49-.6 0-1.214-.285-2.454-.492-.17-.123-.53-.26-.887-.39L7.107 9.91c2.435.983 4.9 1.486 6.616 1.486 1.806 0 3.47-.507 5.09-1.52 1.62 1.013 3.285 1.52 5.09 1.52 1.717 0 4.182-.504 6.617-1.488l-1.767-1.09zm9.968-5.248c-.357.13-.72.264-.89.388-1.238.78-1.852.494-2.452.494-1.184 0-2.788-.195-4.583-1.49-.445-.075-.89-.143-1.336-.21-.447.067-.892.134-1.338.212-1.796 1.294-3.4 1.488-4.583 1.488-.6 0-1.214-.286-2.454-.492-.17-.124-.53-.26-.887-.39l-1.766 1.08c2.433.983 4.9 1.487 6.614 1.487 1.807 0 3.47-.507 5.09-1.52 1.62 1.012 3.286 1.52 5.092 1.52 1.716 0 4.18-.504 6.615-1.488l-1.726-1.08z' fill='%23fff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
              }}></div>
            </div>
            <svg className="absolute bottom-0 left-0 right-0 w-full text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="currentColor" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,229.3C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="px-8 pt-6 pb-10 relative">
            {/* Greeting with user name */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 text-blue-600 rounded-full relative overflow-hidden">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {/* Animated circle */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse opacity-50"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Hello {userName}!</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Your access request has been received and is being processed.
              </p>
            </div>
            
            {/* Course info and animation */}
            <div className="bg-white rounded-xl border border-blue-100 p-5 mb-8 shadow-sm relative overflow-hidden">
              {/* Animated dots background */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-100 text-orange-600 p-2 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Course Details</h2>
                </div>
                
                <div className="pl-10">
                  <h3 className="text-xl font-bold text-orange-500 mb-1">{course.courseTitle}</h3>
                  {course.creator && (
                    <p className="text-sm text-gray-500">
                      by {course.creator.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status and timeline */}
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-1 bg-amber-50 rounded-xl border border-amber-100 p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded animate-pulse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-amber-800">Processing</h3>
                </div>
                <p className="text-sm text-amber-700 pl-10">
                  Our admin team will review your request within <span className="font-bold">1-2 hours</span>
                </p>
              </div>
              
              <div className="flex-1 bg-blue-50 rounded-xl border border-blue-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-800">Notification</h3>
                </div>
                <p className="text-sm text-blue-700 pl-10">
                  You&apos;ll receive a notification once your access is approved
                </p>
              </div>
        </div>
            
            {/* Action button */}
            <div className="flex justify-center">
        <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="group relative inline-flex items-center px-8 py-3 overflow-hidden rounded-full bg-indigo-600 text-white shadow-lg transition-all duration-300 hover:bg-indigo-700"
              >
                {/* Button background animation */}
                <span className="absolute left-0 top-0 h-full w-0 bg-white opacity-10 transition-all duration-300 group-hover:w-full"></span>
                
                <svg className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
          Back to Course
        </button>
            </div>
          </div>
          
          {/* Floating animated elements */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-12 -left-8 w-16 h-16 bg-indigo-500 rounded-full opacity-10 animate-ping" style={{animationDuration: '3s'}}></div>
        </div>
      </div>
    );
  }

  // For approved status, we'll just render a loading state
  // Navigation will happen in the useEffect above
  if (courseData?.status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Processing your course access...</h2>
          <p className="text-gray-500">Redirecting to your course</p>
          <div className="mt-4 w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const isDeclined = courseData?.status === 'declined';

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Course Access Request</h1>
      
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-orange-500 mb-2">
          ₹{course.coursePrice}
        </div>
        {isDeclined && (
          <div className="text-xl text-red-600 font-semibold mb-4">
            Previous access request was declined
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Step 1: QR Code Payment */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
            Pay Course Amount via QR Code
          </h3>
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/qr-code.jpg" 
              alt="Payment QR Code"
              className="w-48 h-48 border-2 border-gray-200 rounded-lg"
            />
            <p className="text-gray-600 text-sm">
              Scan this QR code to pay ₹{course.coursePrice}
            </p>
          </div>
        </div>

        {/* Step 2: WhatsApp Message */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
            Send Payment Screenshot on WhatsApp
          </h3>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Take a screenshot of your payment and send it to our admin on WhatsApp
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center mx-auto"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Message on WhatsApp ({ADMIN_WHATSAPP})
            </button>
          </div>
        </div>

        {/* Step 3: Submit Request */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
            Submit Access Request
          </h3>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              After sending the payment screenshot, click below to submit your access request
            </p>
            <button
              onClick={handleRequestAccess}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                isDeclined ? 'Request Access Again' : 'Submit Access Request'
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="text-gray-600 hover:text-gray-800"
          >
            Go Back to Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest; 