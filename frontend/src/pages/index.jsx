import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";

export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with friends effortlessly</p>

            <p>A true social media platform for seamless interaction and real connections.</p>

            <div onClick={() => {
              router.push("/login");
            }} className={styles.buttonJoin}>
              <p >Join Now</p>
            </div>
          </div>
          <div className={styles.mainContainer_right}>
            <img src="images/homeImage.png" alt="" srcset="" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
