import React from 'react'
import { NavLink } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { authToken } from '../../helpers/authentication'
import { useTranslation } from 'react-i18next'
import { mapboxEnabledQuery } from '../../__generated__/mapboxEnabledQuery'
import classNames from 'classnames'

export const MAPBOX_QUERY = gql`
  query mapboxEnabledQuery {
    mapboxToken
  }
`

export const FACE_DETECTION_ENABLED_QUERY = gql`
  query faceDetectionEnabled {
    siteInfo {
      faceDetectionEnabled
    }
  }
`

type MenuButtonProps = {
  to: string
  exact: boolean
  label: string
  background: string
  activeClasses?: string
  className?: string
  icon?: React.ReactChild
}

const MenuButton = ({
  to,
  exact,
  label,
  background,
  icon,
  activeClasses,
  className,
}: MenuButtonProps) => {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        classNames(`rounded-lg my-2`, className, {
          [`ring-4 lg:ring-4 ${activeClasses}`]: isActive,
        })
      }
    >
      <li className="flex items-center">
        <div
          className={`w-12 h-12 p-1.5 lg:w-8 lg:h-8 lg:p-1 w-full h-full rounded-lg`}
          style={{ backgroundColor: background }}
        >
          {icon}
        </div>
        <span className="hidden lg:block ml-2">{label}</span>
      </li>
    </NavLink>
  )
}

const MenuSeparator = () => (
  <hr className="hidden lg:block my-3 border-gray-200 dark:border-dark-border" />
)

export const MainMenu = () => {
  const { t } = useTranslation()

  const mapboxQuery = authToken()
    ? useQuery<mapboxEnabledQuery>(MAPBOX_QUERY)
    : null
  const faceDetectionEnabledQuery = authToken()
    ? useQuery(FACE_DETECTION_ENABLED_QUERY)
    : null

  const mapboxEnabled = !!mapboxQuery?.data?.mapboxToken
  const faceDetectionEnabled =
    !!faceDetectionEnabledQuery?.data?.siteInfo?.faceDetectionEnabled

  return (
    <div className="fixed w-full bottom-0 lg:bottom-auto lg:top-[84px] z-30 bg-white dark:bg-dark-bg shadow-separator lg:shadow-none lg:w-[240px] lg:ml-8 lg:mr-5 flex-shrink-0">
      <ul className="flex justify-around py-2 px-2 max-w-lg mx-auto lg:flex-col lg:p-0">
        <MenuButton
          to="/timeline"
          exact
          label={t('sidemenu.photos', 'Timeline')}
          background="#8ac5f4"
          activeClasses="ring-[#f1f8ff] bg-[#f1f8ff] dark:bg-[#171f28] dark:ring-[#171f28]"
          className="outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-[#283849] focus:ring-offset-2"
          icon={
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M5.62503136,14 L9.60031266,17.978 L5.38724257,24 L2.99995461,24 C1.45289603,24 0.179346174,22.8289699 0.0173498575,21.3249546 L5.62503136,14 Z M15.7557572,10 L24.0173027,21.526562 C23.7684095,22.9323278 22.5405695,24 21.0633614,24 L21.0633614,24 L5.88324257,24 L15.7557572,10 Z"></path>
            </svg>
          }
        />
        <MenuButton
          to="/albums"
          exact
          label={t('sidemenu.albums', 'Albums')}
          background="#ff797b"
          activeClasses="ring-[#fff1f2] bg-[#fff1f2] dark:ring-[#1d1516] dark:bg-[#1d1516]"
          className="outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
          icon={
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M19,2 C19.5522847,2 20,2.44771525 20,3 L20,21 C20,21.5522847 19.5522847,22 19,22 L6,22 C4.8954305,22 4,21.1045695 4,20 L4,4 C4,2.8954305 4.8954305,2 6,2 L19,2 Z M14.1465649,9 L10.9177928,13.7443828 L8.72759325,11.2494916 L6,15 L18,15 L14.1465649,9 Z M11,9 C10.4477153,9 10,9.44771525 10,10 C10,10.5522847 10.4477153,11 11,11 C11.5522847,11 12,10.5522847 12,10 C12,9.44771525 11.5522847,9 11,9 Z"></path>
            </svg>
          }
        />
        {mapboxEnabled ? (
          <MenuButton
            to="/places"
            exact
            label={t('sidemenu.places', 'Places')}
            background="#92e072"
            activeClasses="ring-[#e3fee5] bg-[#e3fee5] dark:ring-[#0c1c0f] dark:bg-[#0c1c0f]"
            className="outline-none focus:ring-2 focus:ring-green-100 focus:ring-offset-2"
            icon={
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M2.4,3.34740684 C2.47896999,3.34740684 2.55617307,3.37078205 2.62188008,3.41458672 L8,7 L8,21 L2.4452998,17.2968665 C2.16710114,17.1114008 2,16.7991694 2,16.4648162 L2,3.74740684 C2,3.52649294 2.1790861,3.34740684 2.4,3.34740684 Z M14.5,3 L14.5,17 L8.5,21 L8.5,7 L14.5,3 Z M15,3 L21.4961389,6.71207939 C21.8077139,6.89012225 22,7.22146569 22,7.58032254 L22,20.3107281 C22,20.531642 21.8209139,20.7107281 21.6,20.7107281 C21.5303892,20.7107281 21.4619835,20.692562 21.4015444,20.6580254 L15,17 L15,3 Z"></path>
              </svg>
            }
          />
        ) : null}
        {faceDetectionEnabled ? (
          <MenuButton
            to="/people"
            exact
            label={t('sidemenu.people', 'People')}
            background="#fbcd78"
            activeClasses="ring-[#fff7e4] bg-[#fff7e4] dark:ring-[#1a1b13] dark:bg-[#1a1b13]"
            className="outline-none focus:ring-2 focus:ring-yellow-100 focus:ring-offset-2"
            icon={
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M15.713873,14.2127622 C17.4283917,14.8986066 18.9087267,16.0457918 20.0014344,17.5008819 C20,19.1568542 18.6568542,20.5 17,20.5 L7,20.5 C5.34314575,20.5 4,19.1568542 4,17.5 L4.09169034,17.3788798 C5.17486154,15.981491 6.62020934,14.878942 8.28693513,14.2120314 C9.30685583,15.018595 10.5972088,15.5 12,15.5 C13.3092718,15.5 14.5205974,15.0806428 15.5069849,14.3689203 L15.713873,14.2127622 L15.713873,14.2127622 Z M12,4 C15.0375661,4 17.5,6.46243388 17.5,9.5 C17.5,12.5375661 15.0375661,15 12,15 C8.96243388,15 6.5,12.5375661 6.5,9.5 C6.5,6.46243388 8.96243388,4 12,4 Z"></path>
              </svg>
            }
          />
        ) : null}
        <MenuSeparator />
        <MenuButton
          to="/settings"
          exact
          label={t('sidemenu.settings', 'Settings')}
          background="#aacbd0"
          activeClasses="ring-[#e4f0f8] bg-[#e4f0f8] dark:ring-[#0f1f23] dark:bg-[#0f1f23]"
          className="outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          icon={
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M13.1773557,19.4081222 L13,21 L11,21 L10.8236372,19.4082786 C11.2068889,19.4686524 11.5997836,19.5 12,19.5 C12.400562,19.5 12.7937897,19.4685982 13.1773557,19.4081222 Z M18.0703854,16.4054981 L19.0710678,17.6568542 L17.6568542,19.0710678 L16.4054981,18.0703854 C17.0439038,17.6062707 17.6062707,17.0439038 18.0703854,16.4054981 Z M5.92961463,16.4054981 C6.3937293,17.0439038 6.95609622,17.6062707 7.59450194,18.0703854 L6.34314575,19.0710678 L4.92893219,17.6568542 Z M12,5 C12.6476122,5 13.2746839,5.08794431 13.8699239,5.25254178 L13.5991574,5.1834986 C13.7201343,5.21176937 13.8399046,5.24317756 13.9583777,5.27763269 L13.8699239,5.25254178 C13.9708203,5.28044194 14.0708021,5.31054449 14.1698143,5.34279446 L13.9583777,5.27763269 C14.0595223,5.3070482 14.1597215,5.33868451 14.258919,5.37248532 L14.2585262,5.37235148 C14.4676237,5.44359989 14.6718943,5.52429568 14.8712067,5.61404838 L14.8708132,5.61387118 C15.0759012,5.70622473 15.275366,5.80795374 15.4690332,5.91866747 L15.4686608,5.91845456 C15.6392617,6.01598201 15.805011,6.12023811 15.9658953,6.23105008 C16.6666499,6.71376514 17.2748587,7.32052379 17.7590147,8.01971841 L17.7457797,8.00067241 C17.878817,8.19144826 18.0025959,8.38916065 18.1164652,8.59315832 L18.1164561,8.59314205 C18.2263916,8.79009231 18.3270826,8.99288384 18.4179525,9.20094699 L18.3861288,9.12918684 C18.4299988,9.22662425 18.4717042,9.32524649 18.511184,9.42499231 L18.4179525,9.20094699 C18.4555868,9.28711751 18.4915365,9.37419224 18.5257599,9.46212956 L18.5257813,9.46218459 C18.5714417,9.57950906 18.6140479,9.69842546 18.6534795,9.81877975 L18.6303524,9.74942636 C18.663449,9.84696249 18.6944539,9.94546442 18.7233135,10.0448787 L18.6534795,9.81877975 C18.6859159,9.91778316 18.7162042,10.0177596 18.7442892,10.1186538 L18.7233135,10.0448787 C18.7574593,10.1625025 18.7886021,10.2814034 18.8166534,10.4014931 L18.7442892,10.1186538 C18.7780535,10.2399508 18.8086334,10.3625743 18.8359331,10.4864288 L18.8166534,10.4014931 C18.8407863,10.5048078 18.862631,10.6090024 18.8821313,10.7140204 L18.8821096,10.7139036 C18.9595358,11.13088 19,11.5607146 19,12 C19,12.760711 18.8786563,13.4930807 18.654269,14.178809 L18.7203978,13.9651371 C18.6933724,14.0577131 18.6644861,14.1494954 18.633782,14.2404408 L18.6337192,14.240627 C18.5596758,14.4599434 18.4749806,14.6745706 18.3803043,14.8837147 L18.4227814,14.7879702 C18.3748133,14.898324 18.3240845,15.0072005 18.2706822,15.1145124 L18.2706854,15.1145058 C18.2596661,15.1366492 18.2485362,15.1587195 18.2372933,15.1807224 C18.1424458,15.366354 18.0394734,15.5473219 17.9289065,15.7230291 L17.9286242,15.7234777 C17.879176,15.8020582 17.8279091,15.8800231 17.7751478,15.9568818 C17.2283538,16.7533264 16.5213854,17.4307804 15.7006361,17.9429388 C15.5343676,18.0466839 15.363664,18.1435255 15.1886895,18.2332159 C15.0884737,18.2845873 14.9867709,18.3336519 14.8837374,18.380294 C14.8519386,18.3946888 14.820036,18.408843 14.7880089,18.4227646 L14.7879702,18.4227814 C14.594563,18.506852 14.3965774,18.582456 14.1945215,18.6491068 L14.240627,18.6337192 C14.1496136,18.6644491 14.057762,18.6933585 13.9651154,18.7204041 L14.1945215,18.6491068 C14.0848667,18.6852779 13.9740131,18.7188121 13.8620359,18.7496344 L13.9651154,18.7204041 C13.8465034,18.7550297 13.7265885,18.7866003 13.6054615,18.8150251 L13.8620359,18.7496344 C13.7423734,18.7825721 13.6214277,18.8124129 13.4992904,18.8390651 L13.6054615,18.8150251 C13.5080739,18.837879 13.4099028,18.8586994 13.3109955,18.8774389 L13.3113385,18.8773739 C12.9626576,18.943437 12.6051877,18.9836256 12.2406498,18.995941 L12.2406498,18.995941 L12,19 L11.7593502,18.995941 C11.1969062,18.9769397 10.651288,18.8915852 10.1300761,18.7474582 L10.4017085,18.8167037 C10.2816534,18.7886645 10.1627862,18.7575356 10.0451955,18.7234055 L10.1300761,18.7474582 C10.0254444,18.7185252 9.92179619,18.6872236 9.8191929,18.6536149 L10.0451955,18.7234055 C9.94544676,18.6944539 9.84661647,18.6633426 9.74875857,18.6301258 L9.8191929,18.6536149 C9.70181279,18.6151658 9.58580021,18.5736972 9.47124698,18.5293009 L9.74875857,18.6301258 C9.63953023,18.5930493 9.53151337,18.5533494 9.42478305,18.5111012 L9.47124698,18.5293009 C9.38023421,18.4940279 9.29014264,18.4569068 9.20101831,18.4179837 L9.42478305,18.5111012 C9.32510844,18.4716459 9.22655588,18.429968 9.1291865,18.3861287 L9.12918684,18.3861288 C8.92441772,18.2939341 8.72488173,18.1921803 8.53114704,18.0814356 L8.53133924,18.0815454 C8.36085919,17.9840938 8.1950534,17.8798058 8.03411574,17.7689575 C7.32564198,17.2809251 6.71176602,16.6661067 6.22504635,15.9571646 L6.25422032,15.9993276 C6.11671498,15.8021446 5.98910038,15.5975514 5.87209563,15.3862669 L5.87185745,15.3858368 C5.76735702,15.1971324 5.67112032,15.0026361 5.58390133,14.8032939 L5.58376551,14.8029834 C5.4937352,14.5972158 5.41320651,14.3859588 5.34288515,14.1700927 L5.37235148,14.2585262 C5.33857231,14.1593728 5.30695567,14.0592187 5.27755779,13.9581202 L5.27763269,13.9583777 C5.24307029,13.8395186 5.21163631,13.7196173 5.18334661,13.5985069 C5.17667277,13.5699482 5.17002984,13.5406686 5.16357108,13.51132 L5.18334661,13.5985069 C5.16013408,13.4991323 5.13903849,13.3989436 5.12010999,13.2979911 L5.12016797,13.2983003 C5.04124551,12.8773785 5,12.443506 5,12 C5,11.3480145 5.08913609,10.7168479 5.25588682,10.1180216 L5.1834986,10.4008426 C5.21176937,10.2798657 5.24317756,10.1600954 5.27763269,10.0416223 L5.25588682,10.1180216 C5.28369429,10.0181609 5.31366015,9.91919955 5.34573098,9.82119101 L5.27763269,10.0416223 C5.3070482,9.9404777 5.33868451,9.84027851 5.37248532,9.74108101 L5.37235148,9.74147384 C5.44359989,9.53237634 5.52429568,9.32810566 5.61404838,9.1287933 L5.61387118,9.12918684 C5.70622473,8.92409877 5.80795374,8.72463395 5.91866747,8.53096679 L5.91845456,8.53133924 C6.01876346,8.35587279 6.12620349,8.18551775 6.24056786,8.02032137 C6.72514126,7.32052379 7.33335007,6.71376514 8.03378164,6.23127259 L8.00067241,6.25422032 C8.19144826,6.12118298 8.38916065,5.99740405 8.59315832,5.88353481 L8.59314205,5.8835439 C8.79009231,5.77360843 8.99288384,5.67291735 9.20094699,5.58204748 L9.12918684,5.61387118 C9.23839103,5.56470339 9.3490835,5.51825441 9.46117803,5.47461046 L9.20094699,5.58204748 C9.2900304,5.54314104 9.38008018,5.506035 9.47105035,5.47077534 L9.46117803,5.47461046 C9.55626939,5.43758669 9.65236971,5.40258153 9.74942636,5.36964761 L9.47105035,5.47077534 C9.58553305,5.42640232 9.70147341,5.38495349 9.81877975,5.34652049 L9.74942636,5.36964761 C9.84696249,5.336551 9.94546442,5.30554615 10.0448787,5.27668649 L9.81877975,5.34652049 C9.92167671,5.31280843 10.0256247,5.28141681 10.1305618,5.25240749 L10.0448787,5.27668649 C10.1625025,5.24254068 10.2814034,5.2113979 10.4014931,5.18334661 L10.1305618,5.25240749 C10.2482987,5.21985975 10.3672807,5.19031091 10.4874206,5.16384836 L10.4014931,5.18334661 C10.5048078,5.15921373 10.6090024,5.13736899 10.7140204,5.11786873 L10.7139036,5.11789043 C11.13088,5.04046424 11.5607146,5 12,5 Z M12,8 C9.790861,8 8,9.790861 8,12 C8,14.209139 9.790861,16 12,16 C14.209139,16 16,14.209139 16,12 C16,9.790861 14.209139,8 12,8 Z M19.4082786,10.8236372 L21,11 L21,13 L19.4081222,13.1773557 C19.4685982,12.7937897 19.5,12.400562 19.5,12 C19.5,11.5997836 19.4686524,11.2068889 19.4082786,10.8236372 Z M4.59187784,10.8226443 C4.53140176,11.2062103 4.5,11.599438 4.5,12 C4.5,12.4002164 4.53134759,12.7931111 4.59172137,13.1763628 L3,13 L3,11 Z M6.34314575,4.92893219 L7.59450194,5.92961463 C6.95609622,6.3937293 6.3937293,6.95609622 5.92961463,7.59450194 L4.92893219,6.34314575 L6.34314575,4.92893219 Z M17.6568542,4.92893219 L19.0710678,6.34314575 L18.0703854,7.59450194 C17.6062707,6.95609622 17.0439038,6.3937293 16.4054981,5.92961463 L17.6568542,4.92893219 Z M13,3 L13.1773557,4.59187784 C12.7937897,4.53140176 12.400562,4.5 12,4.5 C11.5997836,4.5 11.2068889,4.53134759 10.8236372,4.59172137 L11,3 L13,3 Z"></path>
            </svg>
          }
        />
      </ul>
    </div>
  )
}

export default MainMenu
