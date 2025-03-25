import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";

const CourseTab = () => {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;

  // Log to debug
  console.log("CourseTab rendered with courseId:", courseId);

  // Redirect if no courseId is provided
  useEffect(() => {
    if (!courseId) {
      console.error("No courseId found in URL parameters");
      toast.error("Course ID not found");
      navigate("/admin/course");
    }
  }, [courseId, navigate]);

  const { data: courseByIdData, isLoading: isCourseLoading, error: fetchError, refetch } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });
  const [editCourse, { isLoading }] = useEditCourseMutation();
  const [publishCourse, { isLoading: isPublishing }] = usePublishCourseMutation();
  const [removeCourse, { isLoading: isRemoving }] = useRemoveCourseMutation();

  // Safe access to course data
  const course = courseByIdData?.course || {};

  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const [previewThumbnail, setPreviewThumbnail] = useState("");

  // Refetch data when component mounts to ensure we have the latest data
  useEffect(() => {
    if (courseId) {
      refetch().catch(err => {
        console.error("Error fetching course:", err);
        toast.error("Failed to load course data");
      });
    }
    
    // For debugging
    if (courseByIdData) {
      console.log('CourseTab data:', courseByIdData);
    }
  }, [refetch, courseId, courseByIdData]);

  useEffect(() => {
    if (courseByIdData?.course) { 
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseThumbnail: "",
      });
    }
  }, [courseByIdData, course]);

  // Show error toast if API request fails
  useEffect(() => {
    if (fetchError) {
      console.error("Error fetching course:", fetchError);
      toast.error(fetchError?.data?.message || "Failed to load course data");
    }
  }, [fetchError]);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };
  
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };
  
  // get file
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    // Enhanced validation
    if (!input.courseTitle || !input.courseTitle.trim()) {
      return toast.error("Course title is required");
    }

    if (!input.category) {
      return toast.error("Category is required");
    }

    if (!input.courseLevel) {
      return toast.error("Course level is required");
    }

    // Validate price - must be a valid number
    const price = parseFloat(input.coursePrice);
    if (isNaN(price) || price <= 0) {
      return toast.error("Please enter a valid price");
    }

    // Show loading toast
    const toastId = toast.loading("Saving course details...");

    try {
      // Create a new FormData instance
      const formData = new FormData();
      
      console.log("Creating FormData for course update:", { courseId });
      
      // Add required fields to FormData
      formData.append("courseTitle", input.courseTitle.trim());
      formData.append("category", input.category);
      formData.append("courseLevel", input.courseLevel);
      formData.append("coursePrice", price.toString());
      
      // Add optional fields - only if they have values
      if (input.subTitle && input.subTitle.trim()) {
        formData.append("subTitle", input.subTitle.trim());
      }
      
      // Description might be HTML content from rich text editor
      if (input.description) {
        formData.append("description", input.description);
      }
      
      // Always set status to draft when saving through the form
      formData.append("status", "draft");
      
      // Add thumbnail if available and it's a File object
      if (input.courseThumbnail && input.courseThumbnail instanceof File) {
        formData.append("courseThumbnail", input.courseThumbnail);
      }

      console.log("Saving course with ID:", courseId);
      
      // Log what we're submitting for debugging
      let formEntries = {};
      for (let [key, value] of formData.entries()) {
        formEntries[key] = value instanceof File ? 
          `File: ${value.name} (${(value.size/1024).toFixed(2)}KB)` : 
          value;
      }
      console.log("FormData contents:", formEntries);
      
      // Make the API call
      const result = await editCourse({ 
        formData, 
        courseId 
      }).unwrap();
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      
      if (result && result.success) {
        toast.success(result.message || "Course saved successfully");
        
        // Refetch to get updated data
        refetch();
      } else {
        throw new Error(result?.message || "Unknown error occurred");
      }
      
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(toastId);
      
      console.error("Error updating course:", error);
      
      // Try to get a useful error message
      let errorMessage = "Failed to update course. Please try again.";
      
      if (error.status === 413) {
        errorMessage = "File is too large. Maximum file size is 10MB.";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data) {
        errorMessage = error.data?.message || "Update failed";
      }
      
      toast.error(errorMessage);
    }
  };

  const publishStatusHandler = async (status) => {
    // Check if there are lectures before attempting to publish
    if (status === "true" && (!course.lectures || course.lectures.length === 0)) {
      return toast.error("Please add at least one lecture before publishing the course");
    }
    
    // Display a loading toast
    const toastId = toast.loading(`${status === "true" ? "Publishing" : "Unpublishing"} course...`);
    
    try {
      console.log("Sending publish request with:", { courseId, status });
      
      const result = await publishCourse({ courseId, status }).unwrap();
      
      // Handle success
      toast.dismiss(toastId);
      
      // Use the message from the API response or a default
      const successMessage = result.message || 
        `Course ${status === "true" ? "published" : "unpublished"} successfully`;
      
      toast.success(successMessage);
      
      // Force refresh data
      await refetch();
    } catch (error) {
      // Handle error
      toast.dismiss(toastId);
      console.error("Publish error:", error);
      
      let errorMessage = "Failed to update course status. Please try again.";
      
      // Use more specific error messages if available
      if (error.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.status === 403) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleRemoveCourse = async () => {
    const confirmed = window.confirm("Are you sure you want to remove this course?");
    if (!confirmed) return;

    try {
      const response = await removeCourse(courseId).unwrap();
      if (response.success) {
        toast.success(response.message || "Course removed successfully");
        navigate("/admin/course");
      } else {
        toast.error(response.message || "Failed to remove course");
      }
    } catch (error) {
      console.error("Error removing course:", error);
      toast.error(error?.data?.message || "Failed to remove course. Please try again.");
    }
  };

  if (isCourseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading course details...</span>
      </div>
    );
  }

  if (!courseByIdData?.course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600">Course not found</h2>
        <Button onClick={() => navigate("/admin/course")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>
            Make changes to your courses here. Click save when you&apos;re done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => publishStatusHandler(course.status === 'active' ? "false" : "true")}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              course.status === 'active' ? "Unpublish" : "Publish"
            )}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRemoveCourse}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Course"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input
                type="text"
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandler}
                placeholder="Eg. Complete React JS Course"
              />
            </div>

            <div className="space-y-2">
              <Label>Course Subtitle</Label>
              <Input
                type="text"
                name="subTitle"
                value={input.subTitle}
                onChange={changeEventHandler}
                placeholder="Eg. Master Modern React JS"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={input.category}
                onValueChange={selectCategory}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="IT & Software">IT & Software</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course Level</Label>
              <Select
                value={input.courseLevel}
                onValueChange={selectCourseLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Course Level</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Course Price</Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="Eg. 4999"
              />
            </div>

            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <Input
                type="file"
                name="courseThumbnail"
                onChange={selectThumbnail}
                accept="image/*"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor 
              value={input.description || ""} 
              onChange={(content) => setInput({...input, description: content})}
            />
          </div>

          {/* Preview thumbnail if available */}
          {(previewThumbnail || course.courseThumbnail) && (
            <div className="mt-4">
              <Label>Thumbnail Preview</Label>
              <div className="mt-2 rounded-md overflow-hidden border w-64 h-36">
                <img
                  src={previewThumbnail || course.courseThumbnail}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div>
            <Button onClick={() => navigate("/admin/course")} variant="outline" className="mr-2">
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={updateCourseHandler}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
