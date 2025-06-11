import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  Loginpage, Homepage, Userpage, Gamespage,
  AddGamepage, EditGamepage, CreateUserpage,
  Categorypage, CreateCategorypage, Uploadgamezippage,
  Popuppage, CreatePopuppage, MoreApppage,
  CreateApppage, UserFormpage, Reportpage, EditCategorypage,
  AllowFeaturedpage, AllowRecommendedpage
} from "./pages";
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
            <AuthLayout authentication={true} admin={true}>
              <Layout />
            </AuthLayout>
          }
        >
          <Route index element={<Homepage />} />
          <Route path="/users" element={<Userpage />} />
          <Route path="/games" element={<Gamespage />} />
          <Route path="/categories" element={<Categorypage />} />
          <Route path="/popups" element={<Popuppage />} />
          <Route path="/moreapps" element={<MoreApppage />} />
          <Route path="/userforms" element={<UserFormpage />} />
          <Route path="/reports" element={<Reportpage />} />
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
            <AuthLayout authentication={true} admin={true}>
              <CreateUserpage />
            </AuthLayout>
          }
        />
        <Route
          path="/create-category"
          element={
            <AuthLayout authentication={true} admin={true}>
              <CreateCategorypage />
            </AuthLayout>
          }
        />
        <Route
          path="/upload-zip/:gameId"
          element={
            <AuthLayout authentication={true}>
              <Uploadgamezippage />
            </AuthLayout>
          }
        />
        <Route
          path="/create-popup"
          element={
            <AuthLayout authentication={true} admin={true}>
              <CreatePopuppage />
            </AuthLayout>
          }
        />
        <Route
          path="/create-app"
          element={
            <AuthLayout authentication={true} admin={true}>
              <CreateApppage />
            </AuthLayout>
          }
        />
        <Route
          path="/edit-category/:id"
          element={
            <AuthLayout authentication={true} admin={true}>
              <EditCategorypage />
            </AuthLayout>
          }
        />
        <Route
          path="/allow-featured/:gameId"
          element={
            <AuthLayout authentication={true}>
              <AllowFeaturedpage />
            </AuthLayout>
          }
        />
        <Route
          path="/allow-recommended/:gameId"
          element={
            <AuthLayout authentication={true}>
              <AllowRecommendedpage />
            </AuthLayout>
          }
        />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>

  )
}

export default App;