import { useEffect, useState } from "react";
import { useForm, useFormState, Controller} from "react-hook-form";
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
import { Container, SpecialLoadingButton, Loader} from "./sub-components/";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getById, update, makeGameNull } from "@/store/Slices/offlinegamesappgamesSlice";


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
            setValue("imageUrl", gameData.imageUrl || "");
            setValue("gameUrl", gameData.gameUrl || "");
            setValue("splashColor", gameData.splashColor);
            setValue("isrotate", String(gameData.isrotate));
            setValue("slug", gameData.slug);
            setValue("gameDataUrl", gameData.gameDataUrl)
            setValue("gameZipUrl", gameData.gameZipUrl)
            setValue("points", gameData.points)
        }
    }, [gameData, setValue]);



    const onSubmit = async (data) => {

        const response = await dispatch(update({ gameId, data }));

        if (response.meta.requestStatus === "fulfilled") {
            navigate("/offlinegamesapp/games")
        }

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
                                    {...register("imageUrl", {
                                        required: "Image URL is required",
                                    })}
                                    placeholder="Enter Image URL"
                                />

                                {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                            </div>
                        </div>



                        {/* Game  */}
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
