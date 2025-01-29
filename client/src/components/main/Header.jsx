import CreatePostBtn from "../microComps/CreatePostBtn";
import LogoutBtn from "../microComps/LogoutBtn";
import "./Header.css";

function Header() {
  return (
    <div classNameName="Header">
      <header>
        <div className="header-container">
          <div className="logo">
            <img src="logo.png" alt="Logo" />
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="button">
            <button id="b1">home</button>
            <CreatePostBtn classNameName="CreatePostBtn" />
            <a href="index.html">
              <img
                className="home-icon"
                src="home-icon-white-8.jpg"
                alt="Home"
              />
            </a>
            <a href="index.html">
              <a>
                <i className="fa-solid fa-message"></i>
              </a>

              <a>
                <i className="fa-duotone fa-solid fa-house"></i>
              </a>
            </a>
          </div>

          <div className="profile">
            <img src="profile.jpg" alt="" className="profile-img" />
            <div className="dropdown-menu">
              <a href="#">My Profile</a>
              <a href="#">Settings</a>
              <LogoutBtn />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
