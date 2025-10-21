import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { liffManager } from '@/lib/liff';
import { StoreProfile, OrganizerProfile } from '@/lib/supabase';

export function useStoreProfile() {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      
      // まずユーザーを取得または作成
      let user: any;
      try {
        user = await apiService.getUserByLineId(liffUser.userId);
      } catch (err) {
        // ユーザーが存在しない場合は作成
        user = await apiService.createUser({
          line_user_id: liffUser.userId,
          user_type: 'store',
          name: liffUser.displayName,
        });
      }

      // 店舗プロフィールを取得
      try {
        const storeProfile = await apiService.getStoreProfile(user.id) as StoreProfile;
        setProfile(storeProfile);
      } catch (err) {
        // プロフィールが存在しない場合は空の状態
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading store profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<StoreProfile>) => {
    try {
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      const user: any = await apiService.getUserByLineId(liffUser.userId);

      let savedProfile: StoreProfile;
      if (profile?.id) {
        // 既存のプロフィールを更新
        savedProfile = await apiService.updateStoreProfile(profile.id, profileData) as StoreProfile;
      } else {
        // 新しいプロフィールを作成
        savedProfile = await apiService.createStoreProfile({
          user_id: user.id,
          ...profileData,
        }) as StoreProfile;
      }

      setProfile(savedProfile);
      return savedProfile;
    } catch (err) {
      console.error('Error saving store profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const submitForVerification = async (documents?: Record<string, File | null>) => {
    try {
      setError(null);
      
      const liffUser = await liffManager.getUserProfile();
      const user: any = await apiService.getUserByLineId(liffUser.userId);

      // 認証ステータスを更新
      const updatedProfile = await apiService.updateStoreProfile(profile?.id || '', {
        verification_status: 'pending'
      }) as StoreProfile;

      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error submitting for verification:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    saveProfile,
    submitForVerification,
    reload: loadProfile,
  };
}

export function useOrganizerProfile() {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      
      // まずユーザーを取得または作成
      let user: any;
      try {
        user = await apiService.getUserByLineId(liffUser.userId);
      } catch (err) {
        // ユーザーが存在しない場合は作成
        user = await apiService.createUser({
          line_user_id: liffUser.userId,
          user_type: 'organizer',
          name: liffUser.displayName,
        });
      }

      // 主催者プロフィールを取得
      try {
        const organizerProfile = await apiService.getOrganizerProfile(user.id) as OrganizerProfile;
        setProfile(organizerProfile);
      } catch (err) {
        // プロフィールが存在しない場合は空の状態
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading organizer profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<OrganizerProfile>) => {
    try {
      setError(null);

      const liffUser = await liffManager.getUserProfile();
      const user: any = await apiService.getUserByLineId(liffUser.userId);

      let savedProfile: OrganizerProfile;
      if (profile?.id) {
        // 既存のプロフィールを更新
        savedProfile = await apiService.updateOrganizerProfile(profile.id, profileData) as OrganizerProfile;
      } else {
        // 新しいプロフィールを作成
        savedProfile = await apiService.createOrganizerProfile({
          user_id: user.id,
          ...profileData,
        }) as OrganizerProfile;
      }

      setProfile(savedProfile);
      return savedProfile;
    } catch (err) {
      console.error('Error saving organizer profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const submitForVerification = async () => {
    try {
      setError(null);
      
      const liffUser = await liffManager.getUserProfile();
      const user: any = await apiService.getUserByLineId(liffUser.userId);

      // 認証ステータスを更新
      const updatedProfile = await apiService.updateOrganizerProfile(profile?.id || '', {
        verification_status: 'pending'
      }) as OrganizerProfile;

      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error submitting for verification:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    saveProfile,
    submitForVerification,
    reload: loadProfile,
  };
}
