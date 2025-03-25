import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetUserRequestStatusQuery } from "@/features/api/courseApi";
import { BookOpen, ChevronRight, Star, Users, PlayCircle, Clock } from "lucide-react";

const Course = ({ course }) => {
  const navigate = useNavigate();
  const { data: requestStatus } = useGetUserRequestStatusQuery(course._id);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (requestStatus?.isApproved) {
      setIsEnrolled(true);
    }
  }, [requestStatus]);

  const handleStartCourse = () => {
    if (isEnrolled) {
      navigate(`/course-progress/${course._id}`);
    } else {
      navigate(`/course-detail/${course._id}`);
    }
  };

  // Get random stars for demo (3.5-5)
  const stars = (Math.random() * 1.5 + 3.5).toFixed(1);
  
  // Get random student count for demo
  const studentCount = Math.floor(Math.random() * 5000) + 500;

  // Get random duration for demo (1-10 hours)
  const duration = Math.floor(Math.random() * 9) + 1;

  // Generate gradient based on course level
  const getLevelGradient = () => {
    switch (course.courseLevel) {
      case 'Beginner':
        return 'from-green-500 to-emerald-700';
      case 'Medium':
        return 'from-blue-500 to-indigo-700';
      case 'Advance':
        return 'from-purple-500 to-pink-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
      {/* Course Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.courseThumbnail || "https://placehold.co/600x400?text=Course+Image"}
          alt={course.courseTitle}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Price Badge */}
        <Badge className={`absolute top-4 right-4 bg-gradient-to-r ${getLevelGradient()} text-white border-0 px-3 py-1`}>
          {course.coursePrice ? `₹${course.coursePrice}` : 'Free'}
        </Badge>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
            <PlayCircle className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Course Title and Subtitle */}
        <div>
          <h3 className="text-xl font-semibold line-clamp-2 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {course.courseTitle}
          </h3>
          {course.subTitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {course.subTitle}
            </p>
          )}
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center text-center">
            <Star className="h-5 w-5 text-yellow-400 mb-1" />
            <span className="text-sm font-medium">{stars}</span>
            <span className="text-xs text-gray-500">Rating</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-gray-100 dark:border-gray-700">
            <Users className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-sm font-medium">{studentCount}</span>
            <span className="text-xs text-gray-500">Students</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Clock className="h-5 w-5 text-purple-500 mb-1" />
            <span className="text-sm font-medium">{duration}h</span>
            <span className="text-xs text-gray-500">Duration</span>
          </div>
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-purple-500/20">
            <AvatarImage src={course.creator?.photoUrl} alt={course.creator?.name} />
            <AvatarFallback>{course.creator?.name?.charAt(0) || "I"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{course.creator?.name || "Instructor"}</p>
            <p className="text-xs text-gray-500">{course.category}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
            onClick={handleStartCourse}
          >
            <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

Course.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    courseTitle: PropTypes.string.isRequired,
    subTitle: PropTypes.string,
    courseThumbnail: PropTypes.string,
    coursePrice: PropTypes.number,
    courseLevel: PropTypes.string,
    category: PropTypes.string,
    creator: PropTypes.shape({
      name: PropTypes.string,
      photoUrl: PropTypes.string,
    }),
  }).isRequired,
};

export default Course; 