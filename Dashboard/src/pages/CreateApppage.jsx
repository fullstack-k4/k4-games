import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createApp } from "@/store/Slices/appSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";





const CreateApppage = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors }, unregister, watch } = useForm();
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.app.loading);
  const navigate=useNavigate();

  const [selectedimageType, setSelectedimageType] = useState("url");

  const imageType = watch("imageType", "url"); // Watch the selected image type




  // for custom loader

  useEffect(() => {
    const id = setTimeout(() => {
      setloader(false)
    }, 500)

    return () => {
      clearTimeout(id)
    }
  },[])


  useEffect(() => {
    setSelectedimageType(imageType);
  }, [imageType]);

 



  const onSubmit = async (data) => {


    const response = await dispatch(createApp(data));
    if (response.meta.requestStatus === "fulfilled") {
      reset();

      setValue("image", null);
      setValue("imageUrl", "");

      setValue("imageType", "url");

      setSelectedimageType("url");

      navigate("/moreapps");
      
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






  return (
    loader ? <Loader /> : (
        <Container className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-lg p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">
          {/* Go Back to More App Page link */}
          <div className="absolute top-4 left-4">
            <Link to="/moreapps" className="flex items-center text-blue-600  hover:underline">
              <ArrowLeft className="w-5 h-5 mr-1" />
              More Apps Page
            </Link>
          </div>
      
          <h2 className="text-2xl font-bold text-center">Add New App</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    accept="image/png, image/jpeg, image/jpg, image/webp"
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
      
            {/* Link Input Field */}
            <div>
              <Label>App Link</Label>
              <Input
                {...register("link", { required: "App link is required" })}
                placeholder="Enter link "
              />
              {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
            </div>
      
            {/* Submit Button */}
            {loading ? (
              <SpecialLoadingButton content={"Uploading"} />
            ) : (
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Create App
              </Button>
            )}
          </form>
        </div>
      </Container>
      
    )
  );
};

export { CreateApppage };
