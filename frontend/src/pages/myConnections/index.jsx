import { acceptConnectionRequest, getMyConnectionRequests } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css";
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

export default function MyConnections() {

  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth)
  const router = useRouter();

  useEffect(() => {
    dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}));
  }, [])

  // useEffect(() => {
  //   if(authState.connectionRequest.length !== 0) {
  //   }
  // }, [authState.connectionRequest])
  return (
    <UserLayout>
        <DashboardLayout>
    <div className={styles.container}>
      <h1>My Connections</h1>
      
      {/* Connection Requests */}
      {authState.connectionRequest.length === 0 ? (
        <div className={styles.emptyState}>
          No connection requests
        </div>
      ) : (
        authState.connectionRequest
          .filter((connection) => connection.status_accepted === null)
          .map((user, index) => (
            <div 
              key={index}
              className={styles.userCard}
              onClick={() => router.push(`/viewProfile/${user.userId.username}`)}
            >
              <div className={styles.userContent}>
                <div className={styles.profilePicture}>
                  <img 
                    src={`${BASE_URL}/${user.userId.profilePicture}`} 
                    alt={user.userId.name} 
                  />
                </div>
                <div className={styles.userInfo}>
                  <h3>{user.userId.name}</h3>
                  <p>@{user.userId.username}</p>
                </div>
              </div>
              <button
                className={styles.connectedButton}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(acceptConnectionRequest({
                    followerId: user._id,
                    token: localStorage.getItem("token"),
                    action: "accept"
                  }));
                }}
              >
                Accept
              </button>
            </div>
          ))
      )}

      {/* My Network */}
      <h4>My Network</h4>
      {authState.connectionRequest
        .filter((connection) => connection.status_accepted !== null)
        .map((user, index) => (
          <div
            key={index}
            className={styles.userCard}
            onClick={() => router.push(`/viewProfile/${user.userId.username}`)}
          >
            <div className={styles.userContent}>
              <div className={styles.profilePicture}>
                <img 
                  src={`${BASE_URL}/${user.userId.profilePicture}`} 
                  alt={user.userId.name} 
                />
              </div>
              <div className={styles.userInfo}>
                <h3>{user.userId.name}</h3>
                <p>@{user.userId.username}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
        </DashboardLayout>
    </UserLayout>
  )
}
