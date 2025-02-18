
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Loginpage } from "../Loginpage"

const AuthLayout = ({ children, authentication = true }) => {
  const status = useSelector((state) => state.auth.status)
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated")
    setIsAuthenticated(storedAuth === "true" || status)
  }, [status])

  if (isAuthenticated === null) return null // Prevent flicker before state is set

  if (!isAuthenticated && authentication) {
    return <Loginpage />
  }

  return children
}

export { AuthLayout }
