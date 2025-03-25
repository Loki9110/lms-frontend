import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Clock, ArrowLeft, LucideLoader2, Check, AlertTriangle, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const PaymentRequestPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetCourseDetailWithStatusQuery(courseId, {
    pollingInterval: 30000 // Poll every 30 seconds for status updates
  });
  
  // Get user information from Redux state or localStorage
  const user = useSelector(state => state.auth.user) || {};
  const studentName = user?.name || "Student";
  const [countdown, setCountdown] = useState(0);
  
  // Setup polling for status updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);
  
  // Handle approval status change
  useEffect(() => {
    if (data?.status === 'purchased') {
      toast.success('Your course access has been approved!');
      setTimeout(() => {
        navigate(`/course-progress/${courseId}`);
      }, 2000);
    }
  }, [data?.status, courseId, navigate]);
  
  // Simulate countdown for next status check
  useEffect(() => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [data]);
  
  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const handleOpenWhatsApp = () => {
    // Default WhatsApp number - replace with actual admin contact
    const whatsappNumber = "91961354499";
    const message = encodeURIComponent(
      `Hello, I sent a payment for course ID: ${courseId}. Checking on my approval status.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <span>Loading payment status...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header with wave design */}
        <div className="relative bg-amber-500 pt-8 pb-16">
          <motion.div 
            className="absolute right-6 top-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-8 w-8 text-amber-100" />
          </motion.div>
          
          <div className="px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              Hello {studentName}!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-amber-100"
            >
              Your payment verification is in progress
            </motion.p>
          </div>
          
          {/* Wave SVG for design */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 32L60 32C120 32 240 32 360 37.3C480 43 600 53 720 58.7C840 64 960 64 1080 58.7C1200 53 1320 43 1380 37.3L1440 32V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V32Z" fill="white"/>
            </svg>
          </div>
        </div>
        
        {/* Content section */}
        <div className="px-6 py-6 -mt-6 relative z-10">
          {/* Status badge - prominent at the top */}
          <div className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 flex items-center justify-center mx-auto w-fit mb-6">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Clock className="h-5 w-5 text-amber-500 mr-2 inline-block" />
            </motion.div>
            <span className="font-semibold text-amber-700">Waiting for Admin Approval</span>
          </div>
        
          <div className="flex items-start space-x-4 mb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="bg-amber-100 p-3 rounded-full"
            >
              <Bell className="h-6 w-6 text-amber-600" />
            </motion.div>
            <div>
              <h2 className="font-semibold text-gray-800">Payment Verification in Progress</h2>
              <p className="mt-1 text-sm text-gray-600">
                Our admin will review your payment within <span className="font-medium text-amber-600">1-2 hours</span>
              </p>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100"
          >
            <h3 className="font-medium text-gray-700 mb-2">Course Details</h3>
            <p className="text-indigo-600 font-medium">{data?.course?.courseTitle || "Loading course..."}</p>
            {data?.course?.creator && (
              <p className="text-sm text-gray-500 mt-1">
                By {data.course.creator.name}
              </p>
            )}
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Price: <span className="font-medium text-gray-700">₹{data?.course?.coursePrice || 0}</span>
              </p>
              <div className="flex items-center">
                <p className="text-xs text-gray-500 mr-2">Next status check in:</p>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-mono">
                  {countdown}s
                </span>
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-700">What happens next?</h3>
            
            <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="bg-blue-100 rounded-full p-1.5 mt-0.5">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Admin reviews your payment screenshot</p>
                <p className="text-xs text-blue-600 mt-0.5">Our team verifies that your payment was successful</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="bg-green-100 rounded-full p-1.5 mt-0.5">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Your access is approved</p>
                <p className="text-xs text-green-600 mt-0.5">You&apos;ll be automatically redirected to your course</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="bg-red-100 rounded-full p-1.5 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">If payment verification fails</p>
                <p className="text-xs text-red-600 mt-0.5">You&apos;ll be asked to provide additional proof</p>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100"
          >
            <div className="mr-3 flex-shrink-0">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <LucideLoader2 className="h-5 w-5 text-blue-500" />
              </motion.div>
            </div>
            <p className="text-sm text-blue-700">
              You&apos;ll receive a notification when your access is granted.
              This page will automatically refresh to check for updates.
            </p>
          </motion.div>
        </div>
        
        {/* Footer with buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="ghost" 
              onClick={handleBackToCourse}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Course</span>
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={handleOpenWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-2"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              <span>Contact Admin</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-sm text-gray-500 max-w-md text-center"
      >
        Need help? Contact our support team on WhatsApp
      </motion.p>
    </div>
  );
};

export default PaymentRequestPage; 