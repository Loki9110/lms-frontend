import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Award, Book, Clock, Star, Zap, BookOpen, Instagram, Linkedin, Facebook, User, Mail, GraduationCap, BookOpenCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateUserIsLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  // Achievements and stats data (mock data for demo)
  const achievements = [
    { id: 1, title: "Fast Learner", description: "Completed 3 courses in a week", icon: <Zap className="h-5 w-5 text-yellow-500" /> },
    { id: 2, title: "Dedicated Student", description: "Watched over 50 hours of content", icon: <Clock className="h-5 w-5 text-blue-500" /> },
    { id: 3, title: "Quizmaster", description: "Scored 100% in 5 quizzes", icon: <Star className="h-5 w-5 text-purple-500" /> },
  ];

  // Social media links (mock data)
  const socialLinks = [
    { id: 1, name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com/", color: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400" },
    { id: 2, name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com/in/", color: "bg-blue-600" },
    { id: 3, name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "https://facebook.com/", color: "bg-blue-700" },
  ];

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);
    await updateUser(formData);
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(data.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="relative animate-spin-slow">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-md opacity-75"></div>
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    </div>
  );

  const user = data && data.user;
  
  // Calculate profile completion percentage
  const profileCompletion = 85; // Mock value - would calculate based on profile fields

  return (
    <div className="max-w-6xl mx-auto px-4 my-10 animate-fade-in">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -z-10 h-72 w-72 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-10 -z-10 h-56 w-56 bg-yellow-200 dark:bg-yellow-900 rounded-full blur-3xl opacity-20 animate-float-delay"></div>
      
      <h1 className="font-bold text-3xl mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">MY PROFILE</h1>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500 rounded-full opacity-10"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-yellow-400 rounded-full opacity-10"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-500"></div>
              <Avatar className="h-32 w-32 md:h-40 md:w-40 relative transform transition-all duration-300 hover:scale-105">
                <AvatarImage
                  src={user?.photoUrl || "https://github.com/shadcn.png"}
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user?.name?.charAt(0)}{user?.name?.split(" ")[1]?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Profile completion meter */}
            <div className="mt-4 w-full max-w-[180px]">
              <div className="flex justify-between mb-1 text-xs">
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-2 mt-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.id} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${social.color} text-white p-2 rounded-full transform hover:scale-110 transition-all duration-300 flex items-center justify-center`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transform hover:scale-105 transition-all duration-300">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-purple-200 dark:border-purple-900 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Name</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={user?.name || "Name"}
                      className="col-span-3 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="font-medium">Profile Photo</Label>
                    <Input
                      onChange={onChangeHandler}
                      type="file"
                      accept="image/*"
                      className="col-span-3 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={updateUserIsLoading}
                    onClick={updateUserHandler}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {updateUserIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                        wait
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex-1">
            <div className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h3>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.role === "USER" ? "Student" : user.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <BookOpenCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</h3>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.enrolledCourses.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Apple-style Stats cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/20 overflow-hidden relative">
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
                <div className="mb-2 opacity-80">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold mb-1">3</h2>
                <p className="text-sm opacity-80">Courses Completed</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/20 overflow-hidden relative">
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
                <div className="mb-2 opacity-80">
                  <Book className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold mb-1">15</h2>
                <p className="text-sm opacity-80">Quizzes Taken</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/20 overflow-hidden relative">
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
                <div className="mb-2 opacity-80">
                  <Award className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold mb-1">2</h2>
                <p className="text-sm opacity-80">Certificates</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabbed content */}
        <div className="mt-10">
          <div className="border-b border-gray-200 dark:border-gray-700 flex space-x-8">
            <button
              onClick={() => setActiveTab("courses")}
              className={`py-2 px-1 relative font-medium text-sm transition-colors ${
                activeTab === "courses"
                  ? "text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-600 dark:after:bg-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`py-2 px-1 relative font-medium text-sm transition-colors ${
                activeTab === "achievements"
                  ? "text-purple-600 dark:text-purple-400 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-purple-600 dark:after:bg-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Achievements
            </button>
          </div>
          
          <div className="mt-6">
            {activeTab === "courses" && (
              <div className="animate-fade-in">
                <h1 className="font-medium text-lg mb-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Courses you&apos;re enrolled in</h1>
                {user.enrolledCourses.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <Book className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No courses yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven&apos;t enrolled in any courses yet.</p>
                    <div className="mt-6">
                      <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                        <a href="/courses">Browse Courses</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
                    {user.enrolledCourses.map((course, index) => (
                      <div key={course._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <Course course={course} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "achievements" && (
              <div className="animate-fade-in">
                <h1 className="font-medium text-lg mb-5 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Your Achievements</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={achievement.id} 
                      className="animate-fade-in-up bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4 transform hover:translate-y-[-5px] transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{achievement.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Locked achievement */}
                  <div className="animate-fade-in-up bg-gray-100 dark:bg-gray-800/50 p-5 rounded-xl shadow-md border border-dashed border-gray-300 dark:border-gray-700 flex items-center gap-4 opacity-70">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500 dark:text-gray-400">Course Champion</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Complete 5 courses to unlock</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
