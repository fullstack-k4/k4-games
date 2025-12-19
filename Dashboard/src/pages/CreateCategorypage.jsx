import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader, MyEditor } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory } from "@/store/Slices/categorySlice";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateSlug } from "@/utils/generateSlug";
import axios from "axios";



const CreateCategorypage = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors }, unregister, watch, control } = useForm();
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const adding = useSelector((state) => state.category.adding);
  const navigate = useNavigate();

  const [selectedimageType, setSelectedimageType] = useState("url");
  const [selectediconType, setSelectediconType] = useState("url");
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const imageType = watch("imageType", "url"); // Watch the selected image type
  const iconType = watch("iconType", "url"); // Watch the selected icon type
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


  useEffect(() => {
    setSelectedimageType(imageType);
  }, [imageType]);

  useEffect(() => {
    setSelectediconType(iconType)
  }, [iconType])


  const onSubmit = async (data) => {
    const response = await dispatch(createCategory(data));
    if (response.meta.requestStatus === "fulfilled") {
      reset();
      navigate("/categories");
    }
  };


  useEffect(() => {
    if (imageType === "url") {
      unregister("image");
      setValue("image", null);
    } else {
      unregister("imageUrl");
      setValue("imageUrl", "");
    }
  }, [imageType, unregister, setValue]);


  useEffect(() => {
    if (iconType === "url") {
      unregister("icon");
      setValue("icon", null);
    } else {
      unregister("iconUrl");
      setValue("iconUrl", "");
    }
  }, [iconType, unregister, setValue]);



  const checkSlugAvailability = useCallback(
    async (slug) => {
      try {
        setCheckingSlug(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/category/checkslug?slug=${slug}`);
        if (res.data?.statusCode === 200 && res.data?.data) {
          setSlugAvailable(false); // slug exists
        } else {
          setSlugAvailable(true); // slug does not exist
        }
      } catch (error) {
        setSlugAvailable(true);
      } finally {
        setCheckingSlug(false);
      }
    },
    []
  );


  useEffect(() => {
    if (!slug) return;

    const delayDebounce = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [slug, checkSlugAvailability]);




  return (
    loader ? <Loader /> : (
      <Container className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-lg p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">
          {/* Go Back to Category Page link */}
          <div className="absolute top-4 left-4">
            <Link to="/categories" className="flex items-center text-blue-600  hover:underline">
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
              {!checkingSlug && slug && slugAvailable && (
                <p className="text-green-600 text-sm">✅ Slug is available</p>
              )}
              {!checkingSlug && slug && !slugAvailable && (
                <p className="text-red-500 text-sm">❌ Slug is already taken</p>
              )}
            </div>


            {/* Image Selection */}
            <div>
              <Label>Image</Label>
              <Select value={selectedimageType || undefined} onValueChange={(value) => setValue("imageType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Image Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Image URL</SelectItem>
                  <SelectItem value="image">Upload Image</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2">
                {selectedimageType === "url" ? (
                  <Input
                    {...register("imageUrl", { required: "Image URL is required" })}
                    placeholder="Enter Image URL"
                  />
                ) : (
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
                )}

                {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
              </div>
            </div>


            {/* Icon Selection */}
            <div>
              <Label>Icon</Label>
              <Select value={selectediconType || undefined} onValueChange={(value) => setValue("iconType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Icon Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Icon URL</SelectItem>
                  <SelectItem value="image">Upload Icon</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2">
                {selectediconType === "url" ? (
                  <Input
                    {...register("iconUrl", { required: "Icon URL is required" })}
                    placeholder="Enter Icon URL"
                  />
                ) : (
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    {...register("icon", {
                      required: "Icon is required",
                      validate: {
                        isImageFile: (fileList) =>
                          fileList?.[0]?.type.startsWith("image/") || fileList?.[0]?.type === "image/svg+xml" || "Only image files are allowed",
                        isUnder1MB: (fileList) =>
                          fileList?.[0]?.size <= 1 * 1024 * 1024 || "File size must be under 1MB",
                      },
                    })}
                  />

                )}

                {errors.iconUrl && <p className="text-red-500 text-sm">{errors.iconUrl.message}</p>}
                {errors.icon && <p className="text-red-500 text-sm">{errors.icon.message}</p>}
              </div>
            </div>


            {/* Gradient Color Selection */}
            <div>
              <Label className="block mb-2">Gradient Color</Label>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs mb-1">Start</span>
                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    {...register("gradientColor1")}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs mb-1">End</span>
                  <Input
                    type="color"
                    className="w-12 h-10 p-1"
                    {...register("gradientColor2")}
                  />
                </div>
              </div>
            </div>



            {/* Is SideBar CheckBox */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="isSidebar" className="text-base">Display on Sidebar?</Label>
              <input
                type="checkbox"
                id="isSidebar"
                {...register("isSidebar")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>


            {/* Order */}
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                {...register("order", {
                  required: "Order is required",
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Order must be 0 or higher",
                  },
                })}
                placeholder="Enter display order"
              />
              {errors.order && <p className="text-red-500 text-sm">{errors.order.message}</p>}
            </div>


            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <MyEditor
                value={watch("description")}
                onChange={(content) => setValue("description", content, { shouldValidate: true })}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>




            {/* Submit Button */}
            {adding ? (
              <SpecialLoadingButton content={"Uploading"} />
            ) : (
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!slugAvailable || checkingSlug}>
                Create Category
              </Button>
            )}
          </form>
        </div>
      </Container>

    )
  );
};

export { CreateCategorypage };
