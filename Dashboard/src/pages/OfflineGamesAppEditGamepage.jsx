import { useEffect, useState } from "react";
import { useForm, useFormState, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { getById, update, makeGameNull } from "@/store/Slices/offlinegamesappgamesSlice";
import { getAllCategoriesList } from "@/store/Slices/offlinegamesappcategorySlice";



const OfflineGamesAppEditGamepage = () => {
    const { gameId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm();
    const [loader, setloader] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { categoriesList } = useSelector((state) => state.offlinegamesappcategory);



    const gameData = useSelector((state) => state.offlinegamesappgame.game);
    const loading = useSelector((state) => state.offlinegamesappgame.loading);
    const { isDirty } = useFormState({ control });






    useEffect(() => {
        dispatch(getById({ gameId })).then(() => {
            setloader(false);
        });


        return () => {
            dispatch(makeGameNull());
        }


    }, [gameId, dispatch]);

    useEffect(() => {
        if (gameData) {
            setValue("gameName", gameData.gameName);
            setValue("description", gameData.description);
            setValue("splashColor", gameData.splashColor);
            setValue("isrotate", String(gameData.isrotate));
            setValue("slug", gameData.slug);
            setValue("points", gameData.points)
            setValue("gamePublishId", gameData?.gamePublishId);
            setSelectedCategories(gameData.category || []);
        }
    }, [gameData, setValue]);

    useEffect(() => {
        dispatch(getAllCategoriesList({}))
    }, [])




    const onSubmit = async (data) => {


        const response = await dispatch(update({ gameId, data: { ...data, category: selectedCategories } }));

        if (response.meta.requestStatus === "fulfilled") {
            navigate("/offlinegamesapp/games")
        }

    };


    const handleCategorySelect = (category) => {
        if (!selectedCategories.includes(category)) {
            setSelectedCategories([...selectedCategories, category]);
            setValue("category", [...selectedCategories, category]);
            setValue("categories", selectedCategories, { shouldDirty: true }); // Update hidden field
        }
    };

    const removeCategory = (category) => {
        const updatedCategories = selectedCategories.filter((c) => c !== category);
        setSelectedCategories(updatedCategories);
        setValue("category", updatedCategories);
        setValue("categories", updatedCategories, { shouldDirty: true }); // Update hidden field
    };





    return (
        loader ? <Loader /> : (


            <Container>
                <div className="max-w-lg mx-auto p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">

                    <div className="absolute top-0 left-0 p-4">
                        <Link
                            to="/offlinegamesapp/games"
                            className="flex items-center text-blue-600  hover:underline"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Games Page
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold text-center">Edit Game</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Game Name */}
                        <div>
                            <Label>Game Name</Label>
                            <Input
                                {...register("gameName", { required: "Game name is required" })}
                            />
                            {errors.gameName && (
                                <p className="text-red-500 text-sm">{errors.gameName.message}</p>
                            )}
                        </div>



                        {/* Slug Input */}
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

                        {/* hidden fields */}
                        <input type="hidden" {...register("categories")} />




                        {/* Description */}
                        <div>
                            <Label>Description</Label>
                            <textarea
                                {...register("description", { required: "Description is required" })}
                                className="w-full p-2 border rounded-md "
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm">{errors.description.message}</p>
                            )}
                        </div>



                        {/* Image */}
                        <div>
                            <Label>Image</Label>

                            <div className="mt-2">
                                <Input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    {...register("image", {
                                        validate: {
                                            isImageFile: (fileList) => {
                                                if (!fileList || fileList.length === 0) return true;
                                                return (
                                                    fileList[0].type.startsWith("image/") ||
                                                    "Only image files are allowed"
                                                );
                                            },
                                            isUnder1MB: (fileList) => {
                                                if (!fileList || fileList.length === 0) return true;
                                                return (
                                                    fileList[0].size <= 1 * 1024 * 1024 ||
                                                    "File size must be under 1MB"
                                                );
                                            },
                                        },
                                    })}
                                />
                            </div>
                            <span className="text-red-500 block break-all max-w-full">
                                {gameData?.imageUrl}
                            </span>

                        </div>


                        {/* Game  */}
                        <div>
                            <Label>Game</Label>

                            <div className="mt-2">
                                <Input
                                    type="file"
                                    accept=".zip"
                                    {...register("gameZip", {
                                        validate: {
                                            isZipFile: (fileList) => {
                                                if (!fileList || fileList.length === 0) return true;
                                                const file = fileList[0];
                                                return (
                                                    file.type === "application/zip" ||
                                                    file.name.endsWith(".zip") ||
                                                    "Only ZIP files are allowed"
                                                );
                                            },
                                        },
                                    })}
                                />
                            </div>
                            <span className="text-red-500 block break-all max-w-full">
                                {gameData?.gameUrl}
                            </span>
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

                        {/* orientation */}
                        <div>
                            <Label>Orientation</Label>
                            <Controller
                                name="isrotate"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setValue("isrotate", value, { shouldDirty: true }); // Mark field as dirty
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="false">Portrait</SelectItem>
                                            <SelectItem value="true">Landscape</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>


                        {loading ? (<SpecialLoadingButton content={"Editing"} />) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isDirty}>
                                Update Game
                            </Button>
                        )}
                    </form>
                </div>


            </Container>
        )
    );
};

export { OfflineGamesAppEditGamepage };
