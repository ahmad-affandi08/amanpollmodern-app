import React, { useState } from 'react';
import { useAuth } from '../../../hooks';
import usePageTitle from '../../../hooks/utils/usePageTitle';
import ProfileHeader from './components/ProfileHeader';
import AccountInfo from './components/AccountInfo';
import LogoutButton from './components/LogoutButton';
import ChangePasswordModal from './components/ChangePasswordModal';
import { useProfile } from '../../../hooks/queries/useProfileQueries';

export default function MobileProfile() {
  usePageTitle('Profile');
  const { user: authUser } = useAuth();


  const { data: profileData, isLoading } = useProfile();
  const user = profileData?.data || authUser;

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);


  if (isLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-md w-1/3"></div>
        </div>

        {/* Info Skeleton */}
        <div className="bg-white rounded-[20px] p-5 border border-gray-100 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center py-1">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-100 rounded"></div>
              </div>
              <div className="h-4 w-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* Logout Skeleton */}
        <div className="h-14 bg-gray-200 rounded-[20px] w-full mt-6"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <ProfileHeader user={user} />

      {/* Info & Password */}
      <AccountInfo
        user={user}
        onChangePassword={() => setPasswordModalOpen(true)}
      />

      {/* Logout */}
      <LogoutButton />

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
