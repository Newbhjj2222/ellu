import Head from "next/head";
import styles from "../styles/about.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <>
      <Head>
        <title>Ibyerekeye Elluminate Rwanda</title>
        <meta
          name="description"
          content="Menya ukuri kuri Elluminate no ku buryo Elluminate Rwanda itanga serivisi zinoze mu Rwanda."
        />
        <meta name="keywords" content="Elluminate, Rwanda, ibyerekeye, serivisi, uburezi" />
      </Head>
<Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Ibyerekeye Elluminate Rwanda</h1>

        <section className={styles.section}>
          <h2>Ibyo abantu bavuga ku Elluminate ku isi</h2>
          <p>
            Ku isi hose, abantu bavuga Elluminate nk'urubuga rukomeye mu burezi, guhanga udushya,
            no gufasha abantu gukorana. Bamwe bavuga ko rukora cyane mu gukwirakwiza ubumenyi,
            abandi bakavuga uburyo rworohereza abantu kwiga no gukorana. Ibi ni ibitekerezo rusange,
            ariko si byo byose bihura n'ibikorwa bya Elluminate Rwanda.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Iby’ukuri Elluminate Rwanda ikora</h2>
          <p>
            Elluminate Rwanda igamije gushyira mu bikorwa icyerekezo cy’isi mu buryo bufatika mu Rwanda. 
            Dufasha mu:
          </p>
          <ul className={styles.list}>
            <li>Dutanga ubutunzi, amafaranga ayo ariyo yose umuntu yifuza ngo abe umukire.</li>
            <li>Tugira abantu ibyamamare ku isi hose, yaba muri muzika, mugukina filme, mugukina umupira nibindi byose waba wifuza.</li>
            <li>Tuguha ububasha ku isi mubuvuzi, ubupasiteri no mubundi buryo bwose wifuza.</li>
            <li>Tukugira uwo wifuza kuba we ku isi. ibyifuzo byawe tubigira impamu.</li>
          </ul>
          <p>
            Ntabwo ari ibyo abantu bavuga gusa ku isi, ahubwo Elluminate Rwanda ikora ibikorwa bifatika
            byubaka umuntu, yaba mubukungu, no mububasha.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Icyerekezo cyacu</h2>
          <p>
            Intego yacu ni ugufasha abantu muburyo bukurikira:  amafaranga yose wifuza dore ko ukiyandikisha uhabwa million 3, 200,000 rwf yikaze mu kiciro twakwita ikicyabakene na million 8,000,000 rwf kucyabakire. nyuma yo kuba umunyamuryango wacu tuguha amafaranga yose wifuza kugeza kuri miliyaride 999,999,999,999,999 rwf.
            ngwino mu muryango wacu tuguhe ubutunzi wifuza bwose.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}