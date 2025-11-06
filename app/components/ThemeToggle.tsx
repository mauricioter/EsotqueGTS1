'use client';

import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

// Tipos para o tema
type Theme = 'light' | 'dark';

// Configuração de cores para cada tema
const THEME_COLORS = {
  light: {
    '--bg': '#f3f4f6',
    '--card': '#ffffff',
    '--text': '#0f172a',
    '--primary': '#4f46e5',
    '--muted': '#64748b'
  },
  dark: {
    '--bg': '#0f1724',
    '--card': '#0b1220',
    '--text': '#e6eef8',
    '--primary': '#7c5cff',
    '--muted': '#64748b'
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

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

    // Aplicar/remover classe de tema
    if (theme === 'dark') {
      root.classList.add('theme-dark');
      body.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
      body.classList.remove('theme-dark');
    }

    // Atualizar variáveis CSS
    const colors = THEME_COLORS[theme];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Salvar tema no localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  };

  if (!isMounted) {
    return (
      <div className="theme-toggle-container">
        <div className="theme-toggle-skeleton">
          <div className="skeleton-track"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-toggle-container">
      <label className="theme-toggle" title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
        <input
          type="checkbox"
          aria-label={`Alternar tema. Tema atual: ${theme === 'dark' ? 'escuro' : 'claro'}`}
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <span className="toggle-track">
          <span className="toggle-knob">
            <span className="theme-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </span>
        </span>
      </label>
      <span className="theme-label">
        {theme === 'dark' ? 'Escuro' : 'Claro'}
      </span>
    </div>
  );
}
