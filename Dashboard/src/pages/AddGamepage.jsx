import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCategories } from "@/store/Slices/categorySlice";
import { uploadGame } from "@/store/Slices/gameSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import { toast } from "sonner";





const AddGamepage = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors }, clearErrors, unregister, watch } = useForm({
    defaultValues: {
      downloadable: "", // Keep it optional
    }
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { categories } = useSelector((state) => state.category);
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.game.loading);
  const navigate = useNavigate();

  const [selectedImageType, setSelectedImageType] = useState("url");
  const [selectedGameType, setSelectedGameType] = useState("url");

  const imageType = watch("imageType", "url"); // Watch the selected image type
  const gameType = watch("gameType", "url"); // Watch the selected game type

  const gameName = watch("gameName") //watch the gamename field


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


  // fetch all categories

  useEffect(() => {
    dispatch(getAllCategories());
  }, [])


  useEffect(() => {
    setSelectedImageType(imageType);
  }, [imageType]);

  useEffect(() => {
    setSelectedGameType(gameType);
  }, [gameType]);



  const onSubmit = async (data) => {

    data.downloadable = data.downloadable || "";

    const response = await dispatch(uploadGame(data));
    if (response.meta.requestStatus === "fulfilled") {
      reset(); // Clear the form fields
      setSelectedCategories([]); // Reset category selection

      // Reset form fields related to image and game selection
      setValue("image", null);
      setValue("imageUrl", "");
      setValue("gameZip", null);
      setValue("gameUrl", "");

      // Reset dropdown selections properly
      setValue("imageType", "url");
      setValue("gameType", "url");

      // Ensure state updates correctly after form reset
      setSelectedImageType("url");
      setSelectedGameType("url");

      navigate("/games");

    }
  };


  useEffect(() => {
    if (imageType === "url") {
      unregister("image"); // Remove "image" field if "url" is selected
      setValue("image", null); // Ensure it's reset
    } else {
      unregister("imageUrl"); // Remove "imageUrl" field if "image" is selected
      setValue("imageUrl", ""); // Ensure it's reset
    }
  }, [imageType, unregister, setValue]);


  useEffect(() => {
    if (gameType === "url") {
      unregister("gameZip"); // Remove gameZip if URL is selected
      setValue("gameZip", null); // Ensure it's reset
    } else {
      unregister("gameUrl"); // Remove gameUrl if ZIP upload is selected
      setValue("gameUrl", ""); // Ensure it's reset
    }
  }, [gameType, unregister, setValue]);

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
        <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg space-y-6 relative ">
          {/* Go Back to Home Link  */}
          <div className="absolute top-0 left-0 p-4">
            <Link to="/games" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Games Page
            </Link>
          </div>

          {/* Go Back to Home */}

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
              {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register("description", { required: "Description is required" })}
                className="w-full p-2 border rounded-md   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                rows={4}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>


            {/* Category Selection */}
            <div>
              <Label>Category</Label>
              <Select onValueChange={handleCategorySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.map((category) => (
                    <SelectItem key={category._id} value={category?.name}>
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





            <div>
              {/* Image Selection */}
              <Label>Image</Label>
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




            <div>
              <Label>Game</Label>
              <Select value={selectedGameType || undefined} onValueChange={(value) => setValue("gameType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Game URL</SelectItem>
                  <SelectItem value="gameZip">Upload Game</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2">
                {selectedGameType === "url" ? (
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
                        }
                      }
                    })}
                  />
                )}

                {errors.gameUrl && <p className="text-red-500 text-sm">{errors.gameUrl.message}</p>}
                {errors.gameZip && <p className="text-red-500 text-sm">{errors.gameZip.message}</p>}
              </div>
            </div>




            {/* Splash Color */}
            <div>
              <Label>Splash Color</Label>
              <Input type="color" className="w-12 h-10 p-1" {...register("splashColor")} />
            </div>

            {/* Is Downloadable */}
            {selectedGameType !== "url" && <div>
              <Label>Is Downloadable?</Label>
              <Select
                onValueChange={(value) => {
                  setValue("downloadable", value);
                  clearErrors("downloadable");
                }}
                defaultValue=""
              >
                <SelectTrigger className={errors.downloadable ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.downloadable && <p className="text-red-500 text-sm">{errors.downloadable.message}</p>}
            </div>}

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

export { AddGamepage };
