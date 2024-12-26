import CreatePostBtn from '../microComps/CreatePostBtn';
import LogoutBtn from '../microComps/LogoutBtn';
import './Header.css';

function Header() {
  return (
    <div className='Header'>
      <CreatePostBtn className='CreatePostBtn' />
      <LogoutBtn />
    </div>
  );
}

export default Header;
