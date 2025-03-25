import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // You'll need to install framer-motion
import { CheckCircle, Clock, ArrowLeft, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import confetti from 'canvas-confetti'; // You'll need to install canvas-confetti

const PaymentRequestPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data } = useGetCourseDetailWithStatusQuery(courseId);
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    // Get user name from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'Student');
  }, []);

  const handleBackToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  // Function to trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-indigo-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Access Request Submitted</CardTitle>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="h-6 w-6" />
              </motion.div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-2">
            <div className="flex flex-col items-center text-center space-y-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center"
                onClick={triggerConfetti}
              >
                <Bell className="h-12 w-12 text-orange-500" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Hi {userName}!</h3>
                <p className="text-gray-600">
                  Your request for access to <span className="font-semibold text-indigo-600">{data?.course?.courseTitle || 'this course'}</span> has been received.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-amber-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Timeline
                  </h4>
                  <p className="text-sm text-amber-600 mt-1">
                    Our admin will review your request within <span className="font-bold">1-2 hours</span>. 
                    You'll receive a notification once your course is activated.
                  </p>
                </div>
              </div>
              
              <motion.div 
                className="flex items-center gap-2 w-full bg-blue-50 border border-blue-100 rounded-lg p-3"
                animate={{ 
                  boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 8px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  We'll notify you via email and on the platform when your access is granted.
                </p>
              </motion.div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 pb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={handleBackToCourse}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-6 relative overflow-hidden"
                disabled
              >
                <span className="relative z-10">Waiting</span>
                <motion.span 
                  className="absolute inset-0 bg-orange-400"
                  animate={{ 
                    x: ["-100%", "100%"] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "linear" 
                  }}
                />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
        
        <motion.p 
          className="text-center text-sm text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Have questions? Contact our support team for assistance.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PaymentRequestPage; 