import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SpecialLoadingButton, Loader, Container } from './sub-components';
import { MyPageEditor } from './sub-components/MyPageEditor';
import { generateSlug } from '@/utils/generateSlug';
import { getPageBySlug, makePageNull } from '@/store/Slices/pageSlice';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { editPage } from '@/store/Slices/pageSlice';
const Editpage = () => {
    const [loader, setloader] = useState(true);
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors,isDirty },
    } = useForm();

    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const page = useSelector((state) => state.page.page);
    const editing = useSelector((state) => state.page.editing)



    const name = watch('name');

    // Auto-generate slug from name
    useEffect(() => {
        if (name) {
            setValue('slug', generateSlug(name), { shouldValidate: true });
        }
    }, [name, setValue]);

    // Fetch and populate form with existing data
    useEffect(() => {
        dispatch(getPageBySlug(slug)).then(() => {
            setloader(false);
        })

        return (() => {
            dispatch(makePageNull());
        })
    }, [dispatch]);

    useEffect(() => {
        if (page) {
            setValue("name", page?.name);
            setValue("slug", page?.slug);
            setValue("content", page?.content);
        }
    }, [page])

    const onSubmit = async (data) => {
        const response = await dispatch(editPage({ id: page?._id, data }));
        if (response.meta.requestStatus === 'fulfilled') {
            navigate('/pages');
        }
    };

    return (
        loader ? <Loader /> : (
            <Container className='flex justify-center items-center min-h-screen'>
                <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg space-y-6 relative">
                    {/* Go Back to Pages Page link */}
                    <div className="absolute top-4 left-4">
                        <Link to="/pages" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Pages
                        </Link>
                    </div>
                    <h2 className="text-2xl font-bold text-center mt-[10px]">Edit Page</h2>
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
                                value={watch('content')}
                                onChange={(content) =>
                                    setValue('content', content, { shouldValidate: true ,shouldDirty:true})
                                }
                            />
                            {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                        </div>

                        {/* Submit Button */}
                        {editing ? (
                            <SpecialLoadingButton content="Editing" />
                        ) : (
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!isDirty}>
                                Edit Page
                            </Button>
                        )}
                    </form>
                </div>
            </Container>


        )
    );
};

export { Editpage };
