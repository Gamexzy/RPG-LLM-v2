
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Limpa erro ao digitar
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação Básica
    if (isRegistering) {
        if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
            setError("Todos os campos são obrigatórios.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
    } else {
        if (!formData.username || !formData.password) {
            setError("Informe usuário/email e senha.");
            return;
        }
    }

    // Tratamento do ID para uso no sistema (sanitização básica)
    const safeId = formData.username.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Simula delay de rede
    setTimeout(() => {
        onLogin(safeId);
    }, 500);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setFormData({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center font-sans overflow-y-auto py-10 px-4">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(66,32,6,0.15)_0%,_rgba(12,10,9,1)_70%)] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-900/50 to-transparent"></div>

        {/* 
            CONTAINER RESPONSIVO:
            Mobile: max-w-md (estreito)
            Desktop (md+): max-w-4xl (largo)
        */}
        <div className="relative z-10 w-full max-w-md md:max-w-4xl p-8 md:p-12 animate-fade-in bg-stone-900/20 backdrop-blur-sm border border-stone-800 rounded-sm shadow-2xl">
            
            {/* 
                GRID RESPONSIVO:
                Mobile: flex-col (um em cima do outro)
                Desktop: flex-row (lado a lado)
            */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">

                {/* --- LADO ESQUERDO: BRANDING (No topo no mobile) --- */}
                <div className="flex flex-col justify-center text-center md:text-left md:w-5/12 space-y-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif text-stone-200 tracking-[0.2em] uppercase leading-none">
                            Cronos
                        </h1>
                        <div className="h-px w-16 bg-amber-900/50 mx-auto md:mx-0 mt-4 mb-2"></div>
                        <p className="text-stone-500 text-xs md:text-sm uppercase tracking-widest">
                            O Mundo Vivo
                        </p>
                    </div>

                    <div className="hidden md:block text-stone-600 text-xs italic leading-relaxed pt-4 border-t border-stone-800/50">
                        "A realidade é apenas uma memória compartilhada. Crie sua identidade e deixe sua marca na eternidade."
                    </div>
                    
                    <div className="hidden md:block">
                        <div className="flex gap-2 justify-center md:justify-start mt-4">
                            <div className="w-2 h-2 bg-stone-800 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-stone-800 rounded-full animate-pulse delay-100"></div>
                            <div className="w-2 h-2 bg-amber-900 rounded-full animate-pulse delay-200"></div>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: FORMULÁRIO --- */}
                {/* Adicionamos uma borda esquerda apenas no Desktop */}
                <div className="md:w-7/12 md:border-l md:border-stone-800 md:pl-12 flex flex-col justify-center">
                    
                    <div className="mb-6 text-center md:text-left">
                        <h2 className="text-stone-300 text-sm font-serif uppercase tracking-widest">
                            {isRegistering ? 'Criar Identidade' : 'Acesso Neural'}
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-xs p-3 text-center mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {isRegistering && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Nome</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm"
                                        placeholder="Primeiro"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Sobrenome</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm"
                                        placeholder="Último"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">
                                {isRegistering ? 'Nome de Usuário' : 'Usuário ou Email'}
                            </label>
                            <input 
                                type="text" 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm"
                                placeholder="Ex: viajante_01"
                                autoFocus={!isRegistering}
                            />
                        </div>

                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Senha</label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm tracking-widest"
                                placeholder="••••••••"
                            />
                        </div>

                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-stone-500 ml-1">Confirmar Senha</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-stone-950/50 border border-stone-800 focus:border-amber-700 focus:bg-stone-900 text-stone-300 px-4 py-2 outline-none transition-all text-sm tracking-widest"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full py-4 mt-6 bg-amber-900/20 border border-amber-900/30 text-amber-500 hover:bg-amber-900/30 hover:border-amber-600 transition-all uppercase tracking-[0.2em] text-xs font-bold group relative overflow-hidden"
                        >
                            <span className="relative z-10">{isRegistering ? 'Registrar Conta' : 'Conectar'}</span>
                            <div className="absolute inset-0 bg-amber-600/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                        </button>
                    </form>

                    <div className="text-center md:text-left pt-4 mt-2">
                        <button 
                            onClick={toggleMode}
                            className="text-stone-500 hover:text-amber-500 text-xs underline decoration-stone-800 hover:decoration-amber-500 underline-offset-4 transition-all"
                        >
                            {isRegistering 
                                ? 'Já possui uma conta? Entrar.' 
                                : 'Ainda não tem acesso? Criar conta.'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
