import './root-phone.css'
import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function Root() {

    const toggleMenu = (e) => {
      const el = document.getElementById("nav-menu");
      const navicon = document.querySelector("#nav-button");
      if (el.classList.contains("hidden")) {
        document.querySelectorAll(".inner-menu").forEach((item) => {
          item.classList.add("hidden");
          item.setAttribute("aria-hidden", "true");
        });
        el.classList.remove("hidden");
        el.setAttribute("aria-hidden", "false");
        navicon.classList.add("close");
      } else {
        el.classList.add("hidden");
        el.setAttribute("aria-hidden", "true");
        navicon.classList.remove("close");
      }
      !el.classList.contains("hidden") && el.focus();
    };


    return (
      <div className="root">
        <header>
          <NavLink to="/">
            <h1>Student Work Flow</h1>
          </NavLink>
          <div className="navbar__menu">
          <button
            id="nav-button"
            onClick={(e) => toggleMenu(e)}
          >
            <span >M</span>
          </button>
          <ul
            id="nav-menu"
            className="hidden"
            aria-hidden="true"
          >
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
            <li>
              <NavLink to="/timeline">Timeline</NavLink>
            </li>
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/regester">Register</NavLink>
            </li>
          </ul>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    );
}












