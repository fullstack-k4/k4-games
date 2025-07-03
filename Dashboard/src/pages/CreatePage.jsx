import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MyPageEditor } from './sub-components/MyPageEditor';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateSlug } from '@/utils/generateSlug';
import { createPage } from '@/store/Slices/pageSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SpecialLoadingButton, Loader } from './sub-components';


const CreatePage = () => {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm();
    const dispatch = useDispatch();
    const adding = useSelector((state) => state.page.adding);
    const navigate = useNavigate();
    const [loader, setloader] = useState(true);


    const name = watch("name");

    // update the slug whenever name changes

    useEffect(() => {
        if (name) {
            setValue("slug", generateSlug(name), { shouldValidate: true })
        }
    }, [name, setValue])

    useEffect(() => {
        const id = setTimeout(() => {
            setloader(false)
        }, 500)

        return () => {
            clearTimeout(id)
        }
    }, [])

    const onSubmit = async (data) => {

        const response = await dispatch(createPage(data));
        if (response.meta.requestStatus === "fulfilled") {
            reset();
            navigate("/pages");
        }
    };

    return (
        loader ? <Loader /> : (
            <div className="max-w-2xl mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Create  Page</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <Label>Name</Label>
                        <Input
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    {/* Slug Field */}
                    <div>
                        <Label>Slug</Label>
                        <Input
                            type="text"
                            {...register('slug', { required: 'Slug is required' })}
                        />
                        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                    </div>

                    {/* Content Field using TinyMCE */}

                    <div>
                        <Label htmlFor="content">Content</Label>
                        <MyPageEditor
                            value={watch("content")}
                            onChange={(content) => setValue("content", content, { shouldValidate: true })}
                        />
                        {errors.instruction && <p className="text-red-500 text-sm">{errors.instruction.message}</p>}
                    </div>


                    {/* Submit Button */}
                    {adding ? <SpecialLoadingButton content={"creating"} /> : (
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Create
                        </Button>
                    )}
                </form>
            </div>
        )
    );
};

export { CreatePage };
