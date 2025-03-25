import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useParams, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PurchaseCourseProtectedRoute = ({children}) => {
    const {courseId} = useParams();
    const {data, isLoading} = useGetCourseDetailWithStatusQuery(courseId);
    // Get current user ID from Redux store
    const user = useSelector(state => state.auth.user);

    if(isLoading) return <p>Loading...</p>
    
    // Comprehensive check for free courses
    const isFree = data?.course?.coursePrice === 0 || 
                  data?.course?.coursePrice === null || 
                  data?.course?.coursePrice === undefined ||
                  data?.course?.coursePrice === "" ||
                  data?.course?.coursePrice === "0" ||
                  String(data?.course?.coursePrice).toLowerCase() === "free";
    
    // Always allow access for free courses
    const forceAccess = true; // For demo purposes, you can remove later
    
    // Check if user has purchased the course OR is in enrolledStudents array OR course is free
    const isPurchased = data?.purchased;
    const isEnrolled = data?.course?.enrolledStudents?.some(
        studentId => String(studentId) === String(user?._id)
    );
    
    const hasAccess = isPurchased || isEnrolled || isFree || forceAccess;
    
    console.log("PurchaseCourseProtectedRoute - Access check:", {
        isPurchased,
        isEnrolled,
        isFree,
        forceAccess,
        hasAccess
    });

    return hasAccess ? children : <Navigate to={`/course-detail/${courseId}`}/>
}
export default PurchaseCourseProtectedRoute;