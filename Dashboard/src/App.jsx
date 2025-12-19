import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  Loginpage, Homepage, Userpage, Gamespage,
  AddGamepage, EditGamepage, CreateUserpage,
  Categorypage, CreateCategorypage, Uploadgamezippage,
  MoreApppage, CreateApppage, UserFormpage, Reportpage, EditCategorypage,
  AllowFeaturedpage, AllowRecommendedpage, Chooseadnotificationpage,
  Choosenotificationpage, NotifyAllpage, NotifyAdAllpage, Pages,
  CreatePage, Editpage, AdBannerpage, CreateBannerpage, AdBannerwebpage,
  CreateBannerwebpage, NotifyAllWebPush, NotifyAdWebPushAllpage, Knifethrowgamespage,
  UploadKnifeThrowGamespage, KnifeAppHomeScreenNotificationpage, KnifeAppNewScreenNotificationpage,
  KnifeAppSavedScreenNotificationpage, KnifeAppAdNotificationpage
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
          <Route path="/moreapps" element={<MoreApppage />} />
          <Route path="/userforms" element={<UserFormpage />} />
          <Route path="/reports" element={<Reportpage />} />
          <Route path="/notification/choose" element={<Choosenotificationpage />} />
          <Route path="/advertisement/notification/choose" element={<Chooseadnotificationpage />} />
          <Route path="/notification/all" element={<NotifyAllpage />} />
          <Route path="/notification/webpushall" element={<NotifyAllWebPush />} />
          <Route path="/advertisement/notification/all" element={<NotifyAdAllpage />} />
          <Route path="/advertisement/notification/webpushall" element={<NotifyAdWebPushAllpage />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/create-page" element={<CreatePage />} />
          <Route path="/adbanners" element={<AdBannerpage />} />
          <Route path="/adbannersweb" element={<AdBannerwebpage />} />
          <Route path="/knifethrowgames" element={<Knifethrowgamespage />} />
          <Route path="/knifethrowgamesnotification/home" element={<KnifeAppHomeScreenNotificationpage />} />
          <Route path="/knifethrowgamesnotification/newgames" element={<KnifeAppNewScreenNotificationpage />} />
          <Route path="/knifethrowgamesnotification/saved" element={<KnifeAppSavedScreenNotificationpage />} />
          <Route path="/knifethrowgamesnotification/ad" element={<KnifeAppAdNotificationpage />} />
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
        <Route
          path="/edit-page/:slug"
          element={
            <AuthLayout authentication={true}>
              <Editpage />
            </AuthLayout>
          }
        />
        <Route
          path="/create-adbanner"
          element={
            <AuthLayout authentication={true} admin={true}>
              <CreateBannerpage />
            </AuthLayout>
          }
        />
        <Route
          path="/create-adbannerweb"
          element={
            <AuthLayout authentication={true} admin={true}>
              <CreateBannerwebpage />
            </AuthLayout>
          }
        />
        <Route
          path="/knifethrow/upload-game"
          element={
            <AuthLayout authentication={true} admin={true}>
              <UploadKnifeThrowGamespage />
            </AuthLayout>
          }
        />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>

  )
}

export default App;