import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { allowFeatured } from "@/store/Slices/gameSlice";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";




const AllowFeaturedpage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loader, setloader] = useState(true);
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.game.loading);
    const navigate = useNavigate();
    const { gameId } = useParams();



    // for custom loader
    useEffect(() => {
        const id = setTimeout(() => {
            setloader(false)
        }, 500)

        return () => {
            clearTimeout(id)
        }
    }, [])





    const onSubmit = async (data) => {
        const response = await dispatch(allowFeatured({ data, gameId }));
        if (response.meta.requestStatus === "fulfilled") {
            navigate("/games");
        }
    };



    return (
        loader ? <Loader /> : (
            <Container className="flex justify-center items-center min-h-screen">
                <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg space-y-6 relative">
                    {/* Go Back to Games Page link */}
                    <div className="absolute top-4 left-4">
                        <Link to="/games" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Games Page
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div>
                            <Label>Featured Image</Label>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                {...register("imageFile", {
                                    required: "Image file is required",
                                    validate: {
                                        isImageFile: (fileList) =>
                                            fileList?.[0]?.type.startsWith("image/") || "Only image files are allowed",
                                        isUnder1MB: (fileList) =>
                                            fileList?.[0]?.size <= 1 * 1024 * 1024 || "File size must be under 1MB"
                                    }
                                })}
                            />
                            {errors.imageFile && <p className="text-red-500 text-sm">{errors.imageFile.message}</p>}
                        </div>
                        <div>
                            <Label>Featured Video</Label>
                            <Input
                                type="file"
                                accept="video/*"
                                {...register("videoFile")}
                            />
                        </div>
                        {/* Submit Button */}
                        {loading ? (
                            <SpecialLoadingButton content={"Uploading"} />
                        ) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                Upload
                            </Button>
                        )}
                    </form>
                </div>
            </Container>

        )
    );
};

export { AllowFeaturedpage };
