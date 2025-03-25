import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { toast } from 'sonner';
import { ArrowLeft, Save, Check, X, LayoutList, Settings, Eye } from 'lucide-react';
import LectureManager from '../../components/LectureManager';
import RichTextEditor from '../../components/RichTextEditor';

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    courseTitle: '',
    subTitle: '',
    description: '',
    category: '',
    courseLevel: '',
    coursePrice: '',
    courseThumbnail: '',
    lectures: []
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/course/instructor/courses/${courseId}`, {
          withCredentials: true
        });
        setCourse(response.data.course);
        
        // Transform lectures to include both title formats
        const transformedLectures = response.data.course.lectures.map(lecture => ({
          _id: lecture._id,
          title: lecture.title,
          lectureTitle: lecture.title, // Keep both for compatibility
          description: lecture.description,
          lectureDescription: lecture.description, // Keep both for compatibility
          videoUrl: lecture.videoUrl,
          order: lecture.order
        }));

        setFormData({
          courseTitle: response.data.course.courseTitle,
          subTitle: response.data.course.subTitle || '',
          description: response.data.course.description || '',
          category: response.data.course.category || '',
          courseLevel: response.data.course.courseLevel || '',
          coursePrice: response.data.course.coursePrice || '',
          courseThumbnail: '',
          lectures: transformedLectures
        });
        if (response.data.course.courseThumbnail) {
          setThumbnailPreview(response.data.course.courseThumbnail);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleThumbnailChange = (e) => {
    const url = e.target.value;
    if (url) {
      try {
        new URL(url); // This will throw an error if the URL is invalid
        setFormData(prev => ({
          ...prev,
          courseThumbnail: url
        }));
        setThumbnailPreview(url);
      } catch {
        toast.error('Please enter a valid URL');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        courseThumbnail: ''
      }));
      setThumbnailPreview('');
    }
  };

  const handleDescriptionChange = (content) => {
    setFormData({
      ...formData,
      description: content
    });
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      
      // Create form data
      const data = {
        courseTitle: formData.courseTitle,
        subTitle: formData.subTitle,
        description: formData.description,
        category: formData.category,
        courseLevel: formData.courseLevel,
        coursePrice: formData.coursePrice,
        status: formData.status,
        courseThumbnail: formData.courseThumbnail // Send the URL directly
      };
      
      const response = await axios.put(
        `/api/v1/course/instructor/courses/${courseId}`, 
        data,
        { withCredentials: true }
      );

      if (response.data.success) {
        setCourse(response.data.course);
        setThumbnailPreview(response.data.course.courseThumbnail);
        toast.success('Course updated successfully');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const response = await axios.put(
        `/api/v1/course/instructor/courses/${courseId}/publish`,
        { status: "true" },
        { withCredentials: true }
      );
      
      toast.success('Course published successfully');
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      const response = await axios.put(
        `/api/v1/course/instructor/courses/${courseId}/publish`,
        { status: "false" },
        { withCredentials: true }
      );
      
      toast.success('Course unpublished successfully');
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error unpublishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to unpublish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleLecturesChange = async (updatedLectures) => {
    try {
      const transformedLectures = updatedLectures.map((lecture, index) => {
        const lectureData = {
          title: lecture.title || lecture.lectureTitle,
          description: lecture.description || lecture.lectureDescription || lecture.title || lecture.lectureTitle,
          videoUrl: lecture.videoUrl,
          order: index
        };

        // Only include _id if it's not a new lecture
        if (!lecture.isNew && lecture._id) {
          lectureData._id = lecture._id;
        }

        return lectureData;
      });

      const response = await axios.put(`/api/v1/course/instructor/courses/${courseId}`, {
        lectures: transformedLectures
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Update the form data with the new lectures from the server response
        setFormData(prev => ({
          ...prev,
          lectures: response.data.course.lectures.map(lecture => ({
            _id: lecture._id,
            title: lecture.title,
            lectureTitle: lecture.title,
            description: lecture.description,
            lectureDescription: lecture.description,
            videoUrl: lecture.videoUrl,
            order: lecture.order
          }))
        }));
        toast.success('Lectures updated successfully');
      } else {
        toast.error('Failed to update lectures');
      }
    } catch (error) {
      console.error('Error updating lectures:', error);
      toast.error(error.response?.data?.message || 'Failed to update lectures');
    }
  };

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/instructor/dashboard')}
            className="p-0 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Course</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={course?.isPublished ? "destructive" : "default"}
            className="flex items-center"
            onClick={course?.isPublished ? handleUnpublish : handlePublish}
            disabled={publishing}
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {course?.isPublished ? 'Unpublishing...' : 'Publishing...'}
              </>
            ) : (
              <>
                {course?.isPublished ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="content" className="flex items-center">
            <LayoutList className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                Add and manage your course lectures. Drag and drop to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LectureManager
                courseId={courseId}
                lectures={formData.lectures}
                onLecturesChange={handleLecturesChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseTitle">Course Title *</Label>
                    <Input
                      id="courseTitle"
                      name="courseTitle"
                      placeholder="Enter course title"
                      value={formData.courseTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subTitle">Subtitle</Label>
                    <Input
                      id="subTitle"
                      name="subTitle"
                      placeholder="Enter a subtitle for your course"
                      value={formData.subTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <RichTextEditor 
                      value={formData.description} 
                      onChange={handleDescriptionChange} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Course Settings */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      name="category" 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="personal-development">Personal Development</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="courseLevel">Course Level *</Label>
                    <Select 
                      name="courseLevel" 
                      value={formData.courseLevel} 
                      onValueChange={(value) => handleSelectChange('courseLevel', value)}
                      required
                    >
                      <SelectTrigger id="courseLevel">
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Medium">Intermediate</SelectItem>
                        <SelectItem value="Advance">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coursePrice">Price (₹)</Label>
                    <Input
                      id="coursePrice"
                      name="coursePrice"
                      type="number"
                      placeholder="0 for free course"
                      value={formData.coursePrice}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseThumbnail">Course Thumbnail URL</Label>
                    <div className="grid gap-4">
                      {thumbnailPreview && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={thumbnailPreview} 
                            alt="Course thumbnail" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Input
                          id="courseThumbnail"
                          name="courseThumbnail"
                          type="url"
                          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                          value={formData.courseThumbnail}
                          onChange={handleThumbnailChange}
                          className="flex-1"
                        />
                        {thumbnailPreview && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, courseThumbnail: '' }));
                              setThumbnailPreview('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Enter a direct URL to an image (e.g., from Imgur, ImgBB, or your own server)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>
                See how your course will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {thumbnailPreview && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Cover Image</h3>
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        src={thumbnailPreview} 
                        alt="Course cover" 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </div>
                )}
                {!thumbnailPreview && (
                  <div className="aspect-video w-full rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-gray-500">No cover image uploaded</p>
                      <p className="text-sm text-gray-400">Upload a cover image in the settings tab</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Title</h3>
                    <p className="text-gray-600">{formData.courseTitle || 'No title set'}</p>
                  </div>
                  
                  {formData.subTitle && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Subtitle</h3>
                      <p className="text-gray-600">{formData.subTitle}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="text-gray-600 capitalize">{formData.category || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="text-gray-600">{formData.courseLevel || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="text-gray-600">
                          {formData.coursePrice ? `₹${formData.coursePrice}` : 'Free'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Lectures</p>
                        <p className="text-gray-600">{formData.lectures.length}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: formData.description || 'No description available' }} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Course Content</h3>
                    <div className="space-y-4">
                      {formData.lectures.length > 0 ? (
                        formData.lectures.map((lecture, index) => (
                          <div key={lecture._id || index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-500">
                                  Lecture {index + 1}
                                </span>
                                <h4 className="font-medium">{lecture.title || lecture.lectureTitle}</h4>
                              </div>
                            </div>
                            {lecture.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {lecture.description}
                              </p>
                            )}
                            {lecture.videoUrl && (
                              <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${extractYouTubeId(lecture.videoUrl)}`}
                                  title={lecture.title || lecture.lectureTitle}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No lectures added yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/instructor/dashboard')}
          className="mr-2"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveChanges}
          disabled={loading}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" /> 
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditCourse; 