'use client';

import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

// Tipos para o tema
type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Inicializar o tema apenas quando o componente montar
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      } else {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      setTheme('light');
    }
  }, []);

  // Aplicar o tema quando montado ou alterado
  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    const body = document.body;

    // Adicionar classe de transição antes de mudar o tema
    root.classList.add('theme-transitioning');
    body.classList.add('theme-transitioning');

    // Aplicar/remover classe de tema
    if (theme === 'dark') {
      root.classList.add('theme-dark');
      body.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
      body.classList.remove('theme-dark');
    }

    // Salvar tema no localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }

    // Remover classe de transição após a animação
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      body.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timeout);
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme(current => current === 'dark' ? 'light' : 'dark');
    
    // Reset da animação
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  if (!isMounted) {
    return (
      <div className="theme-toggle-wrapper">
        <div className="theme-toggle-skeleton">
          <div className="skeleton-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-toggle-wrapper">
      <button
        className={`theme-toggle-btn ${theme === 'dark' ? 'dark-mode' : 'light-mode'} ${isAnimating ? 'animating' : ''}`}
        onClick={toggleTheme}
        aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        title={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      >
        <span className="theme-toggle-icon-wrapper">
          <span className={`theme-icon sun-icon ${theme === 'light' ? 'active' : ''}`}>
            ☀️
          </span>
          <span className={`theme-icon moon-icon ${theme === 'dark' ? 'active' : ''}`}>
            🌙
          </span>
        </span>
        <span className="theme-toggle-label">
          {theme === 'dark' ? 'Escuro' : 'Claro'}
        </span>
        <span className="theme-toggle-bg"></span>
      </button>
    </div>
  );
}

