import Container from "../components/frame/Container";
import SharedPaper from "../components/paperplane/SharedPaper";
import styles from "./style/PaperplanePage.module.css";
import 종이비행기 from "../assets/종이비행기.png";
import { useEffect, useState, useRef } from "react";
import useUserStore from "../store/useUserStore";
import { getChatList, getMessageList } from "../api/chat/Chat.js";
import ChatProfile from "../components/paperplane/ChatProfile.js";
import Iconuser2 from "../assets/icon/Iconuser2.png";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PaperplanePage() {
  const query = useQuery();
  const targetUserId = query.get("chatuserid");

  /* 웹소켓: 채팅용 주소를 구독 */
  const user = useUserStore((state) => state.user);
  const [chatRoomList, setChatRoomList] = useState([]); // 채팅방 리스트
  const [chatMessageList, setChatMessageList] = useState([]); // 접속중인 채팅방 채팅 내역
  const [nowChatRoom, setNowChatRoom] = useState(null); // 현재 내가 보고있는 채팅방 정보
  const [stompClient, setStompClient] = useState(null);
  const [nowMessage, setNowMessage] = useState("");
  const chatContainerRef = useRef(null); // 채팅 컨테이너에 대한 ref 스크롤 아래로 관리하기 윟마
  const navigate = useNavigate();

  //채팅페이지에 들어오면 구독 실행
  useEffect(() => {
    (async function asyncGetChatList() {
      try {
        const res = await getChatList();
        setChatRoomList(res.data.content);
        if (targetUserId) {
          const targetRoom = res.data.content.find(
            (room) => room.otherMemberId.toString() === targetUserId
          );
          if (targetRoom) {
            setNowChatRoom(targetRoom);
          }
        }
      } catch (e) {}
    })();

    if (!stompClient) {
      const token = localStorage.getItem("accessToken");
      const client = new Client({
        webSocketFactory: () => new SockJS("https://i10b207.p.ssafy.io/ws"),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      client.onConnect = function () {
        client.subscribe(`/sub/chatMemberId/${user.memberId}`, (message) => {
          const res = JSON.parse(message.body);
          setChatMessageList((prev) => [res, ...prev]);
        });
      };

      client.activate();
      setStompClient(client);
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (nowChatRoom) {
      (async function asyncGetMessageList() {
        try {
          const res = await getMessageList(nowChatRoom.chatRoomId);
          setChatMessageList(res.data.content);
        } catch (e) {}
      })();
    }

    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom(); // 컴포넌트 마운트 시 실행
  }, [nowChatRoom]);

  useEffect(() => {
    // 채팅 메시지 컨테이너의 스크롤을 맨 아래로 이동
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessageList]); // chatMessageList가 변경될 때마다 실행

  const sendMessage = (e) => {
    // 메시지 전송 로직

    if (nowMessage.trim() !== "") {
      const messageObject = {
        chatRoomId: nowChatRoom.chatRoomId,
        senderId: user.memberId,
        message: nowMessage,
        threadId: 1,
      };
      const destination = `/pub/chat/${nowChatRoom.chatRoomId}/send`;
      const bodyData = JSON.stringify(messageObject);
      stompClient.publish({ destination, body: bodyData });

      const message = {
        chatRoomId: nowChatRoom.chatRoomId,
        senderId: user.memberId,
        nickname: user.nickname,
        content: nowMessage,
        profileImageUrl: user.profileImageUrl,
        timestamp: Date.now(),
      };
      setChatMessageList((prev) => [message, ...prev]);

      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      };

      setTimeout(() => scrollToBottom(), 10);
    }

    setNowMessage(""); // 메시지 전송 후 입력 필드 초기화
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(); // 직접 호출
    }
  };

  const handleSelectChatRoom = (selectedChatRoom) => {
    // 현재 선택된 채팅방 상태 업데이트
    setNowChatRoom(selectedChatRoom);

    // chatRoomList에서 선택된 채팅방의 인덱스 찾기 및 unreadMessageCount를 0으로 설정
    setChatRoomList((prevChatRoomList) => {
      const chatRoomIndex = prevChatRoomList.findIndex(
        (chatRoom) => chatRoom.chatRoomId === selectedChatRoom.chatRoomId
      );

      if (chatRoomIndex !== -1) {
        // 선택된 채팅방의 unreadMessageCount를 0으로 설정
        const updatedChatRoomList = [...prevChatRoomList];
        updatedChatRoomList[chatRoomIndex] = {
          ...updatedChatRoomList[chatRoomIndex],
          unreadMessageCount: 0,
        };

        return updatedChatRoomList; // 업데이트된 채팅방 리스트 반환
      }

      return prevChatRoomList; // 변화가 없는 경우 이전 상태 반환
    });
  };

  // 메시지의 timestamp를 한국 시간으로 변환하는 함수
  // 메시지의 timestamp를 한국 시간 AM/PM으로 변환하는 함수
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date
      .toLocaleTimeString("ko-KR", options)
      .replace("오전", "AM")
      .replace("오후", "PM");
  };

  return (
    <>
      <Container backgroundColor={"#FFFAFA"}>
        <div className={styles.main}>
          <div className={styles.pipibox}>
            <div className={styles.member}>
              <div className={styles.pipi}>Paper Plane</div>
              <div className={styles.search}>
                <>
                  <form action="/search" method="get" style={{ width: "100%" }}>
                    <label htmlFor="search"></label>
                    <div className={styles.searchContainer}>
                      <button type="submit" className={styles.searchButton}>
                        검색
                      </button>
                      <input
                        type="text"
                        id="search"
                        name="q"
                        placeholder=""
                        className={styles.searchInput}
                      />
                    </div>
                  </form>
                </>
              </div>
              <div className={styles.users} style={{ marginTop: "15px" }}>
                {chatRoomList.length > 0 ? (
                  <>
                    {chatRoomList.map((chatRoom) => (
                      <ChatProfile
                        key={chatRoom.chatRoomId}
                        isSelected={
                          chatRoom.chatRoomId === nowChatRoom?.chatRoomId
                        }
                        onClick={() => handleSelectChatRoom(chatRoom)}
                        otherMemberNickname={chatRoom.otherMemberNickname}
                        otherMemberProfileImageUrl={
                          chatRoom.otherMemberProfileImageUrl
                        }
                        latestMessage={chatRoom.latestMessage}
                        unreadMessageCount={chatRoom.unreadMessageCount}
                        isNew={chatRoom.latestMessageSender !== user.memberId}
                      />
                    ))}
                  </>
                ) : (
                  <div className={styles.emptyList}>
                    검색해서, 새로운채팅을 시작해보세요 !
                  </div>
                )}
              </div>
            </div>
            <div className={styles.gori}>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
              <div className={styles.ring}></div>
            </div>
            <div className={styles.chat}>
              {/* 채팅 헤더 및 마이브러리 가기 버튼 */}
              {nowChatRoom ? (
                <div>
                  <div className={styles.header}>
                    {/* 상대방 프로필 이미지와 닉네임 */}
                    <div className={styles.이미지닉네임}>
                      <div
                        className={styles.imgotheruser}
                        style={{
                          background: `url("https://jingu.s3.ap-northeast-2.amazonaws.com/${nowChatRoom.otherMemberProfileImageUrl}")no-repeat center/cover`,
                        }}
                      ></div>
                      <div>{nowChatRoom.otherMemberNickname}</div>
                    </div>
                    <div className={styles.flex}>
                      <div
                        className={styles.마이브러리가기}
                        onClick={() => {
                          navigate(`/mybrary/${nowChatRoom.otherMemberId}`);
                        }}
                      >
                        마이브러리 가기
                      </div>
                      <div
                        className={styles.채팅방나가기}
                        onClick={() => {
                          navigate(`/mybrary/${nowChatRoom.otherMemberId}`);
                        }}
                      >
                        채팅방 나가기
                      </div>
                    </div>
                  </div>
                  {/* 채팅 메시지 내용 */}
                  <div className={styles.middle}>
                    <div className={styles.textmain}>
                      <div
                        className={styles.chatContainer}
                        ref={chatContainerRef}
                      >
                        {chatMessageList.length > 0 &&
                          chatMessageList
                            .slice()
                            .reverse()
                            .map((message, index) => (
                              <>
                                {message.content && (
                                  <div
                                    key={index}
                                    className={
                                      message.senderId === user.memberId
                                        ? styles.senderbox
                                        : styles.receiverbox
                                    }
                                    style={{
                                      display: "flex",
                                    }}
                                  >
                                    {message.senderId === user.memberId && (
                                      <div
                                        className={styles.messageTime}
                                        style={{
                                          fontSize: "12px",
                                          display: "flex",
                                          flexDirection: "column",
                                          justifyContent: "flex-end",
                                          marginBottom: "18px",
                                          color: "#998481",
                                          minWidth: "60px",
                                        }}
                                      >
                                        {formatTime(message.timestamp)}
                                      </div>
                                    )}
                                    <div
                                      className={`${styles.message} ${
                                        message.senderId === user.memberId
                                          ? styles.sender
                                          : styles.receiver
                                      }`}
                                    >
                                      {message.content}
                                    </div>
                                    {message.senderId !== user.memberId && (
                                      <div
                                        className={styles.messageTime}
                                        style={{
                                          fontSize: "12px",
                                          display: "flex",
                                          flexDirection: "column",
                                          justifyContent: "flex-end",
                                          marginBottom: "18px",
                                          color: "#998481",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {formatTime(message.timestamp)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ))}

                        {/* <SharedPaper /> */}
                      </div>
                    </div>
                    {/* 메시지 입력창 */}
                    <div className={styles.sendbox}>
                      <textarea
                        placeholder="메시지를 보내세요"
                        rows="1" // 초기에 표시할 줄의 수
                        style={{
                          flexGrow: 1,
                          marginLeft: "10px",
                          marginRight: "10px",
                          padding: "10px",
                          borderRadius: "20px",
                          border: "none",
                          outline: "none",
                          backgroundColor: "#eee3dd", // 배경색을 디자인에 맞게 조정
                          color: "#57423f", // 글자 색상 조정
                          fontSize: "16px", // 글자 크기 조정
                          resize: "none", // 사용자가 크기 조절하지 못하도록 설정
                          overflow: "auto", // 내용이 넘칠 때 스크롤바 자동 생성
                        }}
                        value={nowMessage}
                        onChange={(e) => setNowMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />

                      <img
                        className={styles.종이비행기이미지}
                        src={종이비행기}
                        style={{
                          width: "60px",
                          objectFit: "contain",
                          marginRight: "15px",
                          cursor: "pointer",
                        }}
                        alt="전송버튼"
                        onClick={sendMessage}
                      ></img>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.채팅방이없어요}>
                  <div>Paper Plane</div>
                  <img
                    className={styles.종이비행기이미지}
                    src={종이비행기}
                    alt=""
                  />
                  <div>팔로우하고있는 사람에게 종이비행기를 날려보세요.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
