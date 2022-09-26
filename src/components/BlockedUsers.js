import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";

const BlockedUsers = () => {

    const db = getDatabase();
    const auth = getAuth();

    let [friendList, setFriendList] = useState([])

    useEffect(() => {


        onValue(ref(db, 'friends/'), (snapshot) => {
            let friends = []
            snapshot.forEach(item => {

                if (item.val().receiverId == auth.currentUser.uid || item.val().senderId == auth.currentUser.uid) {
                    let userInfo = {}

                    userInfo.dataKey = item.key
                    userInfo.date = item.val().accDate
                    userInfo.blocked = item.val().block
                    userInfo.userBlocked = item.val().userBlocked

                    if (item.val().receiverId == auth.currentUser.uid) {
                        onValue(ref(db, 'users/' + item.val().senderId), (snapshot) => {
                            userInfo.id = item.val().senderId
                            userInfo.name = snapshot.val().username
                            userInfo.PhotoUrl = snapshot.val().userProfilePicture
                        })
                    }

                    else if (item.val().senderId == auth.currentUser.uid) {
                        onValue(ref(db, 'users/' + item.val().receiverId), (snapshot) => {
                            userInfo.id = item.val().receiverId
                            userInfo.name = snapshot.val().username
                            userInfo.PhotoUrl = snapshot.val().userProfilePicture
                        })
                    }

                    friends.push(userInfo)

                }



            })
            setFriendList(friends)

        })



    }, [])

    return (
        <div className='groupList'>
            <h2>Blocked Users</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists friendlist'>

                {
                    friendList.map((item) => (

                        item.blocked
                            ?
                            <div className={'box blockBox'}>
                                <div className='img'>
                                    <img src={item.PhotoUrl} />
                                </div>
                                <div className='name'>
                                    <h2>{item.name}</h2>
                                    <h4>Hi Guys, Wassup!</h4>
                                </div>
                                <div className='button'>
                                    {/* <div className='info'>
                                        <p>"18/09/2022"</p>
                                        <br />
                                        <button>Blocked</button>
                                    </div> */}
                                </div>
                            </div>
                            :
                            ""
                    ))
                }

            </div>
        </div>
    )
}

export default BlockedUsers