import { format, parseISO } from 'date-fns';
import Head from 'next/head'
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import Link from 'next/link';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import { usePlayer } from '../../contexts/PlayerContext'

import styles from './episode.module.scss';
import React from 'react';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href={"/"}>
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => { play(episode) }}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    // quais episódios gerar antes (por exemplo, carregaria a página desse episódio antes)
    // paths: [
    // (Como passamos [] vazio, ele não gera)
    // {
    //   params:{
    //     slug:'a-importancia-da-contribuicao-em-open-source'
    //   }
    // }
    // ],
    paths,
    fallback: 'blocking' // fallback = Determina o comportamento ao tentar acessar uma página não gerada no momento da build (paths[])
    // fallback: false = para um episódio não informado no paths[] retorna 404
    // fallback: true = para um episódio não informado no paths[] ele busca os dados pelo client (Browser)
    // fallback: blocking = para um episódio não informado no paths[] ele busca os dados pelo next (Node.js)

    // true e blocking = incremental static regeneration = liberdade de carregar apenas as informações 
    // mais acessadas pelo paths[] e carregar as outras de forma dinâmica
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params

  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24 //24h
  }
}