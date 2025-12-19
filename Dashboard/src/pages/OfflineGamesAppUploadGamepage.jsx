import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelector, useDispatch } from "react-redux";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import { uploadGame } from "@/store/Slices/offlinegamesappgamesSlice";



const OfflineGamesAppUploadGamepage = () => {
    const { register, handleSubmit, setValue, formState: { errors }, control } = useForm({
    });

    const [loader, setloader] = useState(true);
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




    const onSubmit = async (data) => {
        const response = await dispatch(uploadGame(data));
        if (response.meta.requestStatus === "fulfilled") {
            navigate("/offlinegamesapp/games");
        }
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
                                    {...register("imageUrl", {
                                        required: "Image URL is required",
                                    })}
                                    placeholder="Enter Image URL"
                                />

                                {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                            </div>
                        </div>



                        <div>
                            <Label>Game</Label>

                            <div className="mt-2">
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
                                {errors.gameUrl && <p className="text-red-500 text-sm">{errors.gameUrl.message}</p>}
                            </div>
                        </div>

                        {/* Game Zip Url */}

                        <div>
                            <Label>Game Zip Url</Label>
                            <Input {...register("gameZipUrl", { required: "Game Zip Url is required" })} />
                            {errors.gameZipUrl && <p className="text-red-500 text-sm">{errors.gameZipUrl.message}</p>}
                        </div>

                        {/* Game Data Url */}
                        <div>
                            <Label>Game Data Url</Label>
                            <Input {...register("gameDataUrl", { required: "Game Data Url is required" })} />
                            {errors.gameDataUrl && <p className="text-red-500 text-sm">{errors.gameDataUrl.message}</p>}
                        </div>

                        {/* Points */}

                        <div>
                            <Label>Points</Label>
                            <Input {...register("points", { required: "Point is required" })} />
                            {errors.points && <p className="text-red-500 text-sm">{errors.points.message}</p>}
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
