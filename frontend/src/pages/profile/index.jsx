import { getAboutUser } from '@/config/redux/action/authAction'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css";
import { BASE_URL, clientServer } from '@/config';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { useRouter } from 'next/router';

export default function ProfilePage() {

    const authState = useSelector((state) => state.auth);
    const postReducer = useSelector((state) => state.posts);
    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([]);
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [imageSrc, setImageSrc] = useState("https://picsum.photos/1600/900?nature");
    
      useEffect(() => {
        const interval = setInterval(() => {
          setImageSrc(`https://picsum.photos/1600/900?t=${new Date().getTime()}`);
        }, 5000); // Refresh every 5 seconds
    
        return () => clearInterval(interval); // Cleanup interval on unmount
      }, []);

    useEffect(() => {
        dispatch(getAboutUser({token: localStorage.getItem("token")}))
        dispatch(getAllPosts());
    }, [])

    useEffect(() => {

        if(authState.user !== undefined) {
            setUserProfile(authState.user)
             let post = postReducer.posts.filter((post) => {
            return post.userId.username === authState.user.userId.username;
          });
          setUserPosts(post);
        }
       
    }, [authState.user, postReducer.posts])

    const updateProfilePicture  = async(file) => {
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", localStorage.getItem("token"));

        try {
            const response = await clientServer.post("/update_profile_picture", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            dispatch(getAboutUser({token: localStorage.getItem("token")}));

        } catch (error) {
            return console.log(error);
        }

    }

    const updateProfileData = async() => {
        const request = await clientServer.post("/user_update", {
            token: localStorage.getItem("token"),
            name: userProfile.userId.name,
        })

        const response = await clientServer.post("/update_profile_data", {
            token: localStorage.getItem("token"),
            bio: userProfile.bio,
            education: userProfile.education,
            pastWork: userProfile.pastWork,
            bio: userProfile.bio
        });

        dispatch(getAboutUser({token: localStorage.getItem("token")}));
    }

   
  const [editingType, setEditingType] = useState(null); // 'work' or 'education'
  const [formData, setFormData] = useState({
    Company: '',
    position: '',
    years: '',
    school: '',
    fieldOfStudy: '',
    degree: ''
  });

  const handleAddExperience = (type) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newEntry = editingType === 'work' ? {
      Company: formData.Company,
      position: formData.position,
      years: formData.years
    } : {
      school: formData.school,
      fieldOfStudy: formData.fieldOfStudy,
      degree: formData.degree
    };

    setUserProfile(prev => ({
      ...prev,
      [editingType === 'work' ? 'pastWork' : 'education']: [
        ...prev[editingType === 'work' ? 'pastWork' : 'education'],
        newEntry
      ]
    }));

    setIsModalOpen(false);
    setFormData({ Company: '', position: '', years: '', school: '', fieldOfStudy: '', degree: '' });
  };

  return (
  <UserLayout>
   <DashboardLayout>
    {authState.user &&  userProfile.userId &&
   <div className={styles.container}>
        <div className={styles.backDropContainer}>
        <img className={styles.backdrop} src={imageSrc}alt="Random Image"/>
        </div>
  
        <div className={styles.profileContainerDetails}>
          <div className={styles.profileMain}>
            <div className={styles.userInfo}>
                <label htmlFor='profileUpload' className={styles.profile_overlay}>
                    <p>Edit</p>
                   
                </label>
                <input onChange={(e) => updateProfilePicture(e.target.files[0])} style={{display: "none"}} type="file" id='profileUpload' />
                 
              <img 
                className={styles.profilePicture}
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                alt="profile"
              />
              <input className={styles.userName} type="text" value={userProfile.userId.name}
                onChange={(e) => setUserProfile({...userProfile, userId: {...userProfile.userId, name: e.target.value}})} />
              <p className={styles.userHandle}>@{userProfile.userId.username}</p>

              <textarea value={userProfile.bio} onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                rows={Math.max(3, Math.ceil(userProfile.bio.length /80))}/>
            </div>
  
            
          </div>
          {userProfile !== authState.user && <div onClick={() => { updateProfileData()}} className={styles.updateProfileBtn}>
            Update Profile
            </div>}
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
              <button className={styles.addWorkBtn} onClick={() => {setIsModalOpen(true)
                handleAddExperience('work')
              }}>
              + Add Work Experience
              </button>
              <button className={styles.addWorkBtn} onClick={() => {
                handleAddExperience('education')
              }}>
              + Add Education
              </button>
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
                  <p style={{marginTop: "1rem", fontSize: "1rem"}}>{post.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
}
{isModalOpen && 
  <div className={styles.commentsContainer} onClick={() => setIsModalOpen(false)}>
    <div className={styles.allCommentsContainer} onClick={(e) => e.stopPropagation()}>
      <h3>{editingType === "work" ? "Add Work Experience" : "Add Education"}</h3>
      <form onSubmit={handleFormSubmit}>
      {editingType === 'work' ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>Company</label>
                      <input
                        type="text"
                        value={formData.Company}
                        onChange={(e) => setFormData({...formData, Company: e.target.value})}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Position</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Years</label>
                      <input
                        type="text"
                        value={formData.years}
                        onChange={(e) => setFormData({...formData, years: e.target.value})}
                        placeholder="e.g., 2018-2020"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.formGroup}>
                      <label>School/University</label>
                      <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => setFormData({...formData, school: e.target.value})}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={formData.fieldOfStudy}
                        onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Degree</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({...formData, degree: e.target.value})}
                        placeholder="e.g., Bachelor's Degree"
                        required
                      />
                    </div>
                  </>
                )}
                <button type="submit" className={styles.submitBtn}>
                  Save {editingType === 'work' ? 'Experience' : 'Education'}
                </button>
              </form>
    </div>
  </div>
}
   </DashboardLayout>
  </UserLayout>
  )
}
