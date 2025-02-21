import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadGame } from "@/store/Slices/gameSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



// If You  Add More Categories in Future add Here Also In Backend and also in editpage
const categories = ["Puzzle", "Word", "Multiplayer", "Arcade", "Recommended",
  "Brain", "Sports", "Shooting", "Animal", "Action",
  "Ball", "All-Games"];

const AddGamepage = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors }, clearErrors, unregister, watch } = useForm();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.game.loading);
  const navigate=useNavigate();

  const [selectedImageType, setSelectedImageType] = useState("url");
  const [selectedGameType, setSelectedGameType] = useState("url");

  const imageType = watch("imageType", "url"); // Watch the selected image type
  const gameType = watch("gameType", "url"); // Watch the selected game type


  // for custom loader

  useEffect(() => {
    const id = setTimeout(() => {
      setloader(false)
    }, 1000)

    return () => {
      clearTimeout(id)
    }
  },[])


  useEffect(() => {
    setSelectedImageType(imageType);
  }, [imageType]);

  useEffect(() => {
    setSelectedGameType(gameType);
  }, [gameType]);



  const onSubmit = async (data) => {

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

  // Register field manually for validation
  useEffect(() => {
    register("isdownload", {
      required: "This field is required",
    });
  }, [register]);

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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
                      pattern: {
                        value: /^(https?:\/\/.*\.(jpg|jpeg|png|webp))$/,
                        message: "Enter a valid image URL (jpg, jpeg, png, webp)"
                      }
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
                        isUnder4MB: (fileList) =>
                          fileList?.[0]?.size <= 4 * 1024 * 1024 || "File size must be under 4MB"
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
                        },
                        isUnder16MB: (fileList) => {
                          const file = fileList?.[0];
                          return file ? file.size <= 16 * 1024 * 1024 || "File size must be under 16MB" : true;
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
            <div>
              <Label>Is Downloadable?</Label>
              <Select
                onValueChange={(value) => {
                  setValue("isdownload", value);
                  clearErrors("isdownload");
                }}
              >
                <SelectTrigger className={errors.isdownload ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Yes</SelectItem>
                  <SelectItem value="true">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.isdownload && <p className="text-red-500 text-sm">{errors.isdownload.message}</p>}
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

export { AddGamepage };
