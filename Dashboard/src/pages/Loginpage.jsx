import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useDispatch, useSelector } from 'react-redux';
import { SpecialLoadingButton } from './sub-components/SpecialLoadingButton';
import { userLogin, getCurrentUser } from '@/store/Slices/authSlice';
import { Container } from './sub-components/';
import { Eye, EyeOff } from 'lucide-react';



const Loginpage = () => {

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth?.loading);
  const [showPassword, setshowPassword] = useState(false);


  const submit = async (data) => {
    const response = await dispatch(userLogin(data));
    const user = await dispatch(getCurrentUser());

    if (response?.type ==="login/fulfilled" ) {
      if(user.payload.role==="admin"){
        navigate("/")
      }
      else{
        navigate("/games");
      }
    }
  }

  const togglePasswordVisibility = () => {
    setshowPassword((prev) => !prev);
  }




  return (
    <Container>
      <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
        <div className=" min-h-[100vh] flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold"> Dashboard Login</h1>
              <p className="text-balance text-muted-foreground">
                Enter  email below to login to Dashboard
              </p>
            </div>
            <form onSubmit={handleSubmit(submit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email", {
                      required: "Email is required",
                    })}
                  />
                  {errors.email && (
                    <div className="text-red-700">{errors.email.message}</div>
                  )}
                </div>
                <div className="grid gap-2 relative">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                      })}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="text-red-700">{errors.password.message}</div>
                  )}
                </div>
                {loading ? (
                  <SpecialLoadingButton content={"Logging In"} />
                ) : (
                  <Button
                    className="w-full"
                  >
                    Login
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="flex justify-center items-center ">
          <img src="/login.png" alt="login" />
        </div>
      </div>
    </Container>)
}

export { Loginpage };