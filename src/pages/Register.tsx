import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDefaultRouteForRole } from '../hooks/useAuth';
import { ScreenProps } from '../types';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export default function Register({ onNavigate }: ScreenProps) {
  const googleSsoMessage = 'Google SSO is coming soon.';
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    try {
      const response = await authService.register(email, password, fullName);
      login({
        id: response.id,
        email: response.email,
        fullName: response.fullName,
        role: response.role
      }, response.token);
      navigate(getDefaultRouteForRole(response.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Xin thử lại sau.');
    }
  };

  const handleBackToLogin = () => {
    onNavigate('login');
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row text-on-surface antialiased overflow-x-hidden">
      {/* Left Side: Visual Anchor */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-on-surface relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Professional Billiards Player" 
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtc1d5yiY6ZBu9lUUP2zeII5Eujit_2SaSZ9LHgsCWuoTIPJiL6IWM94vJnv5qJAYKiPwbFzp0uioFJrx5CVpHLR2SupW5eT4V9wBIq59eDPtfZmVksws1lXB_Ip0cvnEJp2kLRFFD7uuH-4FWEOGSgw-fl3V-1pKypdo0w5aL-RyS0GvB1KjsEbYpueVwhCQ0c6P624_A9UfHzGfJ8tIvkfPsFC9LtYj2rMA1C1VSNeo3gIhjzbxqD1gja-Kzthd7EfOJEXWVXm1I"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-on-surface via-on-surface/40 to-transparent"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 p-16 max-w-2xl">
          <div className="mb-12">
            <span className="brand-font text-primary font-black tracking-tighter text-3xl uppercase">CueMasters</span>
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-6">
            ĐỈNH CAO CỦA <br/> <span className="text-primary italic">SỰ CHÍNH XÁC.</span>
          </h1>
          <p className="font-body text-surface-variant/80 text-lg max-w-md leading-relaxed mb-10">
            Gia nhập cộng đồng cơ thủ chuyên nghiệp. Theo dõi tiến trình huấn luyện và đặt bàn tại những không gian đẳng cấp nhất.
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              <img 
                alt="User 1" 
                className="w-10 h-10 rounded-full border-2 border-on-surface" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8UKFCj53NqUrGT8BvMcYt2OB0Kus6419SHB-96e6OXozfa9aepPQgLAoZks_xoUs4Axz60OuKSwD8_v2TSq_P2U7hDrqJodrg74kZo5BJwY0PowFkqfwZf-Xrr794VwdwldXCTlMZpV6MCfMNUlRtjOQ1mHzCfhFkLQkdwZUykKCdXG0ACctrptUuaR6YimqBYULFDb0OruBsy8STp6PlfZoBe4vgwX6wpAF2bDIuGzWdyzdpGUU0G1b9yceBXogqlyk2qFzefhFO"
                referrerPolicy="no-referrer"
              />
              <img 
                alt="User 2" 
                className="w-10 h-10 rounded-full border-2 border-on-surface" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI4vP7Y7xrAmRDbp9lC1_fJgjJmwksoSghUXoVwHXvf_Tj_6ChUDTSFxTISqF0TsZB9QPaUBfKFvjBh2OJ8O0WAK_52M_IQZQyyeIHmNSbeIhuWtnnils7oINDfq1sAn95EGjOM_ThVdzkiq4y6q7qXVBEHli_92FSwz2aXRNQvx_P_htRCA12mSSbSvakJGgil2oryZpWrzWajhLYL5gOtnqlGBScE84QYpJ-vk25MY5VRuItiNt5wJd8nlvflF1WtRnr92sF58Ld"
                referrerPolicy="no-referrer"
              />
              <img 
                alt="User 3" 
                className="w-10 h-10 rounded-full border-2 border-on-surface" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCiGFuFGppEr6Z2TwVCaLEWZuq0GtOx4SmsyfKzxuzHvrvajTSFhSU7PAiyjAUnmeOnu5vPAawC7guDeImtzb4ue2VOXmwyOAhCdUZ3xG_HqUNamEbm_qbCmvjLPO83JWMzUcFcXcWzDQmqh-kuHvZpRrmG0vmELlGnl9FfcYWsOXHWdGWuYww0ajDBKQvN3jIHJReRTiolAsR2S8Ap85q4dRpaKJbwbrOgATe7UqJr1jkoH0LW7Avaxicse7el4fYRfMe3DgSZdMh"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm text-surface-variant font-medium">+2,400 cơ thủ đã tham gia</p>
          </div>
        </div>
        
        {/* Floating Decorative Element */}
        <div className="absolute bottom-12 right-12 text-white/10 select-none pointer-events-none">
          <Flag className="w-48 h-48" strokeWidth={1} />
        </div>
      </section>
      
      {/* Right Side: Register Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 bg-surface flex flex-col justify-center px-8 py-12 lg:px-20 min-h-screen">
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về đăng nhập</span>
          </button>
        </div>

        <div className="mb-10 text-left">
          <div className="md:hidden mb-8">
            <span className="brand-font text-primary font-black tracking-tighter text-2xl">CueMasters</span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">Tạo tài khoản mới</h2>
          <p className="font-body text-secondary text-sm">Bắt đầu hành trình chinh phục những đường cơ hoàn mỹ.</p>
        </div>
        
        {/* Registration Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
          {/* Name */}
          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="name">Họ và tên</label>
            <input 
              className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50 outline-none rounded-sm" 
              id="name" 
              name="name" 
              placeholder="Nguyễn Văn A" 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-label text-xs font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="email">Email</label>
            <input 
              className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50 outline-none rounded-sm" 
              id="email" 
              name="email" 
              placeholder="name@example.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="reg-password">Mật khẩu</label>
              <input 
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50 outline-none rounded-sm" 
                id="reg-password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="confirm-password">Xác nhận</label>
              <input 
                className="w-full px-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50 outline-none rounded-sm" 
                id="confirm-password" 
                name="confirm-password" 
                placeholder="••••••••" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Terms */}
          <div className="flex items-start gap-3 py-2">
            <div className="flex items-center h-5">
              <input 
                className="w-4 h-4 text-primary bg-surface-container border-outline-variant focus:ring-primary/20 rounded-sm" 
                id="terms" 
                type="checkbox"
                required
              />
            </div>
            <label className="text-xs text-secondary font-body leading-relaxed" htmlFor="terms">
              Tôi đồng ý với <a className="text-primary font-semibold hover:underline" href="#terms">Điều khoản dịch vụ</a> và <a className="text-primary font-semibold hover:underline" href="#privacy">Chính sách bảo mật</a> của CueMasters.
            </label>
          </div>
          
          {/* Submit Button */}
          <button 
            className="w-full billiard-gradient text-on-primary font-headline font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 group" 
            type="submit"
          >
            <span>Đăng ký ngay</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Divider */}
          <div className="relative py-6 flex items-center">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-outline/40 uppercase tracking-widest">Hoặc</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>
          
          {/* Google Signup */}
          <button 
            className="w-full bg-white border border-outline-variant/50 text-on-surface font-body font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60" 
            type="button"
            disabled
            title={googleSsoMessage}
            aria-label={googleSsoMessage}
          >
            <Globe className="w-5 h-5 text-secondary" />
            <span>Đăng ký với Google</span>
          </button>
        </form>
        
        <div className="mt-10 text-center">
          <p className="font-body text-sm text-secondary">
            Đã có tài khoản? 
            <button 
              type="button"
              onClick={() => onNavigate('login')}
              className="text-primary font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
        
        {/* Minimal Footer Info */}
        <div className="mt-auto pt-10 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-outline/40 font-bold">
          <span>CueMasters © 2024</span>
          <div className="flex gap-4">
            <a className="hover:text-primary transition-colors" href="#privacy">Bảo mật</a>
            <a className="hover:text-primary transition-colors" href="#support">Hỗ trợ</a>
          </div>
        </div>
      </section>
      
      {/* Visual Polish: Ghost Cues Background (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.02]">
        <div className="absolute top-1/4 -right-20 transform rotate-45">
          <div className="h-[1000px] w-2 bg-on-surface"></div>
        </div>
        <div className="absolute bottom-1/4 -left-20 transform -rotate-12">
          <div className="h-[800px] w-4 bg-on-surface"></div>
        </div>
      </div>
    </main>
  );
}
