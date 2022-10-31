import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BsFillBellFill } from 'react-icons/bs';
import { Button, Grid, Divider, Alert, Item, ListItem, ListItemIcon, ListItemText, secondary, List } from '@mui/material'
import Leftbar from '../components/Leftbar';
import Searchbar from '../components/Searchbar';
import Grouplist from '../components/Grouplist';
import Friendlist from '../components/Friendlist';
import Friends from '../components/Friends';
import Userlist from '../components/Userlist';
import Groups from '../components/Groups';
import MyGroups from '../components/MyGroups';
import BlockedUsers from '../components/BlockedUsers';
import Chats from '../components/Chats';
import { getDatabase, onValue, ref, update } from 'firebase/database';
import { useDispatch, useSelector } from 'react-redux';
import { notification } from '../Slice/notificationSlice';



const NotificationLists = () => {

    const db = getDatabase()
    const auth = getAuth()

    let selector = useSelector((state) => (state))
    let dispatch = useDispatch()

    let [notifiLists, setNotificationLists] = useState([])
    let [unchecked, setUnchecked] = useState([])
    let lists = []

    useEffect(() => {


        onValue(ref(db, "notification"), (snapshot) => {
            let notifi = []
            let keys = []
            snapshot.forEach((item) => {
                notifi.push(item.val())
                if (item.val().seen == "unseen"){
                    lists.push(item.key)
                }
            })
            setNotificationLists(notifi)
            setUnchecked(keys)

        })

        lists.map((key,index)=>{
            let receiever = ''
            onValue(ref(db,"notification/"+key),(info)=>{
                receiever = info.val().receieve
            })

            if (receiever == auth.currentUser.uid){
                update(ref(db,"notification/"+key),{
                    seen: "seen",
                })
            }
            
        })


        
    }, [selector.notification.refresh])

    return (
        <div className='groupList'>

            <div className='lists notifications'>

                <List>

                    {
                        notifiLists.map((item) => (
                            <>
                                {item.receieve == auth.currentUser.uid
                                ?
                                <>
                                <ListItem alignItems="center" sx={{ marginBottom: 2 }}>
                                    <ListItemIcon>
                                        <BsFillBellFill className='notificationIcon' />
                                    </ListItemIcon>
                                    <ListItemText className='notificationText'
                                        primary={item.message}

                                    />
                                </ListItem>

                                < Divider></Divider>
                                </>
                                :

                                 ""}

                            
                                
                            </>

                        ))
                    }


                </List>

            </div>
        </div>
    )
}

export default NotificationLists