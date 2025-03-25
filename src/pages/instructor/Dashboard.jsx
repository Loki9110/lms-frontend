import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Edit, Phone, Mail, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all courses for the instructor
        console.log('Fetching instructor courses...');
        const coursesResponse = await axios.get('/api/v1/course/instructor/courses', {
          withCredentials: true
        });
        console.log('Courses response:', coursesResponse.data);
        if (!coursesResponse.data.success) {
          console.error('Error in courses response:', coursesResponse.data.message);
          toast.error('Failed to load courses: ' + coursesResponse.data.message);
          return;
        }
        setCourses(coursesResponse.data.courses || []);

        // Fetch all users with role USER
        console.log('Fetching users...');
        const usersResponse = await axios.get('/api/v1/user/users', {
          withCredentials: true
        });
        console.log('Users response:', usersResponse.data);
        if (!usersResponse.data.success) {
          console.error('Error in users response:', usersResponse.data.message);
          toast.error('Failed to load users: ' + usersResponse.data.message);
          return;
        }
        setUsers(usersResponse.data.users || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Failed to load dashboard data');
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          console.error('Error setting up request:', error.message);
          toast.error('Failed to set up request. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on search query and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    try {
      const response = await axios.delete(`/api/v1/course/instructor/courses/${courseToDelete._id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Course deleted successfully');
        setCourses(courses.filter(course => course._id !== courseToDelete._id));
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      } else {
        console.error('Error deleting course:', response.data.message);
        toast.error('Failed to delete course: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Failed to delete course');
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error('Failed to set up request. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
        <Button onClick={() => navigate('/instructor/courses/create')}>
          Create Course
        </Button>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading courses...</TableCell>
                      </TableRow>
                    ) : filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No courses found</TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.map((course) => (
                        <TableRow key={course._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {course.courseThumbnail && (
                                <img 
                                  src={course.courseThumbnail} 
                                  alt={course.courseTitle}
                                  className="h-10 w-16 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{course.courseTitle}</div>
                                {course.subTitle && (
                                  <div className="text-sm text-gray-500">{course.subTitle}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{course.courseLevel || 'Not set'}</TableCell>
                          <TableCell>₹{course.coursePrice || 'Free'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {course.status || 'draft'}
                            </span>
                          </TableCell>
                          <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/instructor/courses/edit/${course._id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(course)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading users...</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {user.email || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {user.phone_number}
                            </div>
                          </TableCell>
                          <TableCell>{user.enrolledCourses?.length || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{courseToDelete?.courseTitle}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard; 