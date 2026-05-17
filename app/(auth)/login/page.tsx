import LoginUI from '@/module/components/login-ui'
import { requireUnAuth } from '@/module/utils/auth-utils'
import React from 'react'

const LoginPage = async () => {
  await requireUnAuth();
  return (
    <div>
      <LoginUI/>
    </div>
  )
}

export default LoginPage
