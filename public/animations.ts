// animations.ts
export const triggerFirstClueAnimation = () => {
    // Confetti en forme de point d'interrogation
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['question'],
        colors: ['#ff0000', '#ffff00', '#00ff00']
    });

    // Animation sonore spéciale
    playSuspenseSound();
};

export const triggerClueRevealAnimation = (clueIndex: number) => {
    // Animation différente selon l'indice
    const colors = [
        ['#FF0000', '#FF5733'], // Rouge pour 40pts
        ['#FFA500', '#FFC300'], // Orange pour 30pts
        ['#FFFF00', '#FFEE58'], // Jaune pour 20pts
        ['#00FF00', '#7CFC00']  // Vert pour 10pts
    ];

    confetti({
        particleCount: 50 + (clueIndex * 20),
        angle: 90,
        spread: 50,
        startVelocity: 30 + (clueIndex * 10),
        colors: colors[clueIndex],
        origin: { y: 0.6 }
    });
};

export const triggerSolutionAnimation = () => {
    // Grande explosion finale
    confetti({
        particleCount: 300,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#00FF00', '#0000FF'],
        shapes: ['circle', 'star']
    });

    // Texte animé "SOLUTION!"
    const solutionText = document.createElement('div');
    solutionText.textContent = 'SOLUTION!';
    solutionText.style.position = 'fixed';
    solutionText.style.left = '50%';
    solutionText.style.top = '50%';
    solutionText.style.transform = 'translate(-50%, -50%)';
    solutionText.style.fontSize = '5rem';
    solutionText.style.fontWeight = '900';
    solutionText.style.color = '#ffffff';
    solutionText.style.textShadow = '0 0 20px #000000';
    solutionText.style.zIndex = '9999';

    document.body.appendChild(solutionText);

    solutionText.animate([
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1)' }
    ], { duration: 2000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });

    setTimeout(() => solutionText.remove(), 2000);
};