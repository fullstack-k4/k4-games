import React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector, useDispatch } from "react-redux"
import { sendAdvertisementNotificationToAllUsers } from "@/store/Slices/offlinegamesappgamesSlice"
import { SpecialLoadingButton } from "./sub-components/"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const OfflineGamesAppAdNotificationpage = () => {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.offlinegamesappgame.notificationloading);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm()

    const onSubmit = async (data) => {

        const response = await dispatch(sendAdvertisementNotificationToAllUsers({ data }));

        if (response.meta.requestStatus === "fulfilled") {
            reset();
            navigate("/offlinegamesapp/games");
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6  ">


            <Card className="relative">

                {/* Go Back to Games Page Link  */}
                <div className="absolute top-0 left-0 p-4 ">
                    <Link to="/offlinegamesapp/games" className="flex items-center text-blue-600  hover:underline">
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Games Page
                    </Link>
                </div>

                <CardHeader>

                    <CardTitle className="text-xl mt-5">Advertisement Notification</CardTitle>
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
                            <Label htmlFor="imageUrl" className="mb-2">Image URL (Optional)</Label>
                            <Input
                                id="imageUrl"
                                placeholder="Enter image URL (optional)"
                                {...register("imageUrl")}
                            />
                        </div>
                        <div>
                            <Label htmlFor="link" className="mb-2">Link</Label>
                            <Input
                                id="link"
                                placeholder="Enter advertisement link"
                                {...register("link")}
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

export { OfflineGamesAppAdNotificationpage }
