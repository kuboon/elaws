/** @jsx h */
/// <reference lib="dom" />
import { h, IS_BROWSER, Fragment, Head } from '../../deps.ts'

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      xml: any
    }
  }
}
interface Props {
  params: Record<string, string | string[]>
}

export default function Page (props: Props) {
  //<div>Hello {props.params.id} ;; {props.params.path}</div>
  return (
    <Fragment>
      <Head>
        <link rel='stylesheet' href='/style.css' />
        <title>日本国憲法 前文1 - 日本法令引用 URL</title>
        <meta property='og:site_name' content='日本法令引用 URL' />
        <meta property='og:title' content='日本国憲法 前文1' />
        <meta
          property='og:description'
          content='天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。'
        />
        <meta
          property='og:url'
          content='https://elaws.kbn.one/321CONSTITUTION/0-1'
        />
        <meta
          property='og:image'
          content='https://og.kbn.one/%23%20日本国憲法 前文1%0A天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。.png?md=1'
        />
        <meta property='og:image:width' content='833' />
        <meta property='og:image:height' content='476' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='日本国憲法 前文1' />
        <meta
          name='twitter:description'
          content='天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。'
        />
        <meta
          name='twitter:image'
          content='https://og.kbn.one/%23%20日本国憲法 前文1%0A天皇は、日本国の象徴であり日本国民統合の象徴であつて、この地位は、主権の存する日本国民の総意に基く。.png?md=1'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' type='image/png' href='/favicon.png' />
        <link rel='mask-icon' href='/favicon.svg' />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
      </Head>
      <header>
        <h1 id='title'>
          <a href='/'>日本法令引用URL</a>
        </h1>
        <a
          id='source'
          href='https://elaws.e-gov.go.jp/document?lawid=321CONSTITUTION'
        >
          原本へのリンク
        </a>
      </header>
      <xml
        id='xml'
        xmlUrl='https://elaws.e-gov.go.jp/api/1/lawdata/321CONSTITUTION'
      ></xml>
      <div id='share' style='display: none;'>
        <svg
          fill='#000000'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          width='48px'
          height='48px'
        >
          <path d='M 15.990234 1.9902344 A 1.0001 1.0001 0 0 0 15.292969 3.7070312 L 17.585938 6 L 17 6 C 10.936593 6 6 10.936593 6 17 A 1.0001 1.0001 0 1 0 8 17 C 8 12.017407 12.017407 8 17 8 L 17.585938 8 L 15.292969 10.292969 A 1.0001 1.0001 0 1 0 16.707031 11.707031 L 20.707031 7.7070312 A 1.0001 1.0001 0 0 0 20.707031 6.2929688 L 16.707031 2.2929688 A 1.0001 1.0001 0 0 0 15.990234 1.9902344 z M 2.984375 7.9863281 A 1.0001 1.0001 0 0 0 2 9 L 2 19 C 2 20.64497 3.3550302 22 5 22 L 19 22 C 20.64497 22 22 20.64497 22 19 L 22 18 A 1.0001 1.0001 0 1 0 20 18 L 20 19 C 20 19.56503 19.56503 20 19 20 L 5 20 C 4.4349698 20 4 19.56503 4 19 L 4 9 A 1.0001 1.0001 0 0 0 2.984375 7.9863281 z' />
        </svg>
      </div>
      <script
        type='text/javascript'
        src='https://minmoji.ucda.jp/sealjs/https%3A__elaws.kbn.one'
      ></script>
    </Fragment>
  )
}
