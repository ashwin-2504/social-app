import React from 'react';

const LogoutBtn = () => {

    const handleLogout = () => {
        // Remove auth token from localStorage
        localStorage.removeItem('authToken');

        // Redirect to sign-in page after logout
        window.location.reload();

    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default LogoutBtn;
