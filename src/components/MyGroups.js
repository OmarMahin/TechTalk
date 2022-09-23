import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";

const MyGroups = () => {

    const auth = getAuth()
    const db = getDatabase()
    let [groupList, setGroupList] = useState([])

    useEffect(() => {
        let grouplist = []

        onValue(ref(db, 'groups'), (snapshot) => {
            snapshot.forEach((item) => {
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                })


            })
            setGroupList(grouplist)
        })

    }, [])

    return (
        <div className='groupList'>
            <h2>MyGroups</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists mygroups'>

                {
                    groupList.map((item) => {
                        if (item.GroupAdmin == auth.currentUser.uid){
                            return (
                                <div className={'box'}>
                                    <div className='img'>
                                        <img src='assets/images/FriendImg.png' />
                                    </div>
                                    <div className='name'>
                                        <h2>{item.GroupName}</h2>
                                        <h4>{item.GroupTagline}</h4>
                                    </div>
                                    <div className='button'>
                                        <div className='info'>
                                            <p>"18/09/2022"</p>
                                            <br />
                                            <button>Info</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        
                    })
                }

            </div>
        </div>
    )
}

export default MyGroups