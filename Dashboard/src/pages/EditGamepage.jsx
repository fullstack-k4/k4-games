import { useEffect, useState, useCallback } from "react";
import { useForm, useFormState, Controller, useWatch } from "react-hook-form";
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
import { Container, SpecialLoadingButton, Loader, MyEditor } from "./sub-components/";
import { Link } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getGameById, editGame, makeGameNull } from "@/store/Slices/gameSlice";
import { getAllCategoriesDashboardPopup } from "@/store/Slices/categorySlice";
import { Badge } from "@/components/ui/badge";
import axios from "axios";


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
    const [videoType, setVideoType] = useState("url");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [slugAvailable, setSlugAvailable] = useState(true);
    const [checkingSlug, setCheckingSlug] = useState(false);
    const [loader, setloader] = useState(true);
    const [selectedAlphabet, setSelectedAlphabet] = useState("#");
    const [categorySearch, setCategorySearch] = useState("");
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);




    const gameData = useSelector((state) => state.game.game);
    const editing = useSelector((state) => state.game.editing);
    const { isDirty } = useFormState({ control });
    const { categoriespopup } = useSelector((state) => state.category);
    const slug = useWatch({ name: "slug", control });
    const statusValue = watch("status");



    useEffect(() => {
        dispatch(getAllCategoriesDashboardPopup({ alphabetquery: selectedAlphabet, query: categorySearch }));
    }, [selectedAlphabet, categorySearch])



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
            setValue("instruction", gameData.instruction);
            setValue("gamePlayVideo", gameData.gamePlayVideo);
            setValue("videoUrl", gameData?.backgroundVideoUrl);
            setValue("isPremium", gameData?.isPremium === true ? "true" : "false");
            setValue("isDesktop", gameData?.isDesktop);
            setValue("isAppOnly", gameData?.isAppOnly);
            setValue("isHiddenWeb", gameData?.isHiddenWeb);
            setValue("isListed", gameData?.isListed);
            setValue("topTenCount", gameData?.topTenCount);
            setValue("likesCount", gameData?.likesCount);
            setValue("dislikesCount", gameData?.dislikesCount);
            setValue("status", gameData?.status);
            setValue("notes", gameData?.notes);
            if (gameData?.status === "scheduled" && gameData?.scheduledAt) {
                const date = new Date(gameData.scheduledAt);

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");

                const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
                setValue("scheduledAt", formatted);
            }
            setValue("notify", gameData?.notify)


            if (gameData.isDesktop) {
                setValue("visibilityOption", "isDesktop");
            } else if (gameData.isAppOnly) {
                setValue("visibilityOption", "isAppOnly");
            } else if (gameData.isHiddenWeb) {
                setValue("visibilityOption", "isHiddenWeb");
            } else if (gameData.isListed) {
                setValue("visibilityOption", "isListed")
            }
            else {
                setValue("visibilityOption", "");
            }
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
        data.scheduledAt = data.status === "scheduled" && data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null;
        data.notify = data.status === "scheduled" ? data.notify : false;
        const updatedGame = { ...data, category: selectedCategories };
        const response = await dispatch(editGame({ gameId, data: updatedGame }));

        if (response.meta.requestStatus === "fulfilled") {
            navigate("/games")
        }

    };


    const checkSlugAvailability = useCallback(
        async (slug) => {
            try {
                setCheckingSlug(true);
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/games/checkslug?slug=${slug}&gameId=${gameId}`);
                if (res.data?.statusCode === 200 && res.data?.data) {
                    setSlugAvailable(false) //slug exists
                } else {
                    setSlugAvailable(true) //slug does not exist
                }
            } catch (error) {
                setSlugAvailable(true);
            } finally {
                setCheckingSlug(false);
            }
        },
        []
    )



    useEffect(() => {
        if (!slug) return;

        const delayDebounce = setTimeout(() => {
            checkSlugAvailability(slug);
        }, 600);

        return () => clearTimeout(delayDebounce);
    }, [slug, checkSlugAvailability]);




    return (
        loader ? <Loader /> : (


            <Container>
                <div className="max-w-lg mx-auto p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">

                    {/* Link to Games Page */}
                    <div className="absolute top-0 left-0 p-4">
                        <Link
                            to="/games"
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
                            {!checkingSlug && slug && slugAvailable && (
                                <p className="text-green-600 text-sm">✅ Slug is available</p>
                            )}
                            {!checkingSlug && slug && !slugAvailable && (
                                <p className="text-red-500 text-sm">❌ Slug is already taken</p>
                            )}
                        </div>

                        {/*Plays Count  */}
                        <div>
                            <Label>Plays Count</Label>
                            <Input
                                type="number"
                                {...register("topTenCount", {
                                    required: "Plays count is required",
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "Plays count cannot be negative",
                                    },
                                })}
                            />
                            {errors.topTenCount && (
                                <p className="text-red-500 text-sm">{errors.topTenCount.message}</p>
                            )}
                        </div>

                        {/* Likes Count */}

                        <div>
                            <Label>Likes Count</Label>
                            <Input
                                type="number"
                                {...register("likesCount", {
                                    required: "Likes count is required",
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "Likes count cannot be negative",
                                    },
                                })}
                            />
                            {errors.likesCount && (
                                <p className="text-red-500 text-sm">{errors.likesCount.message}</p>
                            )}
                        </div>

                        {/* Dislikes Count */}
                        <div>
                            <Label>Dislike Count</Label>
                            <Input
                                type="number"
                                {...register("dislikesCount", {
                                    required: "dislike count is required",
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "Dislike count cannot be negative"
                                    }
                                })}
                            />
                            {errors.dislikesCount && (
                                <p className="text-red-500 text-sm">{errors.dislikesCount.message}</p>
                            )}
                        </div>


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

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes" className="text-purple-500 font-bold" >Notes</Label>
                            <textarea
                                id="notes"
                                {...register("notes")}
                                className="w-full p-2 border rounded-md   focus:outline-none focus:ring-2 focus:ring-blue-500 "
                                rows={4}
                            />
                            {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
                        </div>

                        {/* Instructions */}
                        <div>
                            <Label htmlFor="instruction">Instruction</Label>
                            <MyEditor
                                value={watch("instruction")}
                                onChange={(content) => setValue("instruction", content, { shouldValidate: true, shouldDirty: true })}
                            />
                            {errors.instruction && <p className="text-red-500 text-sm">{errors.instruction.message}</p>}
                        </div>


                        {/* hidden fields */}

                        <input type="hidden" {...register("categories")} />

                        {/* Category Selection  */}
                        <div>
                            <Button type="button" onClick={() => setShowCategoryPopup(true)}>
                                Select Categories
                            </Button>
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
                                            {selectedCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
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




                        {/* Background Video Selection */}
                        <div>
                            <Label>Background Video</Label>
                            <Select
                                onValueChange={(value) => {
                                    setVideoType(value);
                                    if (value === "video") {
                                        setValue("videoUrl", ""); // Clear Video URL
                                    } else {
                                        setValue("video", null); // Clear Video File
                                    }
                                }}
                                value={videoType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Background Video Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">Background Video  URL</SelectItem>
                                    <SelectItem value="video">Upload Background Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="mt-2">
                                {videoType === "url" ? (
                                    <Input
                                        {...register("videoUrl")}
                                        placeholder="Enter Background Video URL"
                                    />
                                ) : (
                                    <Input
                                        type="file"
                                        accept="video/mp4, video/webm, video/ogg"
                                        {...register("video")}
                                    />
                                )}
                            </div>
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

                        {/* Game Visibility Options */}
                        <div className="flex flex-col space-y-2">
                            <Label
                                htmlFor="visibilityOption"
                                className="text-base text-red-600 font-medium"
                            >
                                Game Visibility
                            </Label>

                            <Select
                                value={watch("visibilityOption")}
                                onValueChange={(value) => {
                                    setValue("visibilityOption", value);
                                    setValue("isDesktop", false);
                                    setValue("isAppOnly", false);
                                    setValue("isHiddenWeb", false);
                                    setValue("isListed", false);

                                    if (value === "isDesktop") {
                                        setValue("isDesktop", true, { shouldDirty: true });
                                    } else if (value === "isAppOnly") {
                                        setValue("isAppOnly", true, { shouldDirty: true });
                                    } else if (value === "isHiddenWeb") {
                                        setValue("isHiddenWeb", true, { shouldDirty: true });
                                    } else if (value === "isListed") {
                                        setValue("isListed", true, { shouldDirty: true });
                                    } else if (value === "unselect") {
                                        setValue("visibilityOption", "", { shouldDirty: true });
                                    }
                                }}
                            >
                                <SelectTrigger id="visibilityOption" className="w-full">
                                    <SelectValue placeholder="-- Select an Option --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="isHiddenWeb">Show Game Only in App</SelectItem>
                                    <SelectItem value="isDesktop">Desktop Only</SelectItem>
                                    <SelectItem value="isAppOnly">App Promotion</SelectItem>
                                    <SelectItem value="isListed">List</SelectItem>
                                    <SelectItem value="unselect">Unselect</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>



                        {/* VIP GAME? */}
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-4">
                                <Label
                                    htmlFor="isPremium"
                                    className="text-base text-red-600 font-medium"
                                >
                                    VIP Game?
                                </Label>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="isPremiumYes"
                                        value="true"
                                        {...register("isPremium")}
                                        className="w-4 h-4 accent-green-600 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="isPremiumYes"
                                        className="text-sm text-green-600 cursor-pointer"
                                    >
                                        Yes
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="isPremiumNo"
                                        value="false"
                                        {...register("isPremium")}
                                        className="w-4 h-4 accent-red-600 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="isPremiumNo"
                                        className="text-sm text-red-600 cursor-pointer"
                                    >
                                        No
                                    </label>
                                </div>
                            </div>
                        </div>



                        {/* Game Play Video */}
                        <div>
                            <Label>Game Play Video</Label>
                            <Input
                                {...register("gamePlayVideo")}
                            />
                        </div>



                        {/* Status Selection */}
                        <div>
                            <Label className="mb-2">Status</Label>
                            <Select
                                onValueChange={(value) => setValue("status", value, { shouldDirty: true })}
                                value={statusValue}
                            >
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                                    <SelectItem value="published" className="cursor-pointer">Published</SelectItem>
                                    <SelectItem value="scheduled" className="cursor-pointer">Schedule</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>


                        {statusValue === "scheduled" && (
                            <div>
                                <Label className="mb-2">Schedule At</Label>
                                <Input
                                    type="datetime-local"
                                    {...register("scheduledAt", { required: "Schedule date & time is required when status is scheduled" })}
                                />
                                {errors.scheduledAt && (
                                    <p className="text-red-500 text-sm">{errors.scheduledAt.message}</p>
                                )}
                            </div>
                        )}

                        {statusValue === "scheduled" && (
                            <div className="flex items-center space-x-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="notify"
                                    {...register("notify")}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                    htmlFor="notify"
                                    className="text-sm font-medium text-red-500 cursor-pointer"
                                >
                                    Notify all users when this image gets published
                                </label>
                            </div>
                        )}

                        {editing ? (<SpecialLoadingButton content={"Editing"} />) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isDirty || !slugAvailable}>
                                Update Game
                            </Button>
                        )}
                    </form>
                </div>

                {showCategoryPopup && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center px-4">
                        <div className="bg-white  p-6 rounded-xl w-full max-w-6xl relative max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 ">

                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-6 text-gray-600 hover:text-black  text-3xl"
                                onClick={() => setShowCategoryPopup(false)}
                            >
                                ✕
                            </button>

                            {/* Title */}
                            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                                Select Categories
                            </h2>

                            {/* Search Input */}
                            <Input
                                placeholder="Search categories"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="w-full border-gray-300   mb-4"
                            />

                            {/* Alphabet Filter Row */}
                            <div className="flex flex-wrap gap-1 justify-center md:justify-start mb-6">
                                {["#", ... "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((char) => (
                                    <button
                                        key={char}
                                        onClick={() => {
                                            setSelectedAlphabet(char);
                                            setCategorySearch("");
                                        }}
                                        className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium ${selectedAlphabet === char
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300  "
                                            }`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>

                            {/* Category Grid */}
                            <div className="overflow-y-auto max-h-[55vh] pr-1">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {categoriespopup.map((category) => {
                                        const isChecked = selectedCategories.includes(category.name);
                                        return (
                                            <label
                                                key={category._id}
                                                className="flex items-center space-x-2 p-2 bg-gray-100  rounded-md hover:shadow-sm transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) {
                                                            removeCategory(category.name);
                                                        } else {
                                                            handleCategorySelect(category.name);
                                                        }
                                                    }}
                                                    className="accent-blue-600"
                                                />
                                                <span className=" text-sm text-gray-800 ">{category.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="flex justify-end pt-6 border-t border-gray-200  mt-6">
                                <Button
                                    onClick={() => setShowCategoryPopup(false)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        )
    );
};

export { EditGamepage };