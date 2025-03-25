import { useParams } from 'react-router-dom';
import { useGetCourseByIdQuery } from '@/features/api/courseApi';
import { Loader } from '@/components/Loader';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { data: course, isLoading, error } = useGetCourseByIdQuery(courseId);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Failed to load course details</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course?.title}</h1>
      {/* Add course details here */}
    </div>
  );
};

export default CourseDetails; 