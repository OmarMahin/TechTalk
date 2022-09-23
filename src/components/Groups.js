import { React, useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { TiMessages } from 'react-icons/ti'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { useSelector, useDispatch } from 'react-redux'
import { activeChat } from '../Slice/activeChatUser'

const Groups = () => {

    const auth = getAuth()
    const db = getDatabase()
    const dispatch = useDispatch()

    let [groupList, setGroupList] = useState([])
    let [refresh, setRefresh] = useState(false)

    let handleActiveUser = (item) => {
        let userInfo = {}
        userInfo.status = "group"
        userInfo.id = item.GroupKey
        userInfo.name = item.GroupName
        userInfo.Admin = item.GroupAdmin
        dispatch(activeChat(userInfo))
    }


    useEffect(() => {
        let grouplist = []

        onValue(ref(db, 'groups'), (snapshot) => {
            snapshot.forEach((item) => {
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                    GroupKey: item.key,
                })


            })
            setGroupList(grouplist)
        })

    }, [refresh])


  return (
    <div className='groupList'>
        <div className='top'>
                <h2>Groups</h2>
            </div>

            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists'>
                {groupList.map((item) => {
                    return (
                        <div className='box' onClick={()=>handleActiveUser(item)}>
                            <div className='img'>
                                <img src='assets/images/GroupImg.png' />
                            </div>
                            <div className='name'>
                                <h2>{item.GroupName}</h2>
                                <h4>{item.GroupTagline}</h4>
                            </div>
                            <div className='button'>
                                <button><TiMessages/></button>
                            </div>
                        </div>
                    )
                })}


            </div>
    </div>
  )
}

export default Groups