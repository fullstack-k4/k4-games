import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container, SpecialLoadingButton, Loader } from "./sub-components/"
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link,useParams } from "react-router-dom";
import { allowDownload } from "@/store/Slices/gameSlice";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";



const Uploadgamezippage = () => {
  const { register, handleSubmit, setValue, reset, formState: { errors }, unregister, watch } = useForm();
  const [loader, setloader] = useState(true);
  const dispatch = useDispatch();
  const loading=useSelector((state)=>state.game.loading);
  const navigate = useNavigate();
  const { gameId } = useParams();



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
   const response= await dispatch(allowDownload({data,gameId}));
    if(response.meta.requestStatus === "fulfilled"){
      navigate("/games");
    }
  };



  return (
    loader ? <Loader /> : (
      <Container className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-lg p-6 bg-white  shadow-xl rounded-lg space-y-6 relative">
          {/* Go Back to Games Page link */}
          <div className="absolute top-4 left-4">
            <Link to="/games" className="flex items-center text-blue-600  hover:underline">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Games Page
            </Link>
          </div>

          <p className="text-red-500 font-bold">Note:- Zip must include gamelogo.png file </p>

          <h2 className="text-2xl font-bold text-center">Upload Zip</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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
            {/* Submit Button */}
            {loading ? (
              <SpecialLoadingButton content={"Uploading"} />
            ) : (
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Upload Zip
              </Button>
            )}
          </form>
        </div>
      </Container>

    )
  );
};

export { Uploadgamezippage };
