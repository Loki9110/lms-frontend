import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Save, LayoutList, Settings, Eye, Loader2 } from 'lucide-react';
import LectureManager from '../../components/LectureManager';
import RichTextEditor from '../../components/RichTextEditor';

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    courseTitle: '',
    subTitle: '',
    description: '',
    category: '',
    courseLevel: '',
    coursePrice: '',
    courseThumbnail: null,
    lectures: []
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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

  const handleDescriptionChange = (content) => {
    setFormData({
      ...formData,
      description: content
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        e.target.value = '';
        return;
      }

      setFormData({
        ...formData,
        courseThumbnail: file
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLecturesChange = (updatedLectures) => {
    setFormData(prev => ({
      ...prev,
      lectures: updatedLectures
    }));
  };

  const handleCreateCourse = async () => {
    if (!formData.courseTitle || !formData.category || !formData.courseLevel) {
      toast.error('Course title, category, and level are required');
      return;
    }

    setLoading(true);
    try {
      // Create form data for file upload
      const data = new FormData();
      
      // First, add all non-file and non-lecture fields
      const basicFields = {
        courseTitle: formData.courseTitle,
        subtitle: formData.subTitle,
        description: formData.description,
        category: formData.category,
        level: formData.courseLevel,
        price: formData.coursePrice
      };
      
      // Add basic fields to FormData
      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });

      // Add thumbnail if exists
      if (formData.courseThumbnail) {
        data.append('thumbnail', formData.courseThumbnail);
      }

      // Transform and add lectures
      if (formData.lectures && formData.lectures.length > 0) {
        const transformedLectures = formData.lectures.map((lecture, index) => ({
          lectureTitle: lecture.lectureTitle,
          lectureDescription: lecture.lectureDescription || lecture.lectureTitle,
          videoUrl: lecture.videoUrl,
          order: index,
          _id: lecture._id
        }));
        data.append('lectures', JSON.stringify(transformedLectures));
      } else {
        data.append('lectures', JSON.stringify([]));
      }
      
      const response = await axios.post('/api/v1/course/instructor/courses', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      toast.success('Course created successfully');
      navigate(`/instructor/courses/edit/${response.data.course._id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (formData.lectures.length === 0) {
      toast.error('Please add at least one lecture before publishing');
      return;
    }

    setIsPublishing(true);
    try {
      await handleCreateCourse();
      // Additional publish logic can be added here
      toast.success('Course published successfully');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error(error.response?.data?.message || 'Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Create New Course</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCreateCourse}
            disabled={loading}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" /> 
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Draft'
            )}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading || isPublishing}
            className="flex items-center"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Course'
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
                courseId="new"
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
                    <Label htmlFor="description">Course Description</Label>
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
                    <Label htmlFor="courseThumbnail">Course Thumbnail</Label>
                    <Input
                      id="courseThumbnail"
                      name="courseThumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    {thumbnailPreview && (
                      <div className="mt-2">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
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
                <div>
                  <h3 className="text-lg font-semibold mb-2">Course Title</h3>
                  <p className="text-gray-600">{formData.courseTitle}</p>
                </div>
                {formData.subTitle && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Subtitle</h3>
                    <p className="text-gray-600">{formData.subTitle}</p>
                  </div>
                )}
                {formData.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: formData.description }} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Course Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Category:</span> {formData.category}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {formData.courseLevel}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> {formData.coursePrice ? `₹${formData.coursePrice}` : 'Free'}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Lectures</h3>
                  <div className="space-y-4">
                    {formData.lectures.map((lecture) => (
                      <div key={lecture._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{lecture.lectureTitle}</h4>
                          <span className="text-sm text-gray-500">
                            {lecture.duration} minutes
                          </span>
                        </div>
                        {lecture.lectureDescription && (
                          <p className="text-sm text-gray-600 mt-2">
                            {lecture.lectureDescription}
                          </p>
                        )}
                        <div className="mt-2">
                          <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${extractYouTubeId(lecture.videoUrl)}`}
                            title={lecture.lectureTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateCourse; 