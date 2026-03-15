import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import ResultPage from "./pages/ResultPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* Ambient background */}
        <div className="ambient-blob blob-1" />
        <div className="ambient-blob blob-2" />

        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
