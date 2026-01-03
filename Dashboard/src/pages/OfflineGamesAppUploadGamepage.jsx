import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelector, useDispatch } from "react-redux";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import { uploadGame } from "@/store/Slices/offlinegamesappgamesSlice";
import { Badge } from "@/components/ui/badge";
import { getAllCategoriesList } from "@/store/Slices/offlinegamesappcategorySlice";
import { toast } from "sonner";




const OfflineGamesAppUploadGamepage = () => {
    const { register, handleSubmit, setValue, formState: { errors }, control } = useForm({
    });

    const [loader, setloader] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { categoriesList } = useSelector((state) => state.offlinegamesappcategory);

    const dispatch = useDispatch();
    const loading = useSelector((state) => state.offlinegamesappgame.loading);
    const navigate = useNavigate();


    const gameName = useWatch({ name: "gameName", control });


    // Update slug whenever the gameName changes
    useEffect(() => {
        if (gameName) {
            setValue("slug", generateSlug(gameName), { shouldValidate: true });
        }
    }, [gameName, setValue]);


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
        dispatch(getAllCategoriesList({}))
    }, [])




    const onSubmit = async (data) => {

        if (!Array.isArray(data.category) || data.category.length === 0) {
            toast.error("Category is required");
            return;
        }

        const response = await dispatch(uploadGame(data));
        if (response.meta.requestStatus === "fulfilled") {
            navigate("/offlinegamesapp/games");
        }

    };


    const handleCategorySelect = (category) => {
        if (!selectedCategories.includes(category)) {
            setSelectedCategories([...selectedCategories, category]);
            setValue("category", [...selectedCategories, category]);
        }
    };

    const removeCategory = (category) => {
        const updatedCategories = selectedCategories.filter((c) => c !== category);
        setSelectedCategories(updatedCategories);
        setValue("category", updatedCategories);
    };





    return (
        loader ? <Loader /> : (
            <Container>
                <div className="max-w-lg mx-auto p-6 bg-white  shadow-xl rounded-lg space-y-6 relative ">
                    <div className="absolute top-0 left-0 p-4">
                        <Link to="/offlinegamesapp/games" className="flex items-center text-blue-600  hover:underline">
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Games Page
                        </Link>
                    </div>


                    <h2 className="text-2xl font-bold text-center">Add New Game</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                        {/* Game Name */}
                        <div>
                            <Label>Game Name</Label>
                            <Input {...register("gameName", { required: "Game name is required" })} />
                            {errors.gameName && <p className="text-red-500 text-sm">{errors.gameName.message}</p>}
                        </div>


                        {/* Slug */}
                        <div>
                            <Label>Slug</Label>
                            <Input
                                {...register("slug", { required: "Slug is required" })}
                                placeholder="Enter slug"
                            />
                        </div>


                        <div>
                            <Label>Category</Label>
                            <Select onValueChange={handleCategorySelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoriesList && categoriesList.map((category) => (
                                        <SelectItem key={category?._id} value={category?.name}>
                                            {category?.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedCategories.map((category) => (
                                    <Badge key={category} className="flex items-center gap-1">
                                        {category} <X className="cursor-pointer" size={12} onClick={() => removeCategory(category)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>




                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                {...register("description", { required: "Description is required" })}
                                className="w-full p-2 border rounded-md   focus:outline-none focus:ring-2 focus:ring-blue-500 "
                                rows={4}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                        </div>



                        <div>
                            <Label>Image</Label>

                            <div className="mt-2">
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
                                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
                            </div>
                        </div>



                        <div>
                            <Label>Game</Label>

                            <div className="mt-2">
                                <Input
                                    type="file"
                                    accept=".zip"
                                    {...register("gameZip", {
                                        required: "Game file is required",
                                        validate: {
                                            isZipFile: (fileList) => {
                                                const file = fileList?.[0];
                                                return file
                                                    ? file.type === "application/zip" || file.name.endsWith(".zip") || "Only ZIP files are allowed"
                                                    : "Game file is required";
                                            }
                                        }
                                    })}
                                />
                                {errors.gameZip && <p className="text-red-500 text-sm">{errors.gameZip.message}</p>}
                            </div>
                        </div>


                        {/* Points */}

                        <div>
                            <Label>Points</Label>
                            <Input {...register("points", { required: "Point is required" })} />
                            {errors.points && <p className="text-red-500 text-sm">{errors.points.message}</p>}
                        </div>

                        {/* Game Publish Id */}
                        <div>
                            <Label>Game Publish Id</Label>
                            <Input {...register("gamePublishId")} />
                            {errors.gamePublishId && <p className="text-red-500 text-sm">{errors.gamePublishId.message}</p>}
                        </div>



                        {/* Splash Color */}
                        <div>
                            <Label>Splash Color</Label>
                            <Input type="color" className="w-12 h-10 p-1" {...register("splashColor")} />
                        </div>


                        {/* Orientation */}
                        <div>
                            <Label>Orientation</Label>
                            <Select onValueChange={(value) => setValue("isrotate", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Orientation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="false">Portrait</SelectItem>
                                    <SelectItem value="true">Landscape</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>







                        {/* Submit Button */}
                        {loading ? (
                            <SpecialLoadingButton content={"Adding"} />
                        ) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                Add Game
                            </Button>
                        )}
                    </form>
                </div>

            </Container>
        )
    );
};

export { OfflineGamesAppUploadGamepage };
