
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HeroImage from '../components/HeroImage';
import CallToAction from '../components/CallToAction';
import WelcomeMessage from '../components/WelcomeMessage';
import { Button } from '../components/ui/button';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Welcome | Interactive Drawing Experience</title>
                <meta name="description" content="Welcome to an interactive drawing experience where you can express yourself with beautiful animated strokes." />
            </Helmet>
            <div
                className='min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative'
                style={{
                    background: `radial-gradient(100% 100% at 50% 100%, var(--Gradients-Main-Color-4, #FF9875) 0%, var(--Gradients-Main-Color-3, #B452FF) 15%, var(--Gradients-Main-Color-2, #673DE6) 30%, var(--neutral--800, #1a1b1e) 80%)`
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className='flex flex-col items-center gap-4 w-full max-w-[448px]'
                >
                    <HeroImage />
                    <div className='flex flex-col gap-1 w-full text-center'>
                        <CallToAction />
                        <WelcomeMessage />
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-8"
                    >
                        <Button
                            onClick={() => navigate('/draw')}
                            className="px-8 py-6 text-lg font-bold bg-white text-purple-600 hover:bg-purple-50 transition-all duration-300 shadow-2xl"
                        >
                            Start Drawing
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}

export default HomePage;
