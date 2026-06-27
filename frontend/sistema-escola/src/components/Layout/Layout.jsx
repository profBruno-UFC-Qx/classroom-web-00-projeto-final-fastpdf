import "./Layout.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <div className="layout-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;