import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

const MyEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);

    return (
        <Editor
            onInit={(_, editor) => (editorRef.current = editor)}
            apiKey={import.meta.env.VITE_TINY_MCE_API_KEY}
            value={value}
            init={{
                height: 300,
                menubar: true,
                plugins: [
                    "image",
                    "media",
                    "link",
                    "lists",
                    "advlist",
                    "codesample",
                    "code",
                ],
                toolbar:
                    "undo redo | formatselect | bold italic underline strikethrough | " +
                    "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | blockquote subscript superscript | " +
                    "removeformat | image media link codesample code",
                content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
            onEditorChange={onChange}
        />
    );
};

export { MyEditor };




