import React from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import { Container } from './loginUtilities'

import { checkInitialSetupQuery, login } from './loginUtilities'
import { authToken } from '../../helpers/authentication'
import { useTranslation } from 'react-i18next'
import { CheckInitialSetup } from './__generated__/CheckInitialSetup'
import { useForm } from 'react-hook-form'
import { Submit, TextField } from '../../primitives/form/Input'
import MessageBox from '../../primitives/form/MessageBox'

const initialSetupMutation = gql`
  mutation InitialSetup(
    $username: String!
    $password: String!
    $rootPath: String!
  ) {
    initialSetupWizard(
      username: $username
      password: $password
      rootPath: $rootPath
    ) {
      success
      status
      token
    }
  }
`

type InitialSetupFormData = {
  username: string
  password: string
  rootPath: string
}

const InitialSetupPage = () => {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<InitialSetupFormData>()

  if (authToken()) {
    return <Redirect to="/" />
  }

  const { data: initialSetupData } = useQuery<CheckInitialSetup>(
    checkInitialSetupQuery
  )
  const initialSetupRedirect = initialSetupData?.siteInfo
    ?.initialSetup ? null : (
    <Redirect to="/" />
  )

  const [authorize, { loading: authorizeLoading, data: authorizationData }] =
    useMutation(initialSetupMutation, {
      onCompleted: data => {
        const { success, token } = data.initialSetupWizard

        if (success) {
          login(token)
        }
      },
    })

  const signIn = handleSubmit(data => {
    authorize({
      variables: {
        username: data.username,
        password: data.password,
        rootPath: data.rootPath,
      },
    })
  })

  let errorMessage = null
  if (authorizationData && !authorizationData.initialSetupWizard.success) {
    errorMessage = authorizationData.initialSetupWizard.status
  }

  return (
    <div>
      {initialSetupRedirect}
      <Container>
        <h1 className="text-center text-xl">
          {t('login_page.initial_setup.title', 'Initial Setup')}
        </h1>
        <form onSubmit={signIn} className="max-w-[500px] mx-auto">
          <TextField
            wrapperClassName="my-4"
            fullWidth
            {...register('username', { required: true })}
            label={t('login_page.field.username', 'Username')}
            error={
              formErrors.username?.type == 'required'
                ? 'Please enter a username'
                : undefined
            }
          />
          <TextField
            wrapperClassName="my-4"
            fullWidth
            {...register('password', { required: true })}
            label={t('login_page.field.password', 'Password')}
            error={
              formErrors.password?.type == 'required'
                ? 'Please enter a password'
                : undefined
            }
          />
          <TextField
            wrapperClassName="my-4"
            fullWidth
            {...register('rootPath', { required: true })}
            label={t(
              'login_page.initial_setup.field.photo_path.label',
              'Photo path'
            )}
            placeholder={t(
              'login_page.initial_setup.field.photo_path.placeholder',
              '/path/to/photos'
            )}
            error={
              formErrors.password?.type == 'required'
                ? 'Please enter a photo path'
                : undefined
            }
          />
          <MessageBox
            type="negative"
            message={errorMessage}
            show={errorMessage}
          />
          <Submit className="mt-2" disabled={authorizeLoading}>
            {t('login_page.initial_setup.field.submit', 'Setup Photoview')}
          </Submit>
        </form>
      </Container>
    </div>
  )
}

export default InitialSetupPage
