import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import LectureTab from "./LectureTab";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import CourseSkeleton from "@/components/CourseSkeleton";
import Course from "@/components/Course";

const EditLecture = () => {
  const params = useParams();
  const courseId = params.courseId;
  const {data, isLoading, isError} = useGetPublishedCourseQuery();

  if(isError) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <h1 className="text-red-600 text-xl">Failed to load courses. Please try again later.</h1>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Link to={`/admin/course/${courseId}/lecture`}>
            <Button size="icon" variant="outline" className="rounded-full">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="font-bold text-xl">Update Your Lecture</h1>
        </div>
      </div>
      <LectureTab />
      <div className="bg-gray-50 dark:bg-[#141414]">
        <div className="max-w-7xl mx-auto p-6">
          <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            ) : !data?.courses?.length ? (
              <div className="col-span-full text-center py-10">
                <h3 className="text-xl text-gray-600">No courses available at the moment.</h3>
                <p className="text-gray-500 mt-2">Please check back later for new courses.</p>
              </div>
            ) : (
              data.courses.map((course, index) => (
                <Course key={course._id || index} course={course}/>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLecture;
