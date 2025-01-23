import React from 'react';

const LogoutBtn = () => {

    const handleLogout = () => {
        // Remove auth token from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_id');

        // Redirect to sign-in page after logout
        window.location.reload();

    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default LogoutBtn;
