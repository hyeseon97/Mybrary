import styles from "./style/MybraryPage.module.css";
import table1 from "../assets/table_01.png";
import table2 from "../assets/table_02.png";
import table3 from "../assets/table_03.png";
import table4 from "../assets/table_04.png";
import table5 from "../assets/table_05.png";
import table6 from "../assets/table_06.png";
import shelf1 from "../assets/bookshelf_01.png";
import shelf2 from "../assets/bookshelf_02.png";
import shelf3 from "../assets/bookshelf_03.png";
import shelf4 from "../assets/bookshelf_04.png";
import shelf5 from "../assets/bookshelf_05.png";
import shelf6 from "../assets/bookshelf_06.png";
import easel1 from "../assets/easel_01.png";
import easel2 from "../assets/easel_02.png";
import easel3 from "../assets/easel_03.png";
import easel4 from "../assets/easel_04.png";
import easel5 from "../assets/easel_05.png";
import easel6 from "../assets/easel_06.png";
import frame from "../assets/frame.png";
import door from "../assets/door.png";
import postbox from "../assets/postbox.png";
import s from "classnames";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";
import useStompStore from "../store/useStompStore";
import 혜선누나 from "../assets/혜선누나.jpg";
import { getMyMybrary } from "../api/mybrary/Mybrary.js";
import axios from "axios";

export default function MybraryPage() {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [bgColor, setBgColor] = useState("1");
  const [esColor, setEsColor] = useState(easel1);
  const [tbColor, setTbColor] = useState(table1);
  const [bsColor, setBsColor] = useState(shelf1);
  const user = useUserStore((state) => state.user);
  const client = useStompStore((state) => state.stompClient);
  const [testuser, setTestuser] = useState({
    data: {
      member: {},
      bookCount: 0,
      threadCount: 0,
      followerCount: 0,
      followingCount: 0,
    },
  });

  useEffect(() => {
    async function fetchMybraryData() {
      try {
        const response = await getMyMybrary();
        console.log(response);
        setTestuser(response);
        // setBgColor(response.data.backgroundColor.toString());
        // setEsColor(easelImgs[response.data.easelColor - 1]);
        // setTbColor(tableImgs[response.data.deskColor - 1]);
        // setBsColor(bookshelfImgs[response.data.bookshelfColor - 1]);
      } catch (error) {
        console.error("데이터를 가져오는 데 실패했습니다:", error);
      }
    }

    fetchMybraryData();
  }, []);

  const color = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
  ];
  const easelImgs = [easel1, easel2, easel3, easel4, easel5, easel6];
  const tableImgs = [table1, table2, table3, table4, table5, table6];
  const bookshelfImgs = [shelf1, shelf2, shelf3, shelf4, shelf5, shelf6];

  //완료버튼을 눌렀을때 실행하는 함수
  const handleSelect = () => {
    setEdit(false);
    toast.success("변경이 완료 되었습니다.", {
      style: {
        border: "1px solid #713200",
        padding: "16px",
        color: "#713200",
        zIndex: "100",
      },
      iconTheme: {
        primary: "#713200",
        secondary: "#FFFAEE",
      },
      position: "top-center",
    });
  };

  //색을 고르는 컴포넌트
  function ColorSelector({ color, setColor, Colors }) {
    return (
      <>
        {Colors.map((colornum, index) => (
          <div
            key={index}
            className={s(styles.color, styles[`color${index + 1}`])}
            onClick={() => setColor(colornum, console.log(tbColor))}
          >
            {color === colornum && <div className={styles.select}></div>}
          </div>
        ))}
      </>
    );
  }
  //배경색을 고르는 컴포넌트
  function BgColorSelector({ color, setColor, Colors }) {
    return (
      <>
        {Colors.map((colornum, index) => (
          <div
            key={index}
            className={s(styles.color, styles[`bgColor${index + 1}`])}
            onClick={() => setColor(colornum, console.log(`${index + 1}`))}
          >
            {color === colornum && <div className={styles.select}></div>}
          </div>
        ))}
      </>
    );
  }

  const sendAlarm = async (e) => {
    if (e.key === "Enter") {
      console.log(e.target.value);
      console.log(client);
      // 여기에 알람 전송 요청 코드 작성
      try {
        const msg = {
          sender: user.email,
          receiver: e.target.value,
        };

        const data = await fetch("/api/v1/notification/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(msg),
        });
        console.log(data);
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  };

  return (
    <>
      <div className={s(`${styles.bg} ${styles[`bg${bgColor}`]}`)}>
        <input onKeyDown={sendAlarm}></input>
        <div className={styles.center}>
          <img
            src={bsColor}
            alt=""
            className={s(styles.bookshelf, !edit && styles.img)}
            onClick={() => !edit && navigate("bookshelf")}
          />
          <img
            src={tbColor}
            alt=""
            className={s(styles.table, !edit && styles.img)}
            onClick={() => !edit && navigate("threads")}
          />
          <img
            src={esColor}
            alt=""
            className={s(styles.easel, !edit && styles.img)}
            onClick={() => !edit && navigate("rollingpaper")}
          />
          <div className={s(styles.frame, !edit && styles.img)}>
            <img src={혜선누나} alt="" className={styles.trapezoid} />
            <img src={frame} alt="" className={styles.frameimg} />
          </div>

          <img
            src={door}
            alt=""
            className={s(styles.door, !edit && styles.img)}
            onClick={() => !edit && navigate("/feed")}
          />
          <img
            src={postbox}
            alt=""
            className={s(styles.postbox, !edit && styles.img)}
            onClick={() => !edit && navigate("/paperplane")}
          />
          {edit && (
            <div>
              <div className={s(styles.edit, styles.easelColor)}>
                <div className={styles.colorTitle}>이젤색</div>
                <ColorSelector
                  color={esColor}
                  setColor={setEsColor}
                  Colors={easelImgs}
                />
              </div>
              <div className={s(styles.edit, styles.tableColor)}>
                <div className={styles.colorTitle}>테이블색</div>
                <ColorSelector
                  color={tbColor}
                  setColor={setTbColor}
                  Colors={tableImgs}
                />
              </div>
              <div className={s(styles.edit, styles.bookshelfColor)}>
                <div className={styles.colorTitle}>책장색</div>
                <ColorSelector
                  color={bsColor}
                  setColor={setBsColor}
                  Colors={bookshelfImgs}
                />
              </div>
            </div>
          )}
        </div>
        {/* <div className={styles.trapezoid}></div> */}
        <div className={s(edit ? styles.active : styles.container)}>
          <div className={styles.profileContainer}>
            <div className={styles.profile}>
              <div>이미지</div>
              <div>
                <div>{testuser.data.member.nickname}</div>
                <div>{testuser.data.member.name}</div>
              </div>
              <div>
                <div>{testuser.data.bookCount}</div>
                <div>앨범</div>
              </div>
              <div>
                <div>{testuser.data.threadCount}</div>
                <div>게시글</div>
              </div>
              <div>
                <div>{testuser.data.followerCount}</div>
                <div>팔로워</div>
              </div>
              <div>
                <div>{testuser.data.followingCount}</div>
                <div>팔로우</div>
              </div>
            </div>
            <div>{testuser.data.member.intro}</div>
          </div>
          <div>
            <div className={styles.editButton} onClick={() => setEdit(true)}>
              방 꾸미기
            </div>
            {/* <div className={styles.editButton}>방 꾸미기</div> */}
          </div>
        </div>
        {edit && (
          <div>
            <div className={s(styles.editbg, styles.backGroundColor)}>
              <div>마이브러리 방 꾸미기</div>
              <div className={styles.bgcont}>
                <div>배경색</div>
                <BgColorSelector
                  color={bgColor}
                  setColor={setBgColor}
                  Colors={color}
                />
              </div>
            </div>
            <div
              className={s(styles.edit, styles.ok)}
              onClick={() => handleSelect()}
            >
              완료
            </div>
          </div>
        )}
      </div>
    </>
  );
}
