import React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector, useDispatch } from "react-redux"
import { sendNormalWebPushNotification } from "@/store/Slices/webpushnotificationSlice"
import { SpecialLoadingButton } from "./sub-components/"
import { useNavigate } from "react-router-dom"

const NotifyAllWebPush = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.webpushnotification.loading);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (data) => {

    const response = await dispatch(sendNormalWebPushNotification({ data }));


    if (response.meta.requestStatus === "fulfilled") {
      reset();
      navigate("/notification/choose");
    }

  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notify All Users (Webpush)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2">Title</Label>
              <Input
                id="title"
                placeholder="Enter notification title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="body" className="mb-2">Body</Label>
              <Input
                id="body"
                placeholder="Enter body"
                {...register("body", { required: "Body is required" })}
              />
              {errors.body && (
                <p className="text-sm text-red-500 mt-1">{errors.body.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image" className="mb-2">Image URL (Optional)</Label>
              <Input
                id="image"
                placeholder="Enter image URL (optional)"
                {...register("image")}
              />
            </div>
            {/* Submit Button */}
            {loading ? (
              <SpecialLoadingButton content={"Sending"} />
            ) : (
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Send
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export { NotifyAllWebPush }
