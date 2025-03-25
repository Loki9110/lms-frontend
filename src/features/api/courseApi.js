import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Use the environment variable for the API URL
const COURSE_API = `${import.meta.env.VITE_API_URL}/course`;

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture", "Published_Courses", "RequestStatus"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState, endpoint, body, queryArgs }) => {
      // For FormData, don't set Content-Type header at all
      if (!(body instanceof FormData) && !queryArgs?.formData) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: (formData) => {
        console.log("createCourse mutation called");
        // Log FormData entries for debugging
        if (formData instanceof FormData) {
          console.log("FormData entries for create:");
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? 
              `File (${value.name}, ${(value.size/1024).toFixed(2)}KB)` : value);
          }
        }
        
        return {
          url: `${COURSE_API}`,
          method: "POST",
          body: formData,
          formData: true, // Signal that this is FormData
        };
      },
      invalidatesTags: ["Refetch_Creator_Course"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Created course:', data);
          
          // Explicitly trigger a refetch of the creator courses
          dispatch(courseApi.util.invalidateTags(["Refetch_Creator_Course"]));
        } catch (err) {
          console.error('Error creating course:', err);
        }
      },
    }),
    getSearchCourse:builder.query({
      query: ({searchQuery, categories, sortByPrice}) => {
        // Build query string
        let queryString = `${COURSE_API}/search?query=${encodeURIComponent(searchQuery)}`;

        // append category 
        if(categories && categories.length > 0) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`; 
        }

        // Append sortByPrice is available
        if(sortByPrice){
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`; 
        }

        return {
          url: queryString,
          method:"GET", 
        };
      }
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: '/course/published-courses',
        method: "GET",
      }),
      providesTags: ["Published_Courses"],
      transformResponse: (response) => {
        console.log('Published courses response:', response);
        if (response && response.success) {
          return response;
        }
        return { success: false, courses: [] };
      },
      transformErrorResponse: (error) => {
        console.error('Error fetching published courses:', error);
        return { 
          success: false, 
          courses: [], 
          message: error.data?.message || "Failed to load courses"
        };
      },
    }),
    getCreatorCourse: builder.query({
      query: () => `${COURSE_API}/`,
      providesTags: ['Refetch_Creator_Course'],
      transformResponse: (response) => {
        console.log('Creator courses response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('Error fetching creator courses:', error);
        return { courses: [] };
      }
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => {
        console.log("editCourse mutation called with courseId:", courseId);
        
        // Log basic info for debugging
        console.log("FormData being sent for course ID:", courseId);
        
        // Build the correct URL
        const url = `/api/v1/course/${courseId}`;
        
        return {
          url: url,
          method: 'PUT',
          body: formData,
          // Important: Do not set Content-Type header for FormData requests
          // The browser will automatically set the right Content-Type with boundary
          formData: true
        };
      },
      async onQueryStarted({ courseId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Course updated successfully:", data);
          
          // Invalidate relevant tags to refresh the data
          dispatch(
            courseApi.util.invalidateTags([
              { type: 'Course', id: courseId },
              'Courses',
              'Refetch_Creator_Course'
            ])
          );
        } catch (error) {
          console.error("Error in onQueryStarted:", error);
        }
      },
      transformResponse: (response) => {
        if (!response) {
          throw new Error('No response received from server');
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.log("Transform error response:", response);
        
        // Handle different error status codes with clear messages
        switch (response.status) {
          case 413:
            return {
              status: 413,
              data: { message: 'File is too large. Maximum size is 10MB.' }
            };
          case 400:
            return {
              status: 400,
              data: { message: response.data?.message || 'Invalid data. Please check your form inputs and try again.' }
            };
          case 401:
            return {
              status: 401,
              data: { message: 'You need to log in again to perform this action.' }
            };
          case 403:
            return {
              status: 403,
              data: { message: 'You do not have permission to edit this course.' }
            };
          case 404:
            return {
              status: 404,
              data: { message: 'Course not found. It may have been deleted.' }
            };
          case 500:
            return {
              status: 500,
              data: { message: response.data?.message || 'Server error occurred. Please try again.' }
            };
          default:
            return {
              status: response.status || 500,
              data: { message: response.data?.message || `Error: ${response.error || 'Unknown error'}` }
            };
        }
      }
    }),
    getCourseById: builder.query({
      query: (courseId) => {
        console.log('Fetching course by ID:', courseId);
        return {
          url: `${COURSE_API}/${courseId}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        console.log('Course by ID response:', response);
        if (response.success) {
          return response;
        }
        throw {
          status: 500,
          data: { message: response.message || "Failed to fetch course" },
        };
      },
      transformErrorResponse: (error) => {
        console.error('Error fetching course by ID:', error);
        return {
          status: error.status,
          message: error.data?.message || "An unexpected error occurred while fetching course",
          data: error.data,
        };
      },
    }),
    createLecture: builder.mutation({
      query: ({ courseId, title, description, videoUrl }) => ({
        url: `${COURSE_API}/lecture/${courseId}`,
        method: "POST",
        body: { title, description, videoUrl },
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [
            { type: "Course", id: "LIST" },
            { type: "Course", id: result.course?._id },
          ];
        }
        return [{ type: "Course", id: "LIST" }];
      },
      transformResponse: (response) => {
        if (response.success) {
          // Make sure lectures have the proper title format for frontend
          if (response.course && response.course.lectures) {
            response.course.lectures = response.course.lectures.map(lecture => ({
              ...lecture,
              lectureTitle: lecture.title || lecture.lectureTitle || "Untitled"
            }));
          }
          
          return {
            ...response,
            message: response.message || "Lecture created successfully",
          };
        }
        throw {
          status: 500,
          data: { message: response.message || "Failed to create lecture" },
        };
      },
      transformErrorResponse: (error) => {
        return {
          status: error.status,
          message: error.data?.message || "An unexpected error occurred while creating lecture",
        };
      },
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `${COURSE_API}/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: (result) => {
        if (result?.success) {
          return [
            { type: "Course", id: "LIST" },
            { type: "Course", id: result.course?._id },
          ];
        }
        return [{ type: "Course", id: "LIST" }];
      },
      transformResponse: (response) => {
        if (response.success) {
          return response;
        }
        return { success: false, lectures: [] };
      },
    }),
    editLecture: builder.mutation({
      query: ({
        title,
        description,
        videoUrl,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `${COURSE_API}/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { title, description, videoUrl, isPreviewFree },
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [
            { type: "Course", id: "LIST" },
            { type: "Course", id: result.course?._id },
          ];
        }
        return [{ type: "Course", id: "LIST" }];
      },
      transformResponse: (response) => {
        if (response.success) {
          return {
            ...response,
            message: response.message || "Lecture updated successfully",
          };
        }
        throw {
          status: 500,
          data: { message: response.message || "Failed to update lecture" },
        };
      },
      transformErrorResponse: (error) => {
        return {
          status: error.status,
          message: error.data?.message || "An unexpected error occurred while updating lecture",
        };
      },
    }),
    removeLecture: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `${COURSE_API}/lecture/${lectureId}?courseId=${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => {
        if (result?.success) {
          return [
            { type: "Course", id: "LIST" },
            { type: "Course", id: result.course?._id },
          ];
        }
        return [{ type: "Course", id: "LIST" }];
      },
      transformResponse: (response) => {
        if (response.success) {
          return {
            ...response,
            message: response.message || "Lecture removed successfully",
          };
        }
        throw {
          status: 500,
          data: { message: response.message || "Failed to remove lecture" },
        };
      },
      transformErrorResponse: (error) => {
        return {
          status: error.status,
          message: error.data?.message || "An unexpected error occurred while removing lecture",
        };
      },
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `${COURSE_API}/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, status }) => {
        console.log('Making publish request:', { courseId, status });
        return {
          url: `${COURSE_API}/publish/${courseId}`,
          method: "POST",
          body: { status },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-HTTP-Method-Override': 'PATCH'
          }
        };
      },
      // Always invalidate these tags to force a refetch
      invalidatesTags: ["Refetch_Creator_Course", "Published_Courses", "Refetch_Lecture"],
      transformResponse: (response) => {
        console.log('Publish course response:', response);
        if (response && response.success) {
          return {
            ...response,
            message: response.message || `Course ${response.course?.status === 'active' ? 'published' : 'unpublished'} successfully`
          };
        }
        throw {
          status: 500,
          data: { message: response.message || "Failed to update course status" },
        };
      },
      transformErrorResponse: (error) => {
        console.error('Error updating course status:', error);
        return {
          status: error.status,
          message: error.data?.message || "Failed to update course status. Please try again.",
          data: error.data,
        };
      },
    }),
    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `${COURSE_API}/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Creator_Course", "Published_Courses"],
    }),
    getUserRequestStatus: builder.query({
      query: (courseId) => `/courses/${courseId}/request-status`,
      providesTags: (result, error, courseId) => [
        { type: 'RequestStatus', id: courseId }
      ]
    }),
    requestAccess: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}/request-access`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'RequestStatus', id: courseId }
      ]
    }),
    getCourseProgress: builder.query({
      query: (courseId) => `/courses/${courseId}/progress`,
      providesTags: (result, error, courseId) => [
        { type: 'CourseProgress', id: courseId }
      ]
    })
  }),
});
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
  useGetUserRequestStatusQuery,
  useRequestAccessMutation,
  useGetCourseProgressQuery,
} = courseApi;
