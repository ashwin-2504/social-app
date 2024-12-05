import './Layout.css';
import Header from './navigation/Header.jsx';
import Right from './main/Right.jsx';
import Middle from './main/Middle.jsx';
import Left from './main/Left.jsx';

function Layout() {
  return (
    <div className='layout'>
      <Header />
      <div className="main">
        <Left />
        <Middle />
        <Right />
      </div>
    </div>
  );
}

export default Layout;
