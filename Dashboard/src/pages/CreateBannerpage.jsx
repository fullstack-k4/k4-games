import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton } from "./sub-components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAdBanner } from "../store/Slices/addbannerSlice.js"
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateBannerpage = () => {
    const { register, handleSubmit, setValue, reset, watch, formState: { errors }, unregister } = useForm();
    const [tab, setTab] = useState("image");
    const [imageType, setImageType] = useState("url");
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.adbanner.loading);
    const navigate = useNavigate();

    const watchedImageType = watch("imageType", "url");

    useEffect(() => {
        setImageType(watchedImageType);
    }, [watchedImageType]);

    useEffect(() => {
        if (tab === "adsense") {
            unregister("image");
            unregister("imageUrl");
            unregister("link");
            unregister("imageType");
        } else {
            unregister("adsenseId");
        }
    }, [tab, unregister]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            type: tab,
        };

        const response = await dispatch(createAdBanner(payload));
        if (response.meta.requestStatus === "fulfilled") {
            navigate("/adbanners");
        }
    };

    const positions = ["Home_Top", "Home_Bottom", "Home_Sticky", "Game_Sticky", "Game_Category", "Bottom_Sticky", "Pop_Up", "Game_Exit", "Home_Mid"];


    return (
        <Container className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-2xl relative p-6 bg-white  shadow-xl rounded-lg space-y-6">
                {/* Go Back to Popup Page link */}
                <div className="absolute top-4 left-4">
                    <Link to="/adbanners" className="flex items-center text-blue-600  hover:underline">
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Android App Ads Page
                    </Link>
                </div>
                <h2 className="text-2xl font-bold text-center">Create Android App Ads</h2>

                {/* Tabs */}
                <div className="flex justify-center space-x-4">
                    <Button variant={tab === "image" ? "default" : "outline"} onClick={() => setTab("image")}>
                        Image
                    </Button>
                    <Button variant={tab === "adsense" ? "default" : "outline"} onClick={() => setTab("adsense")}>
                        Adsense
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Shared: Position */}
                    <div>
                        <Label>Position</Label>
                        <Select onValueChange={(val) => setValue("position", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                        {pos.replace(/_/g, " ")} 
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
                    </div>




                    {tab === "image" && (
                        <>
                            {/* Image Type Select */}
                            <div>
                                <Label>Image Type</Label>
                                <Select value={imageType} onValueChange={(val) => setValue("imageType", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Image Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="url">Image URL</SelectItem>
                                        <SelectItem value="image">Upload Image</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="mt-2">
                                    {imageType === "url" ? (
                                        <Input
                                            {...register("imageUrl", { required: "Image URL is required" })}
                                            placeholder="Enter Image URL"
                                        />
                                    ) : (
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            {...register("image", {
                                                required: "Image is required",
                                                validate: {
                                                    isImage: fileList =>
                                                        fileList?.[0]?.type.startsWith("image/") || "Only image files are allowed",
                                                    under1MB: fileList =>
                                                        fileList?.[0]?.size <= 1 * 1024 * 1024 || "Max file size is 1MB"
                                                }
                                            })}
                                        />
                                    )}
                                    {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                                    {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                                </div>
                            </div>

                            {/* Link Field */}
                            <div>
                                <Label>Link</Label>
                                <Input
                                    {...register("link", { required: "Link is required" })}
                                    placeholder="https://example.com"
                                />
                                {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
                            </div>
                        </>
                    )}

                    {tab === "adsense" && (
                        <div>
                            <Label>Adsense ID</Label>
                            <Input
                                {...register("adsenseId", { required: "Adsense ID is required" })}
                                placeholder="Enter Adsense ID"
                            />
                            {errors.adsenseId && <p className="text-red-500 text-sm">{errors.adsenseId.message}</p>}
                        </div>
                    )}

                    {/* Submit */}
                    {loading ? (
                        <SpecialLoadingButton content="Uploading..." />
                    ) : (
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Create Banner
                        </Button>
                    )}
                </form>
            </div>
        </Container>
    );
};

export { CreateBannerpage };
