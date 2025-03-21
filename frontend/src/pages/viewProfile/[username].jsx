import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const searchParams = useSearchParams();

  const router = useRouter();
  const postReducer = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUsersPost = async () => {
    try {
      await dispatch(getAllPosts());
      await dispatch(
        getConnectionsRequest({ token: localStorage.getItem("token") })
      );
      await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
    } catch (error) {
      return console.log(error);
    }
  };

  useEffect(() => {
    getUsersPost();
  }, []);

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });
    setUserPosts(post);
  }, [postReducer.posts]);

  useEffect(() => {
    const connectionsArray = authState.connections?.connection || [];
  
    const isConnected = connectionsArray.some(
      (user) => user.followerId?._id === userProfile.userId._id
    );
    setIsCurrentUserInConnection(isConnected);
  
    // 3. Handle connection status details
    if (isConnected) {
      const connection = connectionsArray.find(
        (user) => user.followerId?._id === userProfile.userId._id
      );
      setIsConnectionNull(!connection?.status_accepted);
    } else {
      setIsConnectionNull(true); // Reset if not connected
    }

    if(authState.connectionRequest.some(user => user.userId._id === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true);
      if(authState.connectionRequest.find(user => user.userId._id === userProfile.userId._id).status_accepted === true) {
        setIsConnectionNull(false);
    }
  }
  }, [authState.connections, authState.connectionRequest]);




  const [imageSrc, setImageSrc] = useState("https://picsum.photos/1600/900");

  useEffect(() => {
    const interval = setInterval(() => {
      setImageSrc(`https://picsum.photos/1600/900?t=${new Date().getTime()}`);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);
  return (
    <UserLayout>
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.backDropContainer}>
        <img src={imageSrc}alt="Random Image"/>
        </div>
  
        <div className={styles.profileContainerDetails}>
          <div className={styles.profileMain}>
            <div className={styles.userInfo}>
              <img 
                className={styles.profilePicture}
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                alt="profile"
              />
              <h1 className={styles.userName}>{userProfile.userId.name}</h1>
              <p className={styles.userHandle}>@{userProfile.userId.username}</p>
              <p className={styles.bio}>{userProfile.bio}</p>
            </div>
  
            <div className={styles.userActions}>
              <div className={styles.actionGroup}>
                {isCurrentUserInConnection ? (
                  <button className={styles.connectedButton}>
                    {isConnectionNull ? "Pending" : "Connected"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(
                        sendConnectionRequest({
                          token: localStorage.getItem("token"),
                          user_id: userProfile.userId._id,
                        })
                      );
                    }}
                    className={styles.connectBtn}
                  >
                    Connect
                  </button>
                )}
                <button 
                  className={styles.downloadResume}
                  onClick={async () => {
                    const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`);
                    window.open(`${BASE_URL}/${response.data.message}`, "_blank");
                  }}
                >
                  <svg 
                    style={{ width: "1.2em" }} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="size-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" 
                    />
                  </svg>
                  Download CV
                </button>
              </div>
            </div>
          </div>
  
          <div className={styles.workHistory}>
            <h4>Experience & Education</h4>
            <div className={styles.workHistoryContainer}>
              {[...userProfile.pastWork, ...userProfile.education].map((item, index) => {
                if (item.Company) {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <h4>Work History</h4>
                      <p>{item.Company} - {item.position}</p>
                      <p>{item.years}</p>
                    </div>
                  );
                } else if (item.school) {
                  return (
                    <div key={index} className={styles.educationHistoryCard}>
                      <h4>Education History</h4>
                      <p>{item.school} - {item.fieldOfStudy}</p>
                      <p>{item.degree}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
  
          <div className={styles.recentActivity}>
            <h4>Recent Activity</h4>
            {userPosts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                <div className={styles.card}>
                  <div className={styles.cardProfileContainer}>
                    {post.media !== "" ? (
                      <img src={`${BASE_URL}/${post.media}`} alt="Post media" />
                    ) : (
                      <div style={{ width: "3.4rem", height: "3.4rem" }}></div>
                    )}
                  </div>
                  <p>{post.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/user/get_profile_through_username", {
    params: {
      username: context.query.username,
    },
  });

  const response = await request.data;
  return { props: { userProfile: request.data.profile } };
}
