import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader, MyEditor } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllCategoriesDashboardPopup } from "@/store/Slices/categorySlice";
import { uploadGame } from "@/store/Slices/gameSlice";
import { useSelector, useDispatch } from "react-redux";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import { toast } from "sonner";
import axios from "axios";




const AddGamepage = () => {
  const { register, handleSubmit, setValue, formState: { errors }, clearErrors, unregister, watch, control } = useForm({
    defaultValues: {
      downloadable: "",
      instruction: "",
      isDesktop: false,
      isAppOnly: false,
      isHiddenWeb: false,
      isPremium: "false"
    }
  });


  const [selectedCategories, setSelectedCategories] = useState([]);
  const { categoriespopup } = useSelector((state) => state.category);

  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.game.loading);
  const navigate = useNavigate();

  const [selectedImageType, setSelectedImageType] = useState("url");
  const [selectedGameType, setSelectedGameType] = useState("url");
  const [selectedVideoType, setSelectedVideoType] = useState("url");
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedAlphabet, setSelectedAlphabet] = useState("A");
  const [categorySearch, setCategorySearch] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const imageType = watch("imageType", "url"); // Watch the selected image type
  const gameType = watch("gameType", "url"); // Watch the selected game type
  const videoType = watch("videoType", "url"); // Watch the selected video type
  const gameName = useWatch({ name: "gameName", control });
  const slug = useWatch({ name: "slug", control });
  const isAppOnly = watch("isAppOnly");
  const isDesktop = watch("isDesktop");
  const isHiddenWeb = watch("isHiddenWeb");


  useEffect(() => {
    if (isAppOnly === "true") {
      setValue('isDesktop', 'false');
      setValue('isHiddenWeb', 'false');
    }
  }, [isAppOnly, setValue])

  useEffect(() => {
    if (isDesktop === "true") {
      setValue('isAppOnly', 'false');
      setValue('isHiddenWeb', 'false');
    }
  }, [isDesktop, setValue])

  useEffect(() => {
    if (isHiddenWeb === "true") {
      setValue('isAppOnly', 'false');
      setValue('isDesktop', 'false');
    }
  }, [isHiddenWeb, setValue])







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
    dispatch(getAllCategoriesDashboardPopup({ alphabetquery: selectedAlphabet, query: categorySearch }));
  }, [selectedAlphabet, categorySearch])


  useEffect(() => {
    setSelectedImageType(imageType);
  }, [imageType]);

  useEffect(() => {
    setSelectedGameType(gameType);
  }, [gameType]);

  useEffect(() => {
    setSelectedVideoType(videoType);
  }, [videoType])



  const onSubmit = async (data) => {

    if (!data.primaryCategory) {
      toast.error("Primary Category is required");
      return;
    }

    if (!data.category) {
      toast.error("Category is requried");
      return;
    }

    data.downloadable = data.downloadable || "";


    const response = await dispatch(uploadGame(data));
    if (response.meta.requestStatus === "fulfilled") {
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


  useEffect(() => {
    if (videoType === "url") {
      unregister("video"); // Remove video if URL is selected
      setValue("video", null); // Ensure it's reset
    } else {
      unregister("videoUrl"); // Remove videoUrl if video is selected
      setValue("videoUrl", ""); // Ensure it's reset
    }

  }, [videoType, unregister, setValue]);





  const handleCategorySelect = (category) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
      setValue("category", [...selectedCategories, category]);
    }
  };

  const handlePrimaryCategorySelect = (category) => {
    setValue("primaryCategory", category);
  }

  const removeCategory = (category) => {
    const updatedCategories = selectedCategories.filter((c) => c !== category);
    setSelectedCategories(updatedCategories);
    setValue("category", updatedCategories);
  };


  const checkSlugAvailability = useCallback(
    async (slug) => {
      try {
        setCheckingSlug(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/games/checkslug?slug=${slug}`);
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
    }, []
  )


  useEffect(() => {
    if (!slug) return;

    const delayDebounce = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 600);

    return () => clearTimeout(delayDebounce);

  }, [slug, checkSlugAvailability])



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
              {!checkingSlug && slug && slugAvailable && (
                <p className="text-green-600 text-sm">✅ Slug is available</p>
              )}
              {!checkingSlug && slug && !slugAvailable && (
                <p className="text-red-500 text-sm">❌ Slug is already taken</p>
              )}
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
            <div>
              <Label> Primary Category</Label>
              <Select onValueChange={handlePrimaryCategorySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategories && selectedCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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



            {/* Background Video */}
            <div>
              <Label>Background Video</Label>
              <Select value={selectedVideoType || undefined} onValueChange={(value) => setValue("videoType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Background Video Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Background Video URL</SelectItem>
                  <SelectItem value="image">Upload Background Video</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2">
                {selectedVideoType === "url" ? (
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

            {/* Game Visibility Options */}
            <div className="flex flex-col space-y-2">
              <Label
                htmlFor="visibilityOption"
                className="text-base text-red-600 font-medium"
              >
                Game Visibility
              </Label>

              <Select
                onValueChange={(value) => {
                  setValue("visibilityOption", value);

                  setValue("isDesktop", false);
                  setValue("isAppOnly", false);
                  setValue("isHiddenWeb", false);

                  if (value === "isDesktop") {
                    setValue("isDesktop", true);
                  } else if (value === "isAppOnly") {
                    setValue("isAppOnly", true);
                  } else if (value === "isHiddenWeb") {
                    setValue("isHiddenWeb", true);
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





            {/* GamePlay Video */}
            <div>
              <Label>Game Play Video</Label>
              <Input {...register("gamePlayVideo")} />
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instruction">Instruction</Label>
              <MyEditor
                value={watch("instruction")}
                onChange={(content) => setValue("instruction", content, { shouldValidate: true })}
              />
              {errors.instruction && <p className="text-red-500 text-sm">{errors.instruction.message}</p>}
            </div>


            {/* Submit Button */}
            {loading ? (
              <SpecialLoadingButton content={"Adding"} />
            ) : (
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!slugAvailable || checkingSlug}>
                Add Game
              </Button>
            )}
          </form>
        </div>

        {showCategoryPopup && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center px-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-6xl relative max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">

              {/* Close Button */}
              <button
                className="absolute top-4 right-6 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-3xl"
                onClick={() => setShowCategoryPopup(false)}
              >
                ✕
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                Select Categories
              </h2>

              {/* Search Input */}
              <Input
                placeholder="Search categories"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 mb-4"
              />

              {/* Alphabet Filter Row */}
              <div className="flex flex-wrap gap-1 justify-center md:justify-start mb-6">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      setSelectedAlphabet(char);
                      setCategorySearch("");
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium ${selectedAlphabet === char
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                        className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:shadow-sm transition"
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
                        <span className=" text-sm text-gray-800 dark:text-white">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Footer Action */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
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

export { AddGamepage };
