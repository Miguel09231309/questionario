import React from 'react';
import { UserSession } from '../types';
import { School, LogOut, Download, ShieldCheck, GraduationCap, Database } from 'lucide-react';

interface HeaderProps {
  session: UserSession | null;
  onLogout: () => void;
  onDownloadHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onLogout, onDownloadHtml }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              Colégio Saber Ativo
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              Sistema de Avaliação de Salas & Turmas
            </span>
          </div>
        </div>

        {/* Zone 2: Status & Quick action */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onDownloadHtml}
            title="Baixar arquivo HTML único com IndexedDB embutido para usar em qualquer navegador"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Versão HTML Única</span>
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/70 text-xs text-slate-700">
                {session.role === 'diretor' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">Direção:</span>
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">{session.nome}</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">Docente:</span>
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">{session.nome}</span>
                  </>
                )}
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Banco IndexedDB Conectado</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
