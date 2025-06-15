'use client'

import { useEffect, useRef, useState } from 'react';
import { awardBadges, checkGamificationRecord, createGamificationRecord } from '@/db/gamification_record';
import { FaMedal } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { IoTrophyOutline } from "react-icons/io5";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { PiTargetLight } from "react-icons/pi";

interface GamificationProps {
  userId: number;
}

interface GamificationRecord {
  user_id: number;
  points: number;
  badge: string[];
}

const Gamification = ({ userId }: GamificationProps) => {
  const [gamificationRecord, setGamificationRecord] = useState<GamificationRecord | null>(null);
  const [badges, setBadges] = useState<{ badge: string, explanation: string }[]>([]);
  const isChecking = useRef(false);

  useEffect(() => {
    const handleGamification = async () => {
      if (isChecking.current) return;
      isChecking.current = true;
      
      let record = await checkGamificationRecord(userId);
      if (!record) {
        record = await createGamificationRecord(userId);
      }
      setGamificationRecord(record);

      const awardedBadges = await awardBadges(userId);
      setBadges(awardedBadges);

      isChecking.current = false;
    };

    handleGamification();
  }, [userId]);

  const calculateLevel = (points: number) => Math.floor(points / 100);
  const calculateProgress = (points: number) => points % 100;

  const missions = [
    { 
      id: 1, 
      description: 'Create a summary', 
      points: 20,
      icon: IoTrophyOutline,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 2, 
      description: 'Create a quiz', 
      points: 20,
      icon: HiOutlineLightningBolt,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 3, 
      description: 'Complete a quiz', 
      points: 10,
      icon: PiTargetLight,
      color: 'from-green-500 to-green-600'
    },
  ];

  if (!gamificationRecord) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-gray-900">
              Level {calculateLevel(gamificationRecord.points)}
            </h3>
            <p className="text-sm text-gray-500">Keep going! You&apos;re doing great.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <IoTrophyOutline className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress(gamificationRecord.points)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>
        <p className="mt-2 text-sm font-medium text-gray-600">
          {calculateProgress(gamificationRecord.points)} / 100 XP to next level
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Missions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {missions.map((mission) => {
            const Icon = mission.icon;
            return (
              <div
                key={mission.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{mission.description}</p>
                    <p className="text-sm text-gray-500">+{mission.points} XP</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm ring-1 ring-amber-500/10"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <FaMedal className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{badge.badge}</p>
                    <p className="text-sm text-gray-600 truncate">{badge.explanation}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamification;