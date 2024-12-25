import { useNavigate } from 'react-router-dom';

function CreatePostBtn() {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/create-post'); // Redirect to the create post page
    };

    return (
        <button onClick={handleRedirect} style={styles.CreatePostBtn}>
            <p style={styles.p}>Create Post</p>
        </button>
    );
};


const styles = {
    CreatePostBtn: {
        height: 'auto',
        border: "1px solid red",
        position: 'relative',
        cursor: 'pointer',
        backgroundColor: 'white',
        transition: '0.3s',
        padding: '10px',

    },
};

export default CreatePostBtn;
