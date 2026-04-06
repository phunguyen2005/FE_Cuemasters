import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-16 mt-auto bg-surface-container-low border-t border-outline-variant/20">
      <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-8">
        <div className="font-headline font-black text-on-surface text-2xl tracking-tighter uppercase">
          CueMasters
        </div>
        <div className="flex gap-10">
          <a
            className="font-body text-xs uppercase tracking-widest text-secondary hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all duration-300"
            href="#"
          >
            Chinh sach bao mat
          </a>
          <a
            className="font-body text-xs uppercase tracking-widest text-secondary hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all duration-300"
            href="#"
          >
            Dieu khoan dich vu
          </a>
          <a
            className="font-body text-xs uppercase tracking-widest text-secondary hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all duration-300"
            href="#"
          >
            Lien he
          </a>
        </div>
        <p className="font-body text-xs uppercase tracking-widest text-secondary/50">
          &copy; 2024 CueMasters Precision Atelier. Bao luu moi quyen.
        </p>
      </div>
    </footer>
  );
}
