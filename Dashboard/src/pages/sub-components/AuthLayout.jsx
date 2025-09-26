
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Loginpage } from "../Loginpage"
import { useLocation, useNavigate } from "react-router-dom"



const AuthLayout = ({ children, authentication = true, admin }) => {
  const status = useSelector((state) => state.auth.status)
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const role = useSelector((state) => state.auth.userData?.role);
  const isAdmin = role === "admin"
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated")
    setIsAuthenticated(storedAuth === "true" || status)

    if (role && !location.pathname.startsWith("/games") && admin && !isAdmin) {
      navigate("/games")
    }
  }, [status, location.pathname])

  if (isAuthenticated === null) return null

  if (!isAuthenticated && authentication) {
    return <Loginpage />
  }

  return children
}

export { AuthLayout }


