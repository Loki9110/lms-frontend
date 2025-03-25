import { Button } from "./ui/button";
import { 
  useEnrollFreeCourseMutation,
  useGetCourseDetailWithStatusQuery
} from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const BuyCourseButton = ({ courseId, price = 0 }) => {
  const [enrollFreeCourse, { isLoading: isEnrolling }] = useEnrollFreeCourseMutation();
  const { data: courseData } = useGetCourseDetailWithStatusQuery(courseId);
  const navigate = useNavigate();

  const handleFreeCourseEnrollment = async () => {
    try {
      const response = await enrollFreeCourse(courseId).unwrap();
      if (response.success) {
        toast.success("Successfully enrolled in the course!");
        navigate(`/course-progress/${response.courseId}`);
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to enroll in the course");
    }
  };

  const handleClick = () => {
    if (courseData?.course) {
      navigate(`/student/dummy-payment/${courseId}`);
    } else {
      toast.error("Course information not available");
    }
  };

  if (!courseData) return null;

  const { status } = courseData;

  if (status === 'purchased' || status === 'enrolled') {
    return (
      <Button
        onClick={() => navigate(`/course/learn/${courseId}`)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
      >
        Continue Course
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button
        disabled
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md cursor-not-allowed"
      >
        Waiting for Approval
      </Button>
    );
  }

  if (status === 'declined') {
    return (
      <Button
        onClick={handleClick}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Request Access Again
      </Button>
    );
  }

  if (price === 0) {
    return (
      <Button
        disabled={isEnrolling}
        onClick={handleFreeCourseEnrollment}
        className="w-full"
        variant="secondary"
      >
        {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEnrolling ? "Enrolling..." : "Enroll Now - Free"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full"
    >
      Request Access
    </Button>
  );
};

BuyCourseButton.propTypes = {
  courseId: PropTypes.string.isRequired,
  price: PropTypes.number
};

export default BuyCourseButton;
