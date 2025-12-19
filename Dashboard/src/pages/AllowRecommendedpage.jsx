import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { allowRecommended } from "@/store/Slices/gameSlice";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";




const AllowRecommendedpage = () => {
    const { register, handleSubmit, formState: { errors }, watch, unregister, setValue } = useForm();
    const [loader, setloader] = useState(true);
    const [selectedImageType, setSelectedImageType] = useState("url");
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.game.loading);
    const navigate = useNavigate();
    const { gameId } = useParams();


    const imageType = watch("imageType", "url") //Watch the selected image type



    // for custom loader
    useEffect(() => {
        const id = setTimeout(() => {
            setloader(false)
        }, 500)

        return () => {
            clearTimeout(id)
        }
    }, [])

    useEffect(() => {
        setSelectedImageType(imageType)
    }, [imageType])

    useEffect(() => {
        if (imageType === "url") {
            unregister("image"); //Remove image field if "url" is selected
            setValue("image", null); //Ensure it's reset
        } else {
            unregister("imageUrl"); //Remove imageUrl field if image is selected
            setValue("imageUrl", ""); //Ensure it's reset
        }

    }, [imageType, unregister, setValue])


    const onSubmit = async (data) => {
        const response = await dispatch(allowRecommended({ data, gameId }));
        if (response.meta.requestStatus === "fulfilled") {
            navigate("/games");
        }
    };



    return (
        loader ? <Loader /> : (
            <Container className="flex justify-center items-center min-h-screen">
                <div className="w-full max-w-lg p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">
                    {/* Go Back to Games Page link */}
                    <div className="absolute top-4 left-4">
                        <Link to="/games" className="flex items-center text-blue-600  hover:underline">
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Games Page
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                        <div>
                            {/* Image Selection */}
                            <Label >Recommended Image</Label>
                            <Select value={selectedImageType || undefined} onValueChange={(value) => setValue("imageType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Image Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">Image URL</SelectItem>
                                    <SelectItem value="image">Upload Image</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="mt-2">
                                {selectedImageType === "url" ? (
                                    <Input
                                        {...register("imageUrl", {
                                            required: "Image URL is required",
                                        })}
                                        placeholder="Enter Image URL"
                                    />
                                ) : (
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        {...register("image", {
                                            required: "Image file is required",
                                            validate: {
                                                isImageFile: (fileList) =>
                                                    fileList?.[0]?.type.startsWith("image/") || "Only image files are allowed",
                                                isUnder1MB: (fileList) =>
                                                    fileList?.[0]?.size <= 1 * 1024 * 1024 || "File size must be under 1MB"
                                            }
                                        })}
                                    />
                                )}

                                {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                            </div>
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

export { AllowRecommendedpage };
