import React, { useState, useEffect } from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { 
  Trophy, Clock, Calendar, BookOpen, 
  TrendingUp, Award, Zap, 
  Flame, Medal, Bookmark, CheckCircle2, GraduationCap,
  ArrowRight, Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";

const MyLearning = () => { 
  const {data, isLoading} = useLoadUserQuery();
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [completionPercentage, setCompletionPercentage] = useState({});
  const [sortOption, setSortOption] = useState("recent");

  const myLearning = data?.user?.enrolledCourses || [];
  
  // Generate random learning stats for demo purposes
  useEffect(() => {
    if (myLearning.length > 0) {
      // Set random points between 500-2000
      setTotalPoints(Math.floor(Math.random() * 1500) + 500);
      // Set random streak between 1-30 days
      setStreakDays(Math.floor(Math.random() * 30) + 1);
      
      // Generate random completion percentages for each course
      const percentages = {};
      myLearning.forEach(course => {
        percentages[course._id] = Math.floor(Math.random() * 100);
      });
      setCompletionPercentage(percentages);
    }
  }, [myLearning.length]);
  
  // Calculate learner level based on points
  const getLearnerLevel = (points) => {
    if (points < 600) return { level: "Beginner", color: "text-blue-500" };
    if (points < 1200) return { level: "Intermediate", color: "text-purple-500" };
    if (points < 1800) return { level: "Advanced", color: "text-amber-500" };
    return { level: "Expert", color: "text-emerald-500" };
  };
  
  const userLevel = getLearnerLevel(totalPoints);
  
  // Get next level threshold
  const getNextLevelThreshold = (points) => {
    if (points < 600) return 600;
    if (points < 1200) return 1200;
    if (points < 1800) return 1800;
    return 2500;
  };
  
  // Calculate progress to next level
  const progressToNextLevel = (totalPoints / getNextLevelThreshold(totalPoints)) * 100;
  
  // Sort courses based on selected option
  const getSortedCourses = () => {
    if (!myLearning.length) return [];
    
    let filteredCourses = [...myLearning];
    
    // Filter by tab
    if (activeTab === "in-progress") {
      filteredCourses = filteredCourses.filter(
        course => completionPercentage[course._id] > 0 && completionPercentage[course._id] < 100
      );
    } else if (activeTab === "completed") {
      filteredCourses = filteredCourses.filter(
        course => completionPercentage[course._id] === 100
      );
    } else if (activeTab === "not-started") {
      filteredCourses = filteredCourses.filter(
        course => completionPercentage[course._id] === 0
      );
    }
    
    // Sort courses
    if (sortOption === "recent") {
      return filteredCourses;
    } else if (sortOption === "progress") {
      return filteredCourses.sort((a, b) => completionPercentage[b._id] - completionPercentage[a._id]);
    } else if (sortOption === "title") {
      return filteredCourses.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
    }
    
    return filteredCourses;
  };
  
  // Calculate badges earned
  const earnedBadges = [
    { name: "Fast Learner", icon: <Zap className="h-4 w-4" />, color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "Course Collector", icon: <Bookmark className="h-4 w-4" />, color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "Early Bird", icon: <Clock className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  ];
  
  if (streakDays >= 7) {
    earnedBadges.push({ 
      name: "Weekly Streak", 
      icon: <Flame className="h-4 w-4" />, 
      color: "bg-red-100 text-red-800 border-red-200" 
    });
  }
  
  // Calculate learning activity (random for demo)
  const weeklyActivity = [15, 35, 25, 45, 80, 30, 20];
  
  // Upcoming deadlines (random for demo)
  const upcomingDeadlines = [
    { course: "Project Submission", date: "Tomorrow" },
    { course: "Quiz: Advanced Topics", date: "In 3 days" },
  ];
  
  // Recommended courses based on current learning
  const recommendedCourses = [
    { title: "Advanced Web Development", level: "Advanced" },
    { title: "UI/UX Design Principles", level: "Intermediate" },
  ];

  if (isLoading) {
    return <MyLearningSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 md:px-6">
      {/* Learning Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning Journey</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and achievements</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute -top-1 -right-1">
                <Badge className="bg-purple-500 text-white border-0 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  {Math.min(myLearning.length, 9)}
                </Badge>
              </div>
              <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10 border-2">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Courses</p>
              <p className="text-xs text-gray-500">{myLearning.length} enrolled</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10 border-2">
                <Trophy className="h-5 w-5 text-amber-500" />
              </Button>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Points</p>
              <p className="text-xs text-gray-500">{totalPoints} XP</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10 border-2">
                <Flame className="h-5 w-5 text-red-500" />
              </Button>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Streak</p>
              <p className="text-xs text-gray-500">{streakDays} days</p>
            </div>
          </div>
        </div>
      </div>
      
      {myLearning.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <GraduationCap className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-semibold mt-4 text-gray-600 dark:text-gray-300">You haven't enrolled in any courses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Start your learning journey by browsing our course catalog and enrolling in courses that interest you.
          </p>
          <Button asChild className="mt-6 bg-purple-600 hover:bg-purple-700">
            <a href="/courses">Browse Courses</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Learner Profile */}
          <div className="space-y-6">
            {/* Learner Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Learner Profile</CardTitle>
                  <Badge className={`${userLevel.color.replace('text', 'bg')} text-white`}>
                    {userLevel.level}
                  </Badge>
                </div>
                <CardDescription>Your learning statistics and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-purple-200">
                    <AvatarImage src={data?.user?.photoUrl || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{data?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{data?.user?.name || "Learner"}</h3>
                    <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                
                {/* Level Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={userLevel.color}>Level: {userLevel.level}</span>
                    <span className="text-gray-500">{totalPoints}/{getNextLevelThreshold(totalPoints)} XP</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(getNextLevelThreshold(totalPoints) - totalPoints)} XP needed for next level
                  </p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Medal className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {myLearning.filter(course => completionPercentage[course._id] === 100).length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {myLearning.filter(course => completionPercentage[course._id] > 0 && completionPercentage[course._id] < 100).length}
                    </p>
                  </div>
                </div>
                
                {/* Badges */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4" /> Earned Badges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map((badge, index) => (
                      <Badge key={index} variant="outline" className={`${badge.color} flex items-center gap-1`}>
                        {badge.icon}
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Weekly Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 pt-4">
                  {weeklyActivity.map((activity, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div 
                        className="w-full max-w-[12px] bg-purple-500 rounded-t-sm opacity-80"
                        style={{ height: `${activity}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {['M','T','W','T','F','S','S'][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">This Week</span>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {weeklyActivity.reduce((a, b) => a + b, 0)} mins
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Deadlines */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 last:border-none">
                        <p className="text-sm font-medium">{deadline.course}</p>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {deadline.date}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming deadlines</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Course List */}
          <div className="md:col-span-2 space-y-6">
            {/* Course Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <TabsList className="grid grid-cols-4 h-9">
                      <TabsTrigger value="all" className="text-xs md:text-sm">
                        All Courses ({myLearning.length})
                      </TabsTrigger>
                      <TabsTrigger value="in-progress" className="text-xs md:text-sm">
                        In Progress ({myLearning.filter(course => completionPercentage[course._id] > 0 && completionPercentage[course._id] < 100).length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs md:text-sm">
                        Completed ({myLearning.filter(course => completionPercentage[course._id] === 100).length})
                      </TabsTrigger>
                      <TabsTrigger value="not-started" className="text-xs md:text-sm">
                        Not Started ({myLearning.filter(course => completionPercentage[course._id] === 0).length})
                      </TabsTrigger>
                    </TabsList>
                    <div>
                      <select 
                        className="text-sm bg-transparent border-gray-200 dark:border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <option value="recent">Recently Added</option>
                        <option value="progress">Progress</option>
                        <option value="title">Title</option>
                      </select>
                    </div>
                  </div>
                  
                  <TabsContent value="all" className="p-4">
                    <CourseGrid 
                      courses={getSortedCourses()} 
                      completionPercentage={completionPercentage} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="in-progress" className="p-4">
                    <CourseGrid 
                      courses={getSortedCourses()} 
                      completionPercentage={completionPercentage} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="p-4">
                    <CourseGrid 
                      courses={getSortedCourses()} 
                      completionPercentage={completionPercentage} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="not-started" className="p-4">
                    <CourseGrid 
                      courses={getSortedCourses()} 
                      completionPercentage={completionPercentage} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Recommended Courses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Recommended for You
                </CardTitle>
                <CardDescription>Based on your learning history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-xs text-gray-500">{course.level}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-purple-600 dark:text-purple-400">
                        Explore
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}
    </div>
  );
};

// Custom Course Grid component with progress bars
const CourseGrid = ({ courses, completionPercentage }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No courses found in this category.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {courses.map((course, index) => (
        <a 
          key={index} 
          href={`/course-detail/${course._id}`}
          className="block group"
        >
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row h-full">
              {/* Course Thumbnail */}
              <div className="relative w-full sm:w-1/3">
                <img
                  src={course.courseThumbnail || "https://placehold.co/600x400?text=No+Image"}
                  alt={course.courseTitle}
                  className="h-32 sm:h-full w-full object-cover"
                />
                {completionPercentage[course._id] === 100 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-emerald-500 text-white border-none">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Course Content */}
              <div className="p-4 flex flex-col flex-grow sm:w-2/3">
                <h3 className="font-semibold line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {course.courseTitle}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
                  <span>{course.creator?.name || "Instructor"}</span>
                  <span className="mx-2">•</span>
                  <Badge className={
                    course.courseLevel === "Beginner" ? "bg-blue-100 text-blue-800 border-none" :
                    course.courseLevel === "Intermediate" ? "bg-purple-100 text-purple-800 border-none" :
                    "bg-amber-100 text-amber-800 border-none"
                  }>
                    {course.courseLevel}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Your Progress</span>
                    <span>{completionPercentage[course._id]}%</span>
                  </div>
                  <Progress 
                    value={completionPercentage[course._id]} 
                    className="h-1.5"
                  />
                  
                  {/* Action button */}
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="ghost" className="text-xs text-purple-600 dark:text-purple-400 p-0 h-auto">
                      {completionPercentage[course._id] === 0 ? "Start Learning" :
                       completionPercentage[course._id] === 100 ? "Review Again" : "Continue Learning"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

CourseGrid.propTypes = {
  courses: PropTypes.array.isRequired,
  completionPercentage: PropTypes.object.isRequired
};

// Skeleton component for loading state
const MyLearningSkeleton = () => (
  <div className="max-w-6xl mx-auto my-6 px-4 md:px-6">
    <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>
    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-8 animate-pulse"></div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-6">
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-64 animate-pulse"></div>
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-40 animate-pulse"></div>
      </div>
      <div className="md:col-span-2">
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-96 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default MyLearning;
