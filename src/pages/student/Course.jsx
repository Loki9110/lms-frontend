import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({course}) => {
  // Mock data for demo (would be actual data in real implementation)
  const rating = 4.7;
  const studentsCount = 128;

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-lg dark:bg-gray-800/80 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 dark:border-gray-700 group h-full">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle || "course"}
            className="w-full h-40 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-700"
          />
          <Badge className="absolute top-2 right-2 z-20 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded-full shadow-lg group-hover:animate-float">
            {course.courseLevel}
          </Badge>
        </div>
        
        <CardContent className="px-5 py-4 space-y-3 relative">
          {/* Decorative element */}
          <div className="absolute -right-3 -bottom-3 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 opacity-50"></div>
          
          <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 truncate">
            {course.courseTitle}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-70 blur group-hover:blur-sm transition duration-500"></div>
                <Avatar className="h-8 w-8 relative">
                  <AvatarImage src={course.creator?.photoUrl || "https://github.com/shadcn.png"} alt={course.creator?.name || "Creator"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {course.creator?.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h1 className="font-medium text-sm text-gray-700 dark:text-gray-300">{course.creator?.name}</h1>
            </div>
          </div>
          
          {/* Course meta info */}
          <div className="flex justify-between items-center pt-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{studentsCount} students</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              <span className="group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">₹{course.coursePrice}</span>
            </div>
            <div className="relative overflow-hidden">
              <div className="py-1 px-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0">
                View Course
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
