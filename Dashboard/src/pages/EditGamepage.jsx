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
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getGameById, editGame, makeGameNull } from "@/store/Slices/gameSlice";
import { getAllCategories } from "@/store/Slices/categorySlice";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";


const EditGamepage = () => {
    const { gameId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm();
    const [imageType, setImageType] = useState("url");
    const [gameType, setGameType] = useState("url");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loader, setloader] = useState(true);
    const gameData = useSelector((state) => state.game.game);
    const editing = useSelector((state) => state.game.editing);
    const { isDirty } = useFormState({ control });

    const { categories } = useSelector((state) => state.category);


    // fetch all categories

    useEffect(() => {
        dispatch(getAllCategories());
    }, [])






    useEffect(() => {
        dispatch(getGameById({ gameId })).then(() => {
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
            setValue("imageUrl", gameData.imageUrl || "");
            setValue("gameUrl", gameData.gameUrl || "");
            setValue("splashColor", gameData.splashColor);
            setValue("isdownload", String(gameData.isdownload));
            setValue("isrotate", String(gameData.isrotate));
            setValue("slug", gameData.slug);
            setSelectedCategories(gameData.category || []);
            setImageType(gameData.imageUrl ? "url" : "image");
            setGameType(gameData.gameUrl ? "url" : "gameZip");
            setValue("primaryCategory", gameData.primaryCategory);
        }
    }, [gameData, setValue]);

    const handleCategorySelect = (category) => {
        if (!selectedCategories.includes(category)) {
            const updatedCategories = [...selectedCategories, category];
            setSelectedCategories(updatedCategories);
            setValue("categories", updatedCategories, { shouldDirty: true }) //Update hidden field
        }
    };

    const removeCategory = (category) => {
        const updatedCategories = selectedCategories.filter((c) => c !== category);
        setSelectedCategories(updatedCategories);
        setValue("categories", updatedCategories, { shouldDirty: true })  //Update hidden field
    };

    const onSubmit = async (data) => {
        const updatedGame = { ...data, category: selectedCategories };
        console.log(updatedGame);
        const response = await dispatch(editGame({ gameId, data: updatedGame }));

        if (response.meta.requestStatus === "fulfilled") {
            navigate("/games")

        }

    };

    return (
        loader ? <Loader /> : (


            <Container>
                <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg space-y-6 relative">

                    {/* Link to Games Page */}
                    <div className="absolute top-0 left-0 p-4">
                        <Link
                            to="/games"
                            className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
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
                            {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                        </div>


                        {/* Description */}
                        <div>
                            <Label>Description</Label>
                            <textarea
                                {...register("description", { required: "Description is required" })}
                                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm">{errors.description.message}</p>
                            )}
                        </div>


                        {/* hidden fields */}

                        <input type="hidden" {...register("categories")} />
                        {/* Category Selection  */}
                        <div>
                            <Label>Categories</Label>
                            <Select onValueChange={handleCategorySelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories && categories.map((category) => (
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

                        {/* Primary Category Selection */}
                        <div className="w-full">
                            <Label className="mb-2 ">Primary Category</Label>

                            <Controller
                                name="primaryCategory"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ""}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setValue("primaryCategory", value, { shouldDirty: true });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category?._id} value={category?.name}>{category?.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>


                        {/* Image Selection */}
                        <div>
                            <Label>Image</Label>
                            <Select
                                onValueChange={(value) => {
                                    setImageType(value);
                                    if (value === "image") {
                                        setValue("imageUrl", ""); // Clear Image URL
                                    } else {
                                        setValue("image", null); // Clear Image File
                                    }
                                }}
                                value={imageType}
                            >
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



                        {/* Game Selection */}
                        <div>
                            <Label>Game</Label>
                            <Select
                                onValueChange={(value) => {
                                    setGameType(value);
                                    if (value === "gameZip") {
                                        setValue("gameUrl", ""); // Clear Game URL
                                    } else {
                                        setValue("gameZip", null); // Clear Game Zip
                                    }
                                }}
                                value={gameType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Game Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">Game URL</SelectItem>
                                    <SelectItem value="gameZip">Upload Game</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="mt-2">
                                {gameType === "url" ? (
                                    <Input
                                        {...register("gameUrl", {
                                            required: "Game URL is required",
                                            pattern: {
                                                value: /^(https?:\/\/.*)/,
                                                message: "Enter a valid URL"
                                            }
                                        })}
                                        placeholder="Enter Game URL"
                                    />
                                ) : (
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
                                                },
                                                isUnder16MB: (fileList) => {
                                                    const file = fileList?.[0];
                                                    return file ? file.size <= 16 * 1024 * 1024 || "File size must be under 16MB" : true;
                                                }
                                            }
                                        })}
                                    />
                                )}
                            </div>
                        </div>




                        {/* Splash Color */}
                        <div>
                            <Label>Splash Color</Label>
                            <Input type="color" className="w-12 h-10 p-1" {...register("splashColor")} />
                        </div>


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



                        {editing ? (<SpecialLoadingButton content={"Editing"} />) : (
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

export { EditGamepage };
