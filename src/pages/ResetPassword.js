import { React, useEffect, useState } from 'react'
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { IconButton, Collapse, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom'

const ResetPassword = () => {

    const auth = getAuth()

    let navigate = useNavigate()

    let [email, setEmail] = useState('')
    let [open, setOpen] = useState(false)

    let emailHandle = (item) => {
        setEmail(item.target.value)
    }

    let resetPassword = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setOpen(true)
                setEmail('')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage)
            });
    }

    let goBack = ()=>{
        navigate('/login')
    }

    return (
        <div className='resetPassword'>
            <div className='background'>
                <Collapse in={open} className='emailAlert'>
                    <Alert severity="success" className='message' >A password reset email has been sent to your email address. Please check your email.
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    </Alert>
                </Collapse>
                <h2>Reset Password</h2>
                <div className='box'>
                    <h3>Forgot Password</h3>
                    <p>To reset your password, enter your email below</p>
                    <input placeholder='Enter Email' type={'email'} onChange={emailHandle} value={email} ></input>
                    <button onClick={resetPassword}>RESET PASSWORD</button>
                    <button onClick={goBack}>GO BACK</button>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword