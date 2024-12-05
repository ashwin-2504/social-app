import './Layout.css';
import Header from './navigation/Header';
import Right from './main/Right'
import Middle from './main/Middle'
import Left from './main/Left'

function Layout() {
  return (
    <div className='layout'>
        <Header className='header'/>
        <Right className='right' />
        <Middle className='middle' />
        <Left className='left' />

    </div>
  );
}

export default Layout;
