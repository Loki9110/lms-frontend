import Course from "@/components/Course";
import CourseSkeleton from "@/components/CourseSkeleton";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Temporarily remove framer-motion import until installation issue is resolved
// import { motion } from "framer-motion";
 
const Courses = () => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');

  // Filter courses based on search and price
  const filteredCourses = data?.courses?.filter(course => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && (!course.coursePrice || course.coursePrice === 0)) ||
                        (priceFilter === 'premium' && course.coursePrice > 0);
    return matchesSearch && matchesPrice;
  }) || [];

  if (isError) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <h1 className="text-red-600 text-xl">Failed to load courses. Please try again later.</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Discover Your Next Learning Adventure
            </h1>
            <p className="text-lg md:text-xl mb-8 text-purple-100">
              Explore our wide range of courses designed to help you master new skills and advance your career
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 w-full"
                />
              </div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="free">Free Courses</SelectItem>
                  <SelectItem value="premium">Premium Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 mb-4 text-gray-400">
                <Filter className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                We could not find any courses matching your criteria. Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div 
                key={course._id} 
                className="transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => window.location.href = `/course-detail/${course._id}`}
              >
                <Course course={course} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Add keyframes animation for fade-in-up effect
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }
`;
document.head.appendChild(style);

export default Courses;
