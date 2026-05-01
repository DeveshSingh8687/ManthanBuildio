// ─── usePostCard.ts ──────────────────────────────────────────
// All state lives here. PostFeed just calls this per item.

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { PostItem, PostMode } from './types';
import { handleApply } from './fetchJobs';

export enum PostMode {
  FEED = 'FEED',
  MY_JOBS = 'MY_JOBS',
  APPLIED = 'APPLIED',
}

// export interface PostItem {
//   id: string | number;
//   description?: string;
//   images?: string[];
//   createdAt: string;
//   likes_count: number;
//   is_liked: boolean;
//   apply_status?: 'applied' | 'pending' | 'approved' | null;
//   is_my_job?: boolean;
//   status?: string;
//   user?: {
//     first_name?: string;
//     last_name?: string;
//     profile_picture?: string;
//   };
// }
export const usePostCard = (item: PostItem, mode: PostMode, refreshJobs?: () => Promise<void>) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [, forceRender] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '' });

  const words = item.description?.split(/\s+/) ?? [];
  const isLong = words.length > 20;
  const displayText = expanded
    ? item.description
    : words.slice(0, 20).join(' ') + (isLong ? '...' : '');

  const isCancellable =
    (item.apply_status === 'applied' || item.apply_status === 'pending') &&
    item.apply_status !== 'approved';

  const actionLabel =
    mode === PostMode.MY_JOBS ? 'Applications'
    : isCancellable           ? 'Cancel'
    : item.apply_status       ? item.apply_status
    : 'Apply';

  const showModal = (title: string, message: string) =>
    setModal({ visible: true, title, message });

  const handleLike = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return;
    const res = await fetch(`https://buildio.co.nz/api/posts/like/${item.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Post Liked') { item.likes_count += 1; item.is_liked = true; }
    else if (data.message === 'Post Unliked') { item.likes_count = Math.max(0, item.likes_count - 1); item.is_liked = false; }
    forceRender(n => n + 1);
  };

  const handleAction = async () => {
    if (mode === PostMode.MY_JOBS) {
      navigation.navigate('JobListComponent', { jobId: item.id });
      return;
    }
    setApplyLoading(true);
    try {
      if (isCancellable) {
        const token = await AsyncStorage.getItem('authToken');
        const res = await fetch(`https://buildio.co.nz/api/jobs/cancel/${item.id}`, {
          headers: { Authorization: `Bearer ${token}!` },
        });
        if (res.ok) { item.apply_status = null; await refreshJobs?.(); showModal('Success', 'Job cancelled.'); }
        else showModal('Error', 'Failed to cancel.');
      } else {
        const result = await handleApply(item.id);
        if (result?.status === true) {
          item.apply_status = 'applied';
          await refreshJobs?.();
          showModal('Success', 'Applied successfully!');
        } else {
          showModal('Info', 'Already applied.');
        }
      }
    } catch {
      showModal('Error', 'Something went wrong.');
    } finally {
      setApplyLoading(false);
    }
  };

  return {
    modal, closeModal: () => setModal(m => ({ ...m, visible: false })),
    displayText, isLong, expanded, toggleExpanded: () => setExpanded(e => !e),
    applyLoading, actionLabel,
    isActionDisabled: item.apply_status === 'pending' || applyLoading,
    handleLike, handleAction,
    handleViewMore: () => navigation.navigate('JobDetailsScreen', { job: item, updateJob: !!item.is_my_job }),
  };
};