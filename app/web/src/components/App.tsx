import { useState } from "react";
import './App.css'
import { SideMenu } from "./SideMenu/SideMenu";
import { Header } from "./content/Header/Header";
import { MainMenu } from "./content/MainMenu/MainMenu";

export const App = () => {
  return (
    <>
      <SideMenu />
      <div className="content-wrapper">
        <div className="content">
          <Header />
          <MainMenu />
        </div>
        <div className="prev-wrap">
          <div id="prev">
            <div className="prev-content">
              <div className="preload">Project preview</div>
            </div>
          </div>
        </div>
      </div>
      <div id="modals-wrap"></div>
      <div className="hidden-conf-json"></div>
      <footer></footer>
    </>
  )
}