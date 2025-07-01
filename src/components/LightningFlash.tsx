// src/components/LightningFlash.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
    trigger: boolean;          // passe à true pour lancer l’effet
}

export default function LightningFlash({ trigger }: Props) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!trigger) return;
        setShow(true);

        const audio = new Audio('/sounds/thunder.mp3');  // ← mets ton wav/mp3 ici
        audio.volume = 0.7;
        audio.play();

        // on masque le flash après ~600 ms
        const t = setTimeout(() => setShow(false), 600);
        return () => clearTimeout(t);
    }, [trigger]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="flash"
                    className="fixed inset-0 bg-white pointer-events-none z-[100]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'] }}
                    transition={{ times: [0, .1, 1], duration: .6, ease: 'easeOut' }}
                />
            )}
        </AnimatePresence>
    );
}
