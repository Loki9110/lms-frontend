import { Button } from "@/components/ui/button";
import { useRequestAccessMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import PropTypes from 'prop-types';
import { toast } from "sonner";

const CoursePurchaseCard = ({ course }) => {
  const [requestAccess, { isLoading }] = useRequestAccessMutation();

  const handleRequestAccess = async () => {
    try {
      await requestAccess(course._id).unwrap();
      toast.success("Access request submitted successfully. Please wait for admin approval.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit access request");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-4">Course Access</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">Price:</span>
          <span className="font-semibold">₹{course.coursePrice || 0}</span>
        </div>
        
        {course.accessStatus === 'pending' ? (
          <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-md">
            <p className="font-medium">Access Request Pending</p>
            <p className="text-sm mt-1">Please wait for admin approval</p>
          </div>
        ) : course.accessStatus === 'approved' ? (
          <div className="text-center p-4 bg-green-50 text-green-700 rounded-md">
            <p className="font-medium">Access Granted</p>
            <p className="text-sm mt-1">You can now view the course content</p>
          </div>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleRequestAccess}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Request Access"
            )}
          </Button>
        )}

        <p className="text-sm text-gray-500 text-center">
          {course.accessStatus === 'pending' 
            ? "An administrator will review your request shortly."
            : "Click the button above to request access to this course."}
        </p>
      </div>
    </div>
  );
};

CoursePurchaseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    coursePrice: PropTypes.number,
    accessStatus: PropTypes.oneOf(['pending', 'approved', 'declined', undefined])
  }).isRequired
};

export default CoursePurchaseCard; 