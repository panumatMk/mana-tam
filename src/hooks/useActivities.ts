import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import type { Activity } from '../types/plan.types';
import {MOCKGROUPID} from "../config/constants.ts";

export function useActivities() {
    const { user } = useAuth();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Realtime Listener
    useEffect(() => {
        if (!user?.id) return;

        // Path: trips/{userId}/activities
        const activitiesRef = collection(db, 'trips', MOCKGROUPID, 'activities');
        // เรียงตามเวลา (time)
        const q = query(activitiesRef, orderBy('time', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Activity[];

            setActivities(loadedActivities);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id]);

    // 2. Add Activity
    const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user?.id) return;

        try {
            const activitiesRef = collection(db, 'trips', MOCKGROUPID, 'activities');

            await addDoc(activitiesRef, {
                ...activityData,
                // ✨ Audit Fields (Create)
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: user.id,
                createdByName: user.name,
                updatedBy: user.id,
                updatedByName: user.name
            });

        } catch (error) {
            console.error("Error adding activity:", error);
            alert("เพิ่มกิจกรรมไม่สำเร็จ");
        }
    };

    // 3. Update Activity
    const updateActivity = async (activityId: string, updateData: Partial<Activity>) => {
        if (!user?.id) return;

        try {
            const activityRef = doc(db, 'trips', user.id, 'activities', activityId);

            // ตัด fields ที่ไม่ควร update ออก (เช่น id)
            const { id, createdAt, createdBy, createdByName, ...dataToUpdate } = updateData as any;

            await updateDoc(activityRef, {
                ...dataToUpdate,
                // ✨ Audit Fields (Update only)
                updatedAt: serverTimestamp(),
                updatedBy: user.id,
                updatedByName: user.name
            });

        } catch (error) {
            console.error("Error updating activity:", error);
            alert("แก้ไขกิจกรรมไม่สำเร็จ");
        }
    };

    // 4. Delete Activity
    const deleteActivity = async (activityId: string) => {
        if (!user?.id) return;
        try {
            await deleteDoc(doc(db, 'trips', user.id, 'activities', activityId));
        } catch (error) {
            console.error("Error deleting activity:", error);
            alert("ลบไม่สำเร็จ");
        }
    };

    return {
        activities,
        isLoading,
        addActivity,
        updateActivity,
        deleteActivity
    };
}
