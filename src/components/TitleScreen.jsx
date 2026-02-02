
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { PenTool, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import SettingsButton from './SettingsButton';
import SettingsModal from './SettingsModal';

const TitleScreen = () => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const steps = [
        {
            icon: <PenTool size={32} className="text-amber-200" />,
            title: "Draw",
            desc: "Your signature"
        },
        {
            icon: <Sparkles size={32} className="text-purple-300" />,
            title: "Receive",
            desc: "A prompt"
        },
        {
            icon: <BookOpen size={32} className="text-emerald-200" />,
            title: "Build",
            desc: "A story from your hand"
        }
    ];

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            <Helmet>
                <title>Legacy Builder | Build Your Truth</title>
                <meta name="description" content="Build your truth one prompt at a time. An interactive storytelling experience." />
            </Helmet>

            <SettingsButton onClick={() => setIsSettingsOpen(true)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <AnimatedBackground />

            <motion.div 
                className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-12">
                    <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
                        Legacy Builder
                    </h1>
                    <p className="font-crimson text-xl md:text-2xl text-slate-300 italic tracking-wide">
                        Build your truth one prompt at a time
                    </p>
                </motion.div>

                {/* Game Loop Cards */}
                <motion.div 
                    variants={itemVariants} 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-4xl"
                >
                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 flex flex-col items-center gap-4 hover:bg-white/10 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 cursor-default"
                        >
                            <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                {step.icon}
                            </div>
                            <h3 className="font-playfair text-2xl font-bold text-white">{step.title}</h3>
                            <p className="font-crimson text-lg text-slate-300">{step.desc}</p>
                            
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-20 text-white/20">
                                    <ArrowRight size={24} />
                                </div>
                            )}
                            {/* Connector arrow for mobile */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20 text-white/20 rotate-90">
                                    <ArrowRight size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => navigate('/draw')}
                        className="group relative px-10 py-4 bg-white text-slate-900 rounded-full font-mono text-lg tracking-wider uppercase hover:bg-slate-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Begin <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <p className="mt-6 text-sm text-slate-500 font-mono uppercase tracking-widest opacity-60">
                        Sound on recommended
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default TitleScreen;
