import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, GraduationCap, Crown, Facebook, Instagram, Youtube } from 'lucide-react';
interface HomeProps {
  onNavigate?: (screen: 'login') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (onNavigate) {
      onNavigate('login');
      return;
    }

    navigate('/login');
  };

  const handleScrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md transition-all duration-300 border-b border-surface-container-highest/50">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-[1920px] mx-auto">
          <div className="text-2xl font-black text-[#1c1b1b] dark:text-[#f8f9fa] tracking-tighter uppercase brand-font">
            CUEMASTERS
          </div>
          <button 
            type="button"
            onClick={handleActionClick}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-primary-container transition-all duration-300 shadow-lg shadow-primary/20 transform hover:-translate-y-0.5"
          >
            Đặt bàn ngay
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Professional billiard player" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWH1UVUle67YcjTixSys7RO78i_DHp5VhgXu7_QUE33MEiqa776JPMRnb7-EXrmhwE3MSd8ajGBIeicU97iuiS_bWOVtrKMwpZRoPS1_MswvP9hNa1_ztQBltqhNKbgTREkCrcJ8LPqi8OiVLRJYD65zmeINhufLKyg9VSMrSpJ_YzfojIL63o4Gq_ODBt1Ug6sYSnNfCHcq9XTxpSMLdnC_v2yo-8B-fTFt2pYYTdi43VVUEDopoMc3vlhx8h1DwhJmWcgQamgsJa"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 px-6 md:px-12 w-full max-w-[1920px] mx-auto">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl space-y-8"
            >
              <motion.h1 
                variants={fadeIn}
                className="text-white text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight brand-font"
              >
                CHƠI HẾT MÌNH.<br/>
                NHẮM CHÍNH XÁC.<br/>
                <span className="text-primary">LÀM CHỦ TRẬN ĐẤU.</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeIn}
                className="text-white/80 text-lg md:text-xl max-w-2xl font-light leading-relaxed"
              >
                Nâng tầm trải nghiệm bida chuyên nghiệp tại không gian sang trọng bậc nhất. Nơi hội tụ của những đường cơ hoàn mỹ và phong thái thượng lưu.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleActionClick}
                  className="bg-primary text-on-primary px-10 py-5 rounded-sm font-bold text-base tracking-widest uppercase hover:bg-primary-container transition-all"
                >
                  Đặt bàn ngay
                </button>
                <button 
                  type="button"
                  onClick={handleScrollToContent}
                  className="backdrop-blur-md bg-white/10 text-white border border-white/20 px-10 py-5 rounded-sm font-bold text-base tracking-widest uppercase hover:bg-white/20 transition-all"
                >
                  Tìm hiểu thêm
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-12 hidden md:flex items-center gap-4 text-white/50 text-xs tracking-widest uppercase"
          >
            <span className="w-12 h-[1px] bg-white/20"></span>
            Kéo để khám phá
          </motion.div>
        </section>

        {/* Trust Bar */}
        <section className="bg-surface-container-low py-12">
          <div className="px-6 md:px-12 max-w-[1920px] mx-auto">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
              <span className="text-xl font-bold tracking-tighter brand-font">QUOTIENT</span>
              <span className="text-xl font-bold tracking-tighter brand-font">HOURGLASS</span>
              <span className="text-xl font-bold tracking-tighter brand-font">COMMAND+R</span>
              <span className="text-xl font-bold tracking-tighter brand-font">GLOBE</span>
              <span className="text-xl font-bold tracking-tighter brand-font">LAYERS</span>
              <span className="text-xl font-bold tracking-tighter brand-font">CIRKLE</span>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="px-6 md:px-12 max-w-[1920px] mx-auto grid md:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 text-primary font-bold tracking-[0.2em] uppercase text-sm">
                <span className="w-8 h-[2px] bg-primary"></span>
                Về chúng tôi
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter brand-font">
                TRẢI NGHIỆM BIDA <br/>TOÀN DIỆN
              </h2>
              <p className="text-secondary text-lg leading-relaxed max-w-xl">
                Tại The Precision Atelier, chúng tôi không chỉ cung cấp bàn chơi. Chúng tôi kiến tạo một môi trường nơi kỹ thuật, sự tập trung và phong cách sống hòa quyện. Từ hệ thống bàn thi đấu đạt chuẩn quốc tế đến đội ngũ huấn luyện viên giàu kinh nghiệm, mọi chi tiết đều được tinh chỉnh cho sự hoàn hảo.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="text-4xl font-black text-on-surface mb-1">24+</div>
                  <div className="text-secondary text-sm uppercase tracking-widest font-semibold">Bàn Thi Đấu</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-on-surface mb-1">12</div>
                  <div className="text-secondary text-sm uppercase tracking-widest font-semibold">Huấn Luyện Viên</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-surface-container-high rounded-sm overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Billiards cue hitting a red ball" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzVMh5j1PvXAWjcb2QqZ3YECNadp_Lax-ObFqBTDqM_632Bw8t0y6XWGj1Ym_XG9iSekXBqZC0ILlS9b06RGLj4--Ym4adN9TzOOb51jgLhvU6CPKNO62rl36crOcVlCX8nYSxgC8q968Kgxjx_1Kxnz5UWK4b7l0eDUFfx15c0fTQ-WANiS0UVPz0spxmNdA3M38_jZXxJTWme8EG0reKJnDrIeOtr7sOterDl3fkBAIxAt51EUxl3TURNskt-zLi4mwfD9PApXbp"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 hidden lg:flex flex-col w-64 h-64 bg-primary p-8 text-on-primary">
                <Star className="w-10 h-10 mb-4 fill-current" />
                <p className="font-bold text-xl leading-snug tracking-tight">Tiêu chuẩn câu lạc bộ 5 sao quốc tế.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Service Highlights (Bento Grid) */}
        <section className="py-24 bg-surface-container-low">
          <div className="px-6 md:px-12 max-w-[1920px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter brand-font">DỊCH VỤ ĐẲNG CẤP</h2>
                <p className="text-secondary max-w-md">Được thiết kế tỉ mỉ để phục vụ cho cả người chơi phong trào và vận động viên chuyên nghiệp.</p>
              </div>
              <button
                type="button"
                className="text-on-surface font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors cursor-pointer"
                onClick={handleActionClick}
              >
                Xem tất cả dịch vụ
              </button>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[700px]"
            >
              {/* Service Card 1 */}
              <motion.div variants={fadeIn} className="md:col-span-8 relative group overflow-hidden rounded-sm bg-on-surface cursor-pointer" onClick={handleActionClick}>
                <img 
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" 
                  alt="Professional tables" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJSAlnJ7myuZsWxy7yiO63nwvb5Rr2ekkzuGwRl-VUDQip50HhJuo0mtzunWOy1iYgaIrXqeTWpzqoxsPo7TXQsob76CJsE9f2SCX_LtoA3DuO-5v3X3NIL_sIJB646d-Rfj-wZ7kAA8iECn8BOQomLTyB9D29QlFXnQUaxKuQDba6PGqrnEuP2HPQGBp1C15Bg4wc8hDOJrBlMdcqecJjNTCSY2uQq-xBfR52uV0dT6i7F7tuGkHf6-HIKcpnl7SyAVZqd6ahB6ky"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent"></div>
                <div className="absolute bottom-0 p-10 space-y-4">
                  <span className="text-primary text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md px-4 py-1 rounded-full">Pro Choice</span>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-tight brand-font">Bàn thi đấu chuyên nghiệp</h3>
                  <p className="text-white/70 max-w-md">Sử dụng hệ thống bàn Diamond và vải nỉ Simonis 860 chính hãng, đảm bảo độ chính xác tuyệt đối trong từng đường cơ.</p>
                </div>
              </motion.div>

              {/* Service Card 2 */}
              <motion.div variants={fadeIn} className="md:col-span-4 relative group overflow-hidden rounded-sm bg-surface-container-lowest cursor-pointer" onClick={handleActionClick}>
                <div className="p-10 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <GraduationCap className="w-10 h-10 text-primary" />
                    <h3 className="text-2xl font-bold uppercase tracking-tight brand-font">Huấn luyện 1-on-1</h3>
                    <p className="text-secondary">Giáo trình cá nhân hóa từ các cơ thủ hàng đầu quốc gia giúp bạn làm chủ kỹ thuật căn bản đến nâng cao.</p>
                  </div>
                  <img 
                    className="w-full h-48 object-cover rounded-sm mt-6 grayscale group-hover:grayscale-0 transition-all duration-500" 
                    alt="Coach adjusting grip" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuIvWeMH5IxELDizUYWXL5c74lX6KtKBntmCBbvURgctsb1X848XRrzryjWRnDyWYUjlBWAS1TM-K6Ico3ct6535KRJSe2foFk5SCSMBNZjWbCsW8IpPIYTvfKPSexRwUJSzK1wS4IWZML_b0yPCdwHlGmUT87boatflKsehaPj_prpz7eOv-bt0Cspcvor4K4bMV8OvWRozBIWZKfpZYR4ytTS23NBMuZvYdkSmuV55lBdopwFbzSPW4_cOyYKRp5AzvMipGI1NEU"
                  />
                </div>
              </motion.div>

              {/* Service Card 3 */}
              <motion.div variants={fadeIn} className="md:col-span-4 relative group overflow-hidden rounded-sm bg-on-surface cursor-pointer" onClick={handleActionClick}>
                <img 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                  alt="Bar counter" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr25_H8pNZvpRIFBA0rpL_6zghQiCzahlbvTMVxrwsAG0gez1TS6AA2iMG2CayjaQGue4YJVeD41bK9ztQvOtBHUg-ZSVz8uX9Ecv5kXXqpafzCS9YvFfMEgueDVsGWOXpJc2a09ntEhCpyDbEReYsFhqHPwpyBUfXhj9cNtyyJDbArzek1OQCWU3TtPkdZ3jOpoVN8ZdlX0XXvBE2MKtq3xxgbGQncTLe71NwKi6pc7P7oTiJnnK9_Ny0b-cX6CGM-BdzCxswpL7a"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent"></div>
                <div className="absolute bottom-0 p-10">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight brand-font">Thực đơn F&amp;B cao cấp</h3>
                </div>
              </motion.div>

              {/* Service Card 4 */}
              <motion.div variants={fadeIn} className="md:col-span-8 relative group overflow-hidden rounded-sm bg-primary p-10 flex items-center justify-between cursor-pointer" onClick={handleActionClick}>
                <div className="max-w-md space-y-4 z-10">
                  <h3 className="text-3xl font-bold text-on-primary uppercase tracking-tight brand-font">Khu vực Lounge VIP</h3>
                  <p className="text-on-primary/80">Không gian riêng tư dành cho các cuộc hội thoại quan trọng và những trận đấu kín.</p>
                </div>
                <Crown className="w-[200px] h-[200px] absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 md:py-32 bg-on-surface text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full text-white" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="200" fill="transparent" r="180" stroke="currentColor" strokeWidth="1"></circle>
              <circle cx="200" cy="200" fill="transparent" r="140" stroke="currentColor" strokeWidth="1"></circle>
              <line stroke="currentColor" x1="200" x2="200" y1="0" y2="400"></line>
              <line stroke="currentColor" x1="0" x2="400" y1="200" y2="200"></line>
            </svg>
          </div>

          <div className="px-6 md:px-12 max-w-[1920px] mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none brand-font">TRỞ THÀNH MỘT PHẦN CỦA ĐẾ CHẾ</h2>
              <p className="text-white/60 text-lg md:text-xl font-light">Gia nhập cộng đồng cơ thủ tinh hoa và tận hưởng những đặc quyền chỉ dành riêng cho thành viên của The Precision Atelier.</p>
              
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <button 
                  type="button"
                  onClick={handleActionClick}
                  className="bg-primary text-on-primary px-12 py-5 rounded-full font-black text-base tracking-widest uppercase hover:scale-105 transition-transform"
                >
                  Đăng ký thành viên
                </button>
                <button 
                  type="button"
                  onClick={handleActionClick}
                  className="border-2 border-white/20 text-white px-12 py-5 rounded-full font-black text-base tracking-widest uppercase hover:bg-white hover:text-on-surface transition-all"
                >
                  Xem bảng điều khiển
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high dark:bg-inverse-surface border-t border-surface-container-highest">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-16 w-full max-w-[1920px] mx-auto">
          <div className="mb-10 md:mb-0 space-y-4">
            <div className="text-xl font-bold text-on-surface dark:text-inverse-on-surface brand-font tracking-tighter uppercase">The Precision Atelier</div>
            <div className="flex gap-4">
              <Facebook className="w-6 h-6 text-secondary hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-6 h-6 text-secondary hover:text-primary cursor-pointer transition-colors" />
              <Youtube className="w-6 h-6 text-secondary hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-sm font-medium">
            <button type="button" className="text-secondary dark:text-inverse-on-surface/70 hover:text-primary transition-opacity duration-200 hover:underline cursor-pointer" onClick={handleActionClick}>Chính sách bảo mật</button>
            <button type="button" className="text-secondary dark:text-inverse-on-surface/70 hover:text-primary transition-opacity duration-200 hover:underline cursor-pointer" onClick={handleActionClick}>Điều khoản sử dụng</button>
            <button type="button" className="text-secondary dark:text-inverse-on-surface/70 hover:text-primary transition-opacity duration-200 hover:underline cursor-pointer" onClick={handleActionClick}>Liên hệ</button>
            <button type="button" className="text-secondary dark:text-inverse-on-surface/70 hover:text-primary transition-opacity duration-200 hover:underline cursor-pointer" onClick={handleActionClick}>Câu lạc bộ</button>
          </div>

          <div className="mt-12 md:mt-0 text-secondary dark:text-inverse-on-surface/70 text-sm text-center md:text-right">
            © 2024 The Precision Atelier. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
