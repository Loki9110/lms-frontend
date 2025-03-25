import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCourseDetailWithStatusQuery, useEnrollFreeCourseMutation } from "@/features/api/purchaseApi";
import { Lock, PlayCircle, Loader2, Star, Clock, Award, Users, BookOpen, Calendar, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock testimonials - replace with real data when available
const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    comment: "This course transformed my understanding of the subject. The instructor explains complex concepts in a simple way that anyone can understand.",
    date: "2023-10-15"
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4,
    comment: "Great content and well-structured modules. I'd recommend this course to anyone looking to master this topic quickly.",
    date: "2023-11-22"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    rating: 5,
    comment: "The practical exercises were incredibly helpful. I feel confident applying these skills in real-world scenarios now.",
    date: "2024-01-05"
  }
];

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useGetCourseDetailWithStatusQuery(courseId, {
    refetchOnMountOrArgChange: true
  });
  
  // Get current user from Redux state
  const user = useSelector(state => state.auth.user);
  const [hasAccessToContent, setHasAccessToContent] = useState(false);
  const [enrollFreeCourse, { isLoading: isEnrolling }] = useEnrollFreeCourseMutation();

  useEffect(() => {
    const loadCourseData = async () => {
      console.log("CourseDetail - Fetching course data...");
      await refetch();
      console.log("CourseDetail - Fetched data:", data);
    };
    
    loadCourseData();
    
    const intervalId = setInterval(() => {
      refetch();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [refetch]);

  // Calculate if user has access based on purchased flag OR if they're in enrolledStudents
  useEffect(() => {
    if (data && user) {
      const purchasedFromAPI = data.purchased;
      
      // Log the enrolledStudents array directly
      console.log("EnrolledStudents data:", data.course?.enrolledStudents);
      console.log("Current user ID:", user._id);
      
      // Enhanced check for user in enrolledStudents array with string comparison
      const isUserEnrolled = data.course?.enrolledStudents?.some(
        studentId => String(studentId) === String(user._id)
      );
      
      const hasAccess = purchasedFromAPI || isUserEnrolled;
      console.log("Course access calculation:", { 
        purchasedFromAPI, 
        isUserEnrolled, 
        hasAccess,
        enrolledStudents: data.course?.enrolledStudents || []
      });
      
      // Calculate access status
      console.log("Force recalculating access:", hasAccess);
      setHasAccessToContent(hasAccess);
    }
  }, [data, user]);

  useEffect(() => {
    if (data) {
      console.log("Course purchase status from API:", data.purchased);
      console.log("Calculated access status:", hasAccessToContent);
    }
  }, [data, hasAccessToContent]);

  // Function to refresh data and recalculate access
  const refreshAccessStatus = async () => {
    await refetch();
  };

  // Check if course is free - more comprehensive check
  const isFree = data?.course?.coursePrice === 0 || 
                data?.course?.coursePrice === null || 
                data?.course?.coursePrice === undefined ||
                data?.course?.coursePrice === "" ||
                data?.course?.coursePrice === "0" ||
                String(data?.course?.coursePrice).toLowerCase() === "free";

  // Force course to be treated as free for demo purposes
  // You can remove this line later
  const forceFreeCourse = true;

  // Handle enrolling in a free course
  const handleEnrollFreeCourse = async () => {
    try {
      console.log("Enrolling in free course:", courseId);
      console.log("Course data:", data?.course);
      
      const response = await enrollFreeCourse(courseId).unwrap();
      
      if (response.success) {
        toast.success("Successfully enrolled in the course!");
        await refetch();
        // After successful enrollment, navigate to the course progress page
        navigate(`/course-progress/${courseId}`);
      }
    } catch (error) {
      console.error("Error enrolling in free course:", error);
      toast.error("You don't have access to this course yet");
      
      // If we get an error, let's try to give access anyway (for demo purposes)
      console.log("Attempting to navigate to course progress despite error");
      navigate(`/course-progress/${courseId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-semibold">Loading course details...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-700">{error?.data?.message || "Failed to load course details"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-semibold">Course Not Found</h2>
          <p className="text-gray-500">The course you&apos;re looking for doesn&apos;t exist</p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const { course } = data;
  
  const handleContinueCourse = () => {
    if (hasAccessToContent) {
      console.log("Navigating to course progress:", courseId);
      navigate(`/course-progress/${courseId}`);
    } else {
      toast.error("You don't have access to this course yet");
    }
  }

  // Format the course creation date
  const formattedDate = new Date(course.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate average rating - replace with actual data when available
  const avgRating = 4.7;

  return (
    <div className="bg-white">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">FEATURED</Badge>
            {course.skillLevel && (
              <Badge className="bg-blue-400 hover:bg-blue-500">{course.skillLevel}</Badge>
            )}
          </div>
          
          <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl">
            {course.courseTitle}
          </h1>
          
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            {course.subTitle || "No subtitle available"}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium">{avgRating}</span>
            </div>
            
            <div className="flex items-center gap-1 text-blue-100">
              <Users size={18} />
              <span>{course.enrolledStudents?.length || 0} students enrolled</span>
            </div>
            
            <div className="flex items-center gap-1 text-blue-100">
              <Calendar size={18} />
              <span>Last updated: {formattedDate}</span>
            </div>
          </div>
          
          {/* Instructor information */}
          {course.creator && (
            <div className="mt-6 flex items-center bg-blue-700/30 p-3 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={course.creator.photoUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(course.creator.name)} alt={course.creator.name} />
                <AvatarFallback>{course.creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm text-blue-100">Instructor</p>
                <p className="font-semibold text-white">{course.creator.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Content */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Course Navigation */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="content" className="flex-1">Course Content</TabsTrigger>
                <TabsTrigger value="testimonials" className="flex-1">Testimonials</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 py-4">
                {/* Key Course Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.duration && (
                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Clock className="h-10 w-10 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{course.duration}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="bg-purple-50 border-purple-100">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <BookOpen className="h-10 w-10 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Lectures</p>
                        <p className="font-medium">{course.lectures?.length || 0} lessons</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Award className="h-10 w-10 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Certification</p>
                        <p className="font-medium">Certificate of Completion</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Course Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.description ? (
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    ) : (
                      <p className="text-gray-500">No description available</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Learning Outcomes */}
                {course.learningOutcomes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        What You&apos;ll Learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {course.learningOutcomes}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Prerequisites */}
                {course.prerequisites && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        Prerequisites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {course.prerequisites}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Target Audience */}
                {course.targetAudience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Who This Course is For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        {course.targetAudience}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Course Content Tab */}
              <TabsContent value="content" className="space-y-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Course Content</span>
                      <Badge variant="outline" className="ml-2">
                        {course.lectures?.length || 0} lectures
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {hasAccessToContent 
                        ? "You have full access to this course." 
                        : "Preview the course content below."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.lectures?.length > 0 ? (
                      course.lectures.map((lecture, idx) => (
                        <div 
                          key={idx}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              {lecture.isPreviewFree || hasAccessToContent ? (
                                <PlayCircle className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{lecture.lectureTitle}</h3>
                              <p className="text-sm text-gray-500">{lecture.lectureDescription || "No description available"}</p>
                            </div>
                            {(lecture.isPreviewFree || hasAccessToContent) ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/course-progress/${courseId}/lecture/${lecture._id}`)}
                              >
                                {hasAccessToContent ? "Start" : "Preview"}
                              </Button>
                            ) : (
                              <Badge variant="outline" className="bg-orange-100 text-orange-600 hover:bg-orange-200">
                                <Lock className="h-3 w-3 mr-1" />
                                Requires Approval
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-gray-500">No lectures available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      Student Testimonials
                    </CardTitle>
                    <CardDescription>
                      See what our students have to say about this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {TESTIMONIALS.map((testimonial) => (
                      <div key={testimonial.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{testimonial.name}</h4>
                              <span className="text-sm text-gray-500">
                                {new Date(testimonial.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= testimonial.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 mt-2">{testimonial.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Course Card and Purchase Options */}
          <div className="w-full lg:w-1/3 sticky top-4 self-start">
            <Card className="border shadow-lg rounded-lg overflow-hidden">
              {/* Course Thumbnail */}
              <div className="aspect-video w-full overflow-hidden">
                {course.courseThumbnail ? (
                  <img 
                    src={course.courseThumbnail} 
                    alt={course.courseTitle}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                {/* Price */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">
                    {isFree ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <>₹{course.coursePrice}</>
                    )}
                  </h2>
                </div>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>Full Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Join {course.enrolledStudents?.length || 0} Students</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>
                
                {/* CTA Button */}
                <div className="space-y-3">
                  {hasAccessToContent ? (
                    <Button 
                      onClick={handleContinueCourse} 
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <>
                      {isFree || forceFreeCourse ? (
                        <Button 
                          onClick={handleEnrollFreeCourse} 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            "Enroll Now - Free Access"
                          )}
                        </Button>
                      ) : (
                        <BuyCourseButton courseId={courseId} price={course.coursePrice || 0} />
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={refreshAccessStatus}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M21 2v6h-6"></path>
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                          <path d="M3 22v-6h6"></path>
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                        </svg>
                        Refresh Access Status
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
