import React from 'react'
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, DownloadCloud, UploadCloud, Link, Bug, LayoutGrid, BookText } from "lucide-react"
import { useSelector, useDispatch } from 'react-redux'
import { Loader } from './sub-components'
import { getAllDashboardData } from '@/store/Slices/dashboardSlice'



const Homepage = () => {
  const dispatch = useDispatch();
  const totalGames = useSelector((state) => state.dashboard?.dashboardData?.totalGames);
  const totalAllowedDownloads = useSelector((state) => state.dashboard?.dashboardData?.totalAllowedDownloads);
  const totalNumberOfSelfUploadedGames = useSelector((state) => state.dashboard?.dashboardData?.totalNumberOfSelfUploadedGames);
  const totalNumberofUploadedGamesByLink = useSelector((state) => state.dashboard?.dashboardData?.totalNumberofUploadedGamesByLink);
  const totalNumberofForms = useSelector((state) => state.dashboard?.dashboardData?.totalNumberofForms);
  const totalNumberofReports = useSelector((state) => state.dashboard?.dashboardData?.totalNumberofReports);
  const totalNumberofMoreApps = useSelector((state) => state.dashboard?.dashboardData?.totalNumberofMoreApps);

  const [loader, setloader] = useState(true);

  // fetching dashboard data

  useEffect(() => {

    dispatch(getAllDashboardData()).then(() => {
      setloader(false)
    });

  }, [dispatch])


  const dashboardData = [
    { id: 1, name: "Total Games", value: totalGames, icon: <Gamepad2 className="w-6 h-6 text-blue-500" /> },
    { id: 2, name: "Total Allowed Downloads", value: totalAllowedDownloads, icon: <DownloadCloud className="w-6 h-6 text-blue-500" /> },
    { id: 3, name: "Total Self Uploaded Games", value: totalNumberOfSelfUploadedGames, icon: <UploadCloud className="w-6 h-6 text-blue-500" /> },
    { id: 4, name: "Total Game Uploaded By Link", value: totalNumberofUploadedGamesByLink, icon: <Link className="w-6 h-6 text-blue-500" /> },
    { id: 5, name: "Total Apps", value: totalNumberofMoreApps, icon: <LayoutGrid className="w-6 h-6 text-blue-500" /> },
    { id: 6, name: "Total Forms", value: totalNumberofForms, icon: <BookText className="w-6 h-6 text-blue-500" /> },
    { id: 7, name: "Total Reports", value: totalNumberofReports, icon: <Bug className="w-6 h-6 text-blue-500" /> },
  ]

  return (
    loader ? <Loader /> : (
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-6 rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Admin! </h1>
            <p className="text-gray-300">Manage your dashboard with ease.</p>
          </div>
          <img
            src="/k4-media-and-technologies-mobile-logo.png"
            alt="Logo"
            className="w-32 h-16 sm:w-40 sm:h-20 md:w-48 md:h-24 lg:w-56 lg:h-28 xl:w-64 xl:h-32"
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {dashboardData.map((data) => (
            <Card key={data.id} className="bg-white  shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {data.icon}
                  <span>{data.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className='text-4xl font-bold'>
                  {data.value}
                </span>
              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    ))
}

export { Homepage }