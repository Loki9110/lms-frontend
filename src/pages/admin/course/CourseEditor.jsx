import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Trash, X } from "lucide-react";
import { AlertCircle } from "lucide-react";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// API Hooks
import {
  useGetCourseByIdQuery,
  useEditCourseMutation,
  useCreateCourseMutation,
  usePublishCourseMutation,
  useRemoveCourseMutation,
  useCreateLectureMutation,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import RichTextEditor from "./RichTextEditor";

function CourseEditor() {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId; // Will be undefined for new courses

  const isNewCourse = !courseId;
  const [activeTab, setActiveTab] = useState("details");

  // State for course details
  const [courseDetails, setCourseDetails] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: null,
  });

  // State for lectures
  const [lectureTitle, setLectureTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [previewThumbnail, setPreviewThumbnail] = useState("");

  // API Hooks
  const { 
    data: courseData, 
    isLoading: isCourseLoading, 
    error: fetchError, 
    refetch 
  } = useGetCourseByIdQuery(courseId, {
    skip: isNewCourse,
  });

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [editCourse] = useEditCourseMutation();
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseMutation();
  const [removeCourse, { isLoading: isRemoving }] = useRemoveCourseMutation();
  const [createLecture, { isLoading: isCreatingLecture }] = useCreateLectureMutation();
  const [removeLecture, { isLoading: isRemovingLecture }] = useRemoveLectureMutation();

  // Safe access to course data with proper null checks
  const course = courseData?.success ? courseData?.course : null;
  const lectures = course?.lectures || [];

  // Enhanced tab change with change protection
  const handleTabChange = (tab) => {
    // If there are unsaved changes, prompt the user
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave this tab?")) {
        setActiveTab(tab);
      }  
    } else {
      setActiveTab(tab);
    }
  };
  
  // Enhance component with better loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };
  
  // Handle select field changes
  const handleSelectChange = (name, value) => {
    setCourseDetails((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };
  
  // Add reset form function
  const resetForm = () => {
    if (course) {
      setCourseDetails({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: null,
      });
      setPreviewThumbnail("");
      setIsDirty(false);
    }
  };
  
  // Load course data
  useEffect(() => {
    setIsLoading(true);
    if (courseId) {
      refetch()
        .then(() => {
          setIsLoading(false);
          console.log("Course loaded successfully");
        })
        .catch((error) => {
          console.error("Error loading course:", error);
          setIsLoading(false);
          toast.error("Failed to load course data");
        });
    } else {
      setIsLoading(false);
    }
  }, [courseId, refetch]);
  
  // Update local state when course data changes
  useEffect(() => {
    if (course) {
      console.log("Course data loaded successfully:", course);
      setCourseDetails({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: null,
      });
      setIsLoading(false);
      setIsDirty(false);
    }
  }, [course]);
  
  // Automatically switch to lectures tab if a course is ready to add lectures
  useEffect(() => {
    // If we have a course with a title but no lectures, suggest adding lectures
    if (courseId && courseData?.course?.courseTitle && 
        (!courseData.course.lectures || courseData.course.lectures.length === 0)) {
      // If there's data and no lectures, show a toast suggesting to add lectures
      const timer = setTimeout(() => {
        if (activeTab === "details") {
          toast.info("Add lectures to your course to make it publishable", {
            duration: 5000,
            action: {
              label: "Add Lectures",
              onClick: () => setActiveTab("lectures")
            }
          });
        }
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [courseId, courseData, activeTab]);

  // Show a success message when a course is first loaded
  useEffect(() => {
    if (courseId && courseData?.course && !isCourseLoading) {
      console.log("Course loaded successfully");
    }
  }, [courseId, courseData, isCourseLoading]);

  // Show error toast if API request fails
  useEffect(() => {
    if (fetchError) {
      console.error("Error fetching course:", fetchError);
      toast.error(fetchError?.data?.message || "Failed to load course data");
    }
  }, [fetchError]);

  // Course Details Handlers
  const selectCategory = (value) => {
    setCourseDetails({ ...courseDetails, category: value });
  };
  
  const selectCourseLevel = (value) => {
    setCourseDetails({ ...courseDetails, courseLevel: value });
  };
  
  // Select thumbnail file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        e.target.value = ''; // Clear the file input
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Validate image dimensions before upload (optional but helpful)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Clean up the object URL
        URL.revokeObjectURL(objectUrl);
        
        // Warn about potential issues with extremely large dimensions
        if (img.width > 4000 || img.height > 4000) {
          toast.warning("Image dimensions are very large. This may cause slow loading times.");
        }
        
        // Update local state with the file
        setCourseDetails(prev => ({...prev, courseThumbnail: file}));
        setIsDirty(true);
        
        // Create a preview URL
        const fileReader = new FileReader();
        fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
        fileReader.readAsDataURL(file);
        
        console.log(`Selected file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, dimensions: ${img.width}x${img.height}`);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast.error("Invalid image file. Please select another image.");
        e.target.value = ''; // Clear the file input
      };
      
      img.src = objectUrl;
    }
  };

  // Enhanced save function with better feedback
  const handleSaveChanges = async () => {
    // Basic validation
    if (!courseDetails.courseTitle?.trim()) {
      return toast.error("Course title is required");
    }

    if (!courseDetails.category) {
      return toast.error("Category is required");
    }

    if (!courseDetails.courseLevel) {
      return toast.error("Course level is required");
    }

    if (courseDetails.coursePrice === undefined || courseDetails.coursePrice === "" || isNaN(Number(courseDetails.coursePrice)) || Number(courseDetails.coursePrice) <= 0) {
      return toast.error("Please enter a valid course price");
    }

    // For new courses, thumbnail is required
    if (isNewCourse && !courseDetails.courseThumbnail) {
      return toast.error("Course thumbnail is required");
    }

    const toastId = toast.loading("Saving course...");
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add essential fields
      formData.append("courseTitle", courseDetails.courseTitle.trim());
      
      // Add category if present
      if (courseDetails.category) {
        formData.append("category", courseDetails.category);
      }
      
      // Add course level if present
      if (courseDetails.courseLevel) {
        formData.append("courseLevel", courseDetails.courseLevel);
      }
      
      // Add course price (convert to string)
      formData.append("coursePrice", courseDetails.coursePrice.toString());
      
      // Add optional fields if they have values
      if (courseDetails.subTitle?.trim()) {
        formData.append("subTitle", courseDetails.subTitle.trim());
      }
      
      if (courseDetails.description) {
        formData.append("description", courseDetails.description);
      }
      
      // Add thumbnail if it's a File object
      if (courseDetails.courseThumbnail instanceof File) {
        formData.append("courseThumbnail", courseDetails.courseThumbnail);
      }
      
      // Set default status to draft
      formData.append("status", "draft");
      
      // Log what we're submitting for debugging
      console.log("Submitting course data:", {
        courseId: courseId || "new",
        title: courseDetails.courseTitle,
        category: courseDetails.category,
        level: courseDetails.courseLevel,
        price: courseDetails.coursePrice,
      });
      
      let result;
      
      if (isNewCourse) {
        // Create new course
        result = await createCourse(formData).unwrap();
      } else {
        // Update existing course
        result = await editCourse({ 
          formData, 
          courseId 
        }).unwrap();
      }
      
      toast.dismiss(toastId);
      
      if (result.success) {
        toast.success(isNewCourse ? "Course created successfully" : "Course updated successfully");
        
        // If new course, navigate to edit page
        if (isNewCourse && result.course?._id) {
          navigate(`/admin/course/edit/${result.course._id}`);
        } else {
          // Refresh to get updated data
          await refetch();
        }
        
        setIsDirty(false);
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error saving course:", error);
      
      let errorMessage = "Failed to save course. Please try again.";
      
      if (error.status === 413) {
        errorMessage = "File is too large. Please choose a smaller image (less than 10MB).";
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prompt user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Validate YouTube URL
  const isValidYouTubeUrl = (url) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url) => {
    if (!url) return '';
    
    // Extract video ID from youtube.com URL
    let match = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    
    // Extract video ID from youtu.be URL
    match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    
    return '';
  };

  // Create a new course
  const createCourseHandler = async () => {
    // Validate required fields
    if (!courseDetails.courseTitle?.trim()) {
      return toast.error("Course title is required");
    }

    if (!courseDetails.category) {
      return toast.error("Category is required");
    }

    if (!courseDetails.courseLevel) {
      return toast.error("Course level is required");
    }

    if (!courseDetails.coursePrice || courseDetails.coursePrice <= 0) {
      return toast.error("Please enter a valid price");
    }

    if (!courseDetails.courseThumbnail) {
      return toast.error("Course thumbnail is required");
    }

    const toastId = toast.loading("Creating course...");
    
    try {
      const formData = new FormData();
      
      // Add all required fields to FormData
      formData.append("courseTitle", courseDetails.courseTitle.trim());
      formData.append("category", courseDetails.category);
      formData.append("courseLevel", courseDetails.courseLevel);
      formData.append("coursePrice", courseDetails.coursePrice.toString());
      
      // Add optional fields only if they have values
      if (courseDetails.subTitle?.trim()) {
        formData.append("subTitle", courseDetails.subTitle.trim());
      }
      
      if (courseDetails.description) {
        formData.append("description", courseDetails.description);
      }
      
      // Add thumbnail
      if (courseDetails.courseThumbnail instanceof File) {
        formData.append("courseThumbnail", courseDetails.courseThumbnail);
      }
      
      // Set initial status as draft
      formData.append("status", "draft");
      
      const result = await createCourse(formData).unwrap();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to create course");
      }
      
      toast.dismiss(toastId);
      toast.success("Course created successfully");
      
      // Navigate to the edit page for the new course
      navigate(`/admin/courses/${result.course._id}`);
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Course creation error:", error);
      
      let errorMessage = "Failed to create course. Please try again.";
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Toggle course publish status
  const handlePublishToggle = async () => {
    if (!course?.isPublished && (!lectures || lectures.length === 0)) {
      return toast.error("Please add at least one lecture before publishing the course");
    }
    
    // Validate required fields before publishing
    if (!courseDetails.courseTitle?.trim()) {
      return toast.error("Course title is required before publishing");
    }

    if (!courseDetails.category) {
      return toast.error("Category is required before publishing");
    }

    if (!courseDetails.courseLevel) {
      return toast.error("Course level is required before publishing");
    }

    if (!courseDetails.coursePrice || courseDetails.coursePrice <= 0) {
      return toast.error("Please enter a valid price before publishing");
    }

    if (!courseDetails.courseThumbnail && !course?.courseThumbnail) {
      return toast.error("Course thumbnail is required before publishing");
    }
    
    // Check thumbnail file size
    if (courseDetails.courseThumbnail instanceof File) {
      if (courseDetails.courseThumbnail.size > 10 * 1024 * 1024) {
        return toast.error("Thumbnail file size must be less than 10MB");
      }
    }

    const toastId = toast.loading(`${!course?.isPublished ? "Publishing" : "Unpublishing"} course...`);
    
    try {
      // Toggle the publish status directly without updating other details
      const newStatus = !course?.isPublished ? "true" : "false";
      
      console.log(`Toggling publish status to: ${newStatus}`);
      
      const publishResult = await publishCourse({
        courseId,
        status: newStatus
      }).unwrap();
      
      if (!publishResult.success) {
        throw new Error(publishResult.message || "Failed to update course status");
      }
      
      toast.dismiss(toastId);
      toast.success(`Course ${!course?.isPublished ? "published" : "unpublished"} successfully`);
      
      // Refresh to get updated data
      await refetch();
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Publish error:", error);
      
      let errorMessage = "Failed to update course status. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        errorMessage = typeof error.data === 'string' 
          ? 'Server error. Please check your data and try again.' 
          : error.data.message || "Update failed";
      }
      
      toast.error(errorMessage);
    }
  };

  // Add a new lecture
  const handleLectureSubmit = async () => {
    if (!lectureTitle.trim() || !videoUrl.trim() || !isValidYouTubeUrl(videoUrl)) {
      return toast.error("Please enter a valid title and YouTube URL");
    }

    try {
      const result = await createLecture({
        courseId,
        title: lectureTitle.trim(),
        description: lectureTitle.trim(), // Using title as description for simplicity
        videoUrl: videoUrl.trim()
      }).unwrap();

      if (result.success) {
        toast.success("Lecture added successfully");
        setLectureTitle("");
        setVideoUrl("");
        await refetch();
      } else {
        toast.error(result.message || "Failed to add lecture");
      }
    } catch (error) {
      console.error("Error adding lecture:", error);
      toast.error(error.message || "Failed to add lecture");
    }
  };

  // Handle lecture deletion
  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      const result = await removeLecture({
        courseId,
        lectureId
      }).unwrap();

      if (result.success) {
        toast.success("Lecture removed successfully");
        await refetch();
      } else {
        toast.error(result.message || "Failed to remove lecture");
      }
    } catch (error) {
      console.error("Error removing lecture:", error);
      toast.error(error.message || "Failed to remove lecture");
    }
  };

  // Delete the entire course
  const handleDeleteCourse = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this course? This action cannot be undone!");
    if (!confirmed) return;

    try {
      const result = await removeCourse(courseId).unwrap();
      if (result.success) {
        toast.success("Course deleted successfully");
        navigate("/admin/course");
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error?.data?.message || "Failed to delete course. Please try again.");
    }
  };

  // Loading state
  if (!isNewCourse && isCourseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading course details...</span>
      </div>
    );
  }

  // Error state
  if (!isNewCourse && fetchError) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600">Error loading course</h2>
        <p className="text-gray-500 mb-4">{fetchError?.data?.message || "Failed to load course details"}</p>
        <Button onClick={() => navigate("/admin/course")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Render the course editor
  return (
    <div className="flex-1 container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {isNewCourse ? "Create New Course" : courseDetails.courseTitle || "Edit Course"}
          </h1>
          <p className="text-gray-500">
            {isNewCourse 
              ? "Add basic details for your new course" 
              : courseDetails.subTitle || "Update course details and manage lectures"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Courses
          </Button>
          
          {!isNewCourse && (
            <div className="flex gap-2">
              {course?.isPublished ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePublishToggle}
                  disabled={isPublishing}
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-600 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                >
                  {isPublishing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M9 3v18" />
                    </svg>
                  )}
                  Unpublish Course
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={lectures.length > 0 ? "outline" : "ghost"}
                  onClick={lectures.length > 0 ? handlePublishToggle : undefined}
                  disabled={isPublishing || lectures.length === 0}
                  className={lectures.length > 0 ? "flex items-center gap-1 text-green-500 hover:text-green-600 border-green-200 hover:border-green-300 hover:bg-green-50" : "text-muted-foreground"}
                  title={lectures.length === 0 ? "Add lectures to publish" : "Publish course"}
                >
                  {isPublishing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2H2v10h10V2Z" />
                      <path d="M12 12h10v10H12V12Z" />
                      <path d="M22 2h-5" />
                      <path d="M22 7h-5" />
                      <path d="M7 22v-5" />
                      <path d="M2 22v-5" />
                    </svg>
                  )}
                  Publish Course
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCourse}
                disabled={isRemoving}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50"
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Trash className="h-3 w-3 mr-1" />
                )}
                Delete Course
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Show info message if no lectures have been added */}
      {!isNewCourse && lectures.length === 0 && (
        <div className="bg-blue-50 p-4 mb-4 rounded-md text-blue-800 flex items-center justify-between">
          <div>
            <p className="font-medium">Your course needs lectures before it can be published</p>
            <p className="text-sm">Add at least one lecture with video content to make your course publishable</p>
          </div>
          <Button 
            onClick={() => setActiveTab("lectures")} 
            variant="outline"
            className="bg-white"
          >
            Add Lectures
          </Button>
        </div>
      )}

      {/* Conditional Tabs Section - Only show for existing courses */}
      {!isNewCourse ? (
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
          </TabsList>

          {/* Course Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {activeTab === "details" ? (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Loading course details...</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="courseTitle">
                          Title<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="courseTitle"
                          name="courseTitle"
                          value={courseDetails.courseTitle}
                          onChange={handleInputChange}
                          placeholder="Your Course Name"
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category<span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          name="category" 
                          value={courseDetails.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="IT & Software">IT & Software</SelectItem>
                            <SelectItem value="Office Productivity">Office Productivity</SelectItem>
                            <SelectItem value="Personal Development">Personal Development</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="Photography">Photography</SelectItem>
                            <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                            <SelectItem value="Music">Music</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subTitle">Subtitle</Label>
                      <Input
                        id="subTitle"
                        name="subTitle"
                        value={courseDetails.subTitle}
                        onChange={handleInputChange}
                        placeholder="A brief subtitle for your course"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={courseDetails.description}
                        onChange={handleInputChange}
                        placeholder="Write your course description here..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="courseLevel">
                          Course Level<span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          name="courseLevel" 
                          value={courseDetails.courseLevel}
                          onValueChange={(value) => handleSelectChange("courseLevel", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="All Levels">All Levels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coursePrice">
                          Price<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="coursePrice"
                          name="coursePrice"
                          type="number"
                          value={courseDetails.coursePrice}
                          onChange={handleInputChange}
                          placeholder="Enter course price"
                          className="w-full"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="courseThumbnail">
                        Course Thumbnail<span className="text-red-500">*</span>
                      </Label>
                      <div className="grid gap-4 md:grid-cols-2 items-start">
                        <div>
                          <Input
                            id="courseThumbnail"
                            name="courseThumbnail"
                            type="file"
                            accept="image/*"
                            onChange={selectThumbnail}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended size: 1280x720px (16:9), max 2MB
                          </p>
                        </div>
                        
                        {previewThumbnail && (
                          <div className="relative aspect-video rounded-md overflow-hidden border border-input">
                            <img
                              src={previewThumbnail}
                              alt="Course thumbnail preview"
                              className="object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 rounded-full"
                              onClick={() => {
                                setPreviewThumbnail("");
                                setCourseDetails(prev => ({...prev, courseThumbnail: null}));
                                setIsDirty(true);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {!previewThumbnail && course?.courseThumbnail && (
                          <div className="relative aspect-video rounded-md overflow-hidden border border-input">
                            <img
                              src={course.courseThumbnail}
                              alt="Current course thumbnail"
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 text-xs rounded">
                              Current thumbnail
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={isSubmitting || !isDirty}
                      >
                        Reset Changes
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {isDirty && (
                          <p className="text-sm text-yellow-600">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Unsaved changes
                          </p>
                        )}
                        
                        <Button 
                          type="submit"
                          disabled={isSubmitting || !isDirty}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {lectures.map((lecture, index) => (
                  <div key={lecture._id} className="flex justify-between items-center p-3 border-b hover:bg-slate-50">
                    <div className="flex items-center">
                      <div className="text-blue-500 font-medium mr-3">{index + 1}.</div>
                      <div>
                        <h4 className="font-medium">{lecture.title}</h4>
                        <a 
                          href={lecture.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {lecture.videoUrl}
                        </a>
                      </div>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteLecture(lecture._id)}
                      disabled={isRemovingLecture}
                    >
                      {isRemovingLecture ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Lectures Tab */}
          <TabsContent value="lectures" className="space-y-4">
            {renderLecturesSection()}
          </TabsContent>
        </Tabs>
      ) : (
        // For new courses, just show the basic form
        renderCourseDetailsForm(true)
      )}
    </div>
  );

  // Helper function to render course details form
  function renderCourseDetailsForm(isNew = false) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Title<span className="text-red-500">*</span></Label>
          <Input
            type="text"
            name="courseTitle"
            value={courseDetails.courseTitle}
            onChange={handleInputChange}
            placeholder="Your Course Name"
            required
          />
        </div>
        
        <div>
          <Label>Category<span className="text-red-500">*</span></Label>
          <Select 
            value={courseDetails.category} 
            onValueChange={selectCategory}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Next JS">Next JS</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                <SelectItem value="Javascript">Javascript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* Show additional fields for existing courses */}
        {!isNew && (
          <>
            <div>
              <Label>Subtitle</Label>
              <Input
                type="text"
                name="subTitle"
                value={courseDetails.subTitle}
                onChange={handleInputChange}
                placeholder="A brief subtitle for your course"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <RichTextEditor
                value={courseDetails.description}
                onChange={(value) => {
                  setCourseDetails({ ...courseDetails, description: value });
                }}
              />
            </div>
            
            <div>
              <Label>Course Level<span className="text-red-500">*</span></Label>
              <Select
                value={courseDetails.courseLevel}
                onValueChange={selectCourseLevel}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Price<span className="text-red-500">*</span></Label>
              <Input
                type="number"
                name="coursePrice"
                value={courseDetails.coursePrice}
                onChange={handleInputChange}
                placeholder="Enter course price"
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <Label>Course Thumbnail<span className="text-red-500">*</span></Label>
              <Input
                type="file"
                onChange={selectThumbnail}
                accept="image/*"
                className="cursor-pointer"
                required={!course.courseThumbnail}
              />
              {(previewThumbnail || course.courseThumbnail) && (
                <div className="mt-2">
                  <Label>Preview</Label>
                  <div className="mt-1 rounded-md overflow-hidden max-w-xs">
                    <img
                      src={previewThumbnail || course.courseThumbnail}
                      alt="Course thumbnail preview"
                      className="object-cover w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="destructive" 
                onClick={handleDeleteCourse}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete Course
              </Button>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={!courseDetails.courseTitle.trim() || 
                           !courseDetails.category || 
                           !courseDetails.courseLevel || 
                           !courseDetails.coursePrice || 
                           (!courseDetails.courseThumbnail && !course.courseThumbnail)}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* For new courses, show the create button */}
        {isNew && (
          <div className="flex items-center gap-2 pt-4">
            <Button variant="outline" onClick={() => navigate("/admin/course")}>
              Cancel
            </Button>
            <Button 
              disabled={isCreating} 
              onClick={createCourseHandler}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Course
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Helper function to render lectures section
  function renderLecturesSection() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Lecture</CardTitle>
            <CardDescription>
              Add a new lecture with a YouTube video to this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lecture-title">Lecture Title<span className="text-red-500">*</span></Label>
              <Input
                id="lecture-title"
                type="text"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="Enter lecture title"
              />
            </div>
            
            <div>
              <Label htmlFor="video-url">YouTube Video URL<span className="text-red-500">*</span></Label>
              <Input
                id="video-url"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a YouTube URL in format: youtube.com/watch?v=ID or youtu.be/ID
              </p>
              {videoUrl && isValidYouTubeUrl(videoUrl) && (
                <div className="mt-2 aspect-video rounded-md overflow-hidden bg-gray-100 max-w-[320px] mx-auto">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractVideoId(videoUrl)}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button 
                onClick={handleLectureSubmit}
                disabled={!lectureTitle.trim() || !videoUrl.trim() || !isValidYouTubeUrl(videoUrl)}
              >
                {isCreatingLecture ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Lecture
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default CourseEditor;