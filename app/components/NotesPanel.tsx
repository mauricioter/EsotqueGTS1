'use client';

import React, { useState, useEffect } from 'react';
import './NotesPanel.css';

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Carregar notas do localStorage ao montar o componente
  useEffect(() => {
    const savedNotes = localStorage.getItem('stockNotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // Converter timestamps de string para Date
        const notesWithDates = parsedNotes.map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }));
        setNotes(notesWithDates);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
      }
    }
  }, []);

  // Salvar notas no localStorage sempre que mudar
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('stockNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.trim(),
        timestamp: new Date()
      };
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    // Se não houver mais notas, limpar o localStorage
    if (notes.length === 1) {
      localStorage.removeItem('stockNotes');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="notes-panel">
      <div 
        className="notes-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📝</span>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Anotações</h3>
          {notes.length > 0 && (
            <span className="notes-count">{notes.length}</span>
          )}
        </div>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="notes-content">
          <div className="notes-input-container">
            <textarea
              className="notes-input"
              placeholder="Digite uma anotação rápida..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={3}
            />
            <button 
              className="notes-add-btn"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              Adicionar
            </button>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="notes-empty">
                <p>Nenhuma anotação ainda</p>
                <small>Adicione lembretes, observações ou tarefas</small>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="note-item">
                  <div className="note-content">
                    <p>{note.text}</p>
                    <small className="note-timestamp">
                      {formatTimestamp(note.timestamp)}
                    </small>
                  </div>
                  <button
                    className="note-delete-btn"
                    onClick={() => handleDeleteNote(note.id)}
                    title="Excluir anotação"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
