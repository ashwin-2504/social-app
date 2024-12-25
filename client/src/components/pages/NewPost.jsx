import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import Header from '../main/Header';
import { useDropzone } from 'react-dropzone';
import './NewPost.css';

function NewPost(props) {
    const [files, setFiles] = useState([]);
    const [textContent, setTextContent] = useState('');
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] }, // Accept all image types
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) })));
        },
    });

    const thumbs = files.map(file => (
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

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const handleTextChange = (event) => {
        setTextContent(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const textContent = document.querySelector('textarea').value.trim();
    
        // Check if there is text or files
        if (!textContent && !files.length) {
            alert("Please enter some text or upload an image.");
            return;
        }
    
        // Create a FormData object to send both text and images
        const formData = new FormData();
        formData.append('user_id', 1); // Add the user ID (should be dynamically set)
        formData.append('data', textContent); // Changed from 'content' to 'data'
    
        // Append images to the FormData object
        files.forEach(file => {
            formData.append('images', file);  // Make sure this matches the field name in your server code
        });
    
        // Send the data to the backend via POST request
        fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Post created successfully:', data);
                alert('Post created successfully!');
                navigate('/'); // Redirect to the homepage
            })
            .catch(error => {
                console.error('Error creating post:', error);
                alert('Error creating post');
            });
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
