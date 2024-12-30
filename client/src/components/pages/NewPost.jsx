import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../main/Header';
import { useDropzone } from 'react-dropzone';
import './NewPost.css';

function NewPost({ userId: propUserId }) {
    const [files, setFiles] = useState([]);
    const [textContent, setTextContent] = useState('');
    const navigate = useNavigate();


    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: (acceptedFiles) => {
            setFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                )
            );
        },
    });

    // Generate image previews
    const thumbs = files.map((file) => (
        <div className="thumb" key={file.name}>
            <div className="thumbInner">
                <img
                    src={file.preview}
                    className="preview"
                    onLoad={() => URL.revokeObjectURL(file.preview)}
                    alt={file.name}
                />
            </div>
        </div>
    ));

    // Cleanup URL.createObjectURL when the component unmounts or files change
    useEffect(() => {
        return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    const handleTextChange = (event) => {
        setTextContent(event.target.value);
    };

    const validateForm = () => {
        if (!textContent.trim() && files.length === 0) {
            alert('Please enter some text or upload an image.');
            return false;
        }
        return true;
    };

    const prepareFormData = () => {
        const formData = new FormData();
        const user_id = localStorage.getItem('user_id');
        formData.append('data', textContent);
        formData.append('user_id', user_id);
        files.forEach((file) => formData.append('images', file));
        return formData;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const formData = prepareFormData();
        const authToken = localStorage.getItem('authToken'); // Get the token from localStorage

        if (!authToken) {
            alert('User is not authenticated');
            return;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create post');
            }

            const result = await response.json();
            console.log('Post created successfully:', result);
            // Handle successful post creation (e.g., redirect or update UI)
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.message);
        }
    };

    return (
        <>
            <Header />
            <div className="NewPost">
                <h1 className="NPtitle">New Post</h1>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={textContent}
                        onChange={handleTextChange}
                        placeholder="What's on your mind?"
                        rows="4"
                    />
                    <section className="container">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                        <aside className="thumbsContainer">
                            {thumbs.length > 0 ? thumbs : <p>No files selected</p>}
                        </aside>
                    </section>
                    <input type="submit" value="Post" />
                </form>
            </div>
        </>
    );
}

export default NewPost;