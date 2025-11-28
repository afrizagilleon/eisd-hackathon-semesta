// Create floating particles
function createParticles() {
  const particlesContainer = document.querySelector('.particles');
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 3 + 1;
    const startX = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 10;

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      left: ${startX}%;
      bottom: -10px;
      animation: floatUp ${duration}s ${delay}s linear infinite;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
    `;

    particlesContainer.appendChild(particle);
  }
}

// Add particle animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUp {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 0.5;
    }
    90% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize particles
createParticles();

// Menu item interactions
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const target = item.getAttribute('href').substring(1);

    // Add a subtle flash effect
    item.style.color = '#fbbf24';
    item.style.textShadow = '0 0 20px rgba(251, 191, 36, 0.8)';

    setTimeout(() => {
      item.style.color = '';
      item.style.textShadow = '';
    }, 200);

    console.log(`Navigating to: ${target}`);
  });
});

// Parallax effect for moon
document.addEventListener('mousemove', (e) => {
  const moon = document.querySelector('.moon');
  const house = document.querySelector('.haunted-house');

  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  // Subtle parallax movement
  const moonX = (mouseX - 0.5) * 20;
  const moonY = (mouseY - 0.5) * 20;
  const houseX = (mouseX - 0.5) * -10;
  const houseY = (mouseY - 0.5) * -10;

  moon.style.transform = `translate(${moonX}px, ${moonY}px)`;
  house.style.transform = `translate(${houseX}px, ${houseY}px)`;
});

// Add eerie window light flicker randomness
const windows = document.querySelectorAll('.window, .tower-window');
windows.forEach((window, index) => {
  setInterval(() => {
    const randomFlicker = Math.random();
    if (randomFlicker > 0.95) {
      window.style.opacity = '0.3';
      setTimeout(() => {
        window.style.opacity = '1';
      }, 100);
    }
  }, 1000 + index * 500);
});

// Audio control (when audio file is added)
const audio = document.getElementById('ambient-music');

// Uncomment when audio file is added:
// audio.volume = 0.3;
// audio.play().catch(e => {
//   console.log('Audio autoplay prevented. User interaction required.');
//   // Add a play button or wait for user interaction
// });

// Optional: Add click anywhere to start audio
let audioStarted = false;
document.addEventListener('click', () => {
  if (!audioStarted && audio.src) {
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
    audioStarted = true;
  }
}, { once: true });

// Add atmospheric cloud movement
function createClouds() {
  const scene = document.querySelector('.scene');
  const cloudCount = 3;

  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';

    const size = Math.random() * 100 + 80;
    const topPosition = Math.random() * 30 + 10;
    const duration = Math.random() * 60 + 80;
    const delay = Math.random() * -30;

    cloud.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: rgba(150, 170, 190, 0.1);
      border-radius: 50%;
      top: ${topPosition}%;
      left: -150px;
      animation: cloudDrift ${duration}s ${delay}s linear infinite;
      filter: blur(15px);
      z-index: 3;
    `;

    scene.appendChild(cloud);
  }
}

// Add cloud animation
const cloudStyle = document.createElement('style');
cloudStyle.textContent = `
  @keyframes cloudDrift {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(100vw + 200px));
    }
  }
`;
document.head.appendChild(cloudStyle);

createClouds();

console.log('ElectroQuest initialized - Ready to learn electronics!');
