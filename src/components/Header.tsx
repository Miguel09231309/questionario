import React from 'react';
import { UserSession } from '../types';
import { School, LogOut, ShieldCheck, GraduationCap, Database } from 'lucide-react';

interface HeaderProps {
  session: UserSession | null;
  onLogout: () => void;
  databaseStatus?: {
    isCloud: boolean;
    projectId?: string;
    statusLabel: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onLogout,
  databaseStatus = { isCloud: true, statusLabel: 'Firebase Cloud Firestore Sincronizado' },
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Institutional Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Colégio Saber Ativo
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Ano Letivo 2026
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden md:block">
              Sistema Integrado de Avaliação de Salas & Turmas
            </span>
          </div>
        </div>

        {/* Database Status & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Database Status Indicator */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              databaseStatus.isCloud
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-amber-50 text-amber-800 border-amber-200/80'
            }`}
            title={databaseStatus.statusLabel}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  databaseStatus.isCloud ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  databaseStatus.isCloud ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <Database className="w-3.5 h-3.5 text-current opacity-80" />
            <span className="font-semibold text-[11px] truncate max-w-[140px] md:max-w-none">
              {databaseStatus.isCloud ? 'Firestore em Nuvem Ativo' : 'LocalStorage Offline'}
            </span>
          </div>

          {/* User Session Info or Login Indicator */}
          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700">
                {session.role === 'diretor' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-bold text-indigo-900 hidden sm:inline">Direção:</span>
                    <span className="font-medium truncate max-w-[100px] sm:max-w-[150px]">
                      {session.nome}
                    </span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-900 hidden sm:inline">Docente:</span>
                    <span className="font-medium truncate max-w-[100px] sm:max-w-[150px]">
                      {session.nome}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="Trocar perfil ou encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trocar Perfil</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
              <span>Selecione seu Perfil</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
