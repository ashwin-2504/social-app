import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.notFound}>
      <h1>404 Page Not Found</h1>
      <h3>Sorry, that page does not exist.</h3>
    </div>
  );
}

const styles = {
  notFound: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    color: '#800080',
    backgroundColor: '#0011'
  }
}

export default NotFound;
