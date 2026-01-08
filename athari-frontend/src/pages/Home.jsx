import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/home.css";
import logo from "../assets/img/logo.png"; 

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      {/* Vos Bulles Financières conservées avec les nouvelles animations CSS */}
      <div className="financial-bubbles">
        <div className="bubble">$</div>
        <div className="bubble">€</div>
        <div className="bubble">FCFA</div>
        <div className="bubble">£</div>
        <div className="bubble">¥</div>
        <div className="bubble">₹</div>
      </div>

      <header>
        <div className="main">
          <div className="logo">
            <img src={logo} alt="Athari Financial Logo" className="rounded-image" />
          </div>
        </div>

        <div className="title">
          <h1>Bienvenue sur Atharibank</h1>
          <p style={{ color: '#64748B', marginTop: '-1rem', fontWeight: 500 }}>
            Votre partenaire financier de confiance
          </p>
        </div>

        <div className="button">
          {/* Boutons avec l'effet de porte défini dans votre CSS */}
          <button onClick={() => navigate("/login")} className="btn">
            <span>Administrateur</span>
          </button>
          
          <button onClick={() => navigate("/login")} className="btn">
            <span>Chef d'Agence</span>
          </button>
          
          <button onClick={() => navigate("/login")} className="btn">
            <span>Comptable</span>
          </button>
          
          <button onClick={() => navigate("/login")} className="btn">
            <span>Caissière</span>
          </button>
        </div>
      </header>
    </div>
  );
}