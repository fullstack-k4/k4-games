import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Loginpage, Homepage, Userpage, Gamespage, AddGamepage, EditGamepage, CreateUserpage } from "./pages";
import { AuthLayout, Layout } from "./pages/sub-components";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/Slices/authSlice";
import { Toaster } from "sonner";




const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch])

  return (
    <>


      <Routes>
        {/* Protected Routes with Sidebar (Layout) */}
        <Route
          path="/"
          element={
            <AuthLayout authentication={true}>
              <Layout />
            </AuthLayout>
          }
        >
          <Route index element={<Homepage />} />
          <Route path="/users" element={<Userpage />} />
          <Route path="/games" element={<Gamespage />} />


        </Route>

        {/* Route (No Sidebar) */}
        <Route
          path="/login"
          element={
            <AuthLayout authentication={false}>
              <Loginpage />
            </AuthLayout>
          }
        />
        <Route
          path="/add"
          element={
            <AuthLayout authentication={true}>
              <AddGamepage />
            </AuthLayout>
          }
        />
        <Route
          path="/edit/:gameId"
          element={
            <AuthLayout authentication={true}>
              <EditGamepage />
            </AuthLayout>
          }
        />
        <Route
        path="/create-user"
        element={
          <AuthLayout authentication={true}>
            <CreateUserpage/>
          </AuthLayout>
        }
        />
      </Routes>
      <Toaster position="top-right" richColors />
    </>

  )
}

export default App;