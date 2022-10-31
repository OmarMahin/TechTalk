import React, { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { FaUserFriends } from 'react-icons/fa'
import { getAuth } from "firebase/auth";


const Userlist = () => {


    const db = getDatabase();
    const auth = getAuth();

    let [userList, setUserList] = useState([])
    let [friendReqs, setFriendReqs] = useState([])
    let [friends, setFriends] = useState([])
    let [change, setChange] = useState(false)

    useEffect(() => {

        let list = []
        const userRef = ref(db, 'users/')

        onValue(userRef, (snapshot) => {
            
            snapshot.forEach((item) => {
                list.push({
                    username: item.val().username,
                    email: item.val().email,
                    id: item.key,
                    userProfilePicture: item.val().userProfilePicture
                })
                
                
            })
            
            setUserList(list)
            
            

        });

    }, [change])






    useEffect(() => {
        let friendReqLists = []
        let friends = []

        onValue(ref(db, 'friendRequests/'), (snapshot) => {

            snapshot.forEach(item => {
                friendReqLists.push(item.val().recieverId + item.val().senderId)
            })

            setFriendReqs(friendReqLists)
        })

        onValue(ref(db, 'friends/'), (snapshot) => {

            snapshot.forEach(item => {
                friends.push(item.val().receiverId + item.val().senderId)
            })

            setFriends(friends)
        })

    }, [])




    let handleFriendRequest = (info) => {

        set(push(ref(db, 'friendRequests')), {
            recieverName: info.username,
            recieverId: info.id,
            senderName: auth.currentUser.displayName,
            senderId: auth.currentUser.uid,

        }). then(()=>{
            set(push(ref(db, 'notification/')), {
                message: `"${auth.currentUser.displayName}"` + " has sent you a friend request",
                receieve: info.id,
                seen: "unseen",
            })
        })
        setChange(!change)
    }

    return (
        <div className='groupList'>
            <h2>User List</h2>
            <BiDotsVerticalRounded className='dotIcon' />

            <div className='lists friendlist userlist'>



                {userList.map((item) => {



                    return (


                        item.id != auth.currentUser.uid &&
                        <div className='box'>

                            <div className='img'>
                                {
                                    item.userProfilePicture == "none"
                                        ?
                                        <img src='./assets/images/avaterPic.png' />
                                        :
                                        <img src={item.userProfilePicture} />
                                }


                            </div>
                            <div className='name'>
                                <h2>{item.username}</h2>
                                <h4>{item.email}</h4>

                            </div>

                            {friends.includes(item.id + auth.currentUser.uid) || friends.includes(auth.currentUser.uid + item.id)
                                ?
                                <div className='button'>
                                    <button><FaUserFriends /></button>
                                </div>
                                :

                                friendReqs.includes(item.id + auth.currentUser.uid) || friendReqs.includes(auth.currentUser.uid + item.id)
                                    ?
                                    <div className='button'>
                                        <button style={{ display: "none" }}>+</button>
                                    </div>
                                    :

                                    <div className='button'>
                                        <button onClick={() => handleFriendRequest(item)}>+</button>
                                    </div>

                            }


                        </div>

                    )


                })}


            </div>
        </div>
    )
}

export default Userlist