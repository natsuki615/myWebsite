function burstParticles(event) {
      const count = 20;
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #ffe77a;
          border-radius: 50%;
          left: ${event.pageX - 5}px;
          top: ${event.pageY - 5}px;
          pointer-events: none;
          z-index: 100;
          opacity: 1;
          transition: 
            transform 0.7s cubic-bezier(0.22,1,0.36,1),
            opacity 0.7s;
          transform: translate(0, 0);
        `;
        document.body.appendChild(particle);
        const angle = Math.random() * 2 * Math.PI;
        const distance = 40 + Math.random() * 80;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        requestAnimationFrame(() => {
          particle.style.transform = `translate(${x}px, ${y}px)`;
          particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 100+Math.random()*1000);
      }
    }

