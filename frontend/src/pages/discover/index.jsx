import { BASE_URL } from '@/config';
import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css";
import { useRouter } from 'next/router';
export default function DiscoverPage() {
    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    useEffect(() => {
        if(!authState.all_profile_fetched) {
            dispatch(getAllUsers());
        }
    }, [])
  return (
    <UserLayout>
        <DashboardLayout>

<div className={styles.container}>
  <h1 style={{marginBottom: "1rem", textAlign:"center"}}>Discover</h1>
  {authState.all_profiles_fetched ? (
    <div className={styles.allUserProfile}>
      {authState.all_users.map((user) => (
       
            <div onClick={() => {
                router.push(`/viewProfile/${user.userId.username}`)
            }} key={user._id} className={styles.userCard}>
                <img className={styles.userCardImage} src={`${BASE_URL}/${user.userId.profilePicture}`} alt="profile" />
                <div> <h1>{user.userId.name}</h1>
                <p>@{user.userId.username}</p></div>
               
            </div>
      ))}
    </div>
  ) : (
    <div className={styles.skeletonList}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText} style={{ width: '60px' }}></div>
        </div>
      ))}
    </div>
  )}
</div>
        </DashboardLayout>
    </UserLayout>
  )
}
