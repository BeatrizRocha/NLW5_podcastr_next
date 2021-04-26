import React from 'react'

import { Header } from '../components/Header'
import { Player } from '../components/Player'

import '../styles/global.scss'
import styles from '../styles/app.module.scss'
import { PlayerContextProvider } from '../contexts/PlayerContext'

function MyApp({ Component, pageProps }) {

  return (
    <div className={styles.wrapper}>
      <PlayerContextProvider>
        <main>
          <Header />
          <Component {...pageProps} />
        </main>
        <Player />
      </PlayerContextProvider>
    </div>
  )
}

export default MyApp
