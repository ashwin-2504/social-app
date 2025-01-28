import CreatePostBtn from '../microComps/CreatePostBtn';
import LogoutBtn from '../microComps/LogoutBtn';
import './Header.css';
import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";


function Header() {
  return (
    <div className='Header'>
      <header>
        <div class="header-container">
          <!-- Logo -->
          <div class="logo">
            <img src="logo.png" alt="Logo">
          </div>

          <!-- Search Bar -->
          <div class="search-bar">
            <input type="text" placeholder="Search...">
              <button class="search-btn">
                <i class="fas fa-search"></i>
              </button>
          </div>
          <div class="button">
            <!-- <button id="b1">home</button> -->
            <a href="index.html">
              <!-- <img src="home-icon-white-8.jpg" alt="Home" style="width: 40px; height: 40px;"> -->
            </a>
            <a href="index.html">
              <a><i class="fa-solid fa-message"></i></a>

              <a>

                <i class="fa-duotone fa-solid fa-house"></i>
              </a>


            </a>
            <!-- <button>chats</button> -->
          </div>




          <!-- Profile Section -->
          <div class="profile">
            <img src="profile.jpg" alt="" class="profile-img">
              <div class="dropdown-menu">
                <a href="#">My Profile</a>
                <a href="#">Settings</a>
                <a href="#">Logout</a>
              </div>
          </div>
        </div>
      </header>
      <CreatePostBtn className='CreatePostBtn' />
      <LogoutBtn />
    </div>
  );
}

export default Header;
