import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader, MyEditor } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory } from "@/store/Slices/offlinegamesappcategorySlice";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import axios from "axios";



const OfflineGamesAppCreateCategorypage = () => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, unregister, watch, control } = useForm();
    const [loader, setloader] = useState(true);
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.offlinegamesappcategory.loading);
    const navigate = useNavigate();


    const name = useWatch({ name: "name", control });
    const slug = useWatch({ name: "slug", control });


    // Update slug whenever the name changes
    useEffect(() => {
        if (name) {
            setValue("slug", generateSlug(name), { shouldValidate: true });
        }
    }, [name, setValue]);



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
        const response = await dispatch(createCategory(data));
        if (response.meta.requestStatus === "fulfilled") {
            reset();
            navigate("/offlinegamesapp/categories");
        }
    };




    return (
        loader ? <Loader /> : (
            <Container className="flex justify-center items-center min-h-screen">
                <div className="w-full max-w-lg p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">
                    {/* Go Back to Category Page link */}
                    <div className="absolute top-4 left-4">
                        <Link to="/offlinegamesapp/categories" className="flex items-center text-blue-600  hover:underline">
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Categories Page
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold text-center">Add New Category</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Name Field */}
                        <div>
                            <Label>Name</Label>
                            <Input
                                {...register("name", { required: "Name is required" })}
                                placeholder="Enter name"
                            />
                            {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
                        </div>

                        {/* Slug */}
                        <div>
                            <Label>Slug</Label>
                            <Input
                                {...register("slug", {
                                    required: "Slug is required",
                                })}
                                placeholder="Enter slug"
                            />
                        </div>


                        {/* Image Selection */}
                        <div>
                            <Label>Image</Label>

                            <div className="mt-2">
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                                    {...register("image", {
                                        required: "Image is required",
                                        validate: {
                                            isImageFile: (fileList) =>
                                                fileList?.[0]?.type.startsWith("image/") || "Only image files are allowed",
                                            isUnder1MB: (fileList) =>
                                                fileList?.[0]?.size <= 1 * 1024 * 1024 || "File size must be under 1MB"
                                        },
                                    })}
                                />
                                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                            </div>
                        </div>



                        {/* Submit Button */}
                        {loading ? (
                            <SpecialLoadingButton content={"Uploading"} />
                        ) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                Create Category
                            </Button>
                        )}
                    </form>
                </div>
            </Container>

        )
    );
};

export { OfflineGamesAppCreateCategorypage };
