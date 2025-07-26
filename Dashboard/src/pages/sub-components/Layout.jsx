import { NavLink } from "react-router-dom"
import { Outlet, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Home, Users, Gamepad2, LogIn, Menu, ChartColumnStacked,
  MessageSquare, LayoutGrid, BookText, Bug, Bell, BookOpenText,
  Megaphone
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { userLogout } from "@/store/Slices/authSlice"


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const admin = useSelector((state) => state.auth.admin);

  const handleLogout = async () => {
    const response = await dispatch(userLogout())
    if (response?.type === "logout/fulfilled") {
      navigate("/login")
    }
  }

  return (
    <div
      className={`h-screen min-h-screen bg-gray-900 text-white flex flex-col p-4 transition-all duration-300 
        fixed md:relative z-50 ${isOpen ? "w-64" : "w-16"}`}
    >
      {/* Logo and Toggle Button */}
      <div className="flex items-center justify-between">
        {isOpen && <div className="text-xl font-bold">Dashboard</div>}
        <button
          onClick={toggleSidebar}
          className="p-2 text-white focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-4 overflow-y-scroll scrollbar-hide mb-5">
        <ul className="space-y-2">


          {admin && <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              <Home className="w-5 h-5" />
              {isOpen && <span>Home</span>}
            </NavLink>
          </li>}

          {admin && <li>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              <Users className="w-5 h-5" />
              {isOpen && <span>Users</span>}
            </NavLink>
          </li>}

          {admin &&
            <li>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <ChartColumnStacked className="w-5 h-5" />
                {isOpen && <span>Categories</span>}
              </NavLink>
            </li>}


          <li>
            <NavLink
              to="/games"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
              }
            >
              <Gamepad2 className="w-5 h-5" />
              {isOpen && <span>Games</span>}
            </NavLink>
          </li>



          {admin && <>
            <li>
              <NavLink
                to="/popups"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <MessageSquare className="w-5 h-5" />
                {isOpen && <span>Popups</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/moreapps"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <LayoutGrid className="w-5 h-5" />
                {isOpen && <span>More Apps</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/userforms"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <BookText className="w-5 h-5" />
                {isOpen && <span>User Forms</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Bug className="w-5 h-5" />
                {isOpen && <span>Reports</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/notification/choose"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Bell className="w-5 h-5" />
                {isOpen && <span>Send Notification</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/advertisement/notification/choose"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Bell className="w-5 h-5" />
                {isOpen && <span>Ad Notification</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pages"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <BookOpenText className="w-5 h-5" />
                {isOpen && <span>Pages</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/adbanners"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Megaphone className="w-5 h-5" />
                {isOpen && <span>Ad Banners</span>}
              </NavLink>
            </li>

          </>}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <Button
          variant="destructive"
          className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          onClick={handleLogout}
        >
          <LogIn className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}

const Layout = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768)

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => setIsOpen((prev) => !prev)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main
        className={`flex-grow p-4 bg-gray-100 overflow-auto transition-all duration-300 
          ${isOpen ? "ml-64 md:ml-0" : "ml-16 md:ml-0"}`}
      >
        <Outlet />
      </main>
    </div>
  )
}



export { Layout }
