import { Link } from 'react-router-dom';

export const CourseCard = ({ course }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.isPublished && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            Published
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white font-bold">
            ₹{course.price}
          </span>
          
          <Link
            to={`/course/${course._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}; 