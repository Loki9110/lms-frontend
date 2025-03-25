import Navbar from '@/components/Navbar'
import { Outlet } from 'react-router-dom'
import CourseApprovalNotification from '@/components/CourseApprovalNotification'

const MainLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
        <Navbar/>
        <CourseApprovalNotification />
        <div className='flex-1 mt-16'>
            <Outlet/>
        </div>
    </div>
  )
}

export default MainLayout