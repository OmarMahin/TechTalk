import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { Button, Grid, TextField, Alert, Item } from '@mui/material'
import Leftbar from '../components/Leftbar';
import Searchbar from '../components/Searchbar';
import NotificationLists from '../components/NotificationLists';

const Notifications = () => {
    const auth = getAuth();
    let [emailVerification, setEmailVerification] = useState(false)

    let navigate = useNavigate();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setEmailVerification(user.emailVerified)
            } else {
                navigate('/login')
            }
        });
    }, [])

    return (
        <>
            {emailVerification
                ?
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <Leftbar active="notifications" />
                    </Grid>
                    <Grid item xs={10}>
                        <Searchbar />
                        <NotificationLists/>        
                    </Grid>
                    
                </Grid>
                :

                <Grid container spacing={2}>
                    <Grid item xs={4}>

                    </Grid>
                    <Grid item xs={4}>
                        <Alert variant="filled" severity="info">
                            Info - Please verify your email address
                        </Alert>
                    </Grid>
                    <Grid item xs={4}>

                    </Grid>
                </Grid>
            }
        </>
    )
}

export default Notifications