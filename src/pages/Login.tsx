import React, { useState } from 'react';
import { Quote, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDefaultRouteForRole } from '../hooks/useAuth';
import { ScreenProps } from '../types';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export default function Login({ onNavigate }: ScreenProps) {
  const googleSsoMessage = 'Google SSO is coming soon.';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await authService.login(email, password);
      login({
        id: response.id, 
        email: response.email,
        fullName: response.fullName,
        role: response.role
      }, response.token);
      navigate(getDefaultRouteForRole(response.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface text-on-surface antialiased overflow-hidden">
      {/* Left Side: Form Section */}
      <section className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-surface py-12 overflow-y-auto no-scrollbar">
        {/* Brand Identity */}
        <div className="mb-12">
          <span className="brand-font text-2xl font-black tracking-tighter text-on-surface">CueMasters</span>
        </div>
        
        {/* Welcome Text */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-on-surface leading-tight">Chào mừng trở lại.</h1>
          <p className="text-secondary font-body">Đăng nhập để tiếp tục hành trình chinh phục sự chính xác của bạn.</p>
        </div>
        
        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2" htmlFor="email">Email</label>
            <input 
              className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 rounded-lg transition-all duration-300 outline-none" 
              id="email" 
              name="email" 
              placeholder="yourname@domain.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-secondary" htmlFor="password">Mật khẩu</label>
              <a className="text-xs font-medium text-primary hover:opacity-80 transition-opacity" href="#forgot">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <input 
                className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-4 rounded-lg transition-all duration-300 outline-none" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input 
              className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary focus:ring-offset-0 bg-surface-container" 
              id="remember" 
              name="remember" 
              type="checkbox"
            />
            <label className="ml-3 text-sm text-secondary select-none" htmlFor="remember">Ghi nhớ đăng nhập</label>
          </div>
          
          <button 
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold tracking-tight hover:bg-primary-container transition-all duration-300 transform active:scale-95 shadow-lg shadow-primary/10" 
            type="submit"
          >
            Đăng nhập
          </button>
        </form>
        
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-4 text-secondary/60 tracking-widest font-semibold">Hoặc với</span>
          </div>
        </div>
        
        {/* Google Login */}
        <button 
          className="w-full flex items-center justify-center gap-3 rounded-full border border-outline-variant/20 bg-surface-container-low py-4 font-bold tracking-tight text-on-surface transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60" 
          type="button"
          disabled
          title={googleSsoMessage}
          aria-label={googleSsoMessage}
        >
          <Globe className="w-5 h-5 text-secondary" />
          <span>Tiếp tục với Google</span>
        </button>
        
        {/* Sign up link */}
        <p className="mt-12 text-center text-secondary text-sm">
          Chưa có tài khoản? 
          <button 
            onClick={() => onNavigate('register')}
            className="text-primary font-bold hover:underline underline-offset-4 ml-1"
          >
            Đăng ký ngay
          </button>
        </p>
      </section>
      
      {/* Right Side: Visual Section */}
      <section className="hidden md:block md:w-[55%] lg:w-[60%] relative overflow-hidden bg-on-surface">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[2000ms] ease-out scale-105" 
            alt="Cinematic close-up of a professional pool table" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG-E7wY4-7TiuxB7w3sT5T6W60Y5ubapAyQkHevtwnttykA7xFU8qNFiJkwceCRGSylrdsL1D6rdI6bllWra8XP5n3vmIyeJVJEEWNIZMsnrA0slUzfR67xXOxgnQ9DGDqQmZHRPVS0Imtx56eZbQKS6lqGdvQdLI3fXKD1Rk2YjMcccqP8QVQzjmnA7hese6vJP18YNsGkimFp-NKT7tgmcijEufeF4KDXUN3iOeogQzI_tdjvSj3YhGJuPzYR4RjgK02JxhpLZwS"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Glassmorphic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-on-surface via-transparent to-transparent opacity-80"></div>
        
        {/* Quote Content */}
        <div className="absolute bottom-24 left-24 right-24">
          <div className="max-w-xl">
            <Quote className="text-primary w-12 h-12 mb-6 fill-current" />
            <h2 className="text-surface text-5xl font-extrabold tracking-tight leading-tight mb-8">
              Billiard không chỉ là trò chơi, đó là nghệ thuật của <span className="text-primary italic">sự chính xác</span> tuyệt đối.
            </h2>
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-primary"></div>
              <p className="text-surface-variant font-label text-sm uppercase tracking-[0.2em] font-semibold">Triết lý CueMasters</p>
            </div>
          </div>
        </div>
        

      </section>
    </main>
  );
}
