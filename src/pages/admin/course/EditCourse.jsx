import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import CourseTab from "./CourseTab";

const EditCourse = () => {
  const { courseId } = useParams();
  
  console.log("EditCourse rendered with courseId:", courseId);
  
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-xl">
          Add detail information regarding course
        </h1>
        <Link to={`/admin/course/${courseId}/lecture`}>
          <Button className="hover:text-blue-600" variant="link">Go to lectures page</Button>
        </Link>
      </div>
      <CourseTab />
    </div>
  );
};

export default EditCourse;
