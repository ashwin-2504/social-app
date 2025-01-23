import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Headers from '../main/Header';
import './NewPost.css';

function NewPost() {
    const [files, setFiles] = useState([]);
    const [postContent, setPostContent] = useState('');
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
            setFiles(
                acceptedFiles.map((file) => {
                    // Ensure only valid File objects are used
                    return Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    });
                })
            );
        },
    });


    useEffect(() => {
        return () => {
            files.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [files]);

    const handlePostContentChange = (e) => {
        setPostContent(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user_id = localStorage.getItem('user_id');
        if (!user_id) {
            alert('User is not logged in');
            return;
        }

        if (files.length && !postContent === 0) {
            alert('You must provide either text, an image, or both.');
            return;
        }

        const file = files[0];

        // Use FormData for multipart submission
        const formData = new FormData();
        formData.append('user_id', user_id);
        formData.append('content', postContent);
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Post submitted successfully!');
                setPostContent('');
                setFiles([]);
                window.location.href = '/';
            } else {
                const errorText = await response.text();
                alert(`Failed to submit post: ${errorText}`);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            alert('An error occurred. Please try again.');
        }
    };


    return (
        <>
            <Headers />
            <div className="NewPost">
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="What's on your mind?"
                        rows="4"
                        value={postContent}
                        onChange={handlePostContentChange}
                    />
                    <section className="container">
                        <div {...getRootProps({ className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                    {files.length > 0 && (
                        <div className="thumbsContainer">
                            {files.map((file, index) => (
                                <div className="thumb" key={`${file.name}-${index}`}>
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        onLoad={() => URL.revokeObjectURL(file.preview)} // Revoke on load
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <button type="submit">Post</button>
                </form>
            </div>
        </>
    );
}

export default NewPost;
