'use client';

import { useEffect } from 'react';

export function ConsoleBranding() {
  useEffect(() => {
    const titleStyle = [
      'color: #020617',
      'background: #ccff00',
      'font-size: 20px',
      'font-weight: bold',
      'padding: 8px 16px',
      'border: 4px solid #020617',
      'text-transform: uppercase',
      'font-family: monospace',
    ].join(';');

    const subTitleStyle = [
      'color: #ccff00',
      'background: #020617',
      'font-size: 14px',
      'font-weight: bold',
      'padding: 4px 8px',
      'margin-top: 10px',
      'font-family: monospace',
    ].join(';');

    const linkStyle = [
      'color: #ccff00',
      'font-size: 12px',
      'font-weight: bold',
      'text-decoration: underline',
      'font-family: monospace',
    ].join(';');

    const normalStyle = [
      'color: #64748b',
      'font-size: 12px',
      'font-family: monospace',
    ].join(';');

    console.log('%c UNIFICANDO PDF ', titleStyle);
    console.log('%c👋 Olá! Sou o Renato Bezerra, o desenvolvedor por trás deste projeto.', subTitleStyle);
    console.log(
      '%cEste projeto é open-source e focado em privacidade. Adoraria ver você contribuindo ou fazendo um fork para seu ambiente!',
      normalStyle
    );
    console.log('\n');
    console.log('%c🚀 GITHUB:', normalStyle);
    console.log('%chttps://github.com/renatojuniordw/pdf-unificando', linkStyle);
    console.log('\n');
    console.log('%c👨‍💻 PORTFÓLIO:', normalStyle);
    console.log('%chttp://renatobezerra.com.br/', linkStyle);
    console.log('\n');
    console.log('%c---', normalStyle);
  }, []);

  return null;
}
