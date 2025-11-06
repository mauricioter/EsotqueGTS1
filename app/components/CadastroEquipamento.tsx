'use client';

import React, { useState, useCallback } from 'react';
import api from '../services/api';
import './CadastroEquipamento.css';

// Tipos para o formulário
interface FormData {
  nome: string;
  descricao: string;
  serial: string;
  mac: string;
  destino: string;
  status: string;
}

// Estado inicial do formulário
const INITIAL_FORM: FormData = {
  nome: '',
  descricao: '',
  serial: '',
  mac: '',
  destino: '',
  status: 'DISPONIVEL'
};

export default function CadastroEquipamento() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [mensagem, setMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mensagemTipo, setMensagemTipo] = useState<'success' | 'error' | ''>('');

  // Função para atualizar o formulário
  const handleChange = useCallback((campo: keyof FormData, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Função para limpar o formulário
  const limparFormulario = useCallback(() => {
    setForm(INITIAL_FORM);
    setMensagem('');
    setMensagemTipo('');
  }, []);

  // Função para enviar o formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!form.nome.trim()) {
      setMensagem('Nome do equipamento é obrigatório');
      setMensagemTipo('error');
      return;
    }

    setSubmitting(true);
    setMensagem('');
    setMensagemTipo('');

    try {
      // Envia o formulário com o status selecionado
      await api.post('/equipamentos', form);
      
      setMensagem('Equipamento cadastrado com sucesso!');
      setMensagemTipo('success');
      limparFormulario();
      
      // Disparar evento para atualizar lista
      window.dispatchEvent(new Event('equipamento:changed'));
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem('');
        setMensagemTipo('');
      }, 3000);
      
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erro ao cadastrar equipamento. Tente novamente.';
      
      setMensagem(mensagemErro);
      setMensagemTipo('error');
      
      console.error('Erro ao cadastrar equipamento:', error);
    } finally {
      setSubmitting(false);
    }
  }, [form, limparFormulario]);

  // Função para formatar MAC address
  const formatarMAC = useCallback((valor: string) => {
    // Remove tudo que não é letra ou número
    const limpo = valor.replace(/[^a-zA-Z0-9]/g, '');
    
    // Adiciona os dois pontos a cada 2 caracteres
    let formatado = '';
    for (let i = 0; i < limpo.length; i += 2) {
      if (i > 0) formatado += ':';
      formatado += limpo.substring(i, i + 2);
    }
    
    return formatado.toUpperCase().substring(0, 17); // Limita a 17 caracteres (XX:XX:XX:XX:XX:XX)
  }, []);

  // Função para lidar com mudança no campo MAC
  const handleMACChange = useCallback((valor: string) => {
    const formatado = formatarMAC(valor);
    handleChange('mac', formatado);
  }, [formatarMAC, handleChange]);

  return (
    <div className="cadastro-container">
      <header className="cadastro-header">
        <h2 className="cadastro-title">Cadastrar Novo Equipamento</h2>
        <p className="cadastro-subtitle">Preencha os dados do equipamento</p>
      </header>

      <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nome" className="form-label">
            Nome do Equipamento <span className="required">*</span>
          </label>
          <input
            id="nome"
            type="text"
            className="form-input"
            placeholder="Ex: Roteador WiFi, Switch, Access Point"
            value={form.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            disabled={submitting}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao" className="form-label">
            Descrição
          </label>
          <textarea
            id="descricao"
            className="form-input"
            placeholder="Detalhes sobre o equipamento, como modelo, cor, etc."
            value={form.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            disabled={submitting}
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="serial" className="form-label">
              Número de Série
            </label>
            <input
              id="serial"
              type="text"
              className="form-input"
              placeholder="SN123456789"
              value={form.serial}
              onChange={(e) => handleChange('serial', e.target.value)}
              disabled={submitting}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mac" className="form-label">
              Endereço MAC
            </label>
            <input
              id="mac"
              type="text"
              className="form-input"
              placeholder="XX:XX:XX:XX:XX:XX"
              value={form.mac}
              onChange={(e) => handleMACChange(e.target.value)}
              disabled={submitting}
              maxLength={17}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="destino" className="form-label">
            Local de Destino
          </label>
          <input
            id="destino"
            type="text"
            className="form-input"
            placeholder="Ex: Sala 101, Escritório Principal"
            value={form.destino}
            onChange={(e) => handleChange('destino', e.target.value)}
            disabled={submitting}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Status do Equipamento <span className="required">*</span>
          </label>
          <select
            id="status"
            className="form-input"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={submitting}
            required
          >
            <option value="DISPONIVEL">✅ Disponível</option>
            <option value="EM_USO">🔧 Em Uso</option>
            <option value="MANUTENCAO">⚠️ Em Manutenção</option>
            <option value="SAIDA">📤 Saída (Descartado/Transferido)</option>
            <option value="RESERVADO">📋 Reservado</option>
            <option value="DEFEITO">❌ Com Defeito</option>
          </select>
          <small className="form-hint">
            {form.status === 'DISPONIVEL' && 'Equipamento pronto para uso'}
            {form.status === 'EM_USO' && 'Equipamento sendo utilizado'}
            {form.status === 'MANUTENCAO' && 'Equipamento em manutenção'}
            {form.status === 'SAIDA' && 'Equipamento descartado ou transferido'}
            {form.status === 'RESERVADO' && 'Equipamento reservado para uso futuro'}
            {form.status === 'DEFEITO' && 'Equipamento com defeito'}
          </small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={limparFormulario}
            disabled={submitting}
          >
            Limpar
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting || !form.nome.trim()}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Cadastrando...
              </>
            ) : (
              'Cadastrar Equipamento'
            )}
          </button>
        </div>
      </form>

      {mensagem && (
        <div className={`mensagem mensagem-${mensagemTipo}`}>
          <span className="mensagem-texto">{mensagem}</span>
          <button 
            className="mensagem-fechar"
            onClick={() => {
              setMensagem('');
              setMensagemTipo('');
            }}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
