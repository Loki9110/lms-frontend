import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

// Use relative URL to leverage the Vite proxy configuration
const USER_API = "/api/v1/user/"

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            }),
            transformErrorResponse: (response) => {
                if (response?.status === 500 && response?.data?.message?.includes('OTP')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not send OTP. Please try again or contact support.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData,
                credentials: 'include'
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log('Login error:', error);
                }
            },
            transformErrorResponse: (response) => {
                console.log('Login response error:', response);
                
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Server error. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.status === 401) {
                    return {
                        status: response.status,
                        data: {
                            message: "Invalid credentials. Please check your phone number and password.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.status === 404) {
                    return {
                        status: response.status,
                        data: {
                            message: "No account found with these credentials.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        }),
        getAllUsers: builder.query({
            query: () => ({
                url: "users",
                method: "GET",
            }),
            providesTags: ["Users"],
        }),
        getDatabaseStats: builder.query({
            query: () => ({
                url: "database-stats",
                method: "GET",
            }),
            providesTags: ["DbStats"],
        }),
        verifyPhone: builder.mutation({
            query: (data) => ({
                url: "verify-phone",
                method: "POST",
                body: data
            }),
            transformErrorResponse: (response) => {
                if (response?.data?.message?.includes('expired')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Your verification code has expired. Please request a new one.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.data?.message?.includes('Invalid OTP')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Invalid verification code. Please check and try again.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        resendOTP: builder.mutation({
            query: (data) => ({
                url: "resend-otp",
                method: "POST",
                body: data
            }),
            transformErrorResponse: (response) => {
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not send verification code. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        updateUserRole: builder.mutation({
            query: (data) => ({
                url: "user/role",
                method: "PUT",
                body: data
            }),
            invalidatesTags: ["Users"],
            transformErrorResponse: (response) => {
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not update user role. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        })
    })
});
export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useGetAllUsersQuery,
    useGetDatabaseStatsQuery,
    useVerifyPhoneMutation,
    useResendOTPMutation,
    useUpdateUserRoleMutation
} = authApi;
