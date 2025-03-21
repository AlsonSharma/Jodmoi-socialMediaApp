import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import styles from "./style.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '@/config/redux/action/authAction';
import { emptyMessage } from '@/config/redux/reducer/authReducer';

function LoginComponent() {
    const router = useRouter(); 
    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isUserLogin, setIsUserLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");

    useEffect(() => {
        if(authState.LoggedIn) {
            router.push("/dashboard")
        }
    }, [authState.LoggedIn])

    useEffect(() => {
      dispatch(emptyMessage());
    }, [isUserLogin]);

    useEffect(() => {
      if(localStorage.getItem("token")) {
        router.push("/dashboard");
      }
    }, [])
    const handleRegister = () => {
      console.log("Registering..");
      dispatch(registerUser({username, name, email, password}));
    }

    const handleLogin = () => {
      console.log("Login");
      dispatch(loginUser({email, password}));
    }
  return (
    <UserLayout>
    
        <div className={styles.container}>
        <div className={styles.cardContainer}>
        <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}>{isUserLogin ? "Sign In" : "Sign Up"}</p> <br />

           <p style={{color: authState.isError ? "red" : "green"}}>{authState.message.message}</p> 
            <br />

            <div className={styles.inputContainers} >
                {!isUserLogin && <div className={styles.inputRow}>
                <input onChange={(e) => setUsername(e.target.value)} className={styles.inputField} type='text' placeholder='Username'></input>
                <input onChange={(e) => setName(e.target.value)}  className={styles.inputField} type='text' placeholder='Name'></input>
                </div>}
                <input onChange={(e) => setEmail(e.target.value)}  className={styles.inputField} type='email' placeholder='Email'></input>
                <input onChange={(e) => setPassword(e.target.value)}  className={styles.inputField} type='text' placeholder='password'></input>

              <div  onClick={() => {
          if(isUserLogin) {
            handleLogin();
          }else{
            handleRegister();
          }
        }} className={styles.buttonWithOutline}>
                {isUserLogin ? "Sign In" : "Sign Up"}
              </div>
                </div>
            
        </div>
        <div className={styles.cardContainer_right}>
         {isUserLogin ? <p style={{marginBottom: "1rem" }}>Don't Have an Account? </p> : <p style={{marginBottom: "1rem" }}>Already Have an Account? </p> } 
        
        <div  onClick={() => {
          setIsUserLogin(!isUserLogin)
        }} className={styles.buttonWithOutline} style={{background: "#fd5e5e"}}>
                {isUserLogin ? "Sign Up" : "Sign In"}
              </div>
        </div>
        </div>
        </div>
    </UserLayout>
  )
}

export default LoginComponent;