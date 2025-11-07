import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { fmtNum } from '../../utils/formatters';

interface AnimatedNumberProps {
    value: number;
    unit?: string;
    className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, unit, className }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => fmtNum(Math.round(latest), unit));

    useEffect(() => {
        const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
        return controls.stop;
    }, [value, count]);

    return <motion.p className={className}>{rounded}</motion.p>;
};
