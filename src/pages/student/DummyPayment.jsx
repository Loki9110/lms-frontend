import { Button } from "@/components/ui/button";
import { useRequestAccessMutation, useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { Loader2, Copy, Check, AlertCircle, ChevronLeft, QrCode, Phone, Camera, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DummyPayment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [requestAccess] = useRequestAccessMutation();
  const { data: courseData, isLoading } = useGetCourseDetailWithStatusQuery(courseId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [goBackEnabled, setGoBackEnabled] = useState(false);
  const whatsappNumber = "+91961354499"; // The correct WhatsApp number

  // Enable the Go Back button after 5 seconds to ensure users read instructions
  useEffect(() => {
    const timer = setTimeout(() => {
      setGoBackEnabled(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRequestAccess = async () => {
    try {
      setIsSubmitting(true);
      await requestAccess(courseId).unwrap();
      toast.success("Payment information sent! Waiting for admin approval");
      navigate(`/payment-request/${courseId}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit payment request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello, I would like to purchase the course: ${courseData?.course?.courseTitle}\nPrice: ₹${courseData?.course?.coursePrice || 0}\n\nI have made the payment and attached the screenshot.`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  if (isLoading || !courseData?.course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading payment details...</span>
      </div>
    );
  }
  
  const { course } = courseData;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button - initially disabled */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/course-detail/${courseId}`)}
          className="mb-6 group"
          disabled={!goBackEnabled}
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go Back to Course
          {!goBackEnabled && <span className="ml-2 text-xs text-gray-500">(available in a few seconds)</span>}
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header with prominent course name */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h1 className="text-2xl md:text-3xl font-bold">{course.courseTitle}</h1>
            <p className="text-blue-100 mt-1">Complete your payment to access this course</p>
          </div>
          
          {/* Price display - extra large and prominent */}
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="text-center">
              <p className="text-lg text-blue-700 font-medium">Course Price</p>
              <h2 className="text-5xl font-bold text-blue-800 my-2">₹{course.coursePrice || 0}</h2>
              <p className="text-sm text-blue-600">One-time payment • Lifetime access</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left column - Payment instructions */}
              <div className="lg:w-7/12 space-y-6">
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-800">Payment Instructions</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">1</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Open your UPI app (PhonePe, Google Pay, etc.)</p>
                        <p className="text-gray-600 mt-1">Choose any UPI app where you have an active account</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">2</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Scan the QR code or enter UPI ID</p>
                        <p className="text-gray-600 mt-1">Scan the QR code shown on this page with your app</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">3</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Pay exactly ₹{course.coursePrice || 0}</p>
                        <p className="text-gray-600 mt-1">Enter the exact amount shown above. No more, no less.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">4</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Take a screenshot of successful payment</p>
                        <div className="flex items-center mt-1 text-gray-600">
                          <Camera className="h-4 w-4 mr-1" />
                          <span>This is necessary proof of your payment</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">5</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Send screenshot via WhatsApp</p>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium">WhatsApp Number:</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="flex-1 bg-gray-100 py-2 px-3 rounded-l-md text-base font-mono overflow-hidden overflow-ellipsis">
                              {whatsappNumber}
                            </div>
                            <button 
                              onClick={() => copyToClipboard(whatsappNumber)}
                              className="bg-gray-200 hover:bg-gray-300 py-2 px-3 transition-colors"
                              title="Copy number"
                            >
                              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                            </button>
                            <button 
                              onClick={openWhatsApp}
                              className="bg-green-500 hover:bg-green-600 py-2 px-3 rounded-r-md text-white transition-colors"
                              title="Open WhatsApp"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 font-bold">6</div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">Wait for admin verification</p>
                        <div className="flex items-center mt-1 text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Approval usually takes 1-2 hours during business hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Important notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-amber-800 font-medium">IMPORTANT</p>
                    <p className="text-amber-700 mt-1">
                      Your access will ONLY be granted after admin verification of your payment. 
                      Do not close this page until you've completed all steps above.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right column - QR Code */}
              <div className="lg:w-5/12 flex flex-col items-center justify-start bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h3 className="text-center text-xl font-bold mb-6 text-gray-800">Scan to Pay ₹{course.coursePrice || 0}</h3>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
                  {/* Placeholder for QR code - replace with actual image later */}
                  <div className="w-full max-w-[250px] h-[250px] bg-gray-100 flex flex-col items-center justify-center mx-auto relative">
                    <QrCode className="w-24 h-24 text-gray-400" />
                    <p className="text-gray-500 mt-2">QR Code for Payment</p>
                    <p className="absolute bottom-2 text-xs text-gray-400">UPI ID: yourpaytm@bank</p>
                  </div>
                </div>
                
                <div className="space-y-4 w-full">
                  <Button
                    onClick={handleRequestAccess}
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "I&apos;ve Made the Payment"
                    )}
                  </Button>
                  
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    Send Screenshot via WhatsApp
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  By clicking &quot;I&apos;ve Made the Payment&quot;, you confirm that you&apos;ve completed payment and sent screenshot to admin.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DummyPayment; 